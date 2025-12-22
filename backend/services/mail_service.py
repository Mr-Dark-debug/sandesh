from typing import List, Optional
from ..core.entities.email import Email
from ..core.entities.user import User
from ..core.entities.folder import Folder
from ..core.exceptions import EntityNotFoundError
from ..infrastructure.db.repositories import EmailRepository, FolderRepository, UserRepository
from ..infrastructure.smtp.smtp_client import SMTPClient
from ..config import settings

class MailService:
    def __init__(
        self,
        email_repo: EmailRepository,
        folder_repo: FolderRepository,
        user_repo: UserRepository,
        smtp_client: SMTPClient
    ):
        self.email_repo = email_repo
        self.folder_repo = folder_repo
        self.user_repo = user_repo
        self.smtp_client = smtp_client

    def get_folder_emails(self, folder_id: int, user_id: int) -> List[Email]:
        # Validate folder ownership
        folder = self.folder_repo.get_by_id_and_user(folder_id, user_id)
        if not folder:
            raise EntityNotFoundError("Folder not found")

        return self.email_repo.get_by_folder(folder_id)

    def get_email(self, email_id: int, user_id: int) -> Email:
        email = self.email_repo.get_by_id_and_owner(email_id, user_id)
        if not email:
            raise EntityNotFoundError("Email not found")

        if not email.is_read:
            email.is_read = True
            self.email_repo.save(email)

        return email

    def move_email(self, email_id: int, target_folder_id: int, user_id: int):
        email = self.email_repo.get_by_id_and_owner(email_id, user_id)
        if not email:
            raise EntityNotFoundError("Email not found")

        target_folder = self.folder_repo.get_by_id_and_user(target_folder_id, user_id)
        if not target_folder:
            raise EntityNotFoundError("Target folder not found")

        email.folder_id = target_folder.id
        self.email_repo.save(email)

    def send_mail(self, sender_user: User, to: List[str], subject: str, body: str, cc: List[str] = None):
        cc = cc or []
        all_recipients = to + cc

        # 1. Save to Sent Folder
        sent_folder = self.folder_repo.get_by_name_and_user("Sent", sender_user.id)
        if not sent_folder:
            # Fallback create if missing
            sent_folder = self.folder_repo.save(Folder(id=None, name="Sent", user_id=sender_user.id))

        sent_email = Email(
            id=None,
            owner_id=sender_user.id,
            folder_id=sent_folder.id,
            sender=f"{sender_user.username}@{settings.NAMESPACE}",
            subject=subject,
            body=body,
            recipients=all_recipients,
            is_read=True
        )
        self.email_repo.save(sent_email)

        # 2. Relay to SMTP
        # Note: exceptions here bubble up to API
        self.smtp_client.send_message(
            sender=f"{sender_user.username}@{settings.NAMESPACE}",
            recipients=to,
            subject=subject,
            body=body,
            cc=cc
        )

    def deliver_incoming_mail(self, sender: str, recipients: List[str], subject: str, body: str):
        """
        Called by SMTP Server to deliver mail to local users.
        """
        for rcpt in recipients:
            if '@' not in rcpt:
                continue

            username, domain = rcpt.split('@', 1)

            # 1. Find User
            user = self.user_repo.get_by_username(username)
            if not user:
                continue # User doesn't exist locally

            # 2. Find Inbox
            inbox = self.folder_repo.get_by_name_and_user("Inbox", user.id)
            if not inbox:
                # Auto-create inbox if missing (robustness)
                inbox = self.folder_repo.save(Folder(id=None, name="Inbox", user_id=user.id))

            # 3. Create Email
            new_email = Email(
                id=None,
                owner_id=user.id,
                folder_id=inbox.id,
                sender=sender,
                subject=subject,
                body=body,
                recipients=recipients,
                is_read=False
            )
            self.email_repo.save(new_email)
