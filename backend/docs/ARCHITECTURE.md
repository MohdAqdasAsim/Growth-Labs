# Architecture Comparison Document

## 1. System Overview

### **Current Architecture**

**Flow:** Signup → Complex Onboarding (30+ fields) → Dashboard → Instant Campaign Creation (auto-executes all agents)

**Problems:**
- Onboarding is overwhelming (30+ fields upfront)
- Phase 2 hidden in onboarding (no profile section)
- Campaigns auto-execute immediately (no control)
- No campaign-specific setup
- Competitors stored globally (can't vary per campaign)
- No learning from previous campaigns
- No agent customization
- Frontend disconnected from backend

---

### **Target Architecture**

**Flow:** Signup → Minimal Global Onboarding (Phase 1: 5 fields) → Dashboard → Optional Profile Completion (Phase 2) → Campaign Onboarding (4 steps) → Manual Start → Agent Execution (with toggles)

**Improvements:**
- ✅ Minimal friction at signup (5 fields only)
- ✅ Phase 2 moved to Profile section
- ✅ Campaign-specific onboarding (name, goals, competitors per campaign)
- ✅ Manual campaign start (user control)
- ✅ Agent toggles (skip unwanted agents)
- ✅ Learning from previous campaigns
- ✅ Campaign isolation with shared global memory
- ✅ Proper timestamps tracking
- ✅ Image generation integration
- ✅ SEO optimization

---

## 2. Data Model Changes

### **2.1 User Model - CreatorProfile**

#### **Current: [backend/models/user.py](backend/models/user.py#L9-L73)**

```python
class CreatorProfile(BaseModel):
    user_id: str
    
    # PHASE 1: ONBOARDING (REQUIRED) - 15 fields
    category: str                          # Creator niche
    target_audience: str                   # Target audience description
    platforms: list[str]                   # Platforms used
    youtube_url: Optional[str]
    instagram_url: Optional[str]
    reddit_url: Optional[str]
    x_handle: Optional[str]
    competitor_urls: list[str]             # 3-5 competitor YouTube URLs
    x_competitor_handles: list[str]        # 3-5 competitor X handles
    best_content: list[dict]               # Best performing content
    worst_content: list[dict]              # Worst performing content
    time_per_week: str                     # Time available
    
    # PHASE 2: PROFILE COMPLETION (OPTIONAL) - 15 fields
    unique_angle: Optional[str]
    content_mission: Optional[str]
    self_strengths: list[str]
    self_weaknesses: list[str]
    content_enjoys: list[str]
    content_avoids: list[str]
    current_metrics: dict                  # REMOVE
    audience_demographics: Optional[str]
    tools_skills: list[str]
    budget: Optional[str]                  # REMOVE
    team_size: Optional[str]               # REMOVE
    past_attempts: list[dict]
    what_worked_before: list[str]
    why_create: Optional[str]
    timeline_expectations: Optional[str]   # REMOVE
    
    # SYSTEM FIELDS
    posting_frequency: Optional[str]
    historical_metrics: dict
    created_at: datetime
    updated_at: datetime
```

**Issues:**
- ❌ Too many Phase 1 fields (15)
- ❌ Platform URLs in global onboarding (should be campaign-specific)
- ❌ Competitors in global onboarding (should be campaign-specific)
- ❌ `best_content`/`worst_content` manually entered (should be automatic)
- ❌ Phase 2 asked during onboarding (should be in Profile section)
- ❌ Missing `creator_type` field

---

#### **Target: NEW CreatorProfile**

```python
class CreatorProfile(BaseModel):
    user_id: str
    
    # PHASE 1: GLOBAL ONBOARDING (REQUIRED) - 5 fields
    user_name: str                         # NEW - User's name
    creator_type: str                      # NEW - "content_creator", "student", "marketing", "business", "freelancer"
    niche: str                             # Category/niche user operates in
    target_audience_niche: str             # Target audience's niche/interests
    
    # PHASE 2: PROFILE COMPLETION (OPTIONAL) - 11 fields
    # Accessed via Dashboard → Profile Section
    unique_angle: Optional[str]
    content_mission: Optional[str]
    self_strengths: list[str] = []
    self_weaknesses: list[str] = []
    content_enjoys: list[str] = []
    content_avoids: list[str] = []
    audience_demographics: Optional[str]
    tools_skills: list[str] = []
    past_attempts: list[dict] = []
    what_worked_before: list[str] = []
    why_create: Optional[str]
    
    # SYSTEM FIELDS
    posting_frequency: Optional[str]       # Calculated by Context Analyzer
    historical_metrics: dict = {}          # Context Analyzer output
    phase2_completed: bool = False         # NEW - Track Phase 2 completion
    created_at: datetime
    updated_at: datetime
```

**Changes:**
- ✅ Phase 1: **15 → 5 fields** (80% reduction)
- ✅ Added `user_name`, `creator_type`
- ✅ Renamed `category` → `niche`
- ✅ Renamed `target_audience` → `target_audience_niche`
- ✅ Removed all platform URLs (moved to campaign-specific)
- ✅ Removed `competitor_urls`, `x_competitor_handles` (moved to campaign-specific)
- ✅ Removed `best_content`, `worst_content` (now automatic via Context Analyzer)
- ✅ Removed `time_per_week` (moved to campaign-specific as `intensity`)
- ✅ Phase 2: **15 → 11 fields** (removed `current_metrics`, `budget`, `team_size`, `timeline_expectations`)
- ✅ Added `phase2_completed` flag
- ✅ All Phase 2 fields have defaults (empty arrays/None)

---

### **2.2 Campaign Model**

#### **Current: [backend/models/campaign.py](backend/models/campaign.py#L59-L82)**

```python
class CampaignGoal(BaseModel):
    description: str                       # Goal description
    goal_type: str                         # growth, engagement, launch, etc.
    platform: Literal["YouTube", "Twitter"]
    metric: str                            # subscribers, views, followers, etc.
    target_value: Optional[float]
    duration_days: int = 3                 # 3-30 days
    posting_frequency: str = "daily"

class Campaign(BaseModel):
    campaign_id: str
    user_id: str
    goal: CampaignGoal
    target_platforms: list[str]
    content_intensity: str = "moderate"    # light, moderate, intense
    status: CampaignStatus                 # planning, approved, in_progress, completed
    
    # Planning phase outputs
    strategy_output: dict
    forensics_output_yt: dict
    forensics_output_x: dict
    plan: Optional[CampaignPlan]
    plan_approved: bool = False
    reality_warning: Optional[dict]
    
    # Execution tracking
    daily_content: dict[int, DailyContent]
    daily_execution: dict[int, DailyExecution]
    report: Optional[CampaignReport]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
```

**Issues:**
- ❌ No campaign name/description
- ❌ No campaign-specific competitor data
- ❌ `CampaignGoal` supports only single platform (should support multiple)
- ❌ `CampaignGoal.metric` is single string (should be array of metric objects)
- ❌ No `campaign_started_at` (when user clicked "Start")
- ❌ No `agent_config` (which agents to run)
- ❌ No `learning_from_previous` (insights from past campaigns)
- ❌ No `image_generation_enabled` flag
- ❌ No `seo_optimization_enabled` flag
- ❌ Status auto-changes (user has no control)

---

#### **Target: NEW Campaign Model**

```python
# NEW: Campaign-specific competitor data
class CompetitorPlatform(BaseModel):
    platform: Literal["YouTube", "Twitter", "Instagram", "TikTok"]
    urls: list[dict]  # [{"url": "...", "desc": "I like his thumbnails"}, ...]

class CampaignCompetitors(BaseModel):
    platforms: list[CompetitorPlatform]

# NEW: Metric with target
class CampaignMetric(BaseModel):
    type: str              # "subscribers", "views", "followers", "engagement"
    target: int            # Target value

# UPDATED: Campaign Goal (supports multiple platforms)
class CampaignGoal(BaseModel):
    goal_aim: str                          # What to achieve (free text)
    goal_type: str                         # "growth", "engagement", "monetization", "launch"
    platforms: list[str]                   # ["YouTube", "Twitter"] - multiple platforms
    metrics: list[CampaignMetric]          # Array of metric objects
    duration_days: int                     # 3-30 days
    intensity: str                         # "light", "moderate", "intense"

# NEW: Agent Configuration
class AgentConfig(BaseModel):
    run_strategy: bool = True
    run_forensics: bool = True
    run_planner: bool = True
    run_content: bool = True
    run_outcome: bool = True

# NEW: Campaign Onboarding Data
class CampaignOnboarding(BaseModel):
    name: str                              # Campaign name
    description: str                       # Campaign description
    goal: CampaignGoal
    competitors: CampaignCompetitors
    agent_config: AgentConfig = AgentConfig()
    image_generation_enabled: bool = True
    seo_optimization_enabled: bool = True

# UPDATED: Campaign with onboarding
class Campaign(BaseModel):
    campaign_id: str                       # Auto-generated UUID
    user_id: str
    
    # Campaign Onboarding Data
    onboarding: CampaignOnboarding
    
    # Lifecycle Status
    status: CampaignStatus                 # onboarding_incomplete, ready_to_start, in_progress, completed, failed
    
    # Global Memory Snapshot (taken at creation)
    global_memory_snapshot: dict           # Copy of CreatorProfile at campaign creation
    
    # Learning from Previous Campaigns
    learning_from_previous: Optional[dict] # Insights from past campaigns
    learning_approved: bool = False        # User approved/modified lessons
    
    # Planning Phase Outputs
    strategy_output: dict = {}
    forensics_output: dict = {}            # Combined YouTube + Twitter + others
    plan: Optional[CampaignPlan] = None
    reality_warning: Optional[dict] = None
    
    # Execution Tracking
    daily_content: dict[int, DailyContent] = {}
    daily_execution: dict[int, DailyExecution] = {}
    report: Optional[CampaignReport] = None
    
    # Timestamps
    created_at: datetime                   # When campaign was created (onboarding started)
    onboarding_completed_at: Optional[datetime] = None  # When onboarding finished
    started_at: Optional[datetime] = None  # When user clicked "Start Campaign"
    completed_at: Optional[datetime] = None  # When campaign finished
    updated_at: datetime                   # Last modification
```

**Changes:**
- ✅ Added `CampaignOnboarding` nested model (name, description, goal, competitors, agent config)
- ✅ `CampaignGoal` now supports multiple platforms
- ✅ `metrics` changed from single string to array of `CampaignMetric` objects
- ✅ Added `CompetitorPlatform` and `CampaignCompetitors` models
- ✅ Added `AgentConfig` for toggle controls
- ✅ Added `global_memory_snapshot` (copy of global profile at creation)
- ✅ Added `learning_from_previous` and `learning_approved`
- ✅ Added `image_generation_enabled` and `seo_optimization_enabled`
- ✅ Merged `forensics_output_yt` and `forensics_output_x` into single `forensics_output` dict
- ✅ Status now includes `onboarding_incomplete`, `ready_to_start` (before manual start)
- ✅ Added granular timestamps: `created_at`, `onboarding_completed_at`, `started_at`, `completed_at`, `updated_at`

---

### **2.3 Campaign Status Enum**

#### **Current:**
```python
class CampaignStatus(str, Enum):
    PLANNING = "planning"
    APPROVED = "approved"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
```

#### **Target:**
```python
class CampaignStatus(str, Enum):
    ONBOARDING_INCOMPLETE = "onboarding_incomplete"  # NEW - During campaign setup
    READY_TO_START = "ready_to_start"                # NEW - Onboarding done, awaiting manual start
    IN_PROGRESS = "in_progress"                      # Agents executing or content being posted
    COMPLETED = "completed"                          # All days executed, report generated
    FAILED = "failed"                                # NEW - Agent execution failed
```

**Changes:**
- ✅ Removed `PLANNING`, `APPROVED` (deprecated)
- ✅ Added `ONBOARDING_INCOMPLETE` (campaign created but onboarding not finished)
- ✅ Added `READY_TO_START` (onboarding complete, user needs to click "Start")
- ✅ Added `FAILED` (error during agent execution)

---

## 3. Memory Storage Changes

### **Current: [backend/storage/memory_store.py](backend/storage/memory_store.py)**

```python
class MemoryStore:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.creator_profiles: Dict[str, CreatorProfile] = {}  # Key: user_id
        self.campaigns: Dict[str, Campaign] = {}               # Key: campaign_id
        self.jwt_blacklist: set = set()
```

**Issues:**
- ❌ No storage for campaign history/lessons learned
- ❌ No relationship tracking between campaigns
- ❌ Campaigns can't access previous campaign data

---

### **Target: NEW MemoryStore**

```python
class MemoryStore:
    def __init__(self):
        # User & Profile Storage
        self.users: Dict[str, User] = {}
        self.creator_profiles: Dict[str, CreatorProfile] = {}  # Key: user_id
        
        # Campaign Storage
        self.campaigns: Dict[str, Campaign] = {}               # Key: campaign_id
        self.user_campaigns: Dict[str, list[str]] = {}         # NEW - Key: user_id, Value: list of campaign_ids (ordered by creation)
        
        # Campaign Learning Storage
        self.campaign_insights: Dict[str, dict] = {}           # NEW - Key: campaign_id, Value: insights/lessons
        
        # Authentication
        self.jwt_blacklist: set = set()
    
    # NEW METHODS
    def get_user_campaign_history(self, user_id: str) -> list[Campaign]:
        """Returns all campaigns for a user, ordered by creation date."""
        campaign_ids = self.user_campaigns.get(user_id, [])
        return [self.campaigns[cid] for cid in campaign_ids if cid in self.campaigns]
    
    def get_previous_campaign_insights(self, user_id: str) -> Optional[dict]:
        """Analyzes previous campaigns and returns lessons learned."""
        history = self.get_user_campaign_history(user_id)
        if not history:
            return None
        
        # Analyze completed campaigns only
        completed = [c for c in history if c.status == CampaignStatus.COMPLETED]
        if not completed:
            return None
        
        # Extract insights from reports
        insights = {
            "total_campaigns": len(completed),
            "successful_patterns": [],
            "failed_patterns": [],
            "recommended_adjustments": []
        }
        
        for campaign in completed:
            if campaign.report:
                # Logic to extract patterns from report
                # (to be implemented in agent_orchestrator)
                pass
        
        return insights
    
    def save_campaign_insights(self, campaign_id: str, insights: dict):
        """Stores insights/lessons from a campaign."""
        self.campaign_insights[campaign_id] = insights
    
    def add_campaign_to_user(self, user_id: str, campaign_id: str):
        """Links a campaign to a user."""
        if user_id not in self.user_campaigns:
            self.user_campaigns[user_id] = []
        self.user_campaigns[user_id].append(campaign_id)
```

**Changes:**
- ✅ Added `user_campaigns` dict for tracking user's campaign list
- ✅ Added `campaign_insights` dict for storing lessons learned
- ✅ Added `get_user_campaign_history()` method
- ✅ Added `get_previous_campaign_insights()` method (analyzes past campaigns)
- ✅ Added `save_campaign_insights()` method
- ✅ Added `add_campaign_to_user()` method

---

## 4. API Endpoint Changes

### **4.1 Onboarding Endpoints**

#### **Current: [backend/api/onboarding.py](backend/api/onboarding.py)**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/onboarding` | Create/update full profile (Phase 1 + Phase 2) |
| `GET` | `/onboarding` | Get creator profile |
| `PUT` | `/onboarding` | Full update |
| `PATCH` | `/onboarding/phase2` | Update Phase 2 fields |

**Issues:**
- ❌ Phase 1 collects 15 fields (too many)
- ❌ Phase 2 accessible during onboarding (should be profile-only)
- ❌ No separation between signup onboarding and profile completion

---

#### **Target: NEW Onboarding Endpoints**

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| `POST` | `/onboarding` | Create Phase 1 profile (5 fields only) | **MODIFIED** |
| `GET` | `/onboarding` | Get creator profile | **KEEP** |
| `DELETE` | `/onboarding/phase2` | REMOVED | **DELETE** |

**[backend/api/onboarding.py](backend/api/onboarding.py) Changes:**
- ✅ `POST /onboarding` now only accepts 5 Phase 1 fields
- ✅ Context Analyzer triggered after Phase 1 completion (fetches historical content automatically)
- ✅ Removed `PATCH /onboarding/phase2` (moved to Profile API)
- ✅ Removed `PUT /onboarding` (not needed)

---

### **4.2 Profile Endpoints (NEW)**

#### **Target: NEW Profile API**

**File:** `backend/api/profile.py` (NEW FILE)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/profile` | Get full creator profile (Phase 1 + Phase 2) |
| `PATCH` | `/profile/phase2` | Update Phase 2 fields (11 fields) |
| `GET` | `/profile/completion` | Get profile completion status (% complete) |

**Purpose:**
- ✅ Separates Phase 2 from onboarding
- ✅ Accessible from Dashboard → Profile section
- ✅ Optional but recommended

---

### **4.3 Campaign Endpoints**

#### **Current: [backend/api/campaigns.py](backend/api/campaigns.py)**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/campaigns` | Create AND auto-execute campaign |
| `GET` | `/campaigns/{id}` | Get campaign details |
| `POST` | `/campaigns/{id}/approve` | DEPRECATED |
| `POST` | `/campaigns/{id}/complete` | Mark campaign complete |
| `PATCH` | `/campaigns/{id}/execute/{day}` | Confirm daily posting |
| `GET` | `/campaigns/{id}/schedule` | Get campaign schedule |
| `GET` | `/campaigns/{id}/report` | Get campaign report |
| `GET` | `/campaigns` | List all user campaigns |

**Issues:**
- ❌ `POST /campaigns` auto-executes immediately (no control)
- ❌ No campaign onboarding flow
- ❌ No edit/delete endpoints
- ❌ No manual start trigger
- ❌ No lessons learned from previous campaigns

---

#### **Target: NEW Campaign Endpoints**

**File:** [backend/api/campaigns.py](backend/api/campaigns.py) (MAJOR REFACTOR)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| `POST` | `/campaigns` | Create empty campaign (generates ID, status: `onboarding_incomplete`) | **MODIFIED** |
| `PATCH` | `/campaigns/{id}/onboarding` | Update campaign onboarding data (Step 1-4) | **NEW** |
| `POST` | `/campaigns/{id}/complete-onboarding` | Mark onboarding complete, generate lessons learned | **NEW** |
| `GET` | `/campaigns/{id}/lessons-learned` | Get insights from previous campaigns | **NEW** |
| `PATCH` | `/campaigns/{id}/approve-lessons` | User approves/modifies lessons | **NEW** |
| `POST` | `/campaigns/{id}/start` | Manual start - executes agent workflow | **NEW** |
| `GET` | `/campaigns/{id}` | Get campaign details | **KEEP** |
| `PATCH` | `/campaigns/{id}` | Edit campaign (only if not started) | **NEW** |
| `DELETE` | `/campaigns/{id}` | Delete campaign (only if not started) | **NEW** |
| `POST` | `/campaigns/{id}/complete` | Mark campaign complete, generate report | **KEEP** |
| `PATCH` | `/campaigns/{id}/execute/{day}` | Confirm daily posting | **KEEP** |
| `GET` | `/campaigns/{id}/schedule` | Get campaign schedule | **KEEP** |
| `GET` | `/campaigns/{id}/report` | Get campaign report | **KEEP** |
| `GET` | `/campaigns` | List all user campaigns | **KEEP** |
| `DELETE` | `/campaigns/{id}/approve` | DEPRECATED - Remove | **DELETE** |

**Changes:**
- ✅ Separated campaign creation from execution
- ✅ Added `/onboarding` PATCH endpoint for 4-step wizard
- ✅ Added `/complete-onboarding` to finalize setup and analyze previous campaigns
- ✅ Added `/lessons-learned` to show user insights
- ✅ Added `/approve-lessons` for user to modify/approve
- ✅ Added `/start` for manual trigger (executes agents with toggles)
- ✅ Added `/campaigns/{id}` PATCH for editing
- ✅ Added `/campaigns/{id}` DELETE for deletion
- ✅ Removed deprecated `/approve` endpoint

---

### **4.4 New Service Endpoints**

#### **Image Generation API (NEW)**

**File:** `backend/api/image_gen.py` (NEW FILE)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/image/generate` | Generate image using Nano Banana 2.5 Flash |
| `GET` | `/image/{id}` | Get generated image by ID |

#### **SEO Optimization API (NEW)**

**File:** `backend/api/seo.py` (NEW FILE)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/seo/optimize` | Optimize content for SEO (title, description, tags) |
| `POST` | `/seo/analyze` | Analyze content SEO score |

---

## 5. Agent Orchestrator Changes

### **Current: [backend/services/agent_orchestrator.py](backend/services/agent_orchestrator.py#L37-L173)**

**`run_full_workflow()` Flow:**
1. Execute Strategy Agent → 1 Gemini call
2. Execute Forensics Agent (YouTube) → 1 call
3. Execute Forensics Agent (Twitter) → 1 call
4. Execute Planner Agent → 1 call
5. **Auto-approve plan** (no user gate)
6. Execute Content Agent for each day → N calls

**Total:** 4 + N Gemini calls (auto-executes all)

**Issues:**
- ❌ No agent toggles
- ❌ Auto-approves plan without user review
- ❌ Can't skip agents
- ❌ No learning from previous campaigns
- ❌ No image generation integration
- ❌ No SEO optimization

---

### **Target: NEW Agent Orchestrator**

**File:** [backend/services/agent_orchestrator.py](backend/services/agent_orchestrator.py) (MAJOR REFACTOR)

**New Method:** `run_campaign_workflow(campaign_id: str)`

**Flow:**
1. **Load Campaign Data**
   - Get campaign from memory store
   - Get global memory snapshot
   - Get learning from previous campaigns

2. **Generate Lessons Learned** (if previous campaigns exist)
   - Analyze previous campaign reports
   - Extract successful patterns
   - Extract failed patterns
   - Return insights to user for approval

3. **Execute Enabled Agents** (based on `agent_config`)
   - If `run_strategy` → Execute Strategy Agent (pass global memory + learning)
   - If `run_forensics` → Execute Forensics Agent (per platform in campaign)
   - If `run_planner` → Execute Planner Agent
   - If `run_content` → Execute Content Agent (per day)
   - If `run_outcome` → Execute Outcome Agent (after campaign completion)

4. **Image Generation** (if `image_generation_enabled`)
   - For each day's content, generate thumbnail/image
   - Call Nano Banana 2.5 Flash API
   - Attach image URL to `DailyContent`

5. **SEO Optimization** (if `seo_optimization_enabled`)
   - For each day's content, optimize title/description/tags
   - Use SEO service
   - Update `DailyContent` with optimized metadata

**New Methods:**
- `analyze_previous_campaigns(user_id: str) -> dict` - Generates lessons learned
- `execute_agent_with_toggle(agent_name: str, campaign: Campaign, enabled: bool)` - Conditional execution
- `generate_image_for_content(content: DailyContent) -> str` - Image generation
- `optimize_content_seo(content: DailyContent) -> DailyContent` - SEO optimization

**Changes:**
- ✅ Respects `agent_config` toggles
- ✅ Passes global memory snapshot to agents
- ✅ Passes learning from previous campaigns to agents
- ✅ Integrates image generation
- ✅ Integrates SEO optimization
- ✅ Removes auto-approve logic
- ✅ Adds error handling (sets status to `FAILED` on error)

---

## 6. New Services

### **6.1 Image Service (NEW)**

**File:** `backend/services/image_service.py` (NEW FILE)

**Purpose:** Generate images using Nano Banana 2.5 Flash model

**Methods:**
```python
class ImageService:
    def __init__(self):
        self.api_key = config.NANO_BANANA_API_KEY
        self.model = "nano-banana-2.5-flash"
    
    async def generate_image(self, prompt: str, style: str = "realistic") -> str:
        """
        Generates image from text prompt.
        Returns image URL or base64.
        """
        pass
    
    async def generate_thumbnail(self, content: DailyContent) -> str:
        """
        Generates thumbnail for content based on title/hook/description.
        Returns image URL.
        """
        pass
```

---

### **6.2 SEO Service (NEW)**

**File:** `backend/services/seo_service.py` (NEW FILE)

**Purpose:** Optimize content for search engines

**Methods:**
```python
class SEOService:
    def __init__(self):
        self.gemini_service = GeminiService()
    
    async def optimize_content(self, content: DailyContent, platform: str) -> dict:
        """
        Optimizes title, description, tags for SEO.
        Returns {"title": "...", "description": "...", "tags": [...]}
        """
        pass
    
    async def analyze_seo_score(self, content: DailyContent) -> dict:
        """
        Analyzes SEO quality of content.
        Returns {"score": 85, "suggestions": [...]}
        """
        pass
```

---

## 7. Frontend Changes

### **7.1 Onboarding Page**

#### **Current: [frontend/src/pages/Onboarding.jsx](frontend/src/pages/Onboarding.jsx)**

**Steps:**
1. Creator Basics (name, niche, content style)
2. Goals (multi-select)
3. Platforms (with URLs)

**Issues:**
- ❌ Doesn't match backend Phase 1 fields
- ❌ Saves to localStorage only (no API call)
- ❌ Collects platform URLs (should be campaign-specific)

---

#### **Target: NEW Onboarding Page**

**Steps:**
1. **User Name** - Text input
2. **Creator Type** - Dropdown (content_creator, student, marketing, business, freelancer)
3. **Your Niche** - Text input (what niche are you in?)
4. **Target Audience Niche** - Text input (who are you targeting?)
5. **Submit** → Calls `POST /onboarding`

**Changes:**
- ✅ Reduced to 5 fields
- ✅ Calls backend API `POST /onboarding`
- ✅ Triggers Context Analyzer (automatic historical content fetch)
- ✅ Removes platform URLs
- ✅ Removes goals (moved to campaign)

---

### **7.2 Profile Page (NEW)**

**File:** `frontend/src/pages/Profile.jsx` (NEW FILE)

**Purpose:** Phase 2 completion (optional but recommended)

**Sections:**
1. **Phase 1 Info** (read-only display)
   - User Name
   - Creator Type
   - Niche
   - Target Audience Niche

2. **Phase 2 Form** (11 fields, editable)
   - Unique Angle
   - Content Mission
   - Strengths (array)
   - Weaknesses (array)
   - Content Enjoys (array)
   - Content Avoids (array)
   - Audience Demographics
   - Tools/Skills (array)
   - Past Attempts (array of dicts)
   - What Worked Before (array)
   - Why Create

3. **Completion Status**
   - Progress bar showing % complete
   - "Save Changes" button → Calls `PATCH /profile/phase2`

---

### **7.3 Campaign Creation Flow**

#### **Current: [frontend/src/pages/PlanCampaign.jsx](frontend/src/pages/PlanCampaign.jsx)**

**Issues:**
- ❌ Uses mock data
- ❌ No API integration
- ❌ No 4-step onboarding wizard
- ❌ No manual start button

---

#### **Target: NEW Campaign Creation**

**File:** [frontend/src/pages/CreateCampaign.jsx](frontend/src/pages/CreateCampaign.jsx) (NEW FILE)

**Flow:**

**Step 1: Campaign Name & Description**
- Campaign Name (text input)
- Campaign Description (textarea)
- → Next

**Step 2: Goals & Metrics**
- Goal Aim (text input) - "What do you want to achieve?"
- Goal Type (dropdown) - growth, engagement, monetization, launch
- Platforms (multi-select checkboxes) - YouTube, Twitter, Instagram, TikTok
- Metrics (dynamic array):
  - Type (dropdown) - subscribers, views, followers, engagement
  - Target (number input)
  - Add/Remove metric buttons
- Duration (slider) - 3-30 days
- Intensity (radio buttons) - light, moderate, intense
- → Next

**Step 3: Platforms & Competitors**
- For each selected platform:
  - Platform: YouTube
    - Add Competitor URLs (dynamic array):
      - URL (text input)
      - Description (text input) - "What you like/dislike"
      - Add/Remove URL buttons
- → Next

**Step 4: Review & Start**
- **Display Summary:**
  - Campaign Name
  - Goals & Metrics
  - Competitors
- **Agent Configuration:**
  - Toggle switches for each agent:
    - ✓ Strategy Agent
    - ✓ Forensics Agent
    - ✓ Planner Agent
    - ✓ Content Agent
    - ✓ Outcome Agent
  - Toggle: ✓ Image Generation
  - Toggle: ✓ SEO Optimization
- **Lessons Learned Section** (if previous campaigns exist):
  - Shows insights from previous campaigns
  - User can approve or modify
  - Checkbox: "Apply these lessons to this campaign"
- **Buttons:**
  - "Save as Draft" → `POST /campaigns` → redirects to Dashboard
  - "Start Campaign" → `POST /campaigns/{id}/complete-onboarding` + `POST /campaigns/{id}/start` → redirects to Campaign Detail

**API Calls:**
1. On component mount: `POST /campaigns` → creates empty campaign with status `onboarding_incomplete`
2. Steps 1-3: Auto-save via `PATCH /campaigns/{id}/onboarding`
3. On "Review" load: `GET /campaigns/{id}/lessons-learned`
4. On lessons approval: `PATCH /campaigns/{id}/approve-lessons`
5. On "Start Campaign": `POST /campaigns/{id}/complete-onboarding` → `POST /campaigns/{id}/start`

---

### **7.4 Campaign Detail Page**

#### **Current: [frontend/src/pages/CampaignDetail.jsx](frontend/src/pages/CampaignDetail.jsx)**

**Issues:**
- ❌ Uses hardcoded mock data
- ❌ No API integration

---

#### **Target: NEW Campaign Detail Page**

**File:** [frontend/src/pages/CampaignDetail.jsx](frontend/src/pages/CampaignDetail.jsx) (MAJOR REFACTOR)

**Sections:**

1. **Campaign Header**
   - Campaign Name
   - Status Badge (`ready_to_start`, `in_progress`, `completed`)
   - Timestamps (Created, Started, Completed)
   - If `ready_to_start`: "Start Campaign" button

2. **Tabs:**
   - **Overview:** Goals, metrics, platforms, competitors
   - **Plan:** Day-by-day content plan (if generated)
   - **Content:** Generated content per day (title, hook, description, thumbnail)
   - **Execution:** Daily posting confirmations
   - **Report:** Campaign outcome analysis (if completed)
   - **Lessons:** Insights saved from this campaign

3. **Actions:**
   - Edit Campaign (if not started)
   - Delete Campaign (if not started)
   - Mark Day as Posted
   - Complete Campaign

**API Calls:**
- On mount: `GET /campaigns/{id}`
- On "Start Campaign": `POST /campaigns/{id}/start`
- On "Mark Posted": `PATCH /campaigns/{id}/execute/{day}`
- On "Complete": `POST /campaigns/{id}/complete`
- On "Delete": `DELETE /campaigns/{id}`

---

### **7.5 Dashboard Updates**

#### **Current: [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)**

**Issues:**
- ❌ Checks localStorage for onboarding status
- ❌ No API call to get campaigns
- ❌ No profile completion prompt

---

#### **Target: UPDATED Dashboard**

**Changes:**

1. **OnboardingGate:**
   - Call `GET /onboarding` on mount
   - If 404, show onboarding prompt
   - If 200, show dashboard

2. **Phase 2 Prompt:**
   - Call `GET /profile/completion`
   - If `phase2_completed === false`, show banner: "Complete your profile for better results"

3. **Campaign List:**
   - Call `GET /campaigns` on mount
   - Show list of campaigns with status badges
   - "Create New Campaign" button → redirects to [frontend/src/pages/CreateCampaign.jsx](frontend/src/pages/CreateCampaign.jsx)

4. **Active Campaign Card:**
   - Show currently `in_progress` campaign
   - Quick actions: View Plan, Add Content, Mark Posted

**API Calls:**
- `GET /onboarding` - Check onboarding status
- `GET /profile/completion` - Check Phase 2 status
- `GET /campaigns` - Load campaign list

---

## 8. Summary of Changes by File

### **Backend Files**

| File | Status | Changes |
|------|--------|---------|
| [backend/models/user.py](backend/models/user.py) | **MODIFY** | Phase 1: 15→5 fields, Phase 2: 15→11 fields, add `creator_type`, `user_name`, `phase2_completed` |
| [backend/models/campaign.py](backend/models/campaign.py) | **MAJOR REFACTOR** | Add `CampaignOnboarding`, `AgentConfig`, `CompetitorPlatform`, update `CampaignGoal`, add timestamps |
| [backend/api/onboarding.py](backend/api/onboarding.py) | **MODIFY** | Simplify `POST /onboarding` to 5 fields, remove `PATCH /phase2` |
| [backend/api/profile.py](backend/api/profile.py) | **NEW FILE** | Add Phase 2 management endpoints |
| [backend/api/campaigns.py](backend/api/campaigns.py) | **MAJOR REFACTOR** | Separate creation/execution, add onboarding endpoints, add edit/delete |
| [backend/api/image_gen.py](backend/api/image_gen.py) | **NEW FILE** | Image generation API |
| [backend/api/seo.py](backend/api/seo.py) | **NEW FILE** | SEO optimization API |
| [backend/storage/memory_store.py](backend/storage/memory_store.py) | **MODIFY** | Add campaign history tracking, lessons learned storage |
| [backend/services/agent_orchestrator.py](backend/services/agent_orchestrator.py) | **MAJOR REFACTOR** | Add agent toggles, learning integration, image/SEO integration |
| [backend/services/image_service.py](backend/services/image_service.py) | **NEW FILE** | Nano Banana 2.5 Flash integration |
| [backend/services/seo_service.py](backend/services/seo_service.py) | **NEW FILE** | SEO optimization service |
| [backend/config.py](backend/config.py) | **MODIFY** | Add `NANO_BANANA_API_KEY` |

### **Frontend Files**

| File | Status | Changes |
|------|--------|---------|
| [frontend/src/pages/Onboarding.jsx](frontend/src/pages/Onboarding.jsx) | **MAJOR REFACTOR** | Simplify to 5 fields, add API integration |
| [frontend/src/pages/Profile.jsx](frontend/src/pages/Profile.jsx) | **NEW FILE** | Phase 2 completion page |
| [frontend/src/pages/CreateCampaign.jsx](frontend/src/pages/CreateCampaign.jsx) | **NEW FILE** | 4-step campaign onboarding wizard |
| [frontend/src/pages/CampaignDetail.jsx](frontend/src/pages/CampaignDetail.jsx) | **MAJOR REFACTOR** | Add API integration, start button, edit/delete |
| [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx) | **MODIFY** | Add API calls for onboarding/profile/campaigns |
| [frontend/src/pages/PlanCampaign.jsx](frontend/src/pages/PlanCampaign.jsx) | **DEPRECATE** | Replace with CreateCampaign.jsx |

---

## 9. Workflow Comparison

### **Current Workflow**

```
User Signup/Login
    ↓
Complex Onboarding (30+ fields, Phase 1 + Phase 2 together)
    ↓
Context Analyzer runs (fetches historical content)
    ↓
Dashboard
    ↓
User enters goal in input box
    ↓
POST /campaigns (auto-executes immediately)
    ├─ Strategy Agent (1 call)
    ├─ Forensics Agent - YouTube (1 call)
    ├─ Forensics Agent - Twitter (1 call)
    ├─ Planner Agent (1 call)
    ├─ Auto-approve plan
    └─ Content Agent (N calls, one per day)
    ↓
Campaign status: IN_PROGRESS
    ↓
User confirms daily posting
    ↓
Campaign completes → Report generated
```

**Problems:**
- ❌ Overwhelming onboarding
- ❌ No control over agent execution
- ❌ Instant execution (no review)
- ❌ No campaign-specific setup
- ❌ No learning from past campaigns

---

### **Target Workflow**

```
User Signup/Login
    ↓
Global Onboarding (Phase 1: 5 fields)
    ├─ User Name
    ├─ Creator Type
    ├─ Niche
    ├─ Target Audience Niche
    └─ Submit
    ↓
Context Analyzer runs (fetches historical content automatically)
    ↓
Dashboard
    ├─ Prompt: "Complete your profile for better results" (Phase 2)
    └─ Campaign List (empty initially)
    ↓
User clicks "Create Campaign"
    ↓
Campaign Onboarding (4 Steps)
    ├─ Step 1: Name & Description
    ├─ Step 2: Goals & Metrics (multi-platform, multi-metric)
    ├─ Step 3: Platforms & Competitors (per platform)
    └─ Step 4: Review & Start
        ├─ Agent Configuration (toggles)
        ├─ Image Generation toggle
        ├─ SEO Optimization toggle
        └─ Lessons Learned (if previous campaigns exist)
            ├─ System analyzes past campaigns
            ├─ Shows insights (what worked, what didn't)
            └─ User approves/modifies lessons
    ↓
POST /campaigns → Status: ONBOARDING_INCOMPLETE
PATCH /campaigns/{id}/onboarding (Steps 1-3)
POST /campaigns/{id}/complete-onboarding → Status: READY_TO_START
    ↓
User clicks "Start Campaign"
    ↓
POST /campaigns/{id}/start → Status: IN_PROGRESS
    ├─ Load global memory snapshot
    ├─ Load learning from previous campaigns
    └─ Execute enabled agents:
        ├─ Strategy Agent (if enabled) + learning insights
        ├─ Forensics Agent (if enabled) → per platform
        ├─ Planner Agent (if enabled)
        └─ Content Agent (if enabled) → per day
            ├─ Generate content
            ├─ Generate image (if enabled)
            └─ Optimize SEO (if enabled)
    ↓
Campaign Detail Page
    ├─ View Plan
    ├─ View Content (with thumbnails)
    ├─ Mark days as posted
    └─ Track progress
    ↓
User clicks "Complete Campaign"
    ↓
POST /campaigns/{id}/complete → Status: COMPLETED
    ├─ Outcome Agent generates report
    ├─ Extract lessons learned for next campaign
    └─ Store insights in memory
    ↓
Next campaign uses these lessons automatically
```

**Improvements:**
- ✅ Minimal friction at signup (5 fields)
- ✅ Phase 2 optional in Profile section
- ✅ Campaign-specific onboarding (unique per campaign)
- ✅ Learning from previous campaigns
- ✅ Manual start control
- ✅ Agent customization (toggles)
- ✅ Image generation integration
- ✅ SEO optimization integration
- ✅ Proper timestamps tracking
- ✅ Edit/delete campaigns before start

---

**End of Architecture Comparison Document**
