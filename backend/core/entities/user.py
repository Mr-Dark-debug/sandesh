from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


@dataclass
class User:
    """
    User domain entity.
    
    Identity Rules:
    - username: Immutable, unique identifier (used in email address)
    - display_name: Mutable, human-friendly name (shown in UI and email headers)
    - email_address: Derived as username@namespace (NEVER manually edited)
    """
    id: Optional[int]
    username: str
    password_hash: str
    is_admin: bool = False
    is_active: bool = True
    display_name: Optional[str] = None
    signature: Optional[str] = None
    avatar_color: Optional[str] = "#A3A380"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Computed fields (set by service layer)
    email_address: Optional[str] = field(default=None, repr=False)
    
    def get_display_name(self) -> str:
        """Returns display name or username as fallback."""
        return self.display_name or self.username
    
    def get_formatted_sender(self) -> str:
        """Returns formatted sender string: 'Display Name <email@namespace>'"""
        if self.email_address:
            return f"{self.get_display_name()} <{self.email_address}>"
        return self.username
    
    def get_initials(self) -> str:
        """Returns initials for avatar display."""
        name = self.get_display_name()
        parts = name.split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[-1][0]).upper()
        return name[0:2].upper() if name else "U"


@dataclass
class SystemSettings:
    """
    System-wide configuration (singleton).
    
    - instance_name: Display name for the Sandesh instance
    - mail_namespace: Domain part of email addresses (e.g., 'sandesh', 'office')
    
    All email addresses are: username@mail_namespace
    """
    id: int = 1
    instance_name: str = "Sandesh"
    mail_namespace: str = "local"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def get_email_address(self, username: str) -> str:
        """Generate email address for a username."""
        return f"{username}@{self.mail_namespace}"
