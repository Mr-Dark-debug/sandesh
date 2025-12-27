from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from .deps import get_auth_service, get_db
from ..services.auth_service import AuthService
from ..core.entities.user import User
from ..infrastructure.db.repositories import SystemSettingsRepository

router = APIRouter()


class LoginRequest(BaseModel):
    username: str = Field(..., max_length=100)
    password: str = Field(..., max_length=128)


class UserResponse(BaseModel):
    """User info returned on login."""
    id: int
    username: str
    display_name: Optional[str]
    email_address: Optional[str]
    is_admin: bool


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


@router.post("/login", response_model=Token)
def login(
    form_data: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
    db=Depends(get_db)
):
    """
    Authenticate user and return JWT token.
    """
    user = auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if hasattr(user, 'is_active') and not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
        )
    
    # Get namespace for email address
    settings_repo = SystemSettingsRepository(db)
    settings = settings_repo.get()
    email_address = f"{user.username}@{settings.mail_namespace}"

    access_token = auth_service.create_token(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user.id, 
            username=user.username, 
            display_name=user.display_name if hasattr(user, 'display_name') else None,
            email_address=email_address,
            is_admin=user.is_admin
        )
    }
