"""
User Management API

Admin endpoints for user management.
User endpoints for profile management.
"""
from typing import List, Optional
import re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from .deps import get_user_service, get_current_admin, get_current_user, get_db
from ..services.user_service import UserService
from ..core.entities.user import User
from ..core.exceptions import SandeshError, ValidationError, EntityNotFoundError
from ..infrastructure.db.repositories import UserRepository, FolderRepository, SystemSettingsRepository

router = APIRouter()


# Request/Response Models
class UserCreate(BaseModel):
    """Request to create a new user (admin only)."""
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=6)
    display_name: Optional[str] = Field(None, max_length=50)

    @field_validator('display_name')
    @classmethod
    def sanitize_display_name(cls, v: Optional[str]) -> Optional[str]:
        if v:
            # Security: Prevent Header Injection by removing control characters
            return re.sub(r'[\r\n]', ' ', v).strip()
        return v


class UserResponse(BaseModel):
    """User information response."""
    id: int
    username: str
    display_name: Optional[str]
    email_address: Optional[str]
    is_admin: bool
    is_active: bool = True
    avatar_color: Optional[str] = None
    signature: Optional[str] = None


class ProfileUpdate(BaseModel):
    """Request to update user profile."""
    display_name: Optional[str] = Field(None, min_length=1, max_length=50)
    signature: Optional[str] = Field(None, max_length=500)
    avatar_color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')

    @field_validator('display_name')
    @classmethod
    def sanitize_display_name(cls, v: Optional[str]) -> Optional[str]:
        if v:
            # Security: Prevent Header Injection by removing control characters
            return re.sub(r'[\r\n]', ' ', v).strip()
        return v


class ProfileResponse(BaseModel):
    """User profile response with full identity info."""
    id: int
    username: str
    display_name: str
    email_address: str
    formatted_sender: str
    is_admin: bool
    avatar_color: Optional[str]
    signature: Optional[str]
    initials: str


# Extended dependency to include settings
def get_user_service_with_settings(session=Depends(get_db)) -> UserService:
    return UserService(
        UserRepository(session),
        FolderRepository(session),
        SystemSettingsRepository(session)
    )


def _to_response(user: User) -> UserResponse:
    """Convert User entity to response model."""
    return UserResponse(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        email_address=user.email_address,
        is_admin=user.is_admin,
        is_active=user.is_active if hasattr(user, 'is_active') else True,
        avatar_color=user.avatar_color,
        signature=user.signature
    )


def _to_profile_response(user: User) -> ProfileResponse:
    """Convert User entity to profile response."""
    return ProfileResponse(
        id=user.id,
        username=user.username,
        display_name=user.get_display_name(),
        email_address=user.email_address or f"{user.username}@local",
        formatted_sender=user.get_formatted_sender(),
        is_admin=user.is_admin,
        avatar_color=user.avatar_color,
        signature=user.signature,
        initials=user.get_initials()
    )


# ==========================================
# Admin Endpoints
# ==========================================

@router.get("", response_model=List[UserResponse])
def list_users(
    admin: User = Depends(get_current_admin),
    user_service: UserService = Depends(get_user_service_with_settings)
):
    """
    Get all users (admin only).
    """
    users = user_service.get_all_users()
    return [_to_response(u) for u in users]


@router.post("", response_model=UserResponse)
def create_user(
    user_in: UserCreate,
    admin: User = Depends(get_current_admin),
    user_service: UserService = Depends(get_user_service_with_settings)
):
    """
    Create a new user (admin only).
    
    Username becomes part of email address and cannot be changed.
    """
    try:
        new_user = user_service.create_user(
            username=user_in.username,
            password=user_in.password,
            display_name=user_in.display_name
        )
        return _to_response(new_user)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except SandeshError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}")
def deactivate_user(
    user_id: int,
    admin: User = Depends(get_current_admin),
    user_service: UserService = Depends(get_user_service_with_settings)
):
    """
    Deactivate a user (admin only).
    User data is preserved but they cannot log in.
    """
    try:
        success = user_service.deactivate_user(user_id)
        if success:
            return {"message": "User deactivated successfully"}
        raise HTTPException(status_code=404, detail="User not found")
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except SandeshError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==========================================
# User Profile Endpoints (Self-service)
# ==========================================

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service_with_settings)
):
    """
    Get current user's profile with full identity information.
    """
    user = user_service.get_user_by_id(current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _to_profile_response(user)


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    profile: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service_with_settings)
):
    """
    Update current user's profile.
    
    Editable fields:
    - display_name: How you appear in emails and UI
    - signature: Appended to outgoing emails
    - avatar_color: Color for your avatar
    
    Read-only (cannot change):
    - username: Part of your email address
    - email_address: Derived from username and system namespace
    """
    try:
        updated = user_service.update_profile(
            user_id=current_user.id,
            display_name=profile.display_name,
            signature=profile.signature,
            avatar_color=profile.avatar_color
        )
        return _to_profile_response(updated)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
