"""Twitter/X service using twitterapi.io."""
import os
import requests
from typing import Optional, Dict, List, Any


class TwitterService:
    """Service for interacting with Twitter/X API via twitterapi.io."""
    
    def __init__(self):
        """Initialize Twitter service with API key from environment."""
        self.api_key = os.getenv("TWITTER_API_KEY")
        if not self.api_key:
            raise ValueError("TWITTER_API_KEY environment variable not set")
        
        self.base_url = "https://api.twitterapi.io"
        self.headers = {
            "X-API-Key": self.api_key,  # ✅ Capital X, capital API, capital Key
            "Content-Type": "application/json"
        }
    
    def fetch_tweets(self, handle: str, count: int = 20) -> Dict[str, Any]:
        """
        Fetch recent tweets from a Twitter/X handle.
        
        Args:
            handle: Twitter handle (with or without @)
            count: Number of tweets to fetch (default 20)
        
        Returns:
            Dictionary with tweets list containing parsed fields:
            - text, likeCount, retweetCount, replyCount, viewCount
            - bookmarkCount, conversationId, isReply
            - author_followers (from author.followers or author.followersCount)
            
        Raises:
            Exception: If API call fails
        """
        # Remove @ if present
        clean_handle = handle.lstrip('@')
        
        try:
            all_tweets = []
            cursor = None
            user_id: Optional[str] = None
            max_pages = 10  # safety cap
            page = 0
            
            # Paginate until we have enough tweets or no more pages
            while len(all_tweets) < count and page < max_pages:
                page += 1
                params = {
                    "count": count,
                    "includeReplies": True,
                }

                # Prefer userId once known, fall back to userName
                if user_id:
                    params["userId"] = user_id
                else:
                    params["userName"] = clean_handle  # ✅ camelCase, not username
                
                # Add cursor for subsequent pages
                if cursor:
                    params["cursor"] = cursor
                
                response = requests.get(
                    f"{self.base_url}/twitter/user/last_tweets",  # ✅ CORRECT
                    headers=self.headers,
                    params=params
                )
                response.raise_for_status()
                raw_data = response.json()
                
                # Parse and enrich tweet data from this page
                tweets = raw_data.get('data', {}).get('tweets', [])
                if not isinstance(tweets, list):
                    tweets = []
                
                # Debug pagination info
                page_has_next = raw_data.get('has_next_page')
                page_cursor = raw_data.get('next_cursor')
                if page_has_next is None:
                    meta_debug = raw_data.get('meta', raw_data.get('data', {}))
                    page_has_next = meta_debug.get('has_next_page')
                    page_cursor = meta_debug.get('next_cursor', page_cursor)
                print(f"🐦 Twitter page {page} fetched: {len(tweets)} tweets, has_next_page={page_has_next}, cursor={page_cursor}, using={'userId' if user_id else 'userName'}")
                
                for tweet in tweets:
                    if len(all_tweets) >= count:
                        break
                        
                    parsed_tweet = tweet.copy()
                    
                    # Add bookmarkCount (default to 0 if missing)
                    parsed_tweet['bookmarkCount'] = tweet.get('bookmarkCount', 0)
                    
                    # Add conversationId and isReply
                    parsed_tweet['conversationId'] = tweet.get('conversationId', tweet.get('conversation_id'))
                    parsed_tweet['isReply'] = tweet.get('isReply', tweet.get('is_reply', bool(tweet.get('inReplyToStatusId'))))
                    
                    # Add author followers (nested under author object)
                    author = tweet.get('author', {})
                    parsed_tweet['author_followers'] = author.get('followers', author.get('followersCount', author.get('followers_count', 0)))
                    
                    all_tweets.append(parsed_tweet)

                    # Capture userId for subsequent pages if available
                    if not user_id:
                        author = tweet.get('author', {})
                        if isinstance(author, dict) and author.get('id'):
                            user_id = str(author.get('id'))
                
                # Check if there are more pages (pagination data at root; fallback to meta/data)
                has_next_page = raw_data.get('has_next_page')
                cursor = raw_data.get('next_cursor')

                if has_next_page is None:
                    meta = raw_data.get('meta', raw_data.get('data', {}))
                    has_next_page = meta.get('has_next_page', False)
                    cursor = meta.get('next_cursor', cursor)
                
                # Break if no more pages or no tweets in this page
                if not has_next_page or not tweets:
                    break
            
            # Return structured response
            return {
                'data': all_tweets,
                'tweets': all_tweets,
                'meta': {'total_fetched': len(all_tweets)}
            }
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to fetch tweets for @{clean_handle}: {str(e)}")
    
    def get_user_stats(self, handle: str) -> Dict[str, Any]:
        """
        Fetch user profile statistics from Twitter/X.
        
        Args:
            handle: Twitter handle (with or without @)
        
        Returns:
            Dictionary with user stats (followers, following, tweet count, etc.)
            
        Raises:
            Exception: If API call fails
        """
        # Remove @ if present
        clean_handle = handle.lstrip('@')
        
        try:
            response = requests.get(
                f"{self.base_url}/user/info",
                headers=self.headers,
                params={"username": clean_handle},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to fetch user stats for @{clean_handle}: {str(e)}")
    
    def get_tweet_metrics(self, tweet_id: str) -> Dict[str, Any]:
        """
        Get detailed metrics for a specific tweet.
        
        Args:
            tweet_id: Twitter tweet ID
        
        Returns:
            Dictionary with tweet metrics (likes, retweets, replies, views)
            
        Raises:
            Exception: If API call fails
        """
        try:
            response = requests.get(
                f"{self.base_url}/tweet/{tweet_id}",
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to fetch tweet metrics for {tweet_id}: {str(e)}")
    
    @staticmethod
    def classify_tweets_by_engagement(tweets: List[Dict[str, Any]]) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Classify tweets into high and low engagement using deterministic scoring.
        
        Args:
            tweets: List of tweet dictionaries with engagement metrics
        
        Returns:
            Tuple of (high_traction, low_traction) tweet lists (top 25%, bottom 25%)
        """
        if not tweets:
            return [], []
        
        # Calculate engagement score for each tweet
        scored_tweets = []
        for tweet in tweets:
            # Extract metrics with safe defaults
            likes = tweet.get('likeCount', 0)
            retweets = tweet.get('retweetCount', 0)
            replies = tweet.get('replyCount', 0)
            bookmarks = tweet.get('bookmarkCount', 0)
            views = tweet.get('viewCount', 1)  # Avoid division by zero
            
            # Engagement formula: (likes + retweets×2 + replies×1.5 + bookmarks×3) / views
            # Bookmarks weighted highest (save-worthy content = high intent)
            engagement_score = (likes + retweets * 2 + replies * 1.5 + bookmarks * 3) / views
            
            scored_tweets.append({
                'tweet': tweet,
                'engagement_score': engagement_score
            })
        
        # Sort by engagement score (highest first)
        scored_tweets.sort(key=lambda x: x['engagement_score'], reverse=True)
        
        # Split into top 25% (high) and bottom 25% (low)
        total_count = len(scored_tweets)
        top_25_count = max(1, total_count // 4)
        
        high_traction = [item['tweet'] for item in scored_tweets[:top_25_count]]
        low_traction = [item['tweet'] for item in scored_tweets[-top_25_count:]]
        
        return high_traction, low_traction
