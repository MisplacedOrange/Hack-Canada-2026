from __future__ import annotations

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status

from app.config import settings

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _ensure_configured() -> None:
    if not settings.CLOUDINARY_CLOUD_NAME:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Cloudinary is not configured")
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


async def upload_image(file: UploadFile, folder: str) -> str:
    """Upload an image to Cloudinary and return the secure URL."""
    _ensure_configured()

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not allowed. Use JPEG, PNG, WebP, or GIF.",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File exceeds 5 MB limit")

    result = cloudinary.uploader.upload(
        contents,
        folder=folder,
        transformation=[{"width": 800, "height": 800, "crop": "limit", "quality": "auto", "fetch_format": "auto"}],
        resource_type="image",
    )
    return result["secure_url"]


def delete_image(public_id: str) -> None:
    """Delete an image from Cloudinary by its public_id."""
    _ensure_configured()
    cloudinary.uploader.destroy(public_id, resource_type="image")
