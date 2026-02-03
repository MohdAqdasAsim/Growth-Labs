"""YouTube data fetching service using YouTube Data API v3."""
import re
from typing import Optional, List, Dict, Any
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from ...config import YOUTUBE_MAX_ITEMS, YOUTUBE_API_KEY


class YouTubeService:
    """Service for fetching YouTube channel/video data using official API."""
    
    def __init__(self):
        """Initialize YouTube API client."""
        if not YOUTUBE_API_KEY:
            raise ValueError("YOUTUBE_API_KEY environment variable is not set")
        self.youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    
    @staticmethod
    def extract_channel_identifier(url: str) -> Optional[Dict[str, str]]:
        """
        Extract channel identifier from URL.
        Returns dict with type ('id', 'username', 'handle') and value.
        """
        # Channel ID format: youtube.com/channel/UC...
        channel_id_match = re.search(r'youtube\.com/channel/([a-zA-Z0-9_-]+)', url)
        if channel_id_match:
            return {'type': 'id', 'value': channel_id_match.group(1)}
        
        # Handle format: youtube.com/@handle
        handle_match = re.search(r'youtube\.com/@([a-zA-Z0-9_-]+)', url)
        if handle_match:
            return {'type': 'handle', 'value': handle_match.group(1)}
        
        # Username format: youtube.com/c/username or youtube.com/user/username
        username_match = re.search(r'youtube\.com/(?:c|user)/([a-zA-Z0-9_-]+)', url)
        if username_match:
            return {'type': 'username', 'value': username_match.group(1)}
        
        return None
    
    def extract_channel_id_from_url(self, url: str) -> Optional[str]:
        """
        Extract and resolve channel ID from URL (convenience method for onboarding).
        
        Args:
            url: YouTube channel URL
        
        Returns:
            Channel ID (UC...) or None if not found
        """
        identifier = self.extract_channel_identifier(url)
        if not identifier:
            return None
        return self._get_channel_id_from_api(identifier)
    
    def _get_channel_id_from_api(self, channel_identifier: Dict[str, str]) -> Optional[str]:
        """
        Resolve channel identifier to channel ID using API.
        
        Args:
            channel_identifier: Dict with 'type' ('id', 'username', 'handle') and 'value'
        
        Returns:
            Channel ID (UC...) or None if not found
        """
        try:
            if channel_identifier['type'] == 'id':
                # Already a channel ID, verify it exists
                request = self.youtube.channels().list(
                    part='id',
                    id=channel_identifier['value']
                )
                response = request.execute()
                if response.get('items'):
                    return channel_identifier['value']
                return None
            
            elif channel_identifier['type'] == 'handle':
                # Use search with exact handle match (works in all API versions)
                handle = channel_identifier['value'].lstrip('@')
                # Try search with @handle for better accuracy
                request = self.youtube.search().list(
                    part='id,snippet',
                    type='channel',
                    q=f'@{handle}',
                    maxResults=5
                )
                response = request.execute()
                
                # Find exact match by custom URL or handle
                for item in response.get('items', []):
                    snippet = item.get('snippet', {})
                    # Check if customUrl matches (case-insensitive)
                    custom_url = snippet.get('customUrl', '').lower()
                    if custom_url == f'@{handle.lower()}' or custom_url == handle.lower():
                        return item['id']['channelId']
                
                # Fallback: return first result if no exact match
                if response.get('items'):
                    return response['items'][0]['id']['channelId']
                return None
            
            elif channel_identifier['type'] == 'username':
                # Use forUsername parameter (legacy)
                request = self.youtube.channels().list(
                    part='id',
                    forUsername=channel_identifier['value']
                )
                response = request.execute()
                if response.get('items'):
                    return response['items'][0]['id']
                return None
            
        except HttpError as e:
            print(f"Error resolving channel ID: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error resolving channel ID: {e}")
            return None
    
    def _fetch_video_ids_from_api(self, channel_id: str, max_results: int = YOUTUBE_MAX_ITEMS) -> List[str]:
        """
        Fetch video IDs from a channel using search API.
        
        Args:
            channel_id: YouTube channel ID (UC...)
            max_results: Maximum number of videos to fetch
        
        Returns:
            List of video IDs
        """
        try:
            request = self.youtube.search().list(
                part='id',
                channelId=channel_id,
                type='video',
                order='date',
                maxResults=min(max_results, 50)  # API limit is 50
            )
            response = request.execute()
            
            video_ids = []
            for item in response.get('items', []):
                if item['id'].get('videoId'):
                    video_ids.append(item['id']['videoId'])
            
            return video_ids
            
        except HttpError as e:
            print(f"Error fetching video IDs: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error fetching video IDs: {e}")
            return []
    
    def _get_video_details_from_api(self, video_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Get detailed information for videos.
        
        Args:
            video_ids: List of video IDs
        
        Returns:
            List of video dictionaries with full metadata
        """
        if not video_ids:
            return []
        
        try:
            # API allows up to 50 IDs per call
            video_ids_str = ','.join(video_ids[:50])
            
            request = self.youtube.videos().list(
                part='statistics,snippet,contentDetails',
                id=video_ids_str
            )
            response = request.execute()
            
            videos = []
            for item in response.get('items', []):
                video_id = item['id']
                snippet = item.get('snippet', {})
                statistics = item.get('statistics', {})
                content_details = item.get('contentDetails', {})
                
                # Parse duration (ISO 8601 format: PT1H2M10S)
                duration_str = content_details.get('duration', '')
                duration_seconds = self._parse_duration(duration_str)
                
                # Extract description and truncate to 800 chars
                full_description = snippet.get('description', '')
                description = full_description[:800] if full_description else ''
                
                videos.append({
                    'video_id': video_id,
                    'title': snippet.get('title', 'Unknown'),
                    'description': description,
                    'description_full': full_description,  # Keep full for potential future use
                    'published_at': snippet.get('publishedAt', ''),
                    'views': int(statistics.get('viewCount', 0)),
                    'likes': int(statistics.get('likeCount', 0)),
                    'comments': int(statistics.get('commentCount', 0)),
                    'duration': duration_seconds,
                    'thumbnail': snippet.get('thumbnails', {}).get('default', {}).get('url', ''),
                    'url': f"https://www.youtube.com/watch?v={video_id}",
                })
            
            return videos
            
        except HttpError as e:
            print(f"Error fetching video details: {e}")
            if e.resp.status == 403:
                print("Possible causes: API quota exceeded or API key invalid")
            return []
        except Exception as e:
            print(f"Unexpected error fetching video details: {e}")
            return []
    
    @staticmethod
    def _parse_duration(duration_str: str) -> Optional[int]:
        """
        Parse ISO 8601 duration to seconds.
        Example: PT1H2M10S -> 3730 seconds
        """
        if not duration_str or not duration_str.startswith('PT'):
            return None
        
        import re
        hours = re.search(r'(\d+)H', duration_str)
        minutes = re.search(r'(\d+)M', duration_str)
        seconds = re.search(r'(\d+)S', duration_str)
        
        total_seconds = 0
        if hours:
            total_seconds += int(hours.group(1)) * 3600
        if minutes:
            total_seconds += int(minutes.group(1)) * 60
        if seconds:
            total_seconds += int(seconds.group(1))
        
        return total_seconds if total_seconds > 0 else None
    
    def fetch_channel_videos(self, channel_url: str, max_items: int = YOUTUBE_MAX_ITEMS) -> List[Dict[str, Any]]:
        """
        Fetch last N videos from a YouTube channel using official API.
        
        Args:
            channel_url: YouTube channel URL (various formats supported)
            max_items: Maximum number of videos to fetch
        
        Returns:
            List of video dictionaries with full metadata
        """
        # Extract channel identifier from URL
        channel_identifier = self.extract_channel_identifier(channel_url)
        if not channel_identifier:
            print(f"Could not extract channel identifier from URL: {channel_url}")
            return []
        
        # Resolve to channel ID
        channel_id = self._get_channel_id_from_api(channel_identifier)
        if not channel_id:
            print(f"Could not resolve channel ID for: {channel_identifier}")
            return []
        
        # Fetch video IDs
        video_ids = self._fetch_video_ids_from_api(channel_id, max_items)
        if not video_ids:
            print(f"No videos found for channel: {channel_id}")
            return []
        
        # Fetch video details
        videos = self._get_video_details_from_api(video_ids)
        
        return videos[:max_items]
    
    @staticmethod
    def classify_videos_by_traction(videos: List[Dict[str, Any]]) -> tuple[List[Dict], List[Dict]]:
        """
        Programmatically classify videos into high/low traction.
        Top 25% = high, Bottom 25% = low (based on views).
        """
        if not videos or len(videos) < 2:
            return videos, []
        
        # Sort by views (descending)
        videos_with_views = [v for v in videos if v.get('views') is not None and v.get('views', 0) > 0]
        videos_without_views = [v for v in videos if v.get('views') is None or v.get('views', 0) == 0]
        
        sorted_videos = sorted(videos_with_views, key=lambda x: x.get('views', 0), reverse=True)
        
        total = len(sorted_videos)
        if total == 0:
            return videos_without_views, []
        
        high_count = max(1, total // 4)  # Top 25%
        low_count = max(1, total // 4)   # Bottom 25%
        
        high_traction = sorted_videos[:high_count]
        low_traction = sorted_videos[-low_count:] + videos_without_views
        
        return high_traction, low_traction
