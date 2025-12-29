from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from .deps import get_auth_service, get_db
from ..services.auth_service import AuthService
from ..core.entities.user import User
from ..infrastructure.db.repositories import SystemSettingsRepository
from ..infrastructure.security.rate_limiter import limiter

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
    request: Request,
    form_data: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
    db=Depends(get_db)
):
    """
    Authenticate user and return JWT token.
    Protected by rate limiting: 5 attempts per minute per IP.
    """
    # Rate Limiting
    # Use client IP as the key. Fallback to 'unknown' if not present.
    client_ip = request.client.host if request.client else "unknown"

    # Allow 5 attempts per 60 seconds
    if not limiter.is_allowed(client_ip, limit=5, window_seconds=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )

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
