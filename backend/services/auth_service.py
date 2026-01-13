from typing import Optional
from ..core.entities.user import User
from ..core.exceptions import AuthenticationError
from ..infrastructure.db.repositories import UserRepository
from ..infrastructure.security.password import verify_password, get_password_hash
from ..infrastructure.security.jwt import create_access_token

# 🛡️ Sentinel: Pre-calculated dummy hash for constant-time verification
# This matches the work factor of real passwords (default bcrypt rounds)
DUMMY_HASH = '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxwKc.60VF/wzF/X1WzF/X1WzF/X1'

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """
        Authenticate a user with username and password.
        Returns User if valid, None otherwise.

        Protected against timing attacks:
        Execution time is consistent regardless of whether the user exists.
        """
        user = self.user_repo.get_by_username(username)

        if not user:
            # 🛡️ Sentinel: Mitigate timing attacks (user enumeration)
            # Perform a dummy verification to consume the same amount of time
            verify_password(password, DUMMY_HASH)
            return None

        if not verify_password(password, user.password_hash):
            return None

        return user

    def create_token(self, user: User) -> str:
        """Create JWT access token for the user."""
        return create_access_token(data={"sub": user.username})
