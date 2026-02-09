"""Celery application for background task processing."""
from celery import Celery
from .config import REDIS_URL

# Initialize Celery app
celery_app = Celery(
    "super_engine_lab",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["backend.tasks.campaign_tasks"]
)

# Celery configuration
celery_app.conf.update(
    # Serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Task tracking
    task_track_started=True,
    task_send_sent_event=True,
    
    # Time limits (10 min hard, 9 min soft)
    task_time_limit=600,
    task_soft_time_limit=540,
    
    # Result backend settings
    result_expires=3600,  # Results expire after 1 hour
    result_extended=True,  # Store additional metadata
    
    # Worker settings
    worker_prefetch_multiplier=1,  # Disable prefetching for long tasks
    worker_max_tasks_per_child=50,  # Restart worker after 50 tasks (memory leak prevention)
    
    # Retry settings
    task_acks_late=True,  # Acknowledge task after completion (not on receipt)
    task_reject_on_worker_lost=True,  # Requeue if worker crashes
)

# Helper function for async database sessions in tasks
def get_async_session():
    """
    Create async database session for Celery tasks.
    Cannot use FastAPI dependency injection in tasks.
    
    Creates a fresh engine per task to avoid connection pool conflicts.
    Returns a context manager that properly handles connection lifecycle.
    """
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
    from sqlalchemy.pool import NullPool
    from contextlib import asynccontextmanager
    from .config import DATABASE_URL
    
    # Create engine with NullPool to avoid connection conflicts between Celery and FastAPI
    engine = create_async_engine(
        DATABASE_URL,
        poolclass=NullPool,  # No connection pooling for Celery tasks
        echo=False,
    )
    
    @asynccontextmanager
    async def session_context():
        """Async context manager for session."""
        # Create session maker
        SessionLocal = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
        
        session = SessionLocal()
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
            await engine.dispose()
    
    return session_context()
