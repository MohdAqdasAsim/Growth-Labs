"""SQLAlchemy declarative base and engine configuration."""
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import declarative_base
from ..config import DATABASE_URL, DB_POOL_SIZE, DB_MAX_OVERFLOW, DB_POOL_TIMEOUT, DB_ECHO

# Create async engine with connection pooling
engine = create_async_engine(
    DATABASE_URL,
    pool_size=DB_POOL_SIZE,
    max_overflow=DB_MAX_OVERFLOW,
    pool_timeout=DB_POOL_TIMEOUT,
    pool_pre_ping=True,  # Test connections before using them
    pool_recycle=3600,  # Recycle connections after 1 hour
    echo=DB_ECHO,
    future=True,
)

# Declarative base for all SQLAlchemy models
Base = declarative_base()
