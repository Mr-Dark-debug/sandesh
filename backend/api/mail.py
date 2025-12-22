from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from .deps import get_mail_service, get_current_user
from ..services.mail_service import MailService
from ..core.entities.user import User
from ..core.exceptions import EntityNotFoundError

router = APIRouter()

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

    @staticmethod
    def from_entity(entity):
        return EmailResponse(
            id=entity.id,
            sender=entity.sender,
            recipients=entity.recipients,
            subject=entity.subject or "",
            body=entity.body or "",
            timestamp=entity.timestamp.isoformat(),
            is_read=entity.is_read,
            folder_id=entity.folder_id
        )

@router.get("/mail/{folder_id}", response_model=List[EmailResponse])
def get_mail_in_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    mail_service: MailService = Depends(get_mail_service)
):
    try:
        emails = mail_service.get_folder_emails(folder_id, current_user.id)
        return [EmailResponse.from_entity(e) for e in emails]
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/message/{email_id}", response_model=EmailResponse)
def get_email(
    email_id: int,
    current_user: User = Depends(get_current_user),
    mail_service: MailService = Depends(get_mail_service)
):
    try:
        email = mail_service.get_email(email_id, current_user.id)
        return EmailResponse.from_entity(email)
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/message/{email_id}/move")
def move_email(
    email_id: int,
    folder_id: int,
    current_user: User = Depends(get_current_user),
    mail_service: MailService = Depends(get_mail_service)
):
    try:
        mail_service.move_email(email_id, folder_id, current_user.id)
        return {"status": "moved"}
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/mail/send")
def send_mail(
    email_in: EmailSendRequest,
    current_user: User = Depends(get_current_user),
    mail_service: MailService = Depends(get_mail_service)
):
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
        # Log error here
        raise HTTPException(status_code=500, detail=f"Failed to send mail: {str(e)}")
