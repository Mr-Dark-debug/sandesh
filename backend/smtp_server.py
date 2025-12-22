import asyncio
import logging
import email
from email.message import EmailMessage
from email import policy
from aiosmtpd.controller import Controller
from sqlalchemy.future import select
from .database import SessionLocal
from .models import User, Email, Folder
from .config import settings
import json

logger = logging.getLogger("sandesh.smtp")

class SandeshSMTPHandler:
    async def handle_DATA(self, server, session, envelope):
        peer = session.peer
        mail_from = envelope.mail_from
        rcpt_tos = envelope.rcpt_tos
        data = envelope.content  # This is bytes

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

        async with SessionLocal() as db_session:
            # We process each recipient
            for rcpt in rcpt_tos:
                # 1. Parse username and namespace
                if '@' not in rcpt:
                    logger.warning(f"Invalid recipient format: {rcpt}")
                    continue

                username, domain = rcpt.split('@', 1)

                # Check namespace (optional, but good practice to enforce local only)
                if domain != settings.NAMESPACE:
                    logger.warning(f"Rejecting mail for foreign domain: {domain}")
                    continue

                # 2. Find User
                result = await db_session.execute(select(User).where(User.username == username))
                user = result.scalars().first()

                if not user:
                    logger.warning(f"User not found: {username}")
                    continue

                # 3. Find Inbox Folder
                # We assume 'Inbox' exists for every user.
                # Optimization: Cache folder IDs or Look it up.
                result = await db_session.execute(
                    select(Folder).where(Folder.user_id == user.id, Folder.name == "Inbox")
                )
                inbox_folder = result.scalars().first()

                if not inbox_folder:
                    logger.error(f"Inbox folder missing for user {username}")
                    # Auto-create if missing? Or fail?
                    # Let's auto-create to be robust
                    inbox_folder = Folder(name="Inbox", user_id=user.id)
                    db_session.add(inbox_folder)
                    await db_session.commit()
                    await db_session.refresh(inbox_folder)

                # 4. Create Email Record
                new_email = Email(
                    owner_id=user.id,
                    folder_id=inbox_folder.id,
                    sender=mail_from,
                    subject=subject,
                    body=body,
                    is_read=False
                )
                new_email.set_recipients(rcpt_tos)

                db_session.add(new_email)
                logger.info(f"Delivered mail to {username} Inbox")

            await db_session.commit()

        return '250 OK'

def create_smtp_controller(hostname="0.0.0.0", port=2525):
    handler = SandeshSMTPHandler()
    controller = Controller(handler, hostname=hostname, port=port)
    return controller
