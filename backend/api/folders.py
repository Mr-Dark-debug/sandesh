from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from .deps import get_folder_service, get_current_user
from ..services.folder_service import FolderService
from ..core.entities.user import User
from ..core.exceptions import SandeshError

router = APIRouter()


class FolderResponse(BaseModel):
    id: int
    name: str


class FolderCreate(BaseModel):
    name: str


@router.get("", response_model=List[FolderResponse])
def get_folders(
    current_user: User = Depends(get_current_user),
    folder_service: FolderService = Depends(get_folder_service)
):
    """
    Get all folders for the current user.
    """
    folders = folder_service.get_user_folders(current_user.id)
    return [FolderResponse(id=f.id, name=f.name) for f in folders]


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
