/**
 * Onboarding type definitions matching backend API schema
 */

export type CreatorType = 
  | "content_creator" 
  | "student" 
  | "marketing" 
  | "business" 
  | "freelancer";

export type Platform = 
  | "YouTube" 
  | "Twitter" 
  | "Instagram" 
  | "LinkedIn" 
  | "TikTok" 
  | "Facebook"
  | "Reddit";

export interface PlatformUrls {
  YouTube?: string;
  Twitter?: string;
  Instagram?: string;
  LinkedIn?: string;
  TikTok?: string;
  Facebook?: string;
  Reddit?: string;
}

export interface OnboardingRequest {
  user_name: string;
  creator_type: CreatorType;
  niche: string;
  target_audience_niche: string;
  existing_platforms: Platform[];
  platform_urls: PlatformUrls;
}

export interface CreatorProfile extends OnboardingRequest {
  user_id: string;
  
  // Phase 2 Optional Fields
  unique_angle?: string;
  self_purpose?: string;
  self_strengths?: string[];
  existing_platforms: Platform[];
  target_platforms?: Platform[];
  self_topics?: string[];
  target_audience_demographics?: string;
  competitor_accounts?: Record<string, string[]>;
  existing_assets?: string[];
  self_motivation?: string;
  
  // System Fields
  recommended_frequency?: string;
  agent_context?: Record<string, unknown>;
  phase2_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  detail: string;
}
