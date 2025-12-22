import asyncio
import logging
import email
from email import policy
from aiosmtpd.controller import Controller
from .smtp_client import SMTPClient
from ..db.session import SessionLocal
from ..db.repositories import EmailRepository, FolderRepository, UserRepository
from ...services.mail_service import MailService
from ...config import settings

logger = logging.getLogger("sandesh.smtp")

class SandeshSMTPHandler:
    async def handle_DATA(self, server, session, envelope):
        peer = session.peer
        mail_from = envelope.mail_from
        rcpt_tos = envelope.rcpt_tos
        data = envelope.content

        logger.info(f"Receiving mail from {mail_from} to {rcpt_tos}")

        # Parse the email
        message = email.message_from_bytes(data, policy=policy.default)
        subject = message.get("subject", "")

        # Extract body
        body = ""
        if message.is_multipart():
            for part in message.walk():
                if part.get_content_type() == "text/plain":
                    body = part.get_content()
                    break
        else:
            body = message.get_content()

        # Create fresh session and services for this message
        async with SessionLocal() as db_session:
            user_repo = UserRepository(db_session)
            folder_repo = FolderRepository(db_session)
            email_repo = EmailRepository(db_session)
            # SMTP Client isn't needed for delivery, but MailService constructor requires it.
            # We can pass a dummy or the real one.
            # Real one is fine, though delivery doesn't send out.
            smtp_client = SMTPClient()

            mail_service = MailService(email_repo, folder_repo, user_repo, smtp_client)

            await mail_service.deliver_incoming_mail(
                sender=mail_from,
                recipients=rcpt_tos,
                subject=subject,
                body=body
            )

            await db_session.commit()

        return '250 OK'

def create_smtp_controller(hostname="0.0.0.0", port=2525):
    handler = SandeshSMTPHandler()
    controller = Controller(handler, hostname=hostname, port=port)
    return controller
