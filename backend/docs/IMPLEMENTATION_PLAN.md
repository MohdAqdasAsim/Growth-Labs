# Implementation Plan - Backend Architecture Redesign

## High-Level Implementation Plan

### Priority 1: Foundation (Data Models & Storage)
**Goal:** Update core data structures to support new architecture
- Update User/CreatorProfile models (Phase 1: 5 fields, Phase 2: 11 fields)
- Update Campaign models (add onboarding, timestamps, agent config)
- Update MemoryStore (add campaign history tracking)
- **Time Estimate:** 2-3 hours
- **Dependencies:** None - start here

### Priority 2: Core APIs (Onboarding & Profile)
**Goal:** Implement simplified onboarding and separate profile management
- Modify Onboarding API (reduce to 5 fields)
- Create Profile API (Phase 2 management)
- Update Context Analyzer trigger
- **Time Estimate:** 2-3 hours
- **Dependencies:** Priority 1 must be complete

### Priority 3: Campaign Management (Major Refactor)
**Goal:** Separate campaign creation from execution, add onboarding flow
- Refactor Campaign API (10+ new endpoints)
- Update Agent Orchestrator (add toggles, learning)
- Implement campaign history analysis
- **Time Estimate:** 4-6 hours
- **Dependencies:** Priorities 1 & 2 must be complete

### Priority 4: New Features (Image & SEO)
**Goal:** Add image generation and SEO optimization
- Create Image Service (Pollinations.ai integration)
- Create SEO Service
- Create Image & SEO APIs
- Integrate into Agent Orchestrator
- **Time Estimate:** 3-4 hours
- **Dependencies:** Priority 3 must be complete

### Priority 4B: Advanced Features (LearningMemory & Goal Type Logic) **[IMPLEMENTED]**
**Goal:** Add learning system and goal-adaptive strategies
- Create LearningMemory model (structured insights storage)
- Update prompts with goal type conditional logic
- Integrate learning retrieval in agent workflows
- **Time Estimate:** 2-3 hours
- **Dependencies:** Priority 3 must be complete
- **Status:** ✅ COMPLETE

### Priority 5: Frontend Integration **[OUT OF SCOPE]**
**Goal:** Connect frontend to new backend APIs
**Status:** Handled by separate frontend team
- Frontend implementation not documented here
- All backend APIs ready for integration
- See frontend developer for status
- **Time Estimate:** N/A (out of scope)
- **Dependencies:** N/A

### Priority 6: Testing & Validation
**Goal:** Ensure all flows work end-to-end
- Test onboarding flow
- Test campaign creation & execution
- Test learning from previous campaigns
- Test agent toggles
- Test image/SEO integration
- **Time Estimate:** 2-3 hours
- **Dependencies:** All priorities complete

**Total Estimated Time:** 22-33 hours (backend only, frontend excluded)

---

## Detailed File-by-File Implementation Plan

### **File 1: backend/models/user.py**

**Status:** MODIFY  
**Priority:** 1 (Foundation)  
**Dependencies:** None

#### Current Implementation:
- Phase 1: 15 fields (category, target_audience, platforms, URLs, competitors, best/worst content, time_per_week)
- Phase 2: 15 fields (including budget, team_size, current_metrics, timeline_expectations)
- Fields mixed in onboarding

#### Target Implementation:
- Phase 1: 5 fields (user_name, creator_type, niche, target_audience_niche)
- Phase 2: 11 fields (removed budget, team_size, current_metrics, timeline_expectations)
- Add `phase2_completed` flag

#### Code Changes:

**Change 1: Update CreatorProfile model (Lines 9-73)**

```python
# BEFORE (Lines 9-73)
class CreatorProfile(BaseModel):
    user_id: str
    
    # PHASE 1: ONBOARDING (REQUIRED)
    category: str
    target_audience: str
    platforms: list[str]
    youtube_url: Optional[str] = None
    instagram_url: Optional[str] = None
    reddit_url: Optional[str] = None
    x_handle: Optional[str] = None
    competitor_urls: list[str]
    x_competitor_handles: list[str]
    best_content: list[dict]
    worst_content: list[dict]
    time_per_week: str
    
    # PHASE 2: PROFILE COMPLETION (OPTIONAL)
    unique_angle: Optional[str] = None
    content_mission: Optional[str] = None
    self_strengths: list[str] = []
    self_weaknesses: list[str] = []
    content_enjoys: list[str] = []
    content_avoids: list[str] = []
    current_metrics: dict = {}
    audience_demographics: Optional[str] = None
    tools_skills: list[str] = []
    budget: Optional[str] = None
    team_size: Optional[str] = None
    past_attempts: list[dict] = []
    what_worked_before: list[str] = []
    why_create: Optional[str] = None
    timeline_expectations: Optional[str] = None
    
    # SYSTEM FIELDS
    posting_frequency: Optional[str] = None
    historical_metrics: dict = {}
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

# AFTER
class CreatorProfile(BaseModel):
    user_id: str
    
    # PHASE 1: GLOBAL ONBOARDING (REQUIRED) - 5 fields
    user_name: str                         # User's display name
    creator_type: str                      # "content_creator", "student", "marketing", "business", "freelancer"
    niche: str                             # Category/niche user operates in
    target_audience_niche: str             # Target audience's niche/interests
    
    # PHASE 2: PROFILE COMPLETION (OPTIONAL) - 11 fields
    # Accessed via Dashboard → Profile Section
    unique_angle: Optional[str] = None
    content_mission: Optional[str] = None
    self_strengths: list[str] = []
    self_weaknesses: list[str] = []
    content_enjoys: list[str] = []
    content_avoids: list[str] = []
    audience_demographics: Optional[str] = None
    tools_skills: list[str] = []
    past_attempts: list[dict] = []
    what_worked_before: list[str] = []
    why_create: Optional[str] = None
    
    # SYSTEM FIELDS
    posting_frequency: Optional[str] = None       # Calculated by Context Analyzer
    historical_metrics: dict = {}                 # Context Analyzer output
    phase2_completed: bool = False                # Track Phase 2 completion
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
```

**Why:** Simplifies onboarding from 30 fields to 5, removes campaign-specific data (platforms, competitors), removes fields that don't affect AI agents (budget, team_size).

**Impact:** 
- Onboarding API will need updates
- Context Analyzer will need to handle missing best/worst content (auto-fetch)
- Campaign API will need to collect platforms/competitors per campaign

---

### **File 2: backend/models/campaign.py**

**Status:** MAJOR REFACTOR  
**Priority:** 1 (Foundation)  
**Dependencies:** File 1 (user.py) complete

#### Current Implementation:
- Single `CampaignGoal` with one platform
- No campaign name/description
- No competitor data in campaign
- Simple status enum (planning, approved, in_progress, completed)

#### Target Implementation:
- Add `CampaignOnboarding` model (name, description, goal, competitors)
- Add `AgentConfig` model (toggle switches)
- Add `CompetitorPlatform` and `CampaignCompetitors` models
- Update `CampaignGoal` to support multiple platforms and metrics array
- Add granular timestamps
- Add learning from previous campaigns
- Update status enum

#### Code Changes:

**Change 1: Update CampaignStatus enum (Lines 6-11)**

```python
# BEFORE
class CampaignStatus(str, Enum):
    PLANNING = "planning"
    APPROVED = "approved"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

# AFTER
class CampaignStatus(str, Enum):
    ONBOARDING_INCOMPLETE = "onboarding_incomplete"  # During campaign setup
    READY_TO_START = "ready_to_start"                # Onboarding done, awaiting manual start
    IN_PROGRESS = "in_progress"                      # Agents executing or content being posted
    COMPLETED = "completed"                          # All days executed, report generated
    FAILED = "failed"                                # Agent execution failed
```

**Change 2: Add new models (Insert after CampaignStatus, before CampaignGoal)**

```python
# NEW MODELS - Insert after line 11

# Campaign-specific competitor data
class CompetitorPlatform(BaseModel):
    platform: Literal["YouTube", "Twitter", "Instagram", "TikTok"]
    urls: list[dict]  # [{"url": "...", "desc": "I like his thumbnails"}, ...]

class CampaignCompetitors(BaseModel):
    platforms: list[CompetitorPlatform] = []

# Metric with target
class CampaignMetric(BaseModel):
    type: str              # "subscribers", "views", "followers", "engagement"
    target: int            # Target value

# UPDATED: Agent Configuration (Simplified)
class AgentConfig(BaseModel):
    """Only forensics is toggleable. Other agents are required."""
    run_forensics: bool = True
```

**Change 3: Update CampaignGoal (Lines 10-19)**

```python
# BEFORE
class CampaignGoal(BaseModel):
    description: str
    goal_type: str  # growth, engagement, launch, etc.
    platform: Literal["YouTube", "Twitter"]
    metric: str  # subscribers, views, followers, etc.
    target_value: Optional[float] = None
    duration_days: int = 3  # 3-30 days
    posting_frequency: str = "daily"

# AFTER
class CampaignGoal(BaseModel):
    goal_aim: str                          # What to achieve (free text)
    goal_type: str                         # "growth", "engagement", "monetization", "launch"
    platforms: list[str]                   # ["YouTube", "Twitter"] - multiple platforms
    metrics: list[CampaignMetric]          # Array of metric objects
    duration_days: int                     # 3-30 days
    intensity: str                         # "light", "moderate", "intense"
```

**Change 4: Add CampaignOnboarding model (Insert after CampaignGoal)**

```python
# NEW MODEL - Insert after CampaignGoal

class CampaignOnboarding(BaseModel):
    name: str                              # Campaign name
    description: str                       # Campaign description
    goal: CampaignGoal
    competitors: CampaignCompetitors
    agent_config: AgentConfig = Field(default_factory=AgentConfig)
    image_generation_enabled: bool = True
    seo_optimization_enabled: bool = True
```

**Change 5: Update Campaign model (Lines 59-82)**

```python
# BEFORE
class Campaign(BaseModel):
    campaign_id: str
    user_id: str
    goal: CampaignGoal
    target_platforms: list[str]
    content_intensity: str = "moderate"
    status: CampaignStatus
    
    # Planning phase outputs
    strategy_output: dict = {}
    forensics_output_yt: dict = {}
    forensics_output_x: dict = {}
    plan: Optional[CampaignPlan] = None
    plan_approved: bool = False
    reality_warning: Optional[dict] = None
    
    # Execution tracking
    daily_content: dict[int, DailyContent] = {}
    daily_execution: dict[int, DailyExecution] = {}
    report: Optional[CampaignReport] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

# AFTER
class Campaign(BaseModel):
    campaign_id: str                       # Auto-generated UUID
    user_id: str
    
    # Campaign Onboarding Data
    onboarding: Optional[CampaignOnboarding] = None
    
    # Lifecycle Status
    status: CampaignStatus = CampaignStatus.ONBOARDING_INCOMPLETE
    
    # Global Memory Snapshot (taken at creation)
    global_memory_snapshot: dict = {}      # Copy of CreatorProfile at campaign creation
    
    # Learning from Previous Campaigns
    learning_from_previous: Optional[dict] = None  # Insights from past campaigns
    learning_approved: bool = False        # User approved/modified lessons
    
    # Planning Phase Outputs
    strategy_output: dict = {}
    forensics_output: dict = {}            # Combined all platforms
    plan: Optional[CampaignPlan] = None
    reality_warning: Optional[dict] = None
    
    # Execution Tracking
    daily_content: dict[int, DailyContent] = {}
    daily_execution: dict[int, DailyExecution] = {}
    report: Optional[CampaignReport] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)           # When campaign was created
    onboarding_completed_at: Optional[datetime] = None                   # When onboarding finished
    started_at: Optional[datetime] = None                                # When user clicked "Start"
    completed_at: Optional[datetime] = None                              # When campaign finished
    updated_at: datetime = Field(default_factory=datetime.now)           # Last modification
```

**Why:** 
- Separates campaign creation from execution
- Stores campaign-specific data (name, competitors, agent config)
- Enables learning from previous campaigns
- Tracks detailed timestamps for analytics

**Impact:**
- Campaign API needs major refactor to handle onboarding flow
- Agent Orchestrator needs to respect agent toggles
- Memory store needs to track campaign relationships

---

### **File 3: backend/storage/memory_store.py**

**Status:** MODIFY  
**Priority:** 1 (Foundation)  
**Dependencies:** Files 1 & 2 complete

#### Current Implementation:
- Simple dict storage for users, profiles, campaigns
- No campaign history tracking
- No relationship between campaigns

#### Target Implementation:
- Add `user_campaigns` dict (user_id → list of campaign_ids)
- Add `campaign_insights` dict (campaign_id → lessons learned)
- Add methods for campaign history and insights

#### Code Changes:

**Change 1: Update MemoryStore __init__ (Lines ~10-15)**

```python
# BEFORE
class MemoryStore:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.creator_profiles: Dict[str, CreatorProfile] = {}
        self.campaigns: Dict[str, Campaign] = {}
        self.jwt_blacklist: set = set()

# AFTER
class MemoryStore:
    def __init__(self):
        # User & Profile Storage
        self.users: Dict[str, User] = {}
        self.creator_profiles: Dict[str, CreatorProfile] = {}  # Key: user_id
        
        # Campaign Storage
        self.campaigns: Dict[str, Campaign] = {}               # Key: campaign_id
        self.user_campaigns: Dict[str, list[str]] = {}         # Key: user_id, Value: list of campaign_ids (ordered)
        
        # Campaign Learning Storage
        self.campaign_insights: Dict[str, dict] = {}           # Key: campaign_id, Value: insights/lessons
        
        # Authentication
        self.jwt_blacklist: set = set()
```

**Change 2: Add new methods (Append at end of class)**

```python
# NEW METHODS - Add at end of MemoryStore class

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

def update_campaign(self, campaign_id: str, campaign: Campaign):
    """Updates existing campaign and refreshes updated_at timestamp."""
    from datetime import datetime
    campaign.updated_at = datetime.now()
    self.campaigns[campaign_id] = campaign
```

**Change 3: Update save_campaign method**

```python
# MODIFY existing save_campaign method
def save_campaign(self, campaign: Campaign):
    """Saves a campaign and links it to user."""
    self.campaigns[campaign.campaign_id] = campaign
    self.add_campaign_to_user(campaign.user_id, campaign.campaign_id)  # NEW LINE
```

**Why:** Enables tracking campaign relationships, storing insights, and learning from previous campaigns.

**Impact:**
- Campaign API can now query user's campaign history
- Agent Orchestrator can analyze previous campaigns for insights

---

### **File 4: backend/api/onboarding.py**

**Status:** MODIFY  
**Priority:** 2 (Core APIs)  
**Dependencies:** Files 1-3 complete

#### Current Implementation:
- POST /onboarding collects 15+ Phase 1 fields
- PATCH /onboarding/phase2 updates Phase 2 during onboarding
- No separation of concerns

#### Target Implementation:
- POST /onboarding collects only 5 Phase 1 fields
- Remove PATCH /onboarding/phase2 (moved to profile API)
- Trigger Context Analyzer automatically

#### Code Changes:

**Change 1: Update POST /onboarding endpoint (Lines 21-131)**

```python
# BEFORE
@router.post("/onboarding")
async def create_or_update_onboarding(
    category: str = Form(...),
    target_audience: str = Form(...),
    platforms: list[str] = Form(...),
    youtube_url: Optional[str] = Form(None),
    instagram_url: Optional[str] = Form(None),
    reddit_url: Optional[str] = Form(None),
    x_handle: Optional[str] = Form(None),
    competitor_urls: list[str] = Form(...),
    x_competitor_handles: list[str] = Form(...),
    best_content: list[dict] = Form(...),
    worst_content: list[dict] = Form(...),
    time_per_week: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    # ... existing logic

# AFTER
@router.post("/onboarding")
async def create_onboarding(
    user_name: str = Form(...),
    creator_type: str = Form(...),
    niche: str = Form(...),
    target_audience_niche: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Phase 1: Global Onboarding (Required)
    Collects 5 essential fields and triggers Context Analyzer.
    """
    user_id = current_user["user_id"]
    
    # Check if profile already exists
    existing_profile = memory_store.get_creator_profile(user_id)
    
    # Create or update profile
    profile = CreatorProfile(
        user_id=user_id,
        user_name=user_name,
        creator_type=creator_type,
        niche=niche,
        target_audience_niche=target_audience_niche,
        created_at=existing_profile.created_at if existing_profile else datetime.now(),
        updated_at=datetime.now()
    )
    
    memory_store.save_creator_profile(profile)
    
    # Trigger Context Analyzer (fetches historical content automatically)
    try:
        context_analyzer = ContextAnalyzer()
        context_result = await context_analyzer.analyze(profile)
        
        # Update profile with analyzed data
        profile.historical_metrics = context_result.get("metrics", {})
        profile.posting_frequency = context_result.get("posting_frequency")
        memory_store.save_creator_profile(profile)
        
    except Exception as e:
        print(f"Context Analyzer failed: {e}")
        # Continue without analysis - not critical
    
    return {
        "message": "Onboarding completed successfully",
        "profile": profile.dict(),
        "phase2_completed": profile.phase2_completed
    }
```

**Change 2: Remove PATCH /onboarding/phase2 endpoint (Lines 157-214)**

```python
# DELETE entire endpoint (Lines 157-214)
# This functionality moved to backend/api/profile.py
```

**Change 3: Remove PUT /onboarding endpoint (Lines 147-154)**

```python
# DELETE entire endpoint (Lines 147-154)
# Not needed in new architecture
```

**Why:** Simplifies onboarding to 5 fields, separates Phase 2 to profile management.

**Impact:**
- Frontend Onboarding page needs to collect only 5 fields
- Profile API will handle Phase 2
- Context Analyzer needs to auto-fetch best/worst content (no manual entry)

---

### **File 5: backend/api/profile.py**

**Status:** NEW FILE  
**Priority:** 2 (Core APIs)  
**Dependencies:** Files 1-4 complete

#### Purpose:
Separate Phase 2 completion from onboarding, accessible via Dashboard → Profile section.

#### Code:

```python
from fastapi import APIRouter, Depends, HTTPException, Form
from typing import Optional
from backend.api.auth import get_current_user
from backend.storage.memory_store import memory_store
from datetime import datetime

router = APIRouter()

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get full creator profile (Phase 1 + Phase 2)."""
    user_id = current_user["user_id"]
    profile = memory_store.get_creator_profile(user_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Complete onboarding first.")
    
    return {
        "profile": profile.dict(),
        "phase1_complete": True,
        "phase2_complete": profile.phase2_completed
    }

@router.get("/profile/completion")
async def get_profile_completion(current_user: dict = Depends(get_current_user)):
    """Get profile completion status."""
    user_id = current_user["user_id"]
    profile = memory_store.get_creator_profile(user_id)
    
    if not profile:
        return {"phase1_complete": False, "phase2_complete": False, "completion_percentage": 0}
    
    # Calculate Phase 2 completion percentage
    phase2_fields = [
        profile.unique_angle,
        profile.content_mission,
        profile.self_strengths,
        profile.self_weaknesses,
        profile.content_enjoys,
        profile.content_avoids,
        profile.audience_demographics,
        profile.tools_skills,
        profile.past_attempts,
        profile.what_worked_before,
        profile.why_create
    ]
    
    filled_fields = sum(1 for field in phase2_fields if field)
    completion_percentage = (filled_fields / len(phase2_fields)) * 100
    
    return {
        "phase1_complete": True,
        "phase2_complete": profile.phase2_completed,
        "completion_percentage": round(completion_percentage, 1),
        "filled_fields": filled_fields,
        "total_fields": len(phase2_fields)
    }

@router.patch("/profile/phase2")
async def update_phase2(
    unique_angle: Optional[str] = Form(None),
    content_mission: Optional[str] = Form(None),
    self_strengths: Optional[list[str]] = Form(None),
    self_weaknesses: Optional[list[str]] = Form(None),
    content_enjoys: Optional[list[str]] = Form(None),
    content_avoids: Optional[list[str]] = Form(None),
    audience_demographics: Optional[str] = Form(None),
    tools_skills: Optional[list[str]] = Form(None),
    past_attempts: Optional[list[dict]] = Form(None),
    what_worked_before: Optional[list[str]] = Form(None),
    why_create: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """Update Phase 2 fields (optional profile completion)."""
    user_id = current_user["user_id"]
    profile = memory_store.get_creator_profile(user_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Complete Phase 1 onboarding first.")
    
    # Update only provided fields
    if unique_angle is not None:
        profile.unique_angle = unique_angle
    if content_mission is not None:
        profile.content_mission = content_mission
    if self_strengths is not None:
        profile.self_strengths = self_strengths
    if self_weaknesses is not None:
        profile.self_weaknesses = self_weaknesses
    if content_enjoys is not None:
        profile.content_enjoys = content_enjoys
    if content_avoids is not None:
        profile.content_avoids = content_avoids
    if audience_demographics is not None:
        profile.audience_demographics = audience_demographics
    if tools_skills is not None:
        profile.tools_skills = tools_skills
    if past_attempts is not None:
        profile.past_attempts = past_attempts
    if what_worked_before is not None:
        profile.what_worked_before = what_worked_before
    if why_create is not None:
        profile.why_create = why_create
    
    # Check if all Phase 2 fields are filled
    phase2_fields = [
        profile.unique_angle,
        profile.content_mission,
        profile.self_strengths,
        profile.self_weaknesses,
        profile.content_enjoys,
        profile.content_avoids,
        profile.audience_demographics,
        profile.tools_skills,
        profile.past_attempts,
        profile.what_worked_before,
        profile.why_create
    ]
    
    if all(field for field in phase2_fields):
        profile.phase2_completed = True
    
    profile.updated_at = datetime.now()
    memory_store.save_creator_profile(profile)
    
    # Re-run Context Analyzer with enhanced data
    try:
        from backend.agents.context_analyzer import ContextAnalyzer
        context_analyzer = ContextAnalyzer()
        context_result = await context_analyzer.analyze(profile)
        
        profile.historical_metrics = context_result.get("metrics", {})
        profile.posting_frequency = context_result.get("posting_frequency")
        memory_store.save_creator_profile(profile)
        
    except Exception as e:
        print(f"Context Analyzer failed: {e}")
    
    return {
        "message": "Profile updated successfully",
        "profile": profile.dict(),
        "phase2_completed": profile.phase2_completed
    }
```

**Why:** Separates optional profile completion from required onboarding, accessible anytime from Dashboard.

**Impact:**
- Frontend needs new Profile page
- Dashboard should prompt users to complete Phase 2

---

### **File 6: backend/api/campaigns.py**

**Status:** MAJOR REFACTOR  
**Priority:** 3 (Campaign Management)  
**Dependencies:** Files 1-5 complete

#### Current Implementation:
- POST /campaigns creates AND executes campaign immediately
- No campaign onboarding flow
- No edit/delete endpoints
- Deprecated /approve endpoint

#### Target Implementation:
- Separate creation from execution
- Add 4-step onboarding flow
- Add lessons learned from previous campaigns
- Add manual start trigger
- Add edit/delete endpoints
- Remove deprecated endpoints

#### Code Changes:

**Change 1: Replace POST /campaigns endpoint (Lines 16-108)**

```python
# BEFORE
@router.post("/campaigns")
async def create_campaign(
    goal_description: str = Form(...),
    goal_type: str = Form(...),
    platform: str = Form(...),
    # ... 10+ more fields
    current_user: dict = Depends(get_current_user)
):
    # Creates and auto-executes campaign
    # ... existing logic

# AFTER
@router.post("/campaigns")
async def create_campaign(current_user: dict = Depends(get_current_user)):
    """
    Create empty campaign shell.
    Status: ONBOARDING_INCOMPLETE
    Frontend will populate data via PATCH /campaigns/{id}/onboarding
    """
    from uuid import uuid4
    
    user_id = current_user["user_id"]
    campaign_id = str(uuid4())
    
    # Get global memory snapshot at creation time
    profile = memory_store.get_creator_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Complete onboarding first")
    
    global_memory_snapshot = profile.dict()
    
    # Create empty campaign
    campaign = Campaign(
        campaign_id=campaign_id,
        user_id=user_id,
        status=CampaignStatus.ONBOARDING_INCOMPLETE,
        global_memory_snapshot=global_memory_snapshot,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    memory_store.save_campaign(campaign)
    
    return {
        "message": "Campaign created. Complete onboarding next.",
        "campaign_id": campaign_id,
        "status": campaign.status
    }
```

**Change 2: Add PATCH /campaigns/{id}/onboarding (NEW)**

```python
# NEW ENDPOINT - Insert after POST /campaigns

@router.patch("/campaigns/{campaign_id}/onboarding")
async def update_campaign_onboarding(
    campaign_id: str,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    goal_aim: Optional[str] = Form(None),
    goal_type: Optional[str] = Form(None),
    platforms: Optional[list[str]] = Form(None),
    metrics: Optional[list[dict]] = Form(None),  # [{"type": "subscribers", "target": 1000}]
    duration_days: Optional[int] = Form(None),
    intensity: Optional[str] = Form(None),
    competitors: Optional[dict] = Form(None),  # {"platforms": [...]}
    agent_config: Optional[dict] = Form(None),  # {"run_strategy": true, ...}
    image_generation_enabled: Optional[bool] = Form(None),
    seo_optimization_enabled: Optional[bool] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Update campaign onboarding data (Steps 1-4).
    Can be called multiple times as user progresses through wizard.
    """
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if campaign.status not in [CampaignStatus.ONBOARDING_INCOMPLETE, CampaignStatus.READY_TO_START]:
        raise HTTPException(status_code=400, detail="Campaign already started")
    
    # Initialize onboarding if not exists
    if not campaign.onboarding:
        from backend.models.campaign import CampaignOnboarding, CampaignGoal, CampaignCompetitors
        campaign.onboarding = CampaignOnboarding(
            name="",
            description="",
            goal=CampaignGoal(
                goal_aim="",
                goal_type="",
                platforms=[],
                metrics=[],
                duration_days=3,
                intensity="moderate"
            ),
            competitors=CampaignCompetitors()
        )
    
    # Update fields
    if name is not None:
        campaign.onboarding.name = name
    if description is not None:
        campaign.onboarding.description = description
    if goal_aim is not None:
        campaign.onboarding.goal.goal_aim = goal_aim
    if goal_type is not None:
        campaign.onboarding.goal.goal_type = goal_type
    if platforms is not None:
        campaign.onboarding.goal.platforms = platforms
    if metrics is not None:
        from backend.models.campaign import CampaignMetric
        campaign.onboarding.goal.metrics = [CampaignMetric(**m) for m in metrics]
    if duration_days is not None:
        campaign.onboarding.goal.duration_days = duration_days
    if intensity is not None:
        campaign.onboarding.goal.intensity = intensity
    if competitors is not None:
        from backend.models.campaign import CampaignCompetitors, CompetitorPlatform
        campaign.onboarding.competitors = CampaignCompetitors(
            platforms=[CompetitorPlatform(**p) for p in competitors.get("platforms", [])]
        )
    if agent_config is not None:
        from backend.models.campaign import AgentConfig
        campaign.onboarding.agent_config = AgentConfig(**agent_config)
    if image_generation_enabled is not None:
        campaign.onboarding.image_generation_enabled = image_generation_enabled
    if seo_optimization_enabled is not None:
        campaign.onboarding.seo_optimization_enabled = seo_optimization_enabled
    
    campaign.updated_at = datetime.now()
    memory_store.update_campaign(campaign_id, campaign)
    
    return {
        "message": "Campaign onboarding updated",
        "campaign": campaign.dict()
    }
```

**Change 3: Add POST /campaigns/{id}/complete-onboarding (NEW)**

```python
# NEW ENDPOINT

@router.post("/campaigns/{campaign_id}/complete-onboarding")
async def complete_campaign_onboarding(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Mark onboarding complete and analyze previous campaigns for lessons.
    Status: ONBOARDING_INCOMPLETE → READY_TO_START
    """
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Validate required fields
    if not campaign.onboarding:
        raise HTTPException(status_code=400, detail="Complete campaign onboarding first")
    
    if not campaign.onboarding.name or not campaign.onboarding.goal.goal_aim:
        raise HTTPException(status_code=400, detail="Name and goal are required")
    
    # Analyze previous campaigns for lessons
    insights = memory_store.get_previous_campaign_insights(current_user["user_id"])
    
    if insights:
        # Agent Orchestrator will fill detailed insights
        from backend.services.agent_orchestrator import AgentOrchestrator
        orchestrator = AgentOrchestrator()
        detailed_insights = await orchestrator.analyze_previous_campaigns(current_user["user_id"])
        campaign.learning_from_previous = detailed_insights
    
    campaign.status = CampaignStatus.READY_TO_START
    campaign.onboarding_completed_at = datetime.now()
    campaign.updated_at = datetime.now()
    memory_store.update_campaign(campaign_id, campaign)
    
    return {
        "message": "Campaign onboarding complete. Ready to start!",
        "campaign": campaign.dict(),
        "learning_from_previous": campaign.learning_from_previous
    }
```

**Change 4: Add GET /campaigns/{id}/lessons-learned (NEW)**

```python
# NEW ENDPOINT

@router.get("/campaigns/{campaign_id}/lessons-learned")
async def get_lessons_learned(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get insights from previous campaigns."""
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not campaign.learning_from_previous:
        return {
            "has_previous_campaigns": False,
            "lessons": None
        }
    
    return {
        "has_previous_campaigns": True,
        "lessons": campaign.learning_from_previous,
        "approved": campaign.learning_approved
    }
```

**Change 5: Add PATCH /campaigns/{id}/approve-lessons (NEW)**

```python
# NEW ENDPOINT

@router.patch("/campaigns/{campaign_id}/approve-lessons")
async def approve_lessons(
    campaign_id: str,
    lessons: dict = Form(...),  # User can modify lessons
    current_user: dict = Depends(get_current_user)
):
    """User approves or modifies lessons from previous campaigns."""
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    campaign.learning_from_previous = lessons
    campaign.learning_approved = True
    campaign.updated_at = datetime.now()
    memory_store.update_campaign(campaign_id, campaign)
    
    return {
        "message": "Lessons approved",
        "lessons": campaign.learning_from_previous
    }
```

**Change 6: Add POST /campaigns/{id}/start (NEW)**

```python
# NEW ENDPOINT

@router.post("/campaigns/{campaign_id}/start")
async def start_campaign(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Manual start - executes agent workflow.
    Status: READY_TO_START → IN_PROGRESS
    """
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if campaign.status != CampaignStatus.READY_TO_START:
        raise HTTPException(status_code=400, detail="Campaign not ready to start")
    
    # Update status
    campaign.status = CampaignStatus.IN_PROGRESS
    campaign.started_at = datetime.now()
    campaign.updated_at = datetime.now()
    memory_store.update_campaign(campaign_id, campaign)
    
    # Execute agent workflow
    from backend.services.agent_orchestrator import AgentOrchestrator
    orchestrator = AgentOrchestrator()
    
    try:
        await orchestrator.run_campaign_workflow(campaign_id)
        
        return {
            "message": "Campaign started successfully",
            "campaign": campaign.dict()
        }
    except Exception as e:
        # Mark as failed
        campaign.status = CampaignStatus.FAILED
        memory_store.update_campaign(campaign_id, campaign)
        raise HTTPException(status_code=500, detail=f"Campaign execution failed: {str(e)}")
```

**Change 7: Add PATCH /campaigns/{id} (NEW - Edit campaign)**

```python
# NEW ENDPOINT

@router.patch("/campaigns/{campaign_id}")
async def edit_campaign(
    campaign_id: str,
    # Same params as /onboarding endpoint
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    # ... all other fields
    current_user: dict = Depends(get_current_user)
):
    """
    Edit campaign (only if not started).
    Alias for /onboarding endpoint with validation.
    """
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if campaign.status not in [CampaignStatus.ONBOARDING_INCOMPLETE, CampaignStatus.READY_TO_START]:
        raise HTTPException(status_code=400, detail="Cannot edit campaign after it has started")
    
    # Call onboarding update logic
    return await update_campaign_onboarding(campaign_id, name, description, ...)
```

**Change 8: Add DELETE /campaigns/{id} (NEW)**

```python
# NEW ENDPOINT

@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete campaign (only if not started)."""
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if campaign.status not in [CampaignStatus.ONBOARDING_INCOMPLETE, CampaignStatus.READY_TO_START]:
        raise HTTPException(status_code=400, detail="Cannot delete campaign after it has started")
    
    # Remove from memory
    del memory_store.campaigns[campaign_id]
    if current_user["user_id"] in memory_store.user_campaigns:
        memory_store.user_campaigns[current_user["user_id"]].remove(campaign_id)
    
    return {"message": "Campaign deleted successfully"}
```

**Change 9: Remove deprecated endpoint (Lines 146-191)**

```python
# DELETE entire /campaigns/{id}/approve endpoint (Lines 146-191)
# This endpoint is deprecated and no longer needed
```

**Why:** 
- Separates creation from execution (user control)
- Adds 4-step onboarding wizard
- Enables learning from previous campaigns
- Allows editing/deleting before start

**Impact:**
- Frontend needs complete refactor (CreateCampaign wizard)
- Agent Orchestrator needs to implement campaign analysis
- Much better UX with manual control

---

### **File 7: backend/services/agent_orchestrator.py**

**Status:** MAJOR REFACTOR  
**Priority:** 3 (Campaign Management)  
**Dependencies:** Files 1-6 complete

#### Current Implementation:
- `run_full_workflow()` auto-executes all agents
- No toggles
- No learning from previous campaigns
- Auto-approves plan

#### Target Implementation:
- `run_campaign_workflow()` respects agent toggles
- Analyze previous campaigns for insights
- Pass global memory + learning to agents
- Integrate image generation & SEO
- Remove auto-approve

#### Code Changes:

**Change 1: Add analyze_previous_campaigns method (NEW)**

```python
# NEW METHOD - Insert at beginning of AgentOrchestrator class

async def analyze_previous_campaigns(self, user_id: str) -> dict:
    """
    Analyzes previous completed campaigns and extracts lessons learned.
    Returns insights for next campaign.
    """
    from backend.storage.memory_store import memory_store
    from backend.models.campaign import CampaignStatus
    
    history = memory_store.get_user_campaign_history(user_id)
    completed = [c for c in history if c.status == CampaignStatus.COMPLETED and c.report]
    
    if not completed:
        return None
    
    # Build analysis prompt
    campaigns_summary = []
    for campaign in completed:
        campaigns_summary.append({
            "name": campaign.onboarding.name if campaign.onboarding else "Unnamed",
            "goal": campaign.onboarding.goal.goal_aim if campaign.onboarding else "",
            "duration": campaign.onboarding.goal.duration_days if campaign.onboarding else 0,
            "report": campaign.report.dict() if campaign.report else {}
        })
    
    prompt = f"""Analyze these previous campaigns and extract lessons learned:

{campaigns_summary}

Provide:
1. Successful patterns (what worked well)
2. Failed patterns (what didn't work)
3. Recommended adjustments for next campaign

Format as JSON:
{{
  "successful_patterns": [...],
  "failed_patterns": [...],
  "recommended_adjustments": [...]
}}
"""
    
    # Call Gemini to analyze
    response = await self.gemini_service.generate_content(prompt)
    
    try:
        import json
        insights = json.loads(response)
        return {
            "total_campaigns": len(completed),
            "last_campaign": completed[-1].campaign_id,
            **insights
        }
    except:
        return {
            "total_campaigns": len(completed),
            "analysis": response
        }
```

**Change 2: Replace run_full_workflow with run_campaign_workflow**

```python
# REPLACE run_full_workflow method (Lines 37-173)

async def run_campaign_workflow(self, campaign_id: str):
    """
    Executes campaign workflow with agent toggles, learning, image gen, SEO.
    Respects agent_config settings.
    """
    from backend.storage.memory_store import memory_store
    from backend.models.campaign import CampaignStatus
    from datetime import datetime
    
    campaign = memory_store.get_campaign(campaign_id)
    if not campaign:
        raise ValueError(f"Campaign {campaign_id} not found")
    
    if campaign.status != CampaignStatus.IN_PROGRESS:
        raise ValueError(f"Campaign must be IN_PROGRESS to execute")
    
    # Load data
    global_memory = campaign.global_memory_snapshot
    learning = campaign.learning_from_previous if campaign.learning_approved else None
    agent_config = campaign.onboarding.agent_config
    
    self.reset_gemini_call_count()
    
    try:
        # STEP 1: Strategy Agent (if enabled)
        if agent_config.run_strategy:
            print("Executing Strategy Agent...")
            strategy_agent = StrategyAgent()
            strategy_context = {
                "global_memory": global_memory,
                "learning": learning,
                "campaign": campaign.onboarding.dict()
            }
            campaign.strategy_output = await strategy_agent.generate_strategy(strategy_context)
            self.increment_gemini_call_count()
        
        # STEP 2: Forensics Agent (if enabled)
        if agent_config.run_forensics:
            print("Executing Forensics Agent...")
            forensics_agent = ForensicsAgent()
            
            forensics_output = {}
            for platform in campaign.onboarding.goal.platforms:
                # Get competitors for this platform
                competitors = [
                    cp for cp in campaign.onboarding.competitors.platforms 
                    if cp.platform == platform
                ]
                
                if competitors:
                    forensics_context = {
                        "platform": platform,
                        "competitors": competitors[0].urls,
                        "niche": global_memory.get("niche")
                    }
                    forensics_output[platform] = await forensics_agent.analyze(forensics_context)
                    self.increment_gemini_call_count()
            
            campaign.forensics_output = forensics_output
        
        # STEP 3: Planner Agent (if enabled)
        if agent_config.run_planner:
            print("Executing Planner Agent...")
            planner_agent = PlannerAgent()
            
            planner_context = {
                "global_memory": global_memory,
                "strategy": campaign.strategy_output,
                "forensics": campaign.forensics_output,
                "duration_days": campaign.onboarding.goal.duration_days,
                "intensity": campaign.onboarding.goal.intensity,
                "learning": learning
            }
            campaign.plan = await planner_agent.create_plan(planner_context)
            self.increment_gemini_call_count()
        
        # Reality check (optional)
        if campaign.onboarding.goal.duration_days < 7:
            campaign.reality_warning = {
                "warning": "Short campaign duration may limit results",
                "recommendation": "Consider extending to 7+ days"
            }
        
        # STEP 4: Content Agent (if enabled)
        if agent_config.run_content:
            print("Executing Content Agent...")
            content_agent = ContentAgent()
            
            for day in range(1, campaign.onboarding.goal.duration_days + 1):
                print(f"Generating content for Day {day}...")
                
                content_context = {
                    "day": day,
                    "plan": campaign.plan.dict() if campaign.plan else {},
                    "strategy": campaign.strategy_output,
                    "forensics": campaign.forensics_output,
                    "global_memory": global_memory,
                    "learning": learning
                }
                
                daily_content = await content_agent.generate_content(content_context)
                campaign.daily_content[day] = daily_content
                self.increment_gemini_call_count()
                
                # Image Generation (if enabled)
                if campaign.onboarding.image_generation_enabled:
                    print(f"Generating image for Day {day}...")
                    image_url = await self.generate_image_for_content(daily_content)
                    campaign.daily_content[day].thumbnail_url = image_url
                
                # SEO Optimization (if enabled)
                if campaign.onboarding.seo_optimization_enabled:
                    print(f"Optimizing SEO for Day {day}...")
                    optimized = await self.optimize_content_seo(daily_content)
                    campaign.daily_content[day] = optimized
        
        # Save campaign
        campaign.updated_at = datetime.now()
        memory_store.update_campaign(campaign_id, campaign)
        
        print(f"Campaign workflow complete. Total Gemini calls: {self.get_gemini_call_count()}")
        
    except Exception as e:
        print(f"Campaign workflow failed: {e}")
        campaign.status = CampaignStatus.FAILED
        memory_store.update_campaign(campaign_id, campaign)
        raise
```

**Change 3: Add image generation method (NEW)**

```python
# NEW METHOD

async def generate_image_for_content(self, content: DailyContent) -> str:
    """Generate thumbnail image for content."""
    from backend.services.image_service import ImageService
    
    image_service = ImageService()
    
    # Build prompt from content
    prompt = f"""Generate a thumbnail image for:
Title: {content.title}
Hook: {content.hook}
Style: Professional, eye-catching, relevant to content
"""
    
    try:
        image_url = await image_service.generate_image(prompt)
        return image_url
    except Exception as e:
        print(f"Image generation failed: {e}")
        return None
```

**Change 4: Add SEO optimization method (NEW)**

```python
# NEW METHOD

async def optimize_content_seo(self, content: DailyContent) -> DailyContent:
    """Optimize content for SEO."""
    from backend.services.seo_service import SEOService
    
    seo_service = SEOService()
    
    try:
        optimized = await seo_service.optimize_content(
            content, 
            platform=content.platform if hasattr(content, 'platform') else 'YouTube'
        )
        
        # Update content with optimized data
        content.title = optimized.get("title", content.title)
        content.description = optimized.get("description", content.description)
        if hasattr(content, 'tags'):
            content.tags = optimized.get("tags", [])
        
        return content
    except Exception as e:
        print(f"SEO optimization failed: {e}")
        return content
```

**Why:** 
- Respects user's agent toggles
- Learns from previous campaigns
- Integrates image generation & SEO
- Better error handling

**Impact:**
- Campaign execution is now customizable
- Better content quality with images & SEO
- Smarter recommendations based on history

---

### **File 8: backend/services/image_service.py**

**Status:** NEW FILE  
**Priority:** 4 (New Features)  
**Dependencies:** File 7 complete

#### Purpose:
Generate images using Nano Banana 2.5 Flash model.

#### Code:

```python
from typing import Optional
import httpx
from backend.config import config

class ImageService:
    """Service for generating images using Nano Banana 2.5 Flash."""
    
    def __init__(self):
        self.api_key = getattr(config, 'NANO_BANANA_API_KEY', None)
        self.model = "nano-banana-2.5-flash"
        self.base_url = "https://api.nanobanana.ai/v1/generate"  # Replace with actual API endpoint
    
    async def generate_image(self, prompt: str, style: str = "realistic", size: str = "1280x720") -> str:
        """
        Generates image from text prompt.
        Returns image URL.
        
        Args:
            prompt: Text description of image
            style: Image style (realistic, cartoon, professional, etc.)
            size: Image dimensions (1280x720, 1920x1080, etc.)
        
        Returns:
            str: URL to generated image
        """
        if not self.api_key:
            raise ValueError("NANO_BANANA_API_KEY not configured")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.base_url,
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "style": style,
                        "size": size
                    },
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    timeout=60.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                # Extract image URL from response
                # Adjust based on actual API response format
                image_url = data.get("image_url") or data.get("url")
                
                return image_url
                
            except httpx.HTTPError as e:
                print(f"Image generation API error: {e}")
                raise
    
    async def generate_thumbnail(self, title: str, hook: str, platform: str = "YouTube") -> str:
        """
        Generates thumbnail for content based on title/hook.
        Optimized for social media platforms.
        
        Args:
            title: Content title
            hook: Content hook/tagline
            platform: Target platform (YouTube, Twitter, etc.)
        
        Returns:
            str: URL to generated thumbnail
        """
        # Platform-specific sizing
        sizes = {
            "YouTube": "1280x720",
            "Twitter": "1200x675",
            "Instagram": "1080x1080",
            "TikTok": "1080x1920"
        }
        
        size = sizes.get(platform, "1280x720")
        
        prompt = f"""Create a professional {platform} thumbnail:
Title: {title}
Hook: {hook}

Style: Eye-catching, bold text, vibrant colors, professional composition
Text overlay: Include title text prominently
Background: Relevant imagery that captures attention
"""
        
        return await self.generate_image(prompt, style="professional", size=size)
```

**Why:** Enables automatic thumbnail generation for content.

**Impact:**
- Content looks more professional with custom images
- Saves time for users (no manual design)
- Requires API key configuration

---

### **File 9: backend/services/seo_service.py**

**Status:** NEW FILE  
**Priority:** 4 (New Features)  
**Dependencies:** File 7 complete

#### Purpose:
Optimize content for SEO (titles, descriptions, tags).

#### Code:

```python
from typing import Optional
from backend.services.gemini_service import GeminiService

class SEOService:
    """Service for SEO optimization using Gemini."""
    
    def __init__(self):
        self.gemini_service = GeminiService()
    
    async def optimize_content(self, title: str, description: str, platform: str = "YouTube") -> dict:
        """
        Optimizes title, description, tags for SEO.
        
        Args:
            title: Original title
            description: Original description
            platform: Target platform (YouTube, Twitter, etc.)
        
        Returns:
            dict: {"title": "...", "description": "...", "tags": [...]}
        """
        prompt = f"""Optimize this content for {platform} SEO:

Original Title: {title}
Original Description: {description}

Provide:
1. Optimized title (keyword-rich, attention-grabbing, {platform} best practices)
2. Optimized description (detailed, keyword-rich, includes CTAs)
3. Relevant tags/keywords (10-15 tags)

Format as JSON:
{{
  "title": "optimized title here",
  "description": "optimized description here",
  "tags": ["tag1", "tag2", ...]
}}
"""
        
        response = await self.gemini_service.generate_content(prompt)
        
        try:
            import json
            optimized = json.loads(response)
            return optimized
        except:
            # Fallback if JSON parsing fails
            return {
                "title": title,
                "description": description,
                "tags": []
            }
    
    async def analyze_seo_score(self, title: str, description: str, tags: list[str], platform: str = "YouTube") -> dict:
        """
        Analyzes SEO quality of content.
        
        Args:
            title: Content title
            description: Content description
            tags: Content tags
            platform: Target platform
        
        Returns:
            dict: {"score": 85, "suggestions": [...]}
        """
        prompt = f"""Analyze this {platform} content for SEO quality:

Title: {title}
Description: {description}
Tags: {tags}

Provide:
1. SEO Score (0-100)
2. Strengths
3. Weaknesses
4. Actionable suggestions for improvement

Format as JSON:
{{
  "score": 85,
  "strengths": [...],
  "weaknesses": [...],
  "suggestions": [...]
}}
"""
        
        response = await self.gemini_service.generate_content(prompt)
        
        try:
            import json
            analysis = json.loads(response)
            return analysis
        except:
            return {
                "score": 0,
                "suggestions": ["Unable to analyze SEO"]
            }
```

**Why:** Improves content discoverability and engagement.

**Impact:**
- Better SEO = more organic reach
- Users get optimized content automatically
- Uses existing Gemini service (no new API)

---

### **File 10: backend/config.py**

**Status:** MODIFY  
**Priority:** 4 (New Features)  
**Dependencies:** Files 8-9 complete

#### Code Changes:

**Add POLLINATIONS_API_KEY**

```python
# ADD at end of config.py

# Image Generation (Pollinations.ai)
POLLINATIONS_API_KEY = os.getenv("POLLINATIONS_API_KEY", "")  # For future paid tier if needed
```

**Why:** Enables image generation service using Pollinations.ai Flux.

**Implementation Note:** Currently Pollinations.ai is free and doesn't require an API key. The environment variable is reserved for potential future paid tiers.

**Impact:**
- No immediate environment variable requirement
- Future-proofed for paid tier migration

---

### **File 11: backend/main.py**

**Status:** MODIFY  
**Priority:** 2 (Core APIs)  
**Dependencies:** Files 5-6 complete

#### Code Changes:

**Register new routers**

```python
# ADD after existing routers (around line 20-30)

from backend.api.profile import router as profile_router

# Register routers
app.include_router(auth_router, prefix="/api", tags=["auth"])
app.include_router(onboarding_router, prefix="/api", tags=["onboarding"])
app.include_router(profile_router, prefix="/api", tags=["profile"])  # NEW
app.include_router(campaigns_router, prefix="/api", tags=["campaigns"])
app.include_router(content_router, prefix="/api", tags=["content"])
```

**Why:** Exposes profile API endpoints.

**Impact:**
- Frontend can access /api/profile endpoints

---

### **File 12: backend/models/campaign/learning_memory.py (NEW - IMPLEMENTED)**

**Status:** NEW FILE  
**Priority:** 4B (Advanced Features)  
**Dependencies:** Files 1-3 complete

#### Purpose:
Store structured insights from completed campaigns to enable learning and improvement in future campaigns.

#### Code:

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class LearningMemory(BaseModel):
    """Stores insights from completed campaigns for learning."""
    memory_id: str                         # Unique ID for this memory
    user_id: str                           # Creator who ran the campaign
    campaign_id: str                       # Source campaign
    
    # Campaign Context
    goal_type: str                         # "growth", "engagement", "monetization", "launch"
    platforms: list[str]                   # Platforms used
    niche: str                             # Creator's niche
    duration_days: int                     # Campaign length
    
    # Outcome Analysis
    what_worked: list[str]                 # Successful strategies/tactics
    what_failed: list[str]                 # Unsuccessful attempts
    key_insights: list[str]                # Major learnings
    recommended_adjustments: list[str]      # Suggestions for next time
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
```

**Why:** Enables systematic learning from past campaigns to improve future performance.

**Usage:**
- Generated by Outcome Agent after campaign completion
- Retrieved by Strategy Agent when planning similar campaigns
- Filtered by goal_type, platform, and niche for relevance

**Impact:**
- Memory store needs to integrate learning retrieval
- Agent orchestrator needs to pass learning context to agents
- Outcome agent needs to generate structured insights

---

### **File 13: backend/prompts/agent2_strategy.txt, agent4_planner.txt, agent5_content.txt (ENHANCED - IMPLEMENTED)**

**Status:** MODIFY  
**Priority:** 4B (Advanced Features)  
**Dependencies:** File 12 complete

#### Purpose:
Add goal type conditional logic to make agents adapt strategies based on campaign goal type.

#### Code Changes:

**agent2_strategy.txt - Add goal type section:**

```
=== GOAL TYPE ADAPTATION ===

Based on the campaign goal_type, adapt your strategic approach:

IF goal_type is "growth":
  - Prioritize viral content formats (shorts, reels, trending topics)
  - Focus on reach and shareability
  - Optimize for new subscriber/follower acquisition
  - Use proven viral hooks and formats
  - Target trending keywords and topics

IF goal_type is "engagement":
  - Prioritize community interaction (polls, questions, CTAs)
  - Focus on watch time, retention, and comments
  - Create content that sparks discussion
  - Build series and recurring formats
  - Foster community and connection

IF goal_type is "monetization":
  - Include clear conversion opportunities
  - Focus on product/service mentions and affiliate links
  - Optimize for click-through rates
  - Build trust and authority
  - Create content around buyer intent keywords

IF goal_type is "launch":
  - Build anticipation and hype
  - Schedule coordinated multi-platform announcements
  - Create teaser content leading up to launch
  - Maximize first impressions
  - Focus on timing and momentum
```

**agent4_planner.txt - Add goal type section:**

```
=== CONTENT PLANNING BY GOAL TYPE ===

Adapt your daily content plan based on goal_type:

growth: Front-load viral content, trending topics, shareable hooks
engagement: Mix educational + community content, recurring series
monetization: Include product mentions, case studies, conversion content
launch: Build hype arc (teasers → reveal → celebration)
```

**agent5_content.txt - Add goal type section:**

```
=== CONTENT STYLE BY GOAL TYPE ===

Adapt your content creation based on goal_type:

growth: Viral hooks, trending formats, curiosity gaps
engagement: Questions, polls, CTAs, community focus
monetization: Value-first, trust-building, clear offers
launch: Excitement, exclusivity, FOMO, countdown
```

**Why:** Makes AI agents goal-aware, resulting in more targeted and effective strategies.

**Impact:**
- Strategy becomes more aligned with creator goals
- Content types adapt to campaign objectives
- Higher success rates for specific goal types

---

## Implementation Order Summary

### **Phase 1: Foundation (Day 1-2)**
1. ✅ Update [backend/models/user.py](backend/models/user.py)
2. ✅ Update [backend/models/campaign.py](backend/models/campaign.py)
3. ✅ Update [backend/storage/memory_store.py](backend/storage/memory_store.py)

### **Phase 2: Core APIs (Day 2-3)**
4. ✅ Modify [backend/api/onboarding.py](backend/api/onboarding.py)
5. ✅ Create [backend/api/profile.py](backend/api/profile.py)
6. ✅ Update [backend/main.py](backend/main.py)

### **Phase 3: Campaign Management (Day 3-5)**
7. ✅ Refactor [backend/api/campaigns.py](backend/api/campaigns.py)
8. ✅ Refactor [backend/services/agent_orchestrator.py](backend/services/agent_orchestrator.py)

### **Phase 4: New Features (Day 5-6)**
9. ✅ Create [backend/services/image_service.py](backend/services/image_service.py)
10. ✅ Create [backend/services/seo_service.py](backend/services/seo_service.py)
11. ✅ Update [backend/config.py](backend/config.py)

### **Phase 5: Frontend (Out of Scope)**
**STATUS:** Frontend development handled by separate team
- All backend APIs ready for integration
- See frontend developer for implementation status
- Frontend not documented in this backend implementation plan

### **Phase 6: Testing (Day 10-11)**
17. ✅ End-to-end testing
18. ✅ Bug fixes and refinements

---

## Further Considerations

### **Questions to Address:**

1. **Database Migration:** Currently using in-memory storage. When should we migrate to persistent database (PostgreSQL/MongoDB)?

2. **Context Analyzer:** How should it auto-fetch best/worst content without manual entry? Need to integrate YouTube API and Twitter API with proper error handling.

3. **Nano Banana API:** What's the actual API endpoint and authentication method? Need documentation.

4. **Image Storage:** Should generated images be stored locally or use cloud storage (S3, Cloudinary)?

5. **Agent Execution Time:** Long campaigns (30 days) = 30+ Gemini calls. Should this be async with progress updates?

6. **Campaign History Limit:** How many previous campaigns should be analyzed for lessons? All or last N?

7. **Error Recovery:** If agent execution fails mid-campaign, should user be able to retry from last successful step?

8. **Cost Tracking:** Should we track Gemini API costs per campaign and show to user?

9. **Frontend State Management:** With complex campaign onboarding, should we use Redux/Zustand or keep React state?

10. **Authentication:** Frontend needs JWT token management. Should we use HTTP-only cookies or localStorage?

---

## Risk Assessment

### **High Risk:**
- ⚠️ Data migration from old structure to new (if existing users)
- ⚠️ Frontend-backend integration (major refactor)
- ⚠️ Image generation API reliability (external dependency)

### **Medium Risk:**
- ⚠️ Agent execution time for long campaigns
- ⚠️ Context Analyzer auto-fetch without manual input
- ⚠️ Campaign history analysis accuracy

### **Low Risk:**
- ✅ Model updates (straightforward)
- ✅ API endpoint changes (well-defined)
- ✅ SEO optimization (uses existing Gemini)

---

## Success Metrics

After implementation, success will be measured by:

1. **Onboarding Completion Rate:** % of users who complete Phase 1 (target: 90%+)
2. **Phase 2 Adoption:** % of users who complete optional profile (target: 60%+)
3. **Campaign Creation Time:** Average time from "Create Campaign" to "Start" (target: <5 min)
4. **Campaign Completion Rate:** % of campaigns that finish vs abandoned (target: 70%+)
5. **Learning Impact:** % improvement in subsequent campaigns vs first (target: 15%+ better outcomes)
6. **Agent Toggle Usage:** % of users who customize agents (target: 30%+)
7. **Image Generation Success:** % of successful image generations (target: 95%+)
8. **SEO Score Improvement:** Average SEO score increase with optimization (target: +20 points)

---

**End of Implementation Plan**
