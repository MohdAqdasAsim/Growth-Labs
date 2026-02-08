"""Pytest configuration and fixtures."""
import pytest
import asyncio
from typing import AsyncGenerator
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy import JSON, event
from sqlalchemy.dialects import postgresql

from backend.main import app
from backend.database.base import Base
from backend.database.session import get_db
from backend.api.auth.auth import get_current_user_id
from backend.models.agents.agent_outputs import ContextAnalyzerOutput


# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Patch JSONB to JSON for SQLite compatibility
@event.listens_for(Base.metadata, "before_create")
def receive_before_create(target, connection, **kw):
    """Replace JSONB with JSON for SQLite."""
    for table in target.tables.values():
        for column in table.columns:
            if isinstance(column.type, postgresql.JSONB):
                column.type = JSON()

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test session factory
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh database session for each test."""
    # Create tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    async with TestSessionLocal() as session:
        yield session
    
    # Drop tables after test
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
def client(db_session: AsyncSession):
    """Create a test client with database override."""
    
    # Override get_db dependency
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Create test client
    with TestClient(app) as test_client:
        yield test_client
    
    # Clear overrides
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user_id():
    """Return a test user ID for authentication bypass."""
    return "test-user-123"


@pytest.fixture(scope="function")
def auth_headers(test_user_id: str):
    """Create authentication headers that bypass Clerk."""
    
    # Override get_current_user_id to return test user
    async def override_get_current_user_id():
        return test_user_id
    
    app.dependency_overrides[get_current_user_id] = override_get_current_user_id
    
    # Return fake token (not actually validated)
    return {"Authorization": "Bearer test-token"}


@pytest.fixture(scope="function")
async def test_user(db_session: AsyncSession, test_user_id: str):
    """Create a test user in the database."""
    from backend.models.db.user import UserDB, SubscriptionDB, UsageMetricDB
    import uuid
    
    # Create user
    user = UserDB(
        user_id=test_user_id,
        email="test@example.com",
        email_verified=True,
        clerk_user_id="test_clerk_123"
    )
    db_session.add(user)
    
    # Create subscription
    subscription = SubscriptionDB(
        subscription_id=str(uuid.uuid4()),
        user_id=test_user_id,
        plan_tier="free",
        status="active"
    )
    db_session.add(subscription)
    
    # Create usage metrics
    usage = UsageMetricDB(
        usage_id=str(uuid.uuid4()),
        user_id=test_user_id
    )
    db_session.add(usage)
    
    await db_session.commit()
    await db_session.refresh(user)
    
    return user


@pytest.fixture(scope="function")
def phase1_profile_data():
    """Sample Phase 1 onboarding data (4 fields - JSON body format)."""
    return {
        "user_name": "Test User",
        "creator_type": "content_creator",
        "niche": "Software Engineering & Developer Productivity",
        "target_audience_niche": "Junior to mid-level developers"
    }


@pytest.fixture(scope="function")
def phase2_profile_data():
    """Sample Phase 2 profile data (matches updated CreatorProfile model)."""
    return {
        "unique_angle": "Teaching through real mistakes and failures",
        "self_purpose": "Make developer productivity accessible to beginners",
        "self_strengths": ["Clear explanations", "Authentic storytelling"],
        "existing_platforms": ["YouTube", "Twitter"],
        "target_platforms": ["YouTube"],
        "self_topics": ["Python", "DevOps", "Productivity"],
        "target_audience_demographics": "18-35, aspiring developers, global",
        "competitor_accounts": {"youtube": ["https://youtube.com/@fireship"]},
        "existing_assets": ["Video equipment", "Editing software"],
        "self_motivation": "Build personal brand and help others learn"
    }


@pytest.fixture(scope="function")
def campaign_create_data():
    """Sample campaign creation data."""
    return {
        "goal_aim": "Increase YouTube subscribers by 500",
        "goal_type": "growth",
        "platforms": ["YouTube"],
        "metrics": [
            {"type": "subscribers", "target": 1700},
            {"type": "views", "target": 10000}
        ],
        "duration_days": 7,
        "intensity": "moderate"
    }


@pytest.fixture(scope="function")
def campaign_onboarding_data(campaign_create_data):
    """Sample campaign onboarding data (4-step wizard)."""
    return {
        "name": "YouTube Growth Sprint",
        "description": "7-day intensive campaign to boost subscribers with consistent uploads",
        # Flatten goal fields to match API expectations
        "goal_aim": campaign_create_data["goal_aim"],
        "goal_type": campaign_create_data["goal_type"],
        "platforms": campaign_create_data["platforms"],
        "metrics": campaign_create_data["metrics"],
        "duration_days": campaign_create_data["duration_days"],
        "intensity": campaign_create_data["intensity"],
        "competitors": {
            "platforms": [
                {
                    "platform": "YouTube",
                    "urls": [
                        {"url": "https://www.youtube.com/@fireship", "desc": "Great tech content"},
                        {"url": "https://www.youtube.com/@codersgyan", "desc": "Clear tutorials"}
                    ]
                },
                {
                    "platform": "Twitter",
                    "urls": [
                        {"url": "https://twitter.com/naval", "desc": "Wisdom tweets"},
                        {"url": "https://twitter.com/alexhormozi", "desc": "Business advice"}
                    ]
                }
            ]
        },
        "agent_config": {
            "run_strategy": True,
            "run_forensics": True,
            "run_planner": True,
            "run_content": True,
            "run_outcome": True
        },
        "image_generation_enabled": False,  # Disable to avoid API costs in tests
        "seo_optimization_enabled": True
    }


@pytest.fixture(scope="function")
def minimal_agent_config():
    """Minimal agent configuration for fast tests."""
    return {
        "run_strategy": True,
        "run_forensics": False,  # Disable to reduce API calls
        "run_planner": True,
        "run_content": True,
        "run_outcome": False  # Disable for creation tests
    }


@pytest.fixture(scope="function")
def daily_execution_data():
    """Sample daily execution confirmation data."""
    return {
        "youtube_posted": True,
        "twitter_posted": False
    }


@pytest.fixture(scope="function")
def actual_metrics_data():
    """Sample actual metrics for campaign completion."""
    return {
        "subscribers_gained": 520,
        "views_gained": 12000,
        "engagement_rate": 4.5,
        "best_performing_content": "Day 3: Python async tutorial",
        "total_reach": 15000
    }


@pytest.fixture(scope="function")
def mock_context_output():
    """Mock ContextAnalyzerOutput to avoid API calls."""
    return ContextAnalyzerOutput(
        creator_identity={
            "niche": "Tech Education",
            "audience": "Developers and learners",
            "unique_angle": "Teaching through real projects",
            "mission": "Make coding accessible"
        },
        content_dna={
            "strengths": ["Clear explanations", "Practical examples"],
            "weaknesses": ["Inconsistent posting"],
            "preferred_formats": ["Tutorial videos", "Code walkthroughs"],
            "avoid": ["Clickbait", "Overly long videos"]
        },
        performance_insights={
            "best_content_pattern": "Short, practical tutorials",
            "worst_content_pattern": "Theory-heavy content",
            "engagement_triggers": ["Code samples", "Real problems"],
            "content_evolution": "Moving towards shorter format"
        },
        constraints={
            "time_capacity": "10 hours/week",
            "platforms": ["YouTube", "Twitter"],
            "tools": ["Basic video editing"],
            "budget": "Free tier tools"
        },
        growth_context={
            "past_attempts": ["Tried daily posting", "Experimented with shorts"],
            "what_worked_before": ["Consistent schedule", "Engaging thumbnails"],
            "current_metrics": {"subscribers": 1200, "avg_views": 500}
        },
        strategic_insights={
            "realistic_posting_frequency": "2-3 videos/week",
            "sustainability_risks": ["Burnout from daily posting"],
            "authentic_voice": "Friendly teacher, not expert guru",
            "motivation_level": "High intrinsic motivation"
        }
    )


@pytest.fixture(autouse=True)
def mock_agents(mock_context_output):
    """Mock all agent calls to avoid API usage in tests."""
    # Mock async function that returns None
    async def mock_run_campaign_workflow(*args, **kwargs):
        """Mock campaign workflow - does nothing."""
        pass
    
    with patch('backend.agents.core.context_analyzer.ContextAnalyzer.analyze', return_value=mock_context_output), \
         patch('backend.services.core.agent_orchestrator.AgentOrchestrator.run_campaign_workflow', side_effect=mock_run_campaign_workflow), \
         patch('backend.services.core.agent_orchestrator.AgentOrchestrator.analyze_previous_campaigns', return_value={}):
        yield
