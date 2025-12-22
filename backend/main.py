from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.future import select
import contextlib
import logging
import os

from .infrastructure.db.session import engine, Base, SessionLocal
from .infrastructure.db.repositories import UserRepository, FolderRepository
from .infrastructure.db.models import UserModel
from .infrastructure.security.password import get_password_hash
from .infrastructure.smtp.smtp_server import create_smtp_controller
from .api import auth, users, folders, mail
from .config import settings
from .core.entities.user import User

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sandesh")

# Lifecycle Manager
@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Sandesh Backend...")

    # Initialize DB Tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Check/Create Admin
    async with SessionLocal() as session:
        user_repo = UserRepository(session)
        folder_repo = FolderRepository(session)

        # We need to query directly or use repo. Repo uses domain entities.
        # But for admin check, we might want to check DB directly or use repo.
        # Let's use repo.
        admin = await user_repo.get_by_username(settings.ADMIN_USER)
        if not admin:
            logger.info("Creating Admin user...")
            new_admin = User(
                id=None,
                username=settings.ADMIN_USER,
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                is_admin=True
            )
            saved_admin = await user_repo.save(new_admin)

            # Create Default Folders for Admin manually or via Service.
            # Since we are in lifespan, constructing a Service might be overkill,
            # but cleaner. Let's just use Repo to avoid Service dependency loops if any.
            from .core.entities.folder import Folder
            folders_to_create = [
                Folder(id=None, name="Inbox", user_id=saved_admin.id),
                Folder(id=None, name="Sent", user_id=saved_admin.id),
                Folder(id=None, name="Trash", user_id=saved_admin.id)
            ]
            folder_repo.add_all(folders_to_create)
            await session.commit()

    # Start SMTP Server
    smtp_controller = create_smtp_controller()
    smtp_controller.start()
    logger.info("SMTP Server started on port 2525")

    yield

    # Shutdown
    smtp_controller.stop()
    logger.info("SMTP Server stopped")


app = FastAPI(title="Sandesh", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(folders.router, prefix="/api/folders", tags=["Folders"])
app.include_router(mail.router, prefix="/api", tags=["Mail"])

# Serve Frontend Static Files
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
else:
    logger.warning("Static directory not found. Frontend will not be served.")
