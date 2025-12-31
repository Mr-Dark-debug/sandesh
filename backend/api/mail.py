"""
Mail API

Endpoints for email operations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from .deps import get_mail_service, get_current_user
from ..services.mail_service import MailService
from ..core.entities.user import User
from ..core.exceptions import EntityNotFoundError
from ..infrastructure.security.rate_limiter import limiter

router = APIRouter()


class EmailSendRequest(BaseModel):
    to: List[str] = Field(..., max_items=50, description="Max 50 recipients")
    cc: List[str] = Field(default=[], max_items=50, description="Max 50 CC recipients")
    subject: str = Field(..., max_length=200, description="Email subject")
    body: str = Field(..., max_length=100000, description="Email body (max 100KB)")


class MoveEmailRequest(BaseModel):
    folder_id: int


class EmailResponse(BaseModel):
    """Email response with full sender identity."""
    id: int
    sender: str
    sender_display_name: Optional[str] = None
    sender_email: Optional[str] = None
    recipients: List[str]
    subject: str
    body: str
    timestamp: str
    is_read: bool
    folder_id: int

    @staticmethod
    def from_entity(entity):
        return EmailResponse(
            id=entity.id,
            sender=entity.sender,
            sender_display_name=getattr(entity, 'sender_display_name', None),
            sender_email=getattr(entity, 'sender_email', None),
            recipients=entity.recipients,
            subject=entity.subject or "",
            body=entity.body or "",
            timestamp=entity.timestamp.isoformat(),
            is_read=entity.is_read,
            folder_id=entity.folder_id
        )


class EmailListResponse(BaseModel):
    """
    Lightweight email response for lists.
    Truncates body to reduce payload size.
    """
    id: int
    sender: str
    sender_display_name: Optional[str] = None
    sender_email: Optional[str] = None
    recipients: List[str]
    subject: str
    body: str
    timestamp: str
    is_read: bool
    folder_id: int

    @staticmethod
    def from_entity(entity):
        # Bolt Optimization:
        # 1. Removed redundant body truncation (DB query uses func.substr(1, 100))
        # 2. Replaced slower getattr() calls with direct attribute access
        #    (entity is an Email dataclass, so fields are guaranteed)
        return EmailListResponse(
            id=entity.id,
            sender=entity.sender,
            sender_display_name=entity.sender_display_name,
            sender_email=entity.sender_email,
            recipients=entity.recipients,
            subject=entity.subject or "",
            body=entity.body or "",
            timestamp=entity.timestamp.isoformat(),
            is_read=entity.is_read,
            folder_id=entity.folder_id
        )


@router.get("/mail/{folder_id}", response_model=List[EmailListResponse])
def get_mail_in_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    mail_service: MailService = Depends(get_mail_service)
):
    """
    Get all emails in a specific folder.
    Returns lightweight objects with truncated bodies.
    """
    try:
        emails = mail_service.get_folder_emails(folder_id, current_user.id)
        return [EmailListResponse.from_entity(e) for e in emails]
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/message/{email_id}", response_model=EmailResponse)
def get_email(
    email_id: int,
    current_user: User = Depends(get_current_user),
    mail_service: MailService = Depends(get_mail_service)
):
    """
    Get a specific email by ID and mark it as read.
    Returns full email body.
    """
    try:
        email = mail_service.get_email(email_id, current_user.id)
        return EmailResponse.from_entity(email)
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/message/{email_id}/move")
def move_email(
    email_id: int,
    move_request: MoveEmailRequest,
    current_user: User = Depends(get_current_user),
    mail_service: MailService = Depends(get_mail_service)
):
    """
    Move an email to a different folder.
    """
    try:
        mail_service.move_email(email_id, move_request.folder_id, current_user.id)
        return {"status": "moved"}
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/mail/send")
def send_mail(
    email_in: EmailSendRequest,
    current_user: User = Depends(get_current_user),
    mail_service: MailService = Depends(get_mail_service)
):
    """
    Send an email to recipients.
    
    Sender identity is automatically set from the current user's profile:
    - Display name from user settings
    - Email address derived from username@namespace
    """
    # Rate limit: 20 emails per minute per user to prevent spam/abuse
    if not limiter.is_allowed(f"send_mail:{current_user.username}", limit=20, window_seconds=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded: Please wait before sending more emails."
        )

    try:
        mail_service.send_mail(
            sender_user=current_user,
            to=email_in.to,
            subject=email_in.subject,
            body=email_in.body,
            cc=email_in.cc
        )
        return {"status": "sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send mail: {str(e)}")
