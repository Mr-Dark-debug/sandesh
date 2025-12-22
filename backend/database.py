from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# If settings failed to load (e.g. build time), use a dummy url or handle it
database_url = settings.DATABASE_URL if settings else "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    database_url,
    connect_args={"check_same_thread": False}, # Needed for SQLite
    echo=False
)

SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False
)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
