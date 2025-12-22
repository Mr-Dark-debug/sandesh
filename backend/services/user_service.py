from typing import List, Optional
from ..core.entities.user import User
from ..core.entities.folder import Folder
from ..core.exceptions import SandeshError
from ..infrastructure.db.repositories import UserRepository, FolderRepository
from ..infrastructure.security.password import get_password_hash

class UserService:
    def __init__(self, user_repo: UserRepository, folder_repo: FolderRepository):
        self.user_repo = user_repo
        self.folder_repo = folder_repo

    def get_all_users(self) -> List[User]:
        return self.user_repo.get_all()

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.user_repo.get_by_username(username)

    def create_user(self, username: str, password: str) -> User:
        existing = self.user_repo.get_by_username(username)
        if existing:
            raise SandeshError("Username already registered")

        # 1. Create User
        new_user = User(
            id=None,
            username=username,
            password_hash=get_password_hash(password),
            is_admin=False
        )
        saved_user = self.user_repo.save(new_user)

        # 2. Create Default Folders
        folders = [
            Folder(id=None, name="Inbox", user_id=saved_user.id),
            Folder(id=None, name="Sent", user_id=saved_user.id),
            Folder(id=None, name="Trash", user_id=saved_user.id)
        ]
        self.folder_repo.add_all(folders)

        # We need to commit the folders.
        # Ideally Unit of Work pattern, but for now we rely on the session being committed
        # by the caller (Route or Unit of Work middleware).
        # However, to ensure logic correctness, the Repository 'save' flushes.
        # But `add_all` typically just adds to session.
        # We should probably expose a commit/flush mechanism or trust the session lifecycle.

        return saved_user
