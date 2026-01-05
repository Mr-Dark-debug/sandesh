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
import time
from sqlalchemy.exc import OperationalError

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

        # Retry mechanism for handling database locking issues
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Create fresh session and services for this message
                # Since the service is now sync, we use the sync session context manager.
                # This will block the asyncio loop for the duration of DB operations.
                # Given "SMTP handlers can also safely use sync sessions" and "Human-paced email traffic",
                # this is acceptable.
                with SessionLocal() as db_session:
                    user_repo = UserRepository(db_session)
                    folder_repo = FolderRepository(db_session)
                    email_repo = EmailRepository(db_session)
                    # SMTP Client isn't needed for delivery, but MailService constructor requires it.
                    smtp_client = SMTPClient()

                    mail_service = MailService(email_repo, folder_repo, user_repo, smtp_client)

                    # Call the sync service method
                    mail_service.deliver_incoming_mail(
                        sender=mail_from,
                        recipients=rcpt_tos,
                        subject=subject,
                        body=body
                    )

                    db_session.commit()

                return '250 OK'
            except OperationalError as e:
                if "database is locked" in str(e) and attempt < max_retries - 1:
                    logger.warning(f"Database locked, retrying ({attempt + 1}/{max_retries}): {e}")
                    time.sleep(0.1 * (attempt + 1))  # Exponential backoff
                    continue
                else:
                    logger.error(f"Failed to deliver mail after {max_retries} attempts: {e}")
                    db_session.rollback()
                    return '554 Transaction failed'
            except Exception as e:
                logger.error(f"Unexpected error during mail delivery: {e}")
                return '554 Transaction failed'

        return '554 Transaction failed after retries'

def create_smtp_controller(hostname="0.0.0.0", port=2525):
    handler = SandeshSMTPHandler()
    # 🛡️ Sentinel: Set strict data size limit (200KB) to prevent DoS via large emails.
    # This aligns with the API limit of 100KB body + headers overhead.
    controller = Controller(handler, hostname=hostname, port=port, data_size_limit=204800)
    return controller
