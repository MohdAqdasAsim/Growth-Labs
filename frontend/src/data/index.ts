export interface Workspace {
  id: string;
  name: string;
  icon?: string;
}

export type CampaignStatus = "active" | "draft" | "completed" | "paused";
export type CampaignType = "awareness" | "engagement" | "conversion" | "retention";
export type Metric = "impressions" | "clicks" | "conversions" | "engagement_rate" | "reach" | "followers";
export type PostingFrequency = "daily" | "twice_daily" | "weekly" | "twice_weekly" | "custom";

export interface Campaign {
  id: string;
  campaignId: string;
  userId: string;
  name: string;
  workspaceId: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  
  // Campaign configuration
  type: CampaignType;
  platforms: Platform[];
  metric: Metric;
  targetValue: number;
  duration: number; // in days
  postingFrequency: PostingFrequency;
  
  // Campaign strategy
  goal: string;
  targetPlatform: Platform[];
  contentThemes: string[];
  contentDensity: string;
  listing?: string;
  
  // AI outputs
  strategyOutput?: string;
  planOutput?: string; // default template plan
  dailyContentPlan?: string;
  executionReport?: string;
}

export const workspaces: Workspace[] = [
  {
    id: "ws-1",
    name: "Sarah's Workspace",
  },
  {
    id: "ws-2",
    name: "Marketing Team",
  },
  {
    id: "ws-3",
    name: "Development Hub",
  },
];

export const campaigns: Campaign[] = [
  {
    id: "camp-1",
    campaignId: "CAMP-2024-001",
    userId: "user-123",
    name: "Summer Launch 2024",
    workspaceId: "ws-1",
    status: "active",
    startDate: "2024-02-10",
    endDate: "2024-02-17",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-09T15:30:00Z",
    type: "awareness",
    platforms: ["instagram", "facebook", "twitter"],
    metric: "impressions",
    targetValue: 100000,
    duration: 7,
    postingFrequency: "daily",
    goal: "Increase brand awareness by 40%",
    targetPlatform: ["instagram", "facebook", "twitter"],
    contentThemes: ["Product Launch", "Behind the Scenes", "Customer Stories"],
    contentDensity: "High - 3 posts per day",
    strategyOutput: "Focus on visual storytelling across platforms",
    planOutput: "Default template plan for brand awareness",
    dailyContentPlan: "Day 1: Product teaser, Day 2: Launch announcement...",
  },
  {
    id: "camp-2",
    campaignId: "CAMP-2024-002",
    userId: "user-123",
    name: "Product Beta Test",
    workspaceId: "ws-1",
    status: "draft",
    startDate: "2024-02-15",
    endDate: "2024-02-20",
    createdAt: "2024-02-05T14:20:00Z",
    updatedAt: "2024-02-08T09:15:00Z",
    type: "conversion",
    platforms: ["twitter", "linkedin"],
    metric: "conversions",
    targetValue: 500,
    duration: 5,
    postingFrequency: "twice_daily",
    goal: "Get 500 beta signups",
    targetPlatform: ["twitter", "linkedin"],
    contentThemes: ["Beta Features", "Early Access", "Developer Focus"],
    contentDensity: "Medium - 2 posts per day",
    strategyOutput: "Target tech-savvy early adopters",
    planOutput: "Default template plan for conversions",
  },
  {
    id: "camp-3",
    campaignId: "CAMP-2024-003",
    userId: "user-456",
    name: "Email Campaign Q1",
    workspaceId: "ws-2",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-03-31",
    createdAt: "2024-01-25T11:00:00Z",
    updatedAt: "2024-02-09T16:45:00Z",
    type: "engagement",
    platforms: ["linkedin", "facebook"],
    metric: "engagement_rate",
    targetValue: 25,
    duration: 59,
    postingFrequency: "weekly",
    goal: "Achieve 25% open rate",
    targetPlatform: ["linkedin", "facebook"],
    contentThemes: ["Industry Insights", "Case Studies", "Thought Leadership"],
    contentDensity: "Low - 1 post per week",
    strategyOutput: "Focus on professional content and B2B engagement",
    planOutput: "Default template plan for engagement",
  },
];