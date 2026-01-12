
import sys
import os
import time
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend to path
sys.path.append(os.getcwd())

from backend.infrastructure.db.models import Base, UserModel, FolderModel, EmailModel
from backend.infrastructure.db.repositories import UserRepository, FolderRepository, EmailRepository
from backend.services.mail_service import MailService
from backend.infrastructure.smtp.smtp_client import SMTPClient

# Mock SMTP Client
class MockSMTPClient:
    def send_message(self, **kwargs):
        pass

def setup_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)

def benchmark():
    SessionLocal = setup_db()
    session = SessionLocal()

    # Setup Repos
    user_repo = UserRepository(session)
    folder_repo = FolderRepository(session)
    email_repo = EmailRepository(session)
    smtp_client = MockSMTPClient()
    service = MailService(email_repo, folder_repo, user_repo, smtp_client)

    # Create 100 users
    print("Creating 100 users...")
    for i in range(100):
        user = UserModel(username=f"user{i}", password_hash="hash", display_name=f"User {i}")
        session.add(user)
    session.commit()

    # Create Inboxes for them (to simulate normal state)
    print("Creating Inboxes...")
    for i in range(100):
        folder = FolderModel(name="Inbox", user_id=i+1)
        session.add(folder)
    session.commit()

    # Recipients list (100 users)
    recipients = [f"user{i}@local" for i in range(100)]
    sender = "sender@local"
    subject = "Benchmark"
    body = "Test body"

    print("Starting delivery to 100 recipients...")
    start_time = time.time()

    # Run the delivery
    service.deliver_incoming_mail(sender, recipients, subject, body)

    end_time = time.time()
    print(f"Delivery took: {end_time - start_time:.4f} seconds")

    # Verify
    count = session.query(EmailModel).count()
    print(f"Emails created: {count}")

if __name__ == "__main__":
    benchmark()
