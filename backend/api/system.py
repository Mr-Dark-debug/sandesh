"""
System Settings API (Admin Only)

Endpoints for managing system-wide configuration including namespace.
"""
from typing import List, Optional
import re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from .deps import get_current_admin, get_db
from ..core.entities.user import User
from ..core.exceptions import SandeshError, ValidationError
from ..services.system_settings_service import SystemSettingsService
from ..infrastructure.db.repositories import SystemSettingsRepository

router = APIRouter()


# Request/Response Models
class SystemSettingsResponse(BaseModel):
    """System settings response."""
    instance_name: str
    mail_namespace: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class SystemSettingsUpdate(BaseModel):
    """Request to update system settings."""
    instance_name: Optional[str] = Field(None, min_length=1, max_length=50)
    mail_namespace: Optional[str] = Field(None, min_length=2, max_length=20)
    confirm_namespace_change: bool = False

    @field_validator('mail_namespace')
    @classmethod
    def validate_namespace(cls, v: Optional[str]) -> Optional[str]:
        if v:
            # Security: Allow only lowercase letters, numbers, and hyphens to ensure valid email domain part
            if not re.match(r'^[a-z][a-z0-9-]*$', v):
                raise ValueError('Namespace must start with a letter and contain only lowercase letters, numbers, and hyphens')
        return v


class NamespaceChangeWarnings(BaseModel):
    """Warnings about namespace change impact."""
    current_namespace: str
    new_namespace: str
    warnings: List[str]


# Dependency
def get_settings_service(session=Depends(get_db)) -> SystemSettingsService:
    return SystemSettingsService(SystemSettingsRepository(session))


# Endpoints
@router.get("", response_model=SystemSettingsResponse)
def get_system_settings(
    admin: User = Depends(get_current_admin),
    service: SystemSettingsService = Depends(get_settings_service)
):
    """
    Get current system settings (admin only).
    """
    settings = service.get_settings()
    return SystemSettingsResponse(
        instance_name=settings.instance_name,
        mail_namespace=settings.mail_namespace,
        created_at=settings.created_at.isoformat() if settings.created_at else None,
        updated_at=settings.updated_at.isoformat() if settings.updated_at else None
    )


@router.put("", response_model=SystemSettingsResponse)
def update_system_settings(
    update: SystemSettingsUpdate,
    admin: User = Depends(get_current_admin),
    service: SystemSettingsService = Depends(get_settings_service)
):
    """
    Update system settings (admin only).
    
    Namespace changes require confirm_namespace_change=True.
    """
    try:
        settings = service.update_settings(
            instance_name=update.instance_name,
            mail_namespace=update.mail_namespace,
            confirm_namespace_change=update.confirm_namespace_change
        )
        return SystemSettingsResponse(
            instance_name=settings.instance_name,
            mail_namespace=settings.mail_namespace,
            created_at=settings.created_at.isoformat() if settings.created_at else None,
            updated_at=settings.updated_at.isoformat() if settings.updated_at else None
        )
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except SandeshError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/namespace-warnings", response_model=NamespaceChangeWarnings)
def get_namespace_change_warnings(
    new_namespace: str,
    admin: User = Depends(get_current_admin),
    service: SystemSettingsService = Depends(get_settings_service)
):
    """
    Get warnings about the impact of changing the namespace.
    Use this before confirming a namespace change.
    """
    current = service.get_settings()
    warnings = service.get_namespace_change_warnings(new_namespace)
    
    return NamespaceChangeWarnings(
        current_namespace=current.mail_namespace,
        new_namespace=new_namespace,
        warnings=warnings
    )
