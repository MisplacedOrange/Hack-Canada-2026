from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserRead
from app.security import create_local_access_token

router = APIRouter()


class AuthExchangeRequest(BaseModel):
    auth0_id: str
    email: str
    full_name: str | None = None
    role: str = "student"


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str | None = None
    role: str = "student"


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str | None = None
    token_type: str | None = None
    requires_email_verification: bool = False
    user: UserRead


def _build_user_read(user: User) -> UserRead:
    return UserRead(
        id=user.id,
        auth0_id=user.auth0_id,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        role=user.role,
        created_at=user.created_at,
        updated_at=user.updated_at,
        preferences=None,
    )


def _ensure_supabase_configured() -> None:
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase auth is not configured on backend",
        )


async def _upsert_local_user(
    *,
    db: AsyncSession,
    provider_user_id: str,
    email: str,
    full_name: str | None,
    role: str,
) -> User:
    result = await db.execute(select(User).where(User.auth0_id == provider_user_id))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            auth0_id=provider_user_id,
            email=email,
            full_name=full_name,
            role=role,
        )
        db.add(user)
    else:
        user.email = email
        user.full_name = full_name
        user.role = role

    await db.commit()
    await db.refresh(user)
    return user


@router.post("/register", response_model=AuthResponse)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    if payload.role not in {"student", "organization"}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid role")

    _ensure_supabase_configured()
    signup_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/signup"

    async with httpx.AsyncClient(timeout=12.0) as client:
        try:
            response = await client.post(
                signup_url,
                headers={
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "email": payload.email,
                    "password": payload.password,
                    "data": {"full_name": payload.full_name or payload.email.split("@")[0]},
                },
            )
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Auth provider unavailable") from exc

    if response.status_code >= 400:
        message = response.json().get("msg") if response.headers.get("content-type", "").startswith("application/json") else "Registration failed"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message or "Registration failed")

    body = response.json()
    provider_user = body.get("user") or {}
    provider_user_id = provider_user.get("id")
    if not provider_user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration succeeded but user id missing")

    full_name = payload.full_name or provider_user.get("user_metadata", {}).get("full_name")
    user = await _upsert_local_user(
        db=db,
        provider_user_id=provider_user_id,
        email=payload.email,
        full_name=full_name,
        role=payload.role,
    )

    session = body.get("session")
    if session:
        token = create_local_access_token(subject=user.auth0_id)
        return AuthResponse(access_token=token, token_type="bearer", requires_email_verification=False, user=_build_user_read(user))

    return AuthResponse(access_token=None, token_type=None, requires_email_verification=True, user=_build_user_read(user))


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    _ensure_supabase_configured()
    login_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/token"

    async with httpx.AsyncClient(timeout=12.0) as client:
        try:
            response = await client.post(
                login_url,
                params={"grant_type": "password"},
                headers={
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "email": payload.email,
                    "password": payload.password,
                },
            )
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Auth provider unavailable") from exc

    if response.status_code >= 400:
        message = response.json().get("msg") if response.headers.get("content-type", "").startswith("application/json") else "Invalid login credentials"
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=message or "Invalid login credentials")

    body = response.json()
    provider_user = body.get("user") or {}
    provider_user_id = provider_user.get("id")
    if not provider_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid login response")

    full_name = provider_user.get("user_metadata", {}).get("full_name") or payload.email.split("@")[0]
    user = await _upsert_local_user(
        db=db,
        provider_user_id=provider_user_id,
        email=payload.email,
        full_name=full_name,
        role="student",
    )

    token = create_local_access_token(subject=user.auth0_id)
    return AuthResponse(access_token=token, token_type="bearer", requires_email_verification=False, user=_build_user_read(user))


@router.post("/exchange")
async def exchange_token(payload: AuthExchangeRequest, db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    if payload.role not in {"student", "organization"}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid role")

    result = await db.execute(select(User).where(User.auth0_id == payload.auth0_id))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            auth0_id=payload.auth0_id,
            email=payload.email,
            full_name=payload.full_name,
            role=payload.role,
        )
        db.add(user)
    else:
        user.email = payload.email
        user.full_name = payload.full_name
        user.role = payload.role

    await db.commit()
    await db.refresh(user)

    return {"id": user.id, "role": user.role}
