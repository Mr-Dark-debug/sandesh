from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from ..infrastructure.db.session import SessionLocal
from ..infrastructure.db.repositories import UserRepository, FolderRepository, EmailRepository
from ..infrastructure.smtp.smtp_client import SMTPClient
from ..services.auth_service import AuthService
from ..services.user_service import UserService
from ..services.folder_service import FolderService
from ..services.mail_service import MailService
from ..infrastructure.security.jwt import decode_access_token
from ..core.entities.user import User
from ..config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Repositories
def get_user_repo(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

def get_folder_repo(db: AsyncSession = Depends(get_db)) -> FolderRepository:
    return FolderRepository(db)

def get_email_repo(db: AsyncSession = Depends(get_db)) -> EmailRepository:
    return EmailRepository(db)

# Infrastructure
def get_smtp_client() -> SMTPClient:
    return SMTPClient() # Config params defaults or from settings

# Services
def get_auth_service(user_repo: UserRepository = Depends(get_user_repo)) -> AuthService:
    return AuthService(user_repo)

def get_user_service(
    user_repo: UserRepository = Depends(get_user_repo),
    folder_repo: FolderRepository = Depends(get_folder_repo)
) -> UserService:
    return UserService(user_repo, folder_repo)

def get_folder_service(folder_repo: FolderRepository = Depends(get_folder_repo)) -> FolderService:
    return FolderService(folder_repo)

def get_mail_service(
    email_repo: EmailRepository = Depends(get_email_repo),
    folder_repo: FolderRepository = Depends(get_folder_repo),
    user_repo: UserRepository = Depends(get_user_repo),
    smtp_client: SMTPClient = Depends(get_smtp_client)
) -> MailService:
    return MailService(email_repo, folder_repo, user_repo, smtp_client)

# Current User
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_service: UserService = Depends(get_user_service)
) -> User:
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await user_service.get_user_by_username(username)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user
