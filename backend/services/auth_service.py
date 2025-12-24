from typing import Optional
from ..core.entities.user import User
from ..core.exceptions import AuthenticationError
from ..infrastructure.db.repositories import UserRepository
from ..infrastructure.security.password import verify_password, get_password_hash
from ..infrastructure.security.jwt import create_access_token


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """
        Authenticate a user with username and password.
        Returns User if valid, None otherwise.
        """
        user = self.user_repo.get_by_username(username)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def create_token(self, user: User) -> str:
        """Create JWT access token for the user."""
        return create_access_token(data={"sub": user.username})
