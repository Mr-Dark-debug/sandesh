from typing import List, Optional
import re
from ..core.entities.user import User, SystemSettings
from ..core.entities.folder import Folder
from ..core.exceptions import SandeshError, ValidationError, EntityNotFoundError
from ..infrastructure.db.repositories import UserRepository, FolderRepository, SystemSettingsRepository
from ..infrastructure.security.password import get_password_hash


class UserService:
    """
    Service for user management.
    
    Identity Rules:
    - username: Immutable, unique, used in email address generation
    - display_name: Mutable by user, defaults to title-cased username
    - email_address: Derived server-side as username@namespace (read-only)
    """
    
    USERNAME_PATTERN = re.compile(r'^[a-z][a-z0-9_]{2,29}$')
    
    def __init__(
        self, 
        user_repo: UserRepository, 
        folder_repo: FolderRepository,
        settings_repo: Optional[SystemSettingsRepository] = None
    ):
        self.user_repo = user_repo
        self.folder_repo = folder_repo
        self.settings_repo = settings_repo

    def get_all_users(self) -> List[User]:
        """Get all registered users with computed email addresses."""
        users = self.user_repo.get_all()
        return [self._enrich_user(u) for u in users]
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get a user by ID with computed email address."""
        user = self.user_repo.get_by_id(user_id)
        return self._enrich_user(user) if user else None

    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get a user by their username with computed email address."""
        user = self.user_repo.get_by_username(username)
        return self._enrich_user(user) if user else None

    def create_user(
        self, 
        username: str, 
        password: str,
        display_name: Optional[str] = None,
        is_admin: bool = False
    ) -> User:
        """
        Create a new user with default folders.
        
        Args:
            username: Unique identifier (immutable, used in email)
            password: User password
            display_name: Optional display name (defaults to title-cased username)
            is_admin: Whether user has admin privileges
            
        Raises:
            ValidationError: If username format is invalid
            SandeshError: If username already exists
        """
        # Validate username format
        username_lower = username.lower().strip()
        if not self.USERNAME_PATTERN.match(username_lower):
            raise ValidationError(
                "Invalid username format. Must be 3-30 characters, "
                "start with a letter, and contain only lowercase letters, numbers, and underscores."
            )
        
        # Check for existing user
        existing = self.user_repo.get_by_username(username_lower)
        if existing:
            raise SandeshError("Username already registered")

        # Create User
        new_user = User(
            id=None,
            username=username_lower,
            password_hash=get_password_hash(password),
            is_admin=is_admin,
            is_active=True,
            display_name=display_name or username_lower.replace('_', ' ').title(),
            signature=None,
            avatar_color=self._generate_avatar_color(username_lower)
        )
        saved_user = self.user_repo.save(new_user)

        # Create Default Folders
        folders = [
            Folder(id=None, name="Inbox", user_id=saved_user.id),
            Folder(id=None, name="Sent", user_id=saved_user.id),
            Folder(id=None, name="Trash", user_id=saved_user.id)
        ]
        self.folder_repo.add_all(folders)

        return self._enrich_user(saved_user)
    
    def update_profile(
        self,
        user_id: int,
        display_name: Optional[str] = None,
        signature: Optional[str] = None,
        avatar_color: Optional[str] = None
    ) -> User:
        """
        Update user profile fields (user can update their own profile).
        
        Note: Username and email address are IMMUTABLE.
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise EntityNotFoundError("User not found")
        
        # Update mutable fields
        if display_name is not None:
            if len(display_name.strip()) < 1:
                raise ValidationError("Display name cannot be empty")
            if len(display_name) > 50:
                raise ValidationError("Display name too long (max 50 characters)")
            user.display_name = display_name.strip()
        
        if signature is not None:
            if len(signature) > 500:
                raise ValidationError("Signature too long (max 500 characters)")
            user.signature = signature
        
        if avatar_color is not None:
            # Basic hex color validation
            if not re.match(r'^#[0-9A-Fa-f]{6}$', avatar_color):
                raise ValidationError("Invalid color format. Use #RRGGBB")
            user.avatar_color = avatar_color
        
        saved = self.user_repo.save(user)
        return self._enrich_user(saved)
    
    def deactivate_user(self, user_id: int) -> bool:
        """
        Deactivate a user (soft delete).
        User data is preserved but they cannot log in.
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise EntityNotFoundError("User not found")
        
        if user.is_admin:
            raise SandeshError("Cannot deactivate admin users")
        
        return self.user_repo.deactivate(user_id)
    
    def _enrich_user(self, user: User) -> User:
        """Add computed email address to user."""
        if user and self.settings_repo:
            settings = self.settings_repo.get()
            user.email_address = f"{user.username}@{settings.mail_namespace}"
        return user
    
    def _generate_avatar_color(self, username: str) -> str:
        """Generate a consistent color based on username."""
        colors = [
            "#A3A380",  # Olive Petal
            "#D8A48F",  # Rose Blush
            "#BB8588",  # Peach Blossom
            "#D7CE93",  # Golden Clover
            "#8BA3A3",  # Muted Teal
            "#A38B8B",  # Dusty Rose
            "#8B9BA3",  # Slate Blue
            "#A3988B"   # Warm Taupe
        ]
        hash_value = sum(ord(c) for c in username)
        return colors[hash_value % len(colors)]
