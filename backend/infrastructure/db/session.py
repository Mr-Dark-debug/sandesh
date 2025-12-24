from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from ...config import settings

# Database setup
database_url = settings.DATABASE_URL

# For SQLite, we need to handle concurrent access properly
# Using QueuePool with proper settings for thread safety
engine = create_engine(
    database_url,
    connect_args={
        "check_same_thread": False,
        "timeout": 30,  # Increase timeout to handle concurrent access
    },
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,  # Recycle connections every 5 minutes
    echo=False,
    isolation_level="SERIALIZABLE"  # Default for SQLite
)

SessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False
)

Base = declarative_base()
