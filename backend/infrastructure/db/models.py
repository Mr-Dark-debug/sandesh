from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from .session import Base

# PRESERVED SCHEMA EXACTLY
class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)

    # Relationships
    emails = relationship("EmailModel", back_populates="owner")
    folders = relationship("FolderModel", back_populates="owner")

class FolderModel(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("UserModel", back_populates="folders")
    emails = relationship("EmailModel", back_populates="folder_rel")

class EmailModel(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True)

    sender = Column(String, nullable=False)
    recipients = Column(Text, nullable=False) # JSON string
    subject = Column(String, nullable=True)
    body = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    owner = relationship("UserModel", back_populates="emails")
    folder_rel = relationship("FolderModel", back_populates="emails")
