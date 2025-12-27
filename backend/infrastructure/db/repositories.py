import json
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from .models import UserModel, FolderModel, EmailModel, SystemSettingsModel
from ...core.entities.user import User, SystemSettings
from ...core.entities.folder import Folder
from ...core.entities.email import Email


class SystemSettingsRepository:
    """Repository for system-wide settings (singleton pattern)."""
    
    def __init__(self, session: Session):
        self.session = session
    
    def get(self) -> SystemSettings:
        """Get system settings, creating default if not exists."""
        result = self.session.execute(select(SystemSettingsModel).where(SystemSettingsModel.id == 1))
        model = result.scalars().first()
        
        if not model:
            # Create default settings
            model = SystemSettingsModel(
                id=1,
                instance_name="Sandesh",
                mail_namespace="local"
            )
            self.session.add(model)
            self.session.flush()
        
        return self._to_entity(model)
    
    def update(self, settings: SystemSettings) -> SystemSettings:
        """Update system settings."""
        result = self.session.execute(select(SystemSettingsModel).where(SystemSettingsModel.id == 1))
        model = result.scalars().first()
        
        if model:
            model.instance_name = settings.instance_name
            model.mail_namespace = settings.mail_namespace
            self.session.flush()
            return self._to_entity(model)
        else:
            # Create if not exists
            model = SystemSettingsModel(
                id=1,
                instance_name=settings.instance_name,
                mail_namespace=settings.mail_namespace
            )
            self.session.add(model)
            self.session.flush()
            return self._to_entity(model)
    
    def _to_entity(self, model: SystemSettingsModel) -> SystemSettings:
        return SystemSettings(
            id=model.id,
            instance_name=model.instance_name,
            mail_namespace=model.mail_namespace,
            created_at=model.created_at,
            updated_at=model.updated_at
        )


class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_username(self, username: str) -> Optional[User]:
        result = self.session.execute(select(UserModel).where(UserModel.username == username))
        model = result.scalars().first()
        if model:
            return self._to_entity(model)
        return None
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        result = self.session.execute(select(UserModel).where(UserModel.id == user_id))
        model = result.scalars().first()
        if model:
            return self._to_entity(model)
        return None

    def get_all(self) -> List[User]:
        result = self.session.execute(select(UserModel).where(UserModel.is_active == True))
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    def save(self, user: User) -> User:
        if user.id:
            # Update existing user
            result = self.session.execute(select(UserModel).where(UserModel.id == user.id))
            model = result.scalars().first()
            if model:
                # Only update mutable fields
                model.display_name = user.display_name
                model.signature = user.signature
                model.avatar_color = user.avatar_color
                model.is_active = user.is_active
                # Password hash update only if changed
                if user.password_hash and user.password_hash != model.password_hash:
                    model.password_hash = user.password_hash
                self.session.flush()
                return self._to_entity(model)

        # Create new user
        model = UserModel(
            username=user.username,
            password_hash=user.password_hash,
            is_admin=user.is_admin,
            is_active=user.is_active,
            display_name=user.display_name or user.username.title(),
            signature=user.signature,
            avatar_color=user.avatar_color or "#A3A380"
        )
        self.session.add(model)
        self.session.flush()
        return self._to_entity(model)
    
    def deactivate(self, user_id: int) -> bool:
        """Soft delete - deactivate user."""
        result = self.session.execute(select(UserModel).where(UserModel.id == user_id))
        model = result.scalars().first()
        if model:
            model.is_active = False
            self.session.flush()
            return True
        return False

    def _to_entity(self, model: UserModel) -> User:
        return User(
            id=model.id,
            username=model.username,
            password_hash=model.password_hash,
            is_admin=model.is_admin,
            is_active=model.is_active if hasattr(model, 'is_active') else True,
            display_name=model.display_name if hasattr(model, 'display_name') else None,
            signature=model.signature if hasattr(model, 'signature') else None,
            avatar_color=model.avatar_color if hasattr(model, 'avatar_color') else "#A3A380",
            created_at=model.created_at if hasattr(model, 'created_at') else None,
            updated_at=model.updated_at if hasattr(model, 'updated_at') else None
        )


class FolderRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_user_id(self, user_id: int) -> List[Folder]:
        """
        Get all folders for a user with unread email counts.
        Uses a LEFT JOIN to count unread emails efficiently in one query.
        """
        stmt = (
            select(FolderModel, func.count(EmailModel.id).label("unread_count"))
            .outerjoin(
                EmailModel,
                and_(
                    EmailModel.folder_id == FolderModel.id,
                    EmailModel.is_read == False
                )
            )
            .where(FolderModel.user_id == user_id)
            .group_by(FolderModel.id)
        )

        result = self.session.execute(stmt)
        folders = []
        for row in result:
            folder_model = row[0]
            unread_count = row[1]
            folder_entity = self._to_entity(folder_model)
            folder_entity.unread_count = unread_count
            folders.append(folder_entity)

        return folders

    def get_by_name_and_user(self, name: str, user_id: int) -> Optional[Folder]:
        result = self.session.execute(
            select(FolderModel).where(FolderModel.user_id == user_id, FolderModel.name == name)
        )
        model = result.scalars().first()
        return self._to_entity(model) if model else None

    def get_by_id_and_user(self, folder_id: int, user_id: int) -> Optional[Folder]:
        result = self.session.execute(
            select(FolderModel).where(FolderModel.id == folder_id, FolderModel.user_id == user_id)
        )
        model = result.scalars().first()
        return self._to_entity(model) if model else None

    def save(self, folder: Folder) -> Folder:
        model = FolderModel(
            name=folder.name,
            user_id=folder.user_id
        )
        self.session.add(model)
        self.session.flush()
        return self._to_entity(model)

    def add_all(self, folders: List[Folder]):
        models = [FolderModel(name=f.name, user_id=f.user_id) for f in folders]
        self.session.add_all(models)

    def _to_entity(self, model: FolderModel) -> Folder:
        return Folder(
            id=model.id,
            name=model.name,
            user_id=model.user_id
        )


class EmailRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_folder(self, folder_id: int) -> List[Email]:
        result = self.session.execute(
            select(EmailModel)
            .where(EmailModel.folder_id == folder_id)
            .order_by(EmailModel.timestamp.desc())
        )
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    def get_by_id_and_owner(self, email_id: int, owner_id: int) -> Optional[Email]:
        result = self.session.execute(
            select(EmailModel).where(EmailModel.id == email_id, EmailModel.owner_id == owner_id)
        )
        model = result.scalars().first()
        return self._to_entity(model) if model else None

    def save(self, email: Email) -> Email:
        import time
        from sqlalchemy.exc import OperationalError
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                if email.id:
                    result = self.session.execute(select(EmailModel).where(EmailModel.id == email.id))
                    model = result.scalars().first()
                    if model:
                        model.folder_id = email.folder_id
                        model.is_read = email.is_read
                        self.session.flush()
                        return self._to_entity(model)

                # Create new email with identity fields
                model = EmailModel(
                    owner_id=email.owner_id,
                    folder_id=email.folder_id,
                    sender=email.sender,
                    sender_display_name=getattr(email, 'sender_display_name', None),
                    sender_email=getattr(email, 'sender_email', None),
                    recipients=json.dumps(email.recipients),
                    subject=email.subject,
                    body=email.body,
                    is_read=email.is_read,
                    timestamp=email.timestamp
                )
                self.session.add(model)
                self.session.flush()
                return self._to_entity(model)
            except OperationalError as e:
                if "database is locked" in str(e) and attempt < max_retries - 1:
                    time.sleep(0.1 * (attempt + 1))  # Exponential backoff
                    continue
                else:
                    raise e
            except Exception as e:
                raise e

    def _to_entity(self, model: EmailModel) -> Email:
        return Email(
            id=model.id,
            owner_id=model.owner_id,
            folder_id=model.folder_id,
            sender=model.sender,
            subject=model.subject,
            body=model.body,
            recipients=json.loads(model.recipients),
            is_read=model.is_read,
            timestamp=model.timestamp,
            sender_display_name=model.sender_display_name if hasattr(model, 'sender_display_name') else None,
            sender_email=model.sender_email if hasattr(model, 'sender_email') else None
        )
