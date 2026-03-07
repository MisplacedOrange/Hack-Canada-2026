from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OrganizationUpdate(BaseModel):
    name: str
    description: str | None = None
    website: str | None = None


class OrganizationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    description: str | None
    website: str | None
    logo_url: str | None = None
    created_at: datetime | None = None
