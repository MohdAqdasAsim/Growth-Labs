"""SEO optimization service using Gemini."""
from typing import Optional
from .gemini_service import GeminiService


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
