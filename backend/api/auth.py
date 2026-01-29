"""Authentication API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated
import uuid
from datetime import timedelta

from ..models.user import UserCreate, UserLogin, Token, User
from ..services.auth_service import AuthService
from ..storage.memory_store import memory_store
from ..config import JWT_EXPIRATION_HOURS

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()
auth_service = AuthService()


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> str:
    """Dependency to get current user ID from JWT token."""
    token = credentials.credentials
    
    # Check blacklist
    if memory_store.is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked"
        )
    
    user_id = auth_service.get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    return user_id


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user."""
    # Check if user already exists
    existing_user = memory_store.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = auth_service.get_password_hash(user_data.password)
    user = User(
        user_id=user_id,
        email=user_data.email,
        hashed_password=hashed_password
    )
    memory_store.create_user(user)
    
    # Generate token
    access_token = auth_service.create_access_token(
        data={"sub": user_id},
        expires_delta=timedelta(hours=JWT_EXPIRATION_HOURS)
    )
    
    return Token(access_token=access_token)


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login and get JWT token."""
    user = memory_store.get_user_by_email(credentials.email)
    if not user or not auth_service.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = auth_service.create_access_token(
        data={"sub": user.user_id},
        expires_delta=timedelta(hours=JWT_EXPIRATION_HOURS)
    )
    
    return Token(access_token=access_token)


@router.post("/logout")
async def logout(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
):
    """Logout by blacklisting the token."""
    token = credentials.credentials
    memory_store.blacklist_token(token)
    return {"message": "Successfully logged out"}

