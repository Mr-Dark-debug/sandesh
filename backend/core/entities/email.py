from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional


@dataclass
class Email:
    """
    Email domain entity.
    
    Sender Identity Fields:
    - sender: Full formatted sender string (backward compatible)
    - sender_display_name: Display name of sender at send time
    - sender_email: Email address of sender at send time
    
    These are stored at send time and NEVER rewritten, even if namespace changes.
    """
    id: Optional[int]
    owner_id: int
    folder_id: Optional[int]
    sender: str  # Legacy: full sender string or email only
    subject: Optional[str]
    body: Optional[str]
    recipients: List[str] = field(default_factory=list)
    is_read: bool = False
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    # Extended identity fields
    sender_display_name: Optional[str] = None
    sender_email: Optional[str] = None
    
    def get_formatted_sender(self) -> str:
        """
        Returns properly formatted sender string.
        Format: 'Display Name <email@namespace>'
        Falls back to sender field for backward compatibility.
        """
        if self.sender_display_name and self.sender_email:
            return f"{self.sender_display_name} <{self.sender_email}>"
        elif self.sender_email:
            return self.sender_email
        return self.sender
    
    def get_sender_name(self) -> str:
        """Returns just the display name or parsed name from sender."""
        if self.sender_display_name:
            return self.sender_display_name
        # Try to parse from sender field
        if '<' in self.sender:
            return self.sender.split('<')[0].strip()
        if '@' in self.sender:
            return self.sender.split('@')[0]
        return self.sender
    
    def get_sender_email_only(self) -> str:
        """Returns just the email address portion."""
        if self.sender_email:
            return self.sender_email
        # Try to parse from sender field
        if '<' in self.sender and '>' in self.sender:
            start = self.sender.index('<') + 1
            end = self.sender.index('>')
            return self.sender[start:end]
        return self.sender
