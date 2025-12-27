from dataclasses import dataclass
from typing import Optional

@dataclass
class Folder:
    id: Optional[int]
    name: str
    user_id: int
    unread_count: int = 0
