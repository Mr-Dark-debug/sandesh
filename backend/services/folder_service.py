from typing import List, Optional
from ..core.entities.folder import Folder
from ..core.entities.user import User
from ..core.exceptions import SandeshError
from ..infrastructure.db.repositories import FolderRepository

class FolderService:
    def __init__(self, folder_repo: FolderRepository):
        self.folder_repo = folder_repo

    def get_user_folders(self, user_id: int) -> List[Folder]:
        return self.folder_repo.get_by_user_id(user_id)

    def create_folder(self, name: str, user: User) -> Folder:
        existing = self.folder_repo.get_by_name_and_user(name, user.id)
        if existing:
            raise SandeshError("Folder already exists")

        new_folder = Folder(id=None, name=name, user_id=user.id)
        return self.folder_repo.save(new_folder)
