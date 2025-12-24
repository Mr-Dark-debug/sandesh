from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from .session import Base


class SystemSettingsModel(Base):
    """
    Singleton table for system-wide configuration.
    Only one row should ever exist (id=1).
    """
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, default=1)
    instance_name = Column(String, nullable=False, default="Sandesh")
    mail_namespace = Column(String, nullable=False, default="local")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserModel(Base):
    """
    User model with identity fields.
    Email address is derived: username@namespace (NOT stored, computed at runtime).
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    
    # Identity (immutable)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    
    # Profile (mutable by user)
    display_name = Column(String, nullable=True)  # Human-friendly name
    signature = Column(Text, nullable=True)  # Email signature
    avatar_color = Column(String, nullable=True, default="#A3A380")  # Hex color for avatar
    
    # Role and status
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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
    """
    Email model with proper identity fields.
    Stores both display name and email address for sender.
    """
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True)

    # Sender identity (stored at send time, never rewritten)
    sender = Column(String, nullable=False)  # Legacy: email address or formatted
    sender_display_name = Column(String, nullable=True)  # Display name at send time
    sender_email = Column(String, nullable=True)  # Email address at send time
    
    recipients = Column(Text, nullable=False)  # JSON string
    subject = Column(String, nullable=True)
    body = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    owner = relationship("UserModel", back_populates="emails")
    folder_rel = relationship("FolderModel", back_populates="emails")
