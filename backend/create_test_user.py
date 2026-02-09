"""Create a test user for bypassing Clerk authentication during development."""
import asyncio
import uuid
import sys
from pathlib import Path
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from backend.models.db.user import UserDB, CreatorProfileDB
from backend.models.db.subscription import SubscriptionDB, UsageMetricDB
from backend.config import DATABASE_URL


async def create_test_user():
    """Create test user with all required relations."""
    print("🔧 Creating test user for auth bypass...")
    
    # Create async engine
    engine = create_async_engine(DATABASE_URL, echo=False)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        test_user_id = "test-user-123"
        
        # Check if user already exists
        from sqlalchemy import select
        result = await session.execute(
            select(UserDB).where(UserDB.user_id == test_user_id)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print(f"✅ Test user already exists: {test_user_id}")
            print(f"   Email: {existing_user.email}")
            return
        
        # Create user
        user = UserDB(
            user_id=test_user_id,
            email="testuser@superenginelab.com",
            clerk_user_id="test_clerk_bypass_123",
            created_at=datetime.utcnow(),
            last_login_at=datetime.utcnow()
        )
        session.add(user)
        await session.flush()  # Flush user first before adding related records
        print(f"✅ Created UserDB: {test_user_id}")
        
        # Create creator profile (Phase 1 required fields)
        profile = CreatorProfileDB(
            user_id=test_user_id,
            user_name="Test User",
            creator_type="content_creator",
            niche="Tech & Education",
            target_audience_niche="Software developers and tech enthusiasts",
            unique_angle="Testing the Super Engine Lab platform",
            self_purpose="Test campaign workflows and AI agent orchestration",
            self_strengths=["Testing", "Development", "AI"],
            existing_platforms=["youtube", "twitter"],
            target_platforms=["youtube", "twitter", "instagram"],
            self_topics=["AI", "Automation", "Testing"],
            phase2_completed=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(profile)
        print(f"✅ Created CreatorProfileDB")
        
        # Create subscription (Free plan with limits)
        subscription = SubscriptionDB(
            subscription_id=str(uuid.uuid4()),
            user_id=test_user_id,
            plan_tier="free",
            status="active",
            billing_cycle="monthly",
            auto_renew_enabled=True,
            cancellation_scheduled=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(subscription)
        print(f"✅ Created SubscriptionDB: free plan, active")
        
        # Create usage metrics
        usage = UsageMetricDB(
            user_id=test_user_id,
            campaigns_created=0,
            campaigns_limit=3,  # Free plan limit
            image_credits_base=10,
            image_credits_topup=0,
            image_credits_used_this_month=0,
            last_reset_at=datetime.utcnow(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(usage)
        print(f"✅ Created UsageMetricDB: 0/3 campaigns, 10 image credits")
        
        # Commit all changes
        await session.commit()
        print(f"\n🎉 Test user created successfully!")
        print(f"\n📋 User Details:")
        print(f"   User ID: {test_user_id}")
        print(f"   Email: testuser@superenginelab.com")
        print(f"   Plan: Free (3 campaigns/month, 10 image credits)")
        print(f"\n🔑 Authentication:")
        print(f"   BYPASS_AUTH is enabled in .env")
        print(f"   Use any Bearer token: Authorization: Bearer test-token")
        print(f"\n✅ Ready to test campaign workflows!")


if __name__ == "__main__":
    asyncio.run(create_test_user())
