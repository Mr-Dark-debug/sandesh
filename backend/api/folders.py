from typing import List
import re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from .deps import get_folder_service, get_current_user
from ..services.folder_service import FolderService
from ..core.entities.user import User
from ..core.exceptions import SandeshError

router = APIRouter()

# ⚡ Bolt: Pre-compile regex for performance
FOLDER_NAME_REGEX = re.compile(r'^[a-zA-Z0-9 _\-.\(\)]+$')

class FolderResponse(BaseModel):
    id: int
    name: str
    unread_count: int = 0


class FolderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Folder name")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        # Security: Prevent weird characters in folder names
        # Expanded to allow dots and parenthesis for versions/grouping
        stripped = v.strip()
        if not stripped:
            raise ValueError('Folder name cannot be empty or whitespace only')

        if not FOLDER_NAME_REGEX.match(v):
            raise ValueError('Folder name must contain only letters, numbers, spaces, underscores, hyphens, dots, and parentheses')
        return stripped


@router.get("", response_model=List[FolderResponse])
def get_folders(
    current_user: User = Depends(get_current_user),
    folder_service: FolderService = Depends(get_folder_service)
):
    """
    Get all folders for the current user.
    """
    folders = folder_service.get_user_folders(current_user.id)
    return [FolderResponse(id=f.id, name=f.name, unread_count=f.unread_count) for f in folders]


@router.post("", response_model=FolderResponse)
def create_folder(
    folder_in: FolderCreate,
    current_user: User = Depends(get_current_user),
    folder_service: FolderService = Depends(get_folder_service)
):
    """
    Create a new folder for the current user.
    """
    try:
        new_folder = folder_service.create_folder(folder_in.name, current_user)
        return FolderResponse(id=new_folder.id, name=new_folder.name)
    except SandeshError as e:
        raise HTTPException(status_code=400, detail=str(e))
