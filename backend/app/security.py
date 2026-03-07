from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from app.config import settings

LOCAL_JWT_ISSUER = "impactmatch-local"
LOCAL_JWT_ALGORITHM = "HS256"


def create_local_access_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "iss": LOCAL_JWT_ISSUER,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=settings.APP_JWT_EXPIRE_HOURS)).timestamp()),
    }
    return jwt.encode(payload, settings.APP_JWT_SECRET, algorithm=LOCAL_JWT_ALGORITHM)


def decode_local_access_token(token: str) -> dict[str, Any] | None:
    try:
        payload = jwt.decode(token, settings.APP_JWT_SECRET, algorithms=[LOCAL_JWT_ALGORITHM])
    except JWTError:
        return None

    if payload.get("iss") != LOCAL_JWT_ISSUER:
        return None
    return payload
