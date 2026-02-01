"""In-memory data storage implementation."""
from typing import Optional, Dict
from datetime import datetime
import uuid

from ..models.user import User, CreatorProfile
from ..models.campaign import Campaign, CampaignStatus


class MemoryStore:
    """In-memory storage for users, profiles, and campaigns."""
    
    def __init__(self):
        """Initialize storage dictionaries."""
        # User & Profile Storage
        self.users: Dict[str, User] = {}
        self.creator_profiles: Dict[str, CreatorProfile] = {}  # Key: user_id
        
        # Campaign Storage
        self.campaigns: Dict[str, Campaign] = {}               # Key: campaign_id
        self.user_campaigns: Dict[str, list[str]] = {}         # Key: user_id, Value: list of campaign_ids (ordered)
        
        # Campaign Learning Storage
        self.campaign_insights: Dict[str, dict] = {}           # Key: campaign_id, Value: insights/lessons
        
        # Authentication
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
        """Store a new campaign and link to user."""
        self.campaigns[campaign.campaign_id] = campaign
        self.add_campaign_to_user(campaign.user_id, campaign.campaign_id)
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
    
    # Campaign history and learning methods
    def get_user_campaign_history(self, user_id: str) -> list[Campaign]:
        """Returns all campaigns for a user, ordered by creation date."""
        campaign_ids = self.user_campaigns.get(user_id, [])
        return [self.campaigns[cid] for cid in campaign_ids if cid in self.campaigns]
    
    def get_previous_campaign_insights(self, user_id: str) -> Optional[dict]:
        """
        Analyzes previous campaigns and returns lessons learned.
        This is a placeholder - actual analysis happens in agent_orchestrator.
        """
        history = self.get_user_campaign_history(user_id)
        if not history:
            return None
        
        # Filter completed campaigns only
        completed = [c for c in history if c.status == CampaignStatus.COMPLETED]
        if not completed:
            return None
        
        # Return structure for agent_orchestrator to fill
        return {
            "total_campaigns": len(completed),
            "last_campaign_id": completed[-1].campaign_id if completed else None,
            "campaigns_to_analyze": [c.campaign_id for c in completed]
        }
    
    def save_campaign_insights(self, campaign_id: str, insights: dict):
        """Stores insights/lessons from a campaign."""
        self.campaign_insights[campaign_id] = insights
    
    def add_campaign_to_user(self, user_id: str, campaign_id: str):
        """Links a campaign to a user's history."""
        if user_id not in self.user_campaigns:
            self.user_campaigns[user_id] = []
        if campaign_id not in self.user_campaigns[user_id]:
            self.user_campaigns[user_id].append(campaign_id)
    
    def delete_campaign(self, campaign_id: str):
        """Delete a campaign and remove from user's history."""
        campaign = self.campaigns.get(campaign_id)
        if campaign:
            user_id = campaign.user_id
            # Remove from campaigns dict
            del self.campaigns[campaign_id]
            # Remove from user's campaign list
            if user_id in self.user_campaigns and campaign_id in self.user_campaigns[user_id]:
                self.user_campaigns[user_id].remove(campaign_id)
            # Remove associated insights if any
            if campaign_id in self.campaign_insights:
                del self.campaign_insights[campaign_id]
    
    # JWT blacklist operations
    def blacklist_token(self, token: str):
        """Add token to blacklist."""
        self.jwt_blacklist.add(token)
    
    def is_token_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted."""
        return token in self.jwt_blacklist


# Global singleton instance
memory_store = MemoryStore()

