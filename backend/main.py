from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import contextlib
import logging
import os

from .infrastructure.db.session import engine, Base, SessionLocal
from .infrastructure.db.repositories import UserRepository, FolderRepository, SystemSettingsRepository
from .infrastructure.db.models import UserModel, SystemSettingsModel
from .infrastructure.security.password import get_password_hash
from .infrastructure.smtp.smtp_server import create_smtp_controller
from .api import auth, users, folders, mail, system
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
    Base.metadata.create_all(engine)

    # Initialize System Settings and Admin User
    with SessionLocal() as session:
        try:
            # Initialize System Settings (singleton)
            settings_repo = SystemSettingsRepository(session)
            system_settings = settings_repo.get()
            
            # Update namespace from env if set and different
            if settings and settings.NAMESPACE and settings.NAMESPACE != system_settings.mail_namespace:
                system_settings.mail_namespace = settings.NAMESPACE
                settings_repo.update(system_settings)
                logger.info(f"Updated namespace to: {settings.NAMESPACE}")
            
            logger.info(f"System namespace: {system_settings.mail_namespace}")

            # Check/Create Admin
            user_repo = UserRepository(session)
            folder_repo = FolderRepository(session)

            admin = user_repo.get_by_username(settings.ADMIN_USER)
            if not admin:
                logger.info("Creating Admin user...")
                new_admin = User(
                    id=None,
                    username=settings.ADMIN_USER,
                    password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                    is_admin=True,
                    is_active=True,
                    display_name=settings.ADMIN_USER.title()
                )
                saved_admin = user_repo.save(new_admin)

                # Create Default Folders for Admin
                from .core.entities.folder import Folder
                folders_to_create = [
                    Folder(id=None, name="Inbox", user_id=saved_admin.id),
                    Folder(id=None, name="Sent", user_id=saved_admin.id),
                    Folder(id=None, name="Trash", user_id=saved_admin.id)
                ]
                folder_repo.add_all(folders_to_create)
                session.commit()
                logger.info(f"Admin user '{settings.ADMIN_USER}' created successfully")
            else:
                logger.info(f"Admin user '{settings.ADMIN_USER}' already exists")
        except Exception as e:
            session.rollback()
            logger.error(f"Error during setup: {e}")
            raise

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
app.include_router(system.router, prefix="/api/system", tags=["System"])


# Health check endpoint (includes namespace info)
@app.get("/api/health")
def health_check():
    """
    Health check endpoint.
    Returns system status and namespace information.
    """
    namespace = settings.NAMESPACE if settings else "local"
    
    # Try to get current namespace from database
    try:
        with SessionLocal() as session:
            settings_repo = SystemSettingsRepository(session)
            system_settings = settings_repo.get()
            namespace = system_settings.mail_namespace
            instance_name = system_settings.instance_name
    except:
        instance_name = "Sandesh"
    
    return {
        "status": "healthy",
        "namespace": namespace,
        "instance_name": instance_name
    }


# Detect static directory
static_dir = None
possible_paths = ["backend/static", "static"]
for path in possible_paths:
    if os.path.exists(path):
        static_dir = path
        break

if static_dir:
    # Mount static files for assets
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")
    logger.info(f"Serving frontend from: {static_dir}")
    
    # Serve specific static files
    @app.get("/vite.svg")
    async def serve_vite_svg():
        return FileResponse(os.path.join(static_dir, "vite.svg"))
    
    @app.get("/favicon.ico")
    async def serve_favicon():
        favicon_path = os.path.join(static_dir, "favicon.ico")
        if os.path.exists(favicon_path):
            return FileResponse(favicon_path)
        return FileResponse(os.path.join(static_dir, "vite.svg"))
    
    # SPA catch-all route - must be defined last
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str, request: Request):
        """Serve index.html for all non-API routes (SPA routing)"""
        if full_path.startswith("api/"):
            return {"error": "Not found"}, 404
        
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        return {"error": "Frontend not found"}, 404
else:
    logger.warning("Static directory not found. Frontend will not be served.")
    logger.warning(f"Checked paths: {possible_paths}")
