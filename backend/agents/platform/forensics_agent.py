"""Agent 3: Competitor Performance Forensics Agent - Critical agent with deterministic classification."""
from typing import Dict, Any, List

from ...services.ai.gemini_service import GeminiService
from ...services.platforms.youtube_service import YouTubeService
from ...services.platforms.twitter_service import TwitterService
from ...models.agents.agent_outputs import ForensicsAgentOutput


class ForensicsAgent:
    """
    Analyzes competitor content patterns.
    
    Single responsibility: Extract patterns from competitor data
    Stateless: No internal state
    Two-phase approach:
        1. Deterministic fetch (code-based, not Gemini)
        2. Programmatic classification (numeric, top 25% = high, bottom 25% = low)
        3. Gemini comparative reasoning (single call)
    
    Supports: YouTube, Twitter/X
    """
    
    def __init__(self):
        """Initialize with services."""
        self.gemini = GeminiService()
        
        # Initialize YouTube service
        try:
            self.youtube_service = YouTubeService()
        except ValueError as e:
            self.youtube_service = None
            print(f"Warning: YouTubeService not initialized: {e}")
        
        # Initialize Twitter service
        try:
            self.twitter_service = TwitterService()
        except ValueError as e:
            self.twitter_service = None
            print(f"Warning: TwitterService not initialized: {e}")
    
    def analyze_competitor(
        self,
        platform: str,
        competitor_url: str
    ) -> ForensicsAgentOutput:
        """
        Analyze competitor performance on a platform.
        
        Process:
        1. Fetch last N items (YT: 6-8, Twitter: 20)
        2. Programmatically classify into high/low (top 25% / bottom 25%) OR use Gemini for Twitter
        3. Single Gemini call for comparative reasoning or direct analysis
        
        Args:
            platform: "youtube" or "twitter"
            competitor_url: Competitor's profile/channel URL or Twitter handle
        
        Returns:
            ForensicsAgentOutput with patterns_that_worked, patterns_that_failed, transferable_rules
        """
        platform_lower = platform.lower()
        
        # Step A: Deterministic Fetch (Code, not Gemini)
        if platform_lower == "youtube":
            if not self.youtube_service:
                raise ValueError("YouTubeService not initialized. Set YOUTUBE_API_KEY environment variable.")
            items = self.youtube_service.fetch_channel_videos(competitor_url)
            high_traction, low_traction = YouTubeService.classify_videos_by_traction(items)
            # Step C: Gemini Comparative Reasoning (single call)
            return self.gemini.analyze_forensics(platform, high_traction, low_traction)
        
        elif platform_lower == "twitter":
            if not self.twitter_service:
                raise ValueError("TwitterService not initialized. Set TWITTER_API_KEY environment variable.")
            # Fetch tweets (competitor_url is Twitter handle)
            twitter_data = self.twitter_service.fetch_tweets(competitor_url)
            # Extract tweets list from response
            tweets = twitter_data.get('data', twitter_data.get('tweets', []))
            # Programmatic classification (like YouTube)
            high_traction, low_traction = TwitterService.classify_tweets_by_engagement(tweets)
            # Single Gemini call for Twitter analysis
            return self.gemini.analyze_twitter(platform, high_traction, low_traction)
        
        else:
            raise ValueError(f"Unsupported platform: {platform}")
    
    def analyze_multiple_competitors(
        self,
        platform: str,
        competitor_urls: List[str]
    ) -> ForensicsAgentOutput:
        """
        Analyze multiple competitors and aggregate insights.
        
        Note: Still one Gemini call, but aggregates data from all competitors first.
        """
        platform_lower = platform.lower()
        
        all_high = []
        all_low = []
        
        for url in competitor_urls:
            try:
                if platform_lower == "youtube":
                    if not self.youtube_service:
                        continue
                    items = self.youtube_service.fetch_channel_videos(url)
                    high, low = YouTubeService.classify_videos_by_traction(items)
                    all_high.extend(high)
                    all_low.extend(low)
                    
                elif platform_lower == "twitter":
                    if not self.twitter_service:
                        continue
                    twitter_data = self.twitter_service.fetch_tweets(url)
                    tweets = twitter_data.get('data', twitter_data.get('tweets', []))
                    high, low = TwitterService.classify_tweets_by_engagement(tweets)
                    all_high.extend(high)
                    all_low.extend(low)
                    
            except Exception as e:
                # Log but continue with other competitors
                print(f"Error analyzing competitor {url}: {e}")
                continue
        
        # Single Gemini call for aggregated analysis
        if platform_lower == "twitter":
            # Validate we have data before calling Gemini
            if not all_high and not all_low:
                print(f"⚠️ No {platform} content classified from competitors, returning empty forensics")
                return ForensicsAgentOutput(
                    platform=platform,
                    patterns_that_worked=[],
                    patterns_that_failed=[],
                    transferable_rules=[]
                )
        
        # Single Gemini call for aggregated analysis
        if platform_lower == "twitter":
            return self.gemini.analyze_twitter(platform, all_high, all_low)
        else:
            return self.gemini.analyze_forensics(platform, all_high, all_low)

