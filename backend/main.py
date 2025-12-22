from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List, Optional
import os
import contextlib
import logging

from .database import get_db, engine, Base
from .models import User, Email, Folder
from .auth import get_password_hash, verify_password, create_access_token, decode_access_token
from .config import settings
from .smtp_server import create_smtp_controller

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sandesh")

# Pydantic Models
class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    is_admin: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    username: str
    password: str

class EmailSendRequest(BaseModel):
    to: List[str]
    cc: List[str] = []
    subject: str
    body: str

class EmailResponse(BaseModel):
    id: int
    sender: str
    recipients: List[str]
    subject: str
    body: str
    timestamp: str
    is_read: bool
    folder_id: int

    class Config:
        from_attributes = True

    # Custom validator/serializer to convert recipients JSON to list?
    # Pydantic v2 uses field_validator, v1 uses validator.
    # To keep it simple and compatible, we might need a manual conversion in the route
    # OR use a property in the ORM model.
    # Let's rely on manual conversion in the endpoint for maximum control.

class FolderResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

# Lifecycle Manager
@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Sandesh Backend...")

    # Initialize DB Tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Check/Create Admin
    async with engine.begin() as conn:
        # We need a session for logic
        pass

    # Using a session to ensure Admin exists
    async with AsyncSession(engine) as session:
        result = await session.execute(select(User).where(User.username == settings.ADMIN_USER))
        admin = result.scalars().first()
        if not admin:
            logger.info("Creating Admin user...")
            admin = User(
                username=settings.ADMIN_USER,
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                is_admin=True
            )
            session.add(admin)
            await session.commit()
            await session.refresh(admin)

            # Create Default Folders for Admin
            session.add_all([
                Folder(name="Inbox", user_id=admin.id),
                Folder(name="Sent", user_id=admin.id),
                Folder(name="Trash", user_id=admin.id)
            ])
            await session.commit()

    # Start SMTP Server
    # Note: Controller is sync/threaded wrapper around asyncio logic or purely async?
    # aiosmtpd Controller runs in a separate thread by default.
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
    allow_origins=["*"], # Tighten for production if needed, but local usage * is fine
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencies
oauth2_scheme = None # We use custom login endpoint

async def get_current_user(token: str = Depends(lambda x: x), db: AsyncSession = Depends(get_db)):
    # This is a placeholder. Real auth uses the Authorization header.
    pass

from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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

    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user

# API Endpoints

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }

@app.get("/api/users", response_model=List[UserResponse])
async def list_users(admin: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()

@app.post("/api/users", response_model=UserResponse)
async def create_user(user_in: UserCreate, admin: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    # Check existing
    result = await db.execute(select(User).where(User.username == user_in.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username already registered")

    new_user = User(
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
        is_admin=False
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Create default folders
    db.add_all([
        Folder(name="Inbox", user_id=new_user.id),
        Folder(name="Sent", user_id=new_user.id),
        Folder(name="Trash", user_id=new_user.id)
    ])
    await db.commit()

    return new_user

@app.get("/api/folders", response_model=List[FolderResponse])
async def get_folders(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Folder).where(Folder.user_id == current_user.id))
    return result.scalars().all()

@app.post("/api/folders", response_model=FolderResponse)
async def create_folder(name: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Check if exists
    result = await db.execute(select(Folder).where(Folder.user_id == current_user.id, Folder.name == name))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Folder already exists")

    new_folder = Folder(name=name, user_id=current_user.id)
    db.add(new_folder)
    await db.commit()
    await db.refresh(new_folder)
    return new_folder

@app.get("/api/mail/{folder_id}", response_model=List[EmailResponse])
async def get_mail_in_folder(folder_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Verify folder belongs to user
    result = await db.execute(select(Folder).where(Folder.id == folder_id, Folder.user_id == current_user.id))
    folder = result.scalars().first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    result = await db.execute(
        select(Email)
        .where(Email.folder_id == folder_id)
        .order_by(Email.timestamp.desc())
    )
    emails = result.scalars().all()

    # Convert recipients from JSON to list
    resp = []
    for e in emails:
        er = EmailResponse.model_validate(e)
        er.recipients = e.get_recipients()
        resp.append(er)
    return resp

@app.get("/api/message/{email_id}", response_model=EmailResponse)
async def get_email(email_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Email).where(Email.id == email_id, Email.owner_id == current_user.id))
    email = result.scalars().first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    if not email.is_read:
        email.is_read = True
        await db.commit()
        await db.refresh(email)

    er = EmailResponse.model_validate(email)
    er.recipients = email.get_recipients()
    return er

@app.put("/api/message/{email_id}/move")
async def move_email(email_id: int, folder_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Verify email ownership
    result = await db.execute(select(Email).where(Email.id == email_id, Email.owner_id == current_user.id))
    email = result.scalars().first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    # Verify target folder ownership
    result = await db.execute(select(Folder).where(Folder.id == folder_id, Folder.user_id == current_user.id))
    folder = result.scalars().first()
    if not folder:
        raise HTTPException(status_code=404, detail="Target folder not found")

    email.folder_id = folder_id
    await db.commit()
    return {"status": "moved"}

from smtplib import SMTP

@app.post("/api/mail/send")
async def send_mail(email_in: EmailSendRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # 1. Validate recipients (basic check)
    all_recipients = email_in.to + email_in.cc
    # We could validate they exist locally, but standard SMTP practice often accepts and bounces.
    # Given our requirement "Send emails to each other", we should probably validate they exist to give immediate feedback?
    # Or just let SMTP handle it.
    # Decision: Let SMTP handle delivery. API just hands off.

    # 2. Save copy to Sender's "Sent" folder
    result = await db.execute(select(Folder).where(Folder.user_id == current_user.id, Folder.name == "Sent"))
    sent_folder = result.scalars().first()
    if not sent_folder:
        # Should exist, but safety net
        sent_folder = Folder(name="Sent", user_id=current_user.id)
        db.add(sent_folder)
        await db.commit()
        await db.refresh(sent_folder)

    sent_email = Email(
        owner_id=current_user.id,
        folder_id=sent_folder.id,
        sender=f"{current_user.username}@{settings.NAMESPACE}",
        subject=email_in.subject,
        body=email_in.body,
        is_read=True
    )
    sent_email.set_recipients(all_recipients)
    db.add(sent_email)
    await db.commit()

    # 3. Relay to Local SMTP
    # We use smtplib to talk to our own localhost:2525
    try:
        with SMTP("localhost", 2525) as smtp:
            # Construct MIME message
            from email.message import EmailMessage
            msg = EmailMessage()
            msg.set_content(email_in.body)
            msg["Subject"] = email_in.subject
            msg["From"] = f"{current_user.username}@{settings.NAMESPACE}"
            msg["To"] = ", ".join(email_in.to)
            if email_in.cc:
                msg["Cc"] = ", ".join(email_in.cc)

            smtp.send_message(msg)

    except Exception as e:
        logger.error(f"Failed to relay mail to SMTP: {e}")
        raise HTTPException(status_code=500, detail="Failed to send mail internally")

    return {"status": "sent"}

# Serve Frontend Static Files
# We mount this LAST so API routes take precedence
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
else:
    # During dev if static missing
    pass
