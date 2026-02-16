"""Common enums and constants for the application."""
import re
from enum import Enum


class PlatformEnum(str, Enum):
    """Supported social media platforms with standardized PascalCase naming."""
    YOUTUBE = "YouTube"
    TWITTER = "Twitter"
    INSTAGRAM = "Instagram"
    LINKEDIN = "LinkedIn"
    TIKTOK = "TikTok"
    FACEBOOK = "Facebook"
    REDDIT = "Reddit"


# URL validation patterns for each platform
PLATFORM_URL_PATTERNS: dict[PlatformEnum, re.Pattern] = {
    PlatformEnum.YOUTUBE: re.compile(
        r'^https?://(www\.)?(youtube\.com/(channel/|@|c\/|user/)|youtu\.be/)',
        re.IGNORECASE
    ),
    PlatformEnum.TWITTER: re.compile(
        r'^https?://(www\.)?(twitter\.com/|x\.com/)',
        re.IGNORECASE
    ),
    PlatformEnum.INSTAGRAM: re.compile(
        r'^https?://(www\.)?instagram\.com/',
        re.IGNORECASE
    ),
    PlatformEnum.LINKEDIN: re.compile(
        r'^https?://(www\.)?linkedin\.com/(in/|company/)',
        re.IGNORECASE
    ),
    PlatformEnum.TIKTOK: re.compile(
        r'^https?://(www\.)?tiktok\.com/@',
        re.IGNORECASE
    ),
    PlatformEnum.FACEBOOK: re.compile(
        r'^https?://(www\.)?facebook\.com/',
        re.IGNORECASE
    ),
    PlatformEnum.REDDIT: re.compile(
        r'^https?://(www\.)?reddit\.com/(user/|u/|r/)',
        re.IGNORECASE
    ),
}
