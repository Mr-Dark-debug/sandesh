from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

@dataclass
class Email:
    id: Optional[int]
    owner_id: int
    folder_id: Optional[int]
    sender: str
    subject: Optional[str]
    body: Optional[str]
    recipients: List[str] = field(default_factory=list)
    is_read: bool = False
    timestamp: datetime = field(default_factory=datetime.utcnow)
