"""
Image generation service using Pollinations.ai Flux model.
Uses REST API with HTTP requests for simple, efficient image generation.
"""

import base64
from typing import Optional
import httpx

from ...config import POLLINATIONS_API_KEY


class ImageService:
    def __init__(self):
        if not POLLINATIONS_API_KEY:
            print("⚠️  POLLINATIONS_API_KEY not configured - image generation will be skipped")
            self.api_key = None
            return

        self.api_key = POLLINATIONS_API_KEY
        self.base_url = "https://gen.pollinations.ai"
        self.model = "flux"  # Using Flux model as specified

    async def generate_image(
        self,
        prompt: str,
        style: str = "realistic",
        size: str = "1:1"
    ) -> Optional[str]:
        """
        Generate an image using Pollinations.ai Flux model.
        
        Args:
            prompt: Text description of the image to generate
            style: Visual style (realistic, vibrant, cartoon, etc.)
            size: Target resolution/aspect ratio (1280x720, 1080x1080, etc.)
        
        Returns:
            Base64-encoded data URI (data:image/png;base64,...) or None
        """
        if not self.api_key:
            return None

        try:
            # Parse size into width and height
            size_map = {
                "1280x720": (1280, 720),
                "1920x1080": (1920, 1080),
                "1080x1920": (1080, 1920),
                "1080x1080": (1080, 1080),
                "1:1": (1024, 1024),
                "16:9": (1280, 720),
                "9:16": (1080, 1920)
            }
            width, height = size_map.get(size, (1024, 1024))

            # Build full prompt with style
            full_prompt = f"{prompt}, {style} style"

            # URL encode the prompt and build the request URL
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(
                    f"{self.base_url}/image/{full_prompt}",
                    params={
                        "model": self.model,
                        "width": width,
                        "height": height,
                        "enhance": "true",  # Let AI improve the prompt
                        "seed": 42  # Consistent results for same prompt
                    },
                    headers={
                        "Authorization": f"Bearer {self.api_key}"
                    }
                )

                if response.status_code == 200:
                    # Convert binary image to base64 data URI
                    image_bytes = response.content
                    b64_data = base64.b64encode(image_bytes).decode("utf-8")
                    return f"data:image/png;base64,{b64_data}"
                elif response.status_code == 401:
                    print("⚠️  Pollinations API: Unauthorized - check your API key")
                    return None
                elif response.status_code == 402:
                    print("⚠️  Pollinations API: Insufficient pollen balance")
                    return None
                elif response.status_code == 403:
                    print("⚠️  Pollinations API: Access denied - check model permissions")
                    return None
                else:
                    print(f"⚠️  Pollinations API returned status {response.status_code}")
                    return None

        except Exception as e:
            print(f"❌ Pollinations Image Service Error: {e}")
            return None

    async def generate_thumbnail(
        self,
        title: str,
        hook: str,
        platform: str = "YouTube"
    ) -> Optional[str]:
        """
        Generate a thumbnail image for social media content.
        
        Args:
            title: Content title
            hook: Content hook/description
            platform: Target platform (YouTube, TikTok, Instagram)
        
        Returns:
            Base64-encoded data URI or None
        """
        sizes = {
            "YouTube": "1280x720",
            "TikTok": "1080x1920",
            "Instagram": "1080x1080"
        }
        size = sizes.get(platform, "1280x720")

        # Create prompt optimized for thumbnail generation
        prompt = (
            f"High-quality {platform} thumbnail background, "
            f"cinematic lighting, eye-catching, professional. "
            f"Theme: {hook}. No text on image."
        )

        return await self.generate_image(
            prompt,
            style="vibrant",
            size=size
        )