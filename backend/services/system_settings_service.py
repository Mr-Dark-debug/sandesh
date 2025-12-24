from typing import Optional
import re
from ..core.entities.user import SystemSettings
from ..core.exceptions import SandeshError, ValidationError
from ..infrastructure.db.repositories import SystemSettingsRepository


class SystemSettingsService:
    """
    Service for managing system-wide settings.
    
    Business Rules:
    - Only admins can modify settings
    - Namespace changes require explicit confirmation
    - Namespace must be valid (alphanumeric, lowercase, 2-20 chars)
    - Existing emails keep their stored sender (no retroactive rewrite)
    """
    
    NAMESPACE_PATTERN = re.compile(r'^[a-z][a-z0-9\-]{1,19}$')
    
    def __init__(self, settings_repo: SystemSettingsRepository):
        self.settings_repo = settings_repo
    
    def get_settings(self) -> SystemSettings:
        """Get current system settings."""
        return self.settings_repo.get()
    
    def update_settings(
        self, 
        instance_name: Optional[str] = None,
        mail_namespace: Optional[str] = None,
        confirm_namespace_change: bool = False
    ) -> SystemSettings:
        """
        Update system settings.
        
        Args:
            instance_name: New instance name (optional)
            mail_namespace: New namespace (requires confirm_namespace_change=True)
            confirm_namespace_change: Must be True to change namespace
            
        Raises:
            ValidationError: If namespace is invalid
            SandeshError: If namespace change not confirmed
        """
        current = self.settings_repo.get()
        
        # Update instance name if provided
        if instance_name is not None:
            if len(instance_name.strip()) < 1:
                raise ValidationError("Instance name cannot be empty")
            if len(instance_name) > 50:
                raise ValidationError("Instance name too long (max 50 characters)")
            current.instance_name = instance_name.strip()
        
        # Update namespace if provided (with confirmation)
        if mail_namespace is not None and mail_namespace != current.mail_namespace:
            # Validate namespace format
            namespace_lower = mail_namespace.lower().strip()
            if not self.NAMESPACE_PATTERN.match(namespace_lower):
                raise ValidationError(
                    "Invalid namespace format. Must be 2-20 characters, "
                    "start with a letter, and contain only lowercase letters, numbers, and hyphens."
                )
            
            # Require explicit confirmation
            if not confirm_namespace_change:
                raise SandeshError(
                    "Changing the namespace affects all user email addresses. "
                    "Set confirm_namespace_change=True to proceed."
                )
            
            current.mail_namespace = namespace_lower
        
        return self.settings_repo.update(current)
    
    def get_email_address(self, username: str) -> str:
        """Generate email address for a username using current namespace."""
        settings = self.get_settings()
        return f"{username}@{settings.mail_namespace}"
    
    def get_namespace_change_warnings(self, new_namespace: str) -> list:
        """Get warnings about namespace change impact."""
        current = self.get_settings()
        warnings = []
        
        if new_namespace != current.mail_namespace:
            warnings.append(
                f"Email addresses will change from @{current.mail_namespace} to @{new_namespace}"
            )
            warnings.append(
                "Existing emails will keep their stored sender addresses"
            )
            warnings.append(
                "Users will need to be informed of their new email addresses"
            )
            warnings.append(
                "External systems may need to be updated"
            )
        
        return warnings
