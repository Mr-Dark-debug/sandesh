import json
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .models import UserModel, FolderModel, EmailModel
from ...core.entities.user import User
from ...core.entities.folder import Folder
from ...core.entities.email import Email

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.session.execute(select(UserModel).where(UserModel.username == username))
        model = result.scalars().first()
        if model:
            return self._to_entity(model)
        return None

    async def get_all(self) -> List[User]:
        result = await self.session.execute(select(UserModel))
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def save(self, user: User) -> User:
        if user.id:
            # Update not fully implemented in this refactor scope unless needed,
            # but usually we fetch model, update fields, commit.
            # For strict refactor, we focus on creation which is used.
            pass

        model = UserModel(
            username=user.username,
            password_hash=user.password_hash,
            is_admin=user.is_admin
        )
        self.session.add(model)
        await self.session.flush() # Populate ID
        return self._to_entity(model)

    def _to_entity(self, model: UserModel) -> User:
        return User(
            id=model.id,
            username=model.username,
            password_hash=model.password_hash,
            is_admin=model.is_admin
        )

class FolderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_user_id(self, user_id: int) -> List[Folder]:
        result = await self.session.execute(select(FolderModel).where(FolderModel.user_id == user_id))
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def get_by_name_and_user(self, name: str, user_id: int) -> Optional[Folder]:
        result = await self.session.execute(
            select(FolderModel).where(FolderModel.user_id == user_id, FolderModel.name == name)
        )
        model = result.scalars().first()
        return self._to_entity(model) if model else None

    async def get_by_id_and_user(self, folder_id: int, user_id: int) -> Optional[Folder]:
        result = await self.session.execute(
            select(FolderModel).where(FolderModel.id == folder_id, FolderModel.user_id == user_id)
        )
        model = result.scalars().first()
        return self._to_entity(model) if model else None

    async def save(self, folder: Folder) -> Folder:
        model = FolderModel(
            name=folder.name,
            user_id=folder.user_id
        )
        self.session.add(model)
        await self.session.flush()
        return self._to_entity(model)

    # Batch save used in initialization
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
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_folder(self, folder_id: int) -> List[Email]:
        result = await self.session.execute(
            select(EmailModel)
            .where(EmailModel.folder_id == folder_id)
            .order_by(EmailModel.timestamp.desc())
        )
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def get_by_id_and_owner(self, email_id: int, owner_id: int) -> Optional[Email]:
        result = await self.session.execute(
            select(EmailModel).where(EmailModel.id == email_id, EmailModel.owner_id == owner_id)
        )
        model = result.scalars().first()
        return self._to_entity(model) if model else None

    async def save(self, email: Email) -> Email:
        # Check if updating or creating
        if email.id:
            result = await self.session.execute(select(EmailModel).where(EmailModel.id == email.id))
            model = result.scalars().first()
            if model:
                model.folder_id = email.folder_id
                model.is_read = email.is_read
                # We typically don't update body/subject/sender of existing emails
                await self.session.flush()
                return self._to_entity(model)

        # Create
        model = EmailModel(
            owner_id=email.owner_id,
            folder_id=email.folder_id,
            sender=email.sender,
            recipients=json.dumps(email.recipients),
            subject=email.subject,
            body=email.body,
            is_read=email.is_read,
            timestamp=email.timestamp
        )
        self.session.add(model)
        await self.session.flush()
        return self._to_entity(model)

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
            timestamp=model.timestamp
        )
