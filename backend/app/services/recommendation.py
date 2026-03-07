from __future__ import annotations

import math
from datetime import date

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.opportunity import Opportunity
from app.models.user import UserPreference
from app.services.gemini import gemini_service


def build_profile_text(preferences: UserPreference) -> str:
    interests = ", ".join(preferences.interests or [])
    skills = ", ".join(preferences.skills or [])
    return f"Interests: {interests}. Skills: {skills}."


def _coerce_embedding(value: object) -> list[float]:
    if value is None:
        return []
    if isinstance(value, list):
        return [float(v) for v in value]
    if hasattr(value, "tolist"):
        converted = value.tolist()
        if isinstance(converted, list):
            return [float(v) for v in converted]
    if hasattr(value, "__iter__"):
        return [float(v) for v in value]  # type: ignore[arg-type]
    return []


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_km = 6371.0
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = math.sin(dlat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return earth_km * c


async def update_user_embedding(db: AsyncSession, preferences: UserPreference) -> None:
    profile_text = build_profile_text(preferences)
    preferences.embedding = await gemini_service.embed(profile_text)
    db.add(preferences)
    await db.commit()


def _rerank(
    candidates: list[tuple[Opportunity, float]],
    user_lat: float | None,
    user_lng: float | None,
) -> list[tuple[Opportunity, float]]:
    """Apply proximity, demand, and recency boosts on top of cosine similarity."""
    scored: list[tuple[Opportunity, float]] = []
    for opp, cosine_sim in candidates:
        proximity_boost = 0.0
        if user_lat is not None and user_lng is not None and opp.location_lat is not None and opp.location_lng is not None:
            distance_km = haversine(user_lat, user_lng, opp.location_lat, opp.location_lng)
            proximity_boost = max(0.0, 1.0 - (distance_km / 50.0))

        needed = opp.volunteers_needed or 0
        signed = opp.volunteers_signed or 0
        demand_boost = ((needed - signed) / max(needed, 1)) * 0.3

        recency_boost = 0.0
        if opp.event_date is not None:
            days_until = (opp.event_date - date.today()).days
            recency_boost = max(0.0, 1.0 - (days_until / 30.0)) * 0.2

        final_score = float(cosine_sim + proximity_boost + demand_boost + recency_boost)
        scored.append((opp, final_score))

    scored.sort(key=lambda item: item[1], reverse=True)
    return scored


async def get_recommendations(
    db: AsyncSession,
    preferences: UserPreference,
    limit: int = 20,
) -> list[tuple[Opportunity, float]]:
    embedding = _coerce_embedding(preferences.embedding)
    if len(embedding) == 0:
        await update_user_embedding(db, preferences)
        embedding = _coerce_embedding(preferences.embedding)

    # Use pgvector's native <=> (cosine distance) operator for KNN search.
    # Fetch more candidates than needed so re-ranking with bonus signals
    # can still surface good results that aren't the closest by embedding alone.
    knn_limit = min(limit * 3, 100)
    vec_literal = "[" + ",".join(str(v) for v in embedding) + "]"

    stmt = (
        select(
            Opportunity,
            (1 - Opportunity.embedding.cosine_distance(text(f"'{vec_literal}'::vector"))).label("cosine_sim"),
        )
        .where(Opportunity.embedding.is_not(None))
        .order_by(Opportunity.embedding.cosine_distance(text(f"'{vec_literal}'::vector")))
        .limit(knn_limit)
    )

    result = await db.execute(stmt)
    candidates = [(row[0], float(row[1])) for row in result.all()]

    reranked = _rerank(candidates, preferences.location_lat, preferences.location_lng)
    return reranked[:limit]
