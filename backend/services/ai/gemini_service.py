"""Gemini 3 Flash API wrapper service."""
import json
import os
from pathlib import Path
from typing import Any, Dict, Optional, List
from datetime import datetime
import google.generativeai as genai

from ...config import GEMINI_API_KEY, GEMINI_MODEL
from ...models.agents.agent_outputs import (
    ContextAnalyzerOutput,
    StrategyAgentOutput,
    ForensicsAgentOutput,
    PlannerAgentOutput,
    ContentAgentOutput,
    OutcomeAgentOutput,
)


def _serialize_for_prompt(obj: Any) -> str:
    """Serialize object to JSON string, handling datetime objects."""
    def datetime_handler(x):
        if isinstance(x, datetime):
            return x.isoformat()
        raise TypeError(f"Object of type {type(x)} is not JSON serializable")
    
    return json.dumps(obj, indent=2, default=datetime_handler)


class GeminiService:
    """Service for interacting with Gemini 3 Flash API."""
    
    def __init__(self):
        """Initialize Gemini client."""
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(GEMINI_MODEL)
        
        # Cache for loaded prompts
        self._prompt_cache: Dict[str, str] = {}
    
    def load_prompt(self, filename: str) -> str:
        """Load prompt from txt file in prompts/ directory.
        
        Args:
            filename: Name of the prompt file (e.g., 'agent1_context.txt')
        
        Returns:
            Prompt string from file
            
        Raises:
            FileNotFoundError: If prompt file doesn't exist
        """
        # Check cache first
        if filename in self._prompt_cache:
            return self._prompt_cache[filename]
        
        # Build path to prompts directory (now at backend/prompts/agents/)
        current_dir = Path(__file__).parent.parent.parent
        prompts_dir = current_dir / "prompts" / "agents"
        
        # Handle platform-specific prompts
        if "forensics" in filename and ("youtube" in filename or "twitter" in filename):
            prompts_dir = prompts_dir / "platform_specific"
        
        prompt_file = prompts_dir / filename
        
        if not prompt_file.exists():
            raise FileNotFoundError(f"Prompt file not found: {prompt_file}")
        
        # Load and cache
        with open(prompt_file, 'r', encoding='utf-8') as f:
            prompt = f.read()
        
        self._prompt_cache[filename] = prompt
        return prompt
    
    def generate_json(
        self,
        prompt: str,
        output_schema: type[Any],
        system_instruction: Optional[str] = None
    ) -> Any:
        """
        Generate structured JSON output from Gemini.
        
        Args:
            prompt: The input prompt
            output_schema: Pydantic model class for output structure
            system_instruction: Optional system instruction
        
        Returns:
            Parsed Pydantic model instance
        
        Note: One call per execution, no retries per design principles.
        """
        try:
            # Create generation config for JSON output
            generation_config = genai.types.GenerationConfig(
                temperature=0.7,
            )
            
            # Build the full prompt
            full_prompt = prompt
            if system_instruction:
                full_prompt = f"{system_instruction}\n\n{prompt}"
            
            # Add simplified schema instruction (avoid confusing model with full JSON Schema)
            field_names = ', '.join(output_schema.model_fields.keys())
            schema_instruction = f"\n\nIMPORTANT: Return ONLY a valid JSON object with these exact fields: {field_names}. No markdown formatting, no explanations, just pure JSON."
            full_prompt += schema_instruction
            
            # Generate response
            response = self.model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            
            # Validate response exists
            if not response or not hasattr(response, 'text') or not response.text:
                raise ValueError("Empty or invalid response from Gemini")
            
            # Parse JSON response with robust extraction
            json_text = response.text.strip()
            
            if not json_text:
                raise ValueError("Empty text in Gemini response")
            
            # Remove markdown code blocks (multiple formats)
            if json_text.startswith("```json"):
                json_text = json_text[7:].strip()
            elif json_text.startswith("```"):
                json_text = json_text[3:].strip()
            
            if json_text.endswith("```"):
                json_text = json_text[:-3].strip()
            
            # DEBUG: Log before extraction
            print(f"📄 After markdown removal (first 200): {json_text[:200]}")
            
            # Extract JSON object with proper brace matching
            if '{' in json_text:
                start = json_text.index('{')
                brace_count = 0
                end = start
                
                for i in range(start, len(json_text)):
                    if json_text[i] == '{':
                        brace_count += 1
                    elif json_text[i] == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end = i + 1
                            break
                
                if end > start:
                    print(f"🔍 Extracting JSON from position {start} to {end}")
                    json_text = json_text[start:end]
                else:
                    print(f"⚠️ Warning: Could not find matching closing brace")
            
            # Parse JSON
            try:
                print(f"🔍 About to parse JSON. First 300 chars: {json_text[:300]}")
                print(f"🔍 Last 100 chars: {json_text[-100:]}")
                json_data = json.loads(json_text)
            except json.JSONDecodeError as e:
                print(f"❌ JSON parse error: {e}")
                print(f"❌ Error position: line {e.lineno} col {e.colno}")
                print(f"❌ Full extracted text ({len(json_text)} chars):\n{json_text}")
                print(f"❌ Original response text (first 500 chars):\n{response.text[:500]}")
                
                # Try to clean common JSON issues as fallback
                try:
                    # Remove trailing commas before closing braces/brackets
                    cleaned = json_text.replace(',}', '}').replace(',]', ']')
                    # Remove control characters
                    cleaned = ''.join(char for char in cleaned if ord(char) >= 32 or char in '\n\r\t')
                    print(f"🔄 Attempting to parse cleaned JSON...")
                    json_data = json.loads(cleaned)
                    print(f"✅ Successfully parsed after cleaning")
                except json.JSONDecodeError as e2:
                    print(f"❌ Cleaning also failed: {e2}")
                    raise ValueError(f"Failed to parse Gemini JSON (line {e.lineno}, col {e.colno}): {str(e)}")
            
            # Parse into Pydantic model
            return output_schema.model_validate(json_data)
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Gemini returned invalid JSON: {str(e)}")
        except Exception as e:
            raise ValueError(f"Gemini API call failed: {str(e)}")
    
    def analyze_context(self, creator_data: Dict[str, Any]) -> ContextAnalyzerOutput:
        """Agent 1: Deep creator context analysis."""
        
        # Build Phase 2 data string
        phase2_parts = []
        if creator_data.get('unique_angle'):
            phase2_parts.append(f"\nUNIQUE ANGLE: {creator_data['unique_angle']}")
        if creator_data.get('content_mission'):
            phase2_parts.append(f"\nCONTENT MISSION: {creator_data['content_mission']}")
        
        if creator_data.get('self_strengths'):
            phase2_parts.append(f"\n\nSELF-IDENTIFIED STRENGTHS: {creator_data['self_strengths']}")
        if creator_data.get('self_weaknesses'):
            phase2_parts.append(f"\nSELF-IDENTIFIED WEAKNESSES: {creator_data['self_weaknesses']}")
        
        if creator_data.get('content_enjoys'):
            phase2_parts.append(f"\n\nCONTENT TYPES THEY ENJOY: {creator_data['content_enjoys']}")
        if creator_data.get('content_avoids'):
            phase2_parts.append(f"\nCONTENT TYPES THEY AVOID: {creator_data['content_avoids']}")
        
        if creator_data.get('current_metrics'):
            phase2_parts.append(f"\n\nCURRENT METRICS: {json.dumps(creator_data['current_metrics'], indent=2)}")
        if creator_data.get('audience_demographics'):
            phase2_parts.append(f"\nAUDIENCE DEMOGRAPHICS: {creator_data['audience_demographics']}")
        
        if creator_data.get('tools_skills'):
            phase2_parts.append(f"\n\nTOOLS/SKILLS: {creator_data['tools_skills']}")
        if creator_data.get('budget'):
            phase2_parts.append(f"\nBUDGET: {creator_data['budget']}")
        if creator_data.get('team_size'):
            phase2_parts.append(f"\nTEAM: {creator_data['team_size']}")
        
        if creator_data.get('past_attempts'):
            phase2_parts.append(f"\n\nPAST GROWTH ATTEMPTS: {json.dumps(creator_data['past_attempts'], indent=2)}")
        if creator_data.get('what_worked_before'):
            phase2_parts.append(f"\nWHAT WORKED BEFORE: {creator_data['what_worked_before']}")
        
        if creator_data.get('why_create'):
            phase2_parts.append(f"\n\nWHY THEY CREATE: {creator_data['why_create']}")
        if creator_data.get('timeline_expectations'):
            phase2_parts.append(f"\nTIMELINE EXPECTATIONS: {creator_data['timeline_expectations']}")
        
        phase2_data = ''.join(phase2_parts) if phase2_parts else "No Phase 2 data provided"
        
        # Load prompt template and format
        prompt_template = self.load_prompt('agent1_context.txt')
        
        # Format user's auto-classified content
        user_best_videos = "No videos yet"
        if creator_data.get('user_best_videos'):
            user_best_videos = json.dumps(creator_data['user_best_videos'], indent=2)
        
        user_worst_videos = "No videos yet"
        if creator_data.get('user_worst_videos'):
            user_worst_videos = json.dumps(creator_data['user_worst_videos'], indent=2)
        
        user_best_tweets = "No tweets yet"
        if creator_data.get('user_best_tweets'):
            user_best_tweets = json.dumps(creator_data['user_best_tweets'], indent=2)
        
        user_worst_tweets = "No tweets yet"
        if creator_data.get('user_worst_tweets'):
            user_worst_tweets = json.dumps(creator_data['user_worst_tweets'], indent=2)
        
        prompt = prompt_template.format(
            category=creator_data.get('category', 'Not specified'),
            target_audience=creator_data.get('target_audience', 'Not specified'),
            platforms=', '.join(creator_data.get('platforms', [])),
            time_per_week=creator_data.get('time_per_week', 'Not specified'),
            youtube_url=creator_data.get('youtube_url', 'Not provided'),
            instagram_url=creator_data.get('instagram_url', 'Not provided'),
            reddit_url=creator_data.get('reddit_url', 'Not provided'),
            competitor_urls=json.dumps(creator_data.get('competitor_urls', []), indent=2),
            user_best_videos=user_best_videos,
            user_worst_videos=user_worst_videos,
            user_best_tweets=user_best_tweets,
            user_worst_tweets=user_worst_tweets,
            phase2_data=phase2_data
        )
        
        return self.generate_json(
            prompt,
            ContextAnalyzerOutput,
            system_instruction="You are an expert creator strategist building persistent creator memory for personalized campaigns."
        )
    
    def generate_strategy(self, goal: str, creator_context: Dict[str, Any], duration_days: int = 3, goal_type: str = "growth", past_learnings: Optional[List] = None) -> StrategyAgentOutput:
        """Agent 2: Generate campaign strategy with reality check."""
        prompt_template = self.load_prompt('agent2_strategy.txt')
        
        # Extract from creator_identity if nested
        identity = creator_context.get('creator_identity', {})
        content_dna = creator_context.get('content_dna', {})
        growth_context = creator_context.get('growth_context', {})  # NEW
        
        # Format lists as bullet points for better Gemini comprehension
        def format_list(items):
            if not items:
                return "None specified"
            if isinstance(items, list):
                return "\n- " + "\n- ".join(str(item) for item in items)
            return str(items)
        
        # Format past learnings
        learnings_text = "No previous campaign data available."
        if past_learnings:
            learnings_text = "\n\n".join([
                f"Campaign {i+1}:\n"
                f"- Goal Type: {l.goal_type}\n"
                f"- Platform: {l.platform}\n"
                f"- Result: {l.goal_vs_result}\n"
                f"- What Worked: {', '.join(l.what_worked)}\n"
                f"- What Failed: {', '.join(l.what_failed)}\n"
                f"- Suggestions: {', '.join(l.next_campaign_suggestions)}"
                for i, l in enumerate(past_learnings)
            ])
        
        prompt = prompt_template.format(
            goal=goal,
            goal_type=goal_type,
            duration_days=duration_days,  # NEW
            niche=identity.get('niche', creator_context.get('niche', 'Unknown')),
            content_style=format_list(content_dna.get('preferred_formats', creator_context.get('content_style', []))),
            audience_type=identity.get('audience', creator_context.get('audience_type', 'Unknown')),
            strengths=format_list(content_dna.get('strengths', creator_context.get('strengths', []))),
            weaknesses=format_list(content_dna.get('weaknesses', creator_context.get('weaknesses', []))),
            current_metrics=growth_context.get('current_metrics', 'Not available'),  # NEW
            past_learnings=learnings_text
        )
        return self.generate_json(
            prompt,
            StrategyAgentOutput,
            system_instruction="You are a growth strategy expert. Create testable hypotheses based on real data. Be brutally honest about goal realism."  # UPDATED
        )
    
    def analyze_forensics(
        self,
        platform: str,
        high_traction: list[Dict[str, Any]],
        low_traction: list[Dict[str, Any]]
    ) -> ForensicsAgentOutput:
        """Agent 3: Compare high vs low traction content."""
        prompt_template = self.load_prompt('agent3_forensics_youtube.txt')
        prompt = prompt_template.format(
            platform=platform,
            high_traction=json.dumps(high_traction, indent=2),
            low_traction=json.dumps(low_traction, indent=2)
        )
        result = self.generate_json(
            prompt,
            ForensicsAgentOutput,
            system_instruction="You are a content performance analyst. Identify clear patterns from comparative data."
        )
        # Ensure platform field is set
        result.platform = platform
        return result
    
    def analyze_twitter(
        self,
        platform: str,
        high_traction: list[Dict[str, Any]],
        low_traction: list[Dict[str, Any]]
    ) -> ForensicsAgentOutput:
        """Agent 3: Analyze Twitter/X content performance.
        
        Args:
            platform: Platform name (should be 'twitter')
            high_traction: Top 25% tweets by engagement
            low_traction: Bottom 25% tweets by engagement
        
        Returns:
            ForensicsAgentOutput with platform='twitter'
        """
        prompt_template = self.load_prompt('agent3_forensics_twitter.txt')
        prompt = prompt_template.format(
            platform=platform,
            high_traction=json.dumps(high_traction, indent=2),
            low_traction=json.dumps(low_traction, indent=2)
        )
        result = self.generate_json(
            prompt,
            ForensicsAgentOutput,
            system_instruction="You are a Twitter/X content analyst. Identify engagement patterns and content strategies."
        )
        # Ensure platform field is set
        result.platform = "twitter"
        return result
    
    def create_plan(
        self,
        goal: Any,  # CampaignGoal
        strategy: Dict[str, Any],
        forensics_yt: Optional[Dict[str, Any]] = None,
        forensics_x: Optional[Dict[str, Any]] = None,
        content_intensity: str = "moderate",
        goal_type: str = "growth",
        past_learnings: Optional[List] = None
    ) -> PlannerAgentOutput:
        """Agent 4: Create N-day campaign plan."""
        prompt_template = self.load_prompt('agent4_planner.txt')
        
        # Format past learnings
        learnings_text = "No previous campaign data available."
        if past_learnings:
            learnings_text = "\n\n".join([
                f"Campaign {i+1}:\n"
                f"- What Worked: {', '.join(l.what_worked)}\n"
                f"- What Failed: {', '.join(l.what_failed)}\n"
                f"- Suggestions: {', '.join(l.next_campaign_suggestions)}"
                for i, l in enumerate(past_learnings)
            ])
        
        prompt = prompt_template.format(
            goal=json.dumps(goal.model_dump() if hasattr(goal, 'model_dump') else goal, indent=2),
            goal_type=goal_type,
            duration_days=goal.duration_days if hasattr(goal, 'duration_days') else 3,
            posting_frequency=goal.posting_frequency if hasattr(goal, 'posting_frequency') else "daily",
            target_platforms=goal.platform if hasattr(goal, 'platform') else "YouTube",
            content_intensity=content_intensity,
            strategy=json.dumps(strategy, indent=2),
            forensics_yt=json.dumps(forensics_yt or {}, indent=2),
            forensics_x=json.dumps(forensics_x or {}, indent=2),
            past_learnings=learnings_text
        )
        return self.generate_json(
            prompt,
            PlannerAgentOutput,
            system_instruction="You are a campaign planner. Create specific, daily action plans with proper platform cadence."
        )
    
    def generate_content(
        self,
        day_plan: Dict[str, Any],
        creator_context: Dict[str, Any],
        day_number: int,
        content_intensity: str = "moderate",
        goal_type: str = "growth"
    ) -> ContentAgentOutput:
        """Agent 5: Generate daily content."""
        prompt_template = self.load_prompt('agent5_content.txt')
        prompt = prompt_template.format(
            day_number=day_number,
            day_plan=_serialize_for_prompt(day_plan),
            creator_context=_serialize_for_prompt(creator_context),
            content_intensity=content_intensity,
            goal_type=goal_type
        )
        return self.generate_json(
            prompt,
            ContentAgentOutput,
            system_instruction="You are a content creator assistant. Generate authentic, platform-optimized content with clear reasoning."
        )
    
    def analyze_outcome(
        self,
        goal: Dict[str, Any],
        actual_metrics: Dict[str, Any],
        campaign_plan: Dict[str, Any],
        daily_execution: Optional[Dict[str, Any]] = None
    ) -> OutcomeAgentOutput:
        """Agent 6: Analyze campaign outcome."""
        prompt_template = self.load_prompt('agent6_outcome.txt')
        prompt = prompt_template.format(
            goal=json.dumps(goal, indent=2),
            actual_metrics=json.dumps(actual_metrics, indent=2),
            campaign_plan=json.dumps(campaign_plan, indent=2),
            daily_execution=json.dumps(daily_execution or {}, indent=2)
        )
        return self.generate_json(
            prompt,
            OutcomeAgentOutput,
            system_instruction="You are a campaign analyst. Provide honest, actionable insights including adherence rate."
        )

