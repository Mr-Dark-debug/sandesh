import os
import secrets
from pydantic import BaseModel


class Settings(BaseModel):
    NAMESPACE: str
    ADMIN_USER: str
    ADMIN_PASSWORD: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "sqlite:////data/sandesh.db"

    @classmethod
    def load_from_env(cls):
        namespace = os.getenv("SANDESH_NAMESPACE")
        admin_user = os.getenv("SANDESH_ADMIN_USER")
        admin_password = os.getenv("SANDESH_ADMIN_PASSWORD")
        
        # Database URL from environment (uses standard sqlite:// not aiosqlite)
        database_url = os.getenv("DATABASE_URL", "sqlite:////data/sandesh.db")

        # In production, SECRET_KEY should be set explicitly for token persistence
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
            SECRET_KEY=secret_key,
            DATABASE_URL=database_url
        )


# Instantiate settings
try:
    settings = Settings.load_from_env()
except ValueError as e:
    # For build environments where env vars may not be set
    print(f"Config Warning: {e}")
    settings = None
