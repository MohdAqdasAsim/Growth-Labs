"""
Standalone test for image generation - uses mock content data.
Tests what images will be generated for what content.

Run with: python test_image_generation.py
"""
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import asyncio
from backend.services.ai.image_service import ImageService


# Mock content data - simulating 3 days of campaign content
MOCK_CONTENT = [
    {
        "day": 1,
        "youtube_title": "Build a SaaS UI in 60 seconds with v0.dev + Cursor 🚀",
        "youtube_script": """[00:00-00:05] Hook: Split screen showing a blank VS Code window vs. a fully rendered SaaS Dashboard.
Audio: 'You're still building SaaS UIs from scratch? Stop. It's 2024.'

[00:05-00:20] The Tool: Screen recording of v0.dev. Typing prompt: 'Modern SaaS dashboard with sidebar, charts, dark mode'.
Cursor auto-completes the prompt, v0.dev generates a Next.js component in 10 seconds.

[00:20-00:35] The Result: Paste the code into Cursor. Hit save. The dashboard renders instantly.
Audio: 'No CSS. No boilerplate. Just production-ready UI.'

[00:35-00:50] The Workflow: Quick demo - v0.dev for UI, Cursor for logic, deploy to Vercel.
Audio: 'Ship features in hours, not weeks.'

[00:50-00:60] CTA: 'Follow for more AI-assisted dev workflows. Link in bio for the full setup guide.'
Visual: End screen with subscribe button.""",
        "youtube_seo_tags": ["v0.dev", "Cursor AI", "SaaS development", "Next.js", "AI coding assistant"]
    },
    {
        "day": 2,
        "youtube_title": "5 Cursor AI Rules That Actually Work 🔥",
        "youtube_script": """Thread: 5 Cursor.sh 'Rules for AI' that actually work.

Most devs use Cursor like a basic chat. But if you want it to write production-ready code, you need a system.

Here's how to 10x your output: 👇

1/ Always index your @Codebase.
Stop copy-pasting files. Use the '@' symbol to let Cursor scan your entire project structure.
Result: Context-aware suggestions that match your architecture.""",
        "youtube_seo_tags": ["Cursor AI", "Cursor rules", "AI coding", "productivity", "developer tools"]
    },
    {
        "day": 3,
        "youtube_title": "Which AI Coding Tool Wins in 2024? 🤔 [Poll]",
        "youtube_script": "Poll tweet: Which AI coding tool is winning in 2024? 💻🚀",
        "youtube_seo_tags": ["AI tools", "coding", "developer poll", "Cursor", "GitHub Copilot"]
    }
]


async def test_image_generation():
    """Test image generation for mock campaign content."""
    
    print("=" * 80)
    print("🎨 IMAGE GENERATION TEST")
    print("=" * 80)
    print()
    
    # Initialize image service
    image_service = ImageService()
    
    if not image_service.api_key:
        print("❌ POLLINATIONS_API_KEY not configured!")
        print("   Image generation will be skipped.")
        print()
        print("   To test image generation:")
        print("   1. Add POLLINATIONS_API_KEY to backend/.env file")
        print("   2. Restart this test")
        return
    
    print("✅ Image service initialized successfully")
    print(f"   Model: {image_service.model}")
    print(f"   Base URL: {image_service.base_url}")
    print()
    
    # Test image generation for each day's content
    generated_images = []
    
    for content in MOCK_CONTENT:
        day = content["day"]
        title = content["youtube_title"]
        script = content["youtube_script"]
        
        print(f"📅 DAY {day}")
        print(f"   Title: {title}")
        print(f"   Script length: {len(script)} characters")
        print()
        
        # Extract hook (first 200 chars of script)
        hook = script[:200] if len(script) > 200 else script
        
        print(f"   🎯 Image prompt will be based on:")
        print(f"      Title: {title}")
        print(f"      Hook: {hook[:100]}...")
        print()
        
        try:
            # Generate thumbnail
            print(f"   🎨 Generating thumbnail...")
            image_data = await image_service.generate_thumbnail(
                title=title,
                hook=hook,
                platform="YouTube"
            )
            
            if image_data:
                # Image data is a base64 data URI
                size_kb = len(image_data) / 1024
                print(f"   ✅ Thumbnail generated successfully!")
                print(f"      Size: {size_kb:.2f} KB")
                print(f"      Format: {image_data[:30]}...")
                print()
                
                generated_images.append({
                    "day": day,
                    "title": title,
                    "image_data": image_data,
                    "size_kb": size_kb
                })
            else:
                print(f"   ⚠️  No image returned (API might have failed)")
                print()
                
        except Exception as e:
            print(f"   ❌ Error generating thumbnail: {str(e)[:200]}")
            print()
        
        print("-" * 80)
        print()
    
    # Summary
    print("=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print()
    print(f"Total content pieces: {len(MOCK_CONTENT)}")
    print(f"Images generated: {len(generated_images)}")
    if len(MOCK_CONTENT) > 0:
        print(f"Success rate: {len(generated_images)}/{len(MOCK_CONTENT)} ({len(generated_images)/len(MOCK_CONTENT)*100:.0f}%)")
    print()
    
    if generated_images:
        print("✅ Generated images:")
        total_size = 0
        for img in generated_images:
            print(f"   Day {img['day']}: {img['title'][:50]}... ({img['size_kb']:.2f} KB)")
            total_size += img['size_kb']
        print()
        print(f"   Total size: {total_size:.2f} KB")
        print()
        print("💡 TIP: These images are base64 data URIs that can be:")
        print("   1. Saved to database as-is")
        print("   2. Displayed in HTML: <img src='data:image/...' />")
        print("   3. Converted to files if needed")
    else:
        print("⚠️  No images were generated.")
        print("   Check your POLLINATIONS_API_KEY and API quota/balance.")
    
    print()
    print("=" * 80)


async def test_single_image():
    """Quick test with a single image generation."""
    
    print("=" * 80)
    print("🧪 SINGLE IMAGE TEST (Quick Check)")
    print("=" * 80)
    print()
    
    image_service = ImageService()
    
    if not image_service.api_key:
        print("❌ POLLINATIONS_API_KEY not configured - skipping test")
        return
    
    # Simple test content
    test_title = "Python Async/Await Explained in 60 Seconds"
    test_hook = "Stop using callbacks. Stop using threading. Python's async/await is the modern way."
    
    print(f"Test title: {test_title}")
    print(f"Test hook: {test_hook}")
    print()
    print("Generating image...")
    
    try:
        image_data = await image_service.generate_thumbnail(
            title=test_title,
            hook=test_hook,
            platform="YouTube"
        )
        
        if image_data:
            print(f"✅ Success! Generated {len(image_data)/1024:.2f} KB image")
            print(f"   Data URI prefix: {image_data[:50]}...")
        else:
            print("⚠️  No image returned")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print()
    print("=" * 80)


if __name__ == "__main__":
    import sys
    
    print()
    print("🎯 Choose test mode:")
    print("   1. Full test (all 3 days)")
    print("   2. Quick test (single image)")
    print()
    
    if len(sys.argv) > 1 and sys.argv[1] == "quick":
        asyncio.run(test_single_image())
    else:
        asyncio.run(test_image_generation())