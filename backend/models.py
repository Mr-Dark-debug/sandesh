from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)

    # Relationships
    emails = relationship("Email", back_populates="owner")
    folders = relationship("Folder", back_populates="owner")

class Folder(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="folders")
    emails = relationship("Email", back_populates="folder_rel")

class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True) # If None, maybe system? But we should use IDs.

    # Store explicit folder name for simplicity if we want, but relational is better.
    # Requirement: "Custom folders".
    # We'll use folder_id.
    # But wait, standard folders (Inbox, Sent) are they "real" folders in DB or just labels?
    # Relational approach: User has many Folders. Inbox/Sent are created for every user.

    sender = Column(String, nullable=False)
    recipients = Column(Text, nullable=False) # JSON string of ["a@b", "c@d"]
    subject = Column(String, nullable=True)
    body = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="emails")
    folder_rel = relationship("Folder", back_populates="emails")

    def set_recipients(self, recipients_list):
        self.recipients = json.dumps(recipients_list)

    def get_recipients(self):
        return json.loads(self.recipients)
