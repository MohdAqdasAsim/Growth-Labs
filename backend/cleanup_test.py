import asyncio
from database.session import AsyncSessionLocal
from sqlalchemy import text

async def cleanup():
    async with AsyncSessionLocal() as s:
        await s.execute(text("DELETE FROM users WHERE user_id='test_user_123'"))
        await s.commit()
        print('✅ Cleaned up test data')

asyncio.run(cleanup())
