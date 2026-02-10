"""Clerk authentication service for JWT verification."""
import jwt
import httpx
from typing import Optional, Dict
from datetime import datetime, timedelta, timezone
from functools import lru_cache

from ...config import CLERK_SECRET_KEY, CLERK_JWKS_URL


class ClerkService:
    """Service for Clerk JWT verification and user management."""
    
    def __init__(self):
        """Initialize Clerk service."""
        self.secret_key = CLERK_SECRET_KEY
        self.jwks_url = CLERK_JWKS_URL
        self._jwks_cache: Optional[Dict] = None
        self._jwks_cache_time: Optional[datetime] = None
        self._cache_ttl = timedelta(hours=1)  # Refresh JWKS every hour
    
    async def get_jwks(self) -> Dict:
        """
        Fetch JWKS (JSON Web Key Set) from Clerk with caching.
        
        Returns:
            Dict containing public keys for JWT verification
        """
        # Return cached JWKS if still valid
        if (self._jwks_cache and self._jwks_cache_time and 
            datetime.now(timezone.utc) - self._jwks_cache_time < self._cache_ttl):
            return self._jwks_cache
        
        # Fetch fresh JWKS
        async with httpx.AsyncClient() as client:
            response = await client.get(self.jwks_url, timeout=10.0)
            response.raise_for_status()
            self._jwks_cache = response.json()
            self._jwks_cache_time = datetime.now(timezone.utc)
            return self._jwks_cache
    
    async def verify_token(self, token: str) -> Optional[Dict]:
        """
        Verify Clerk JWT token and return decoded payload.
        
        Args:
            token: Clerk session token from frontend
        
        Returns:
            Decoded token payload with user info, or None if invalid
        """
        try:
            # Get JWKS for verification
            jwks = await self.get_jwks()
            
            # Decode JWT header to get key ID
            unverified_header = jwt.get_unverified_header(token)
            key_id = unverified_header.get("kid")
            
            if not key_id:
                return None
            
            # Find matching public key in JWKS
            signing_key = None
            for key in jwks.get("keys", []):
                if key.get("kid") == key_id:
                    signing_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                    break
            
            if not signing_key:
                return None
            
            # Verify and decode token
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=["RS256"],
                options={"verify_exp": True, "verify_aud": False}  # Clerk tokens don't always have aud
            )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            # Token expired
            return None
        except jwt.InvalidTokenError:
            # Invalid token
            return None
        except Exception as e:
            # Other errors
            print(f"Token verification error: {e}")
            return None
    
    def extract_user_info(self, payload: Dict) -> Dict[str, str]:
        """
        Extract user info from Clerk JWT payload.
        
        Args:
            payload: Decoded JWT payload
        
        Returns:
            Dict with clerk_user_id and email
        """
        return {
            "clerk_user_id": payload.get("sub"),  # Clerk user ID
            "email": payload.get("email", ""),
            "email_verified": payload.get("email_verified", False)
        }


# Global singleton instance
clerk_service = ClerkService()
