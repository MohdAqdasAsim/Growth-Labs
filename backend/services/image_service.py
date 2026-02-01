"""
Image generation service for Flux.
Optimized for Nano Banana (Imagen 3.0).
"""
import base64
from typing import Optional
from google import genai
from google.genai import types
from ..config import NANO_BANANA_API_KEY

class ImageService:
    def __init__(self):
        if not NANO_BANANA_API_KEY:
            raise ValueError("NANO_BANANA_API_KEY not configured")
        
        # Initialize the 2026 Async Client
        # We access the .aio property to enable awaitable methods
        self.client = genai.Client(api_key=NANO_BANANA_API_KEY).aio
        self.model_id = "imagen-3.0-generate-001" 

    async def generate_image(self, prompt: str, style: str = "realistic", size: str = "1:1") -> Optional[str]:
        try:
            ratio_map = {
                "1280x720": "16:9",
                "1920x1080": "16:9",
                "1080x1920": "9:16",
                "1080x1080": "1:1"
            }
            target_ratio = ratio_map.get(size, "1:1")

            # Correct Method: self.client.models.generate_images (via .aio)
            response = await self.client.models.generate_images(
                model=self.model_id,
                prompt=f"{prompt}, style: {style}",
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio=target_ratio,
                    # Optional: block_medium_and_above is default
                    safety_filter_level="BLOCK_ONLY_HIGH" 
                )
            )

            if response.generated_images:
                # In the 2026 SDK, the bytes are stored here:
                raw_bytes = response.generated_images[0].image.image_bytes
                b64_data = base64.b64encode(raw_bytes).decode('utf-8')
                return f"data:image/png;base64,{b64_data}"
            
            return None
                
        except Exception as e:
            print(f"Flux Imagen Service Error: {e}")
            raise

    async def generate_thumbnail(self, title: str, hook: str, platform: str = "YouTube") -> str:
        # Same logic as before, now utilizing the fixed generate_image
        sizes = {"YouTube": "1280x720", "TikTok": "1080x1920", "Instagram": "1080x1080"}
        size = sizes.get(platform, "1280x720")
        
        prompt = f"Professional {platform} thumbnail. Title: '{title}'. Concept: {hook}."
        return await self.generate_image(prompt, style="vibrant", size=size)