"""In-memory data storage implementation."""
from typing import Optional, Dict
from datetime import datetime
import uuid

from ..models.user import User, CreatorProfile
from ..models.campaign import Campaign


class MemoryStore:
    """In-memory storage for users, profiles, and campaigns."""
    
    def __init__(self):
        """Initialize storage dictionaries."""
        self.users: Dict[str, User] = {}
        self.creator_profiles: Dict[str, CreatorProfile] = {}
        self.campaigns: Dict[str, Campaign] = {}
        self.jwt_blacklist: set = set()  # For token invalidation
    
    # User operations
    def create_user(self, user: User) -> User:
        """Store a new user."""
        self.users[user.user_id] = user
        return user
    
    def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        return self.users.get(user_id)
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        for user in self.users.values():
            if user.email == email:
                return user
        return None
    
    # Creator profile operations
    def create_or_update_profile(self, profile: CreatorProfile) -> CreatorProfile:
        """Create or update creator profile."""
        profile.updated_at = datetime.utcnow()
        self.creator_profiles[profile.user_id] = profile
        return profile
    
    def get_profile(self, user_id: str) -> Optional[CreatorProfile]:
        """Get creator profile by user ID."""
        return self.creator_profiles.get(user_id)
    
    # Campaign operations
    def create_campaign(self, campaign: Campaign) -> Campaign:
        """Store a new campaign."""
        self.campaigns[campaign.campaign_id] = campaign
        return campaign
    
    def get_campaign(self, campaign_id: str) -> Optional[Campaign]:
        """Get campaign by ID."""
        return self.campaigns.get(campaign_id)
    
    def get_user_campaigns(self, user_id: str) -> list[Campaign]:
        """Get all campaigns for a user."""
        return [c for c in self.campaigns.values() if c.user_id == user_id]
    
    def update_campaign(self, campaign: Campaign) -> Campaign:
        """Update an existing campaign."""
        campaign.updated_at = datetime.utcnow()
        self.campaigns[campaign.campaign_id] = campaign
        return campaign
    
    # JWT blacklist operations
    def blacklist_token(self, token: str):
        """Add token to blacklist."""
        self.jwt_blacklist.add(token)
    
    def is_token_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted."""
        return token in self.jwt_blacklist


# Global singleton instance
memory_store = MemoryStore()

