from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from ...config import settings

# Database setup
database_url = settings.DATABASE_URL

# For SQLite, we need to handle the connect_args check_same_thread=False
# because we might use the session across threads in FastAPI (threadpool)
# or SMTP handler threads.
engine = create_engine(
    database_url,
    connect_args={"check_same_thread": False},
    poolclass=NullPool, # Use NullPool to avoid thread safety issues with SQLite
    echo=False
)

SessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False
)

Base = declarative_base()
