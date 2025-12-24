from typing import List, Optional
from ..core.entities.email import Email
from ..core.entities.user import User
from ..core.entities.folder import Folder
from ..core.exceptions import EntityNotFoundError
from ..infrastructure.db.repositories import EmailRepository, FolderRepository, UserRepository, SystemSettingsRepository
from ..infrastructure.smtp.smtp_client import SMTPClient


class MailService:
    """
    Service for email operations.
    
    Identity Rules for Sending:
    - Sender is formatted as: "Display Name <username@namespace>"
    - Display name and email are stored separately for proper display
    - Signature is appended if user has one enabled
    - Namespace is ALWAYS derived from system settings (never hardcoded)
    """
    
    def __init__(
        self,
        email_repo: EmailRepository,
        folder_repo: FolderRepository,
        user_repo: UserRepository,
        smtp_client: SMTPClient,
        settings_repo: Optional[SystemSettingsRepository] = None
    ):
        self.email_repo = email_repo
        self.folder_repo = folder_repo
        self.user_repo = user_repo
        self.smtp_client = smtp_client
        self.settings_repo = settings_repo

    def _get_namespace(self) -> str:
        """Get current namespace from settings."""
        if self.settings_repo:
            settings = self.settings_repo.get()
            return settings.mail_namespace
        # Fallback to config (should not happen in production)
        from ..config import settings as config_settings
        return config_settings.NAMESPACE if config_settings else "local"

    def get_folder_emails(self, folder_id: int, user_id: int) -> List[Email]:
        """Get all emails in a folder for a user."""
        folder = self.folder_repo.get_by_id_and_user(folder_id, user_id)
        if not folder:
            raise EntityNotFoundError("Folder not found")
        return self.email_repo.get_by_folder(folder_id)

    def get_email(self, email_id: int, user_id: int) -> Email:
        """Get a specific email and mark it as read."""
        email = self.email_repo.get_by_id_and_owner(email_id, user_id)
        if not email:
            raise EntityNotFoundError("Email not found")

        if not email.is_read:
            email.is_read = True
            self.email_repo.save(email)

        return email

    def move_email(self, email_id: int, target_folder_id: int, user_id: int):
        """Move an email to a different folder."""
        email = self.email_repo.get_by_id_and_owner(email_id, user_id)
        if not email:
            raise EntityNotFoundError("Email not found")

        target_folder = self.folder_repo.get_by_id_and_user(target_folder_id, user_id)
        if not target_folder:
            raise EntityNotFoundError("Target folder not found")

        email.folder_id = target_folder.id
        self.email_repo.save(email)

    def send_mail(
        self, 
        sender_user: User, 
        to: List[str], 
        subject: str, 
        body: str, 
        cc: List[str] = None,
        include_signature: bool = True
    ):
        """
        Send an email to recipients and save to Sent folder.
        
        Identity is properly formatted:
        - sender: "Display Name <email@namespace>"
        - sender_display_name: User's display name at send time
        - sender_email: Full email address at send time
        """
        cc = cc or []
        all_recipients = to + cc
        
        # Get namespace from settings
        namespace = self._get_namespace()
        
        # Build sender identity
        sender_email = f"{sender_user.username}@{namespace}"
        sender_display_name = sender_user.get_display_name() if hasattr(sender_user, 'get_display_name') else sender_user.username
        formatted_sender = f"{sender_display_name} <{sender_email}>"
        
        # Append signature if enabled and exists
        email_body = body
        if include_signature and sender_user.signature:
            email_body = f"{body}\n\n--\n{sender_user.signature}"

        # 1. Save to Sent Folder
        sent_folder = self.folder_repo.get_by_name_and_user("Sent", sender_user.id)
        if not sent_folder:
            sent_folder = self.folder_repo.save(Folder(id=None, name="Sent", user_id=sender_user.id))

        sent_email = Email(
            id=None,
            owner_id=sender_user.id,
            folder_id=sent_folder.id,
            sender=formatted_sender,
            sender_display_name=sender_display_name,
            sender_email=sender_email,
            subject=subject,
            body=email_body,
            recipients=all_recipients,
            is_read=True
        )
        self.email_repo.save(sent_email)

        # 2. Relay to SMTP
        self.smtp_client.send_message(
            sender=formatted_sender,
            recipients=to,
            subject=subject,
            body=email_body,
            cc=cc
        )

    def deliver_incoming_mail(self, sender: str, recipients: List[str], subject: str, body: str):
        """
        Called by SMTP Server to deliver mail to local users.
        Parses sender identity if formatted.
        """
        # Parse sender identity
        sender_display_name = None
        sender_email = sender
        
        if '<' in sender and '>' in sender:
            # Format: "Display Name <email@domain>"
            parts = sender.split('<')
            sender_display_name = parts[0].strip().strip('"')
            sender_email = parts[1].rstrip('>')
        
        for rcpt in recipients:
            if '@' not in rcpt:
                continue

            username, domain = rcpt.split('@', 1)

            # Find User
            user = self.user_repo.get_by_username(username)
            if not user:
                continue

            # Find Inbox
            inbox = self.folder_repo.get_by_name_and_user("Inbox", user.id)
            if not inbox:
                inbox = self.folder_repo.save(Folder(id=None, name="Inbox", user_id=user.id))

            # Create Email with identity fields
            new_email = Email(
                id=None,
                owner_id=user.id,
                folder_id=inbox.id,
                sender=sender,
                sender_display_name=sender_display_name,
                sender_email=sender_email,
                subject=subject,
                body=body,
                recipients=recipients,
                is_read=False
            )
            self.email_repo.save(new_email)
