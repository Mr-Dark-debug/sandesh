from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from .deps import get_user_service, get_current_admin
from ..services.user_service import UserService
from ..core.entities.user import User
from ..core.exceptions import SandeshError

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    is_admin: bool

@router.get("", response_model=List[UserResponse])
def list_users(
    admin: User = Depends(get_current_admin),
    user_service: UserService = Depends(get_user_service)
):
    users = user_service.get_all_users()
    return [UserResponse(id=u.id, username=u.username, is_admin=u.is_admin) for u in users]

@router.post("", response_model=UserResponse)
def create_user(
    user_in: UserCreate,
    admin: User = Depends(get_current_admin),
    user_service: UserService = Depends(get_user_service)
):
    try:
        new_user = user_service.create_user(user_in.username, user_in.password)
        return UserResponse(id=new_user.id, username=new_user.username, is_admin=new_user.is_admin)
    except SandeshError as e:
        raise HTTPException(status_code=400, detail=str(e))
