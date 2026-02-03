"""Pytest configuration and fixtures."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.storage.memory_store import MemoryStore


@pytest.fixture(scope="function")
def client():
    """Create a test client for each test with fresh memory store."""
    # Reset memory store before each test
    from backend.storage import memory_store as memory_store_module
    from backend.api.campaign import campaigns
    from backend.api.user import onboarding
    from backend.api.auth import auth
    from backend.api.user import profile as profile_api
    
    # Create new memory store instance
    new_store = MemoryStore()
    
    # Replace in all modules
    memory_store_module.memory_store = new_store
    campaigns.memory_store = new_store
    onboarding.memory_store = new_store
    auth.memory_store = new_store
    profile_api.memory_store = new_store
    
    return TestClient(app)


@pytest.fixture(scope="function")
def test_user_data():
    """Sample user registration data."""
    return {
        "email": "test@example.com",
        "password": "SecurePass123!",
        "name": "Test User"
    }


@pytest.fixture(scope="function")
def auth_headers(client, test_user_data):
    """Create a user and return authentication headers."""
    # Register
    client.post("/auth/register", json=test_user_data)
    
    # Login
    response = client.post("/auth/login", json={
        "email": test_user_data["email"],
        "password": test_user_data["password"]
    })
    token = response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}


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
    """Sample Phase 2 profile data (11 fields matching CreatorProfile model)."""
    return {
        "unique_angle": "Teaching through real mistakes and failures",
        "content_mission": "Make developer productivity accessible to beginners",
        "self_strengths": ["Clear explanations", "Authentic storytelling"],
        "self_weaknesses": ["Consistency", "Video editing speed"],
        "content_enjoys": ["Tutorial videos", "Problem-solving content"],
        "content_avoids": ["Pure opinion pieces", "Trend-chasing"],
        "audience_demographics": "18-35, aspiring developers, global",
        "tools_skills": ["Python", "Video editing", "Canva"],
        "past_attempts": [{"attempt": "30-day consistency challenge", "outcome": "200 new subscribers"}],
        "what_worked_before": ["Practical tutorials", "Beginner-friendly content"],
        "why_create": "Build personal brand and help others learn"
    }


@pytest.fixture(scope="function")
def campaign_goal_data():
    """Sample campaign goal data."""
    return {
        "goal_aim": "Increase YouTube subscribers by 500",
        "goal_type": "Growth - Subscribers",
        "platforms": ["youtube"],
        "metrics": [
            {"type": "subscribers", "target": 1700},
            {"type": "views", "target": 10000}
        ],
        "duration_days": 7,
        "intensity": "moderate"
    }


@pytest.fixture(scope="function")
def campaign_create_data(campaign_goal_data):
    """Sample campaign creation data."""
    return {
        "goal": campaign_goal_data,
        "target_platforms": ["youtube"],
        "competitor_youtube_urls": ["https://www.youtube.com/@fireship"],
        "competitor_x_handles": []
    }


@pytest.fixture(scope="function")
def campaign_onboarding_data(campaign_goal_data):
    """Sample campaign onboarding data (4-step wizard)."""
    return {
        "name": "YouTube Growth Sprint",
        "description": "7-day intensive campaign to boost subscribers with consistent uploads",
        # Flatten goal fields to match API expectations
        "goal_aim": campaign_goal_data["goal_aim"],
        "goal_type": campaign_goal_data["goal_type"],
        "platforms": campaign_goal_data["platforms"],
        "metrics": campaign_goal_data["metrics"],
        "duration_days": campaign_goal_data["duration_days"],
        "intensity": campaign_goal_data["intensity"],
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
