"""SQLAlchemy async session factory and dependency injection."""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from .base import engine

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides async database session.

    Usage in endpoints:
        async def endpoint(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(User))
            await db.commit()  # Endpoints manage their own commits
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            # No auto-commit - let endpoints manage their own transactions
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
