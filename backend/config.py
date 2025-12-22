import os
import secrets
from pydantic import BaseModel

class Settings(BaseModel):
    NAMESPACE: str
    ADMIN_USER: str
    ADMIN_PASSWORD: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:////data/sandesh.db"

    @classmethod
    def load_from_env(cls):
        namespace = os.getenv("SANDESH_NAMESPACE")
        admin_user = os.getenv("SANDESH_ADMIN_USER")
        admin_password = os.getenv("SANDESH_ADMIN_PASSWORD")

        # In a real persistence scenario, we might want a fixed secret,
        # but for simplicity/security if not provided, we generate one.
        # However, for auth tokens to survive restart, it should be fixed or persisted.
        # We'll assume a restart invalidates tokens unless SECRET_KEY is set.
        secret_key = os.getenv("SANDESH_SECRET_KEY", secrets.token_hex(32))

        if not namespace:
            raise ValueError("SANDESH_NAMESPACE environment variable is required")
        if not admin_user:
            raise ValueError("SANDESH_ADMIN_USER environment variable is required")
        if not admin_password:
            raise ValueError("SANDESH_ADMIN_PASSWORD environment variable is required")

        return cls(
            NAMESPACE=namespace,
            ADMIN_USER=admin_user,
            ADMIN_PASSWORD=admin_password,
            SECRET_KEY=secret_key
        )

# Instantiate settings
try:
    # We catch error here so import doesn't fail during build/test if envs are missing
    # but application startup will fail if checked.
    # For now, we will lazy load or check in main.
    settings = Settings.load_from_env()
except ValueError as e:
    # Check if we are in a build environment or running
    # We'll let it fail at runtime if imported
    print(f"Config Warning: {e}")
    settings = None
