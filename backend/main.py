from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass
from urllib.parse import parse_qs, unquote, urlparse

import httpx
from bs4 import BeautifulSoup
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Summit API")

# Allow local frontend dev servers to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Summit backend is running"}


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


CAUSE_KEYWORDS: dict[str, tuple[str, ...]] = {
    "environment": ("environment", "climate", "sustain", "cleanup", "green", "park", "recycle"),
    "education": ("education", "tutor", "school", "student", "mentor", "literacy", "youth"),
    "healthcare": ("health", "hospital", "clinic", "medical", "wellness", "blood"),
    "community": ("community", "food", "shelter", "neighbourhood", "outreach", "support"),
    "animal-care": ("animal", "pet", "rescue", "shelter", "wildlife"),
    "arts-culture": ("arts", "museum", "culture", "festival", "music", "gallery"),
}

SKILL_KEYWORDS: tuple[str, ...] = (
    "teaching",
    "event planning",
    "social media",
    "design",
    "fundraising",
    "logistics",
    "coding",
    "writing",
)


@dataclass
class OpportunitySeed:
    title: str
    description: str
    url: str


class Opportunity(BaseModel):
    id: str
    title: str
    organization: str
    description: str
    url: str
    cause: str
    location: str
    schedule: str
    volunteers_needed: int
    skills: list[str]
    urgency: str
    score: float = 0.0
    latitude: float
    longitude: float


class RecommendationRequest(BaseModel):
    interests: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    availability: str = "weekends"
    location: str = "Toronto"
    max_distance_km: int = 15
    limit: int = Field(default=12, ge=1, le=25)


class OpportunityResponse(BaseModel):
    query: str
    count: int
    source: str
    items: list[Opportunity]


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip().lower()


def _classify_cause(text: str) -> str:
    normalized = _normalize(text)
    for cause, keywords in CAUSE_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return cause
    return "community"


def _infer_skills(text: str) -> list[str]:
    normalized = _normalize(text)
    found = [skill for skill in SKILL_KEYWORDS if skill in normalized]
    return found if found else ["communication", "teamwork"]


def _hash_int(seed: str) -> int:
    return int(hashlib.sha256(seed.encode("utf-8")).hexdigest()[:8], 16)


def _organization_from_url(url: str) -> str:
    host = urlparse(url).netloc.replace("www.", "")
    parts = host.split(".")
    if not parts:
        return "Local Organization"
    root = parts[0].replace("-", " ").replace("_", " ").strip()
    return root.title() if root else "Local Organization"


def _map_point_from_seed(seed: str) -> tuple[float, float]:
    # Deterministic pseudo-coordinates around Toronto.
    h1 = _hash_int(seed)
    h2 = _hash_int(f"{seed}-lon")
    lat = 43.62 + (h1 % 2400) / 10000.0
    lon = -79.52 + (h2 % 3200) / 10000.0
    return (round(lat, 6), round(lon, 6))


def _score_opportunity(
    opportunity: Opportunity,
    interests: list[str],
    skills: list[str],
    query: str,
    location: str,
) -> float:
    score = 0.0
    text = _normalize(f"{opportunity.title} {opportunity.description}")
    if query and _normalize(query) in text:
        score += 2.5
    if location and _normalize(location) in _normalize(opportunity.location):
        score += 2.0

    interest_tokens = [_normalize(x) for x in interests if x.strip()]
    if opportunity.cause in interest_tokens:
        score += 3.0
    score += sum(1.0 for token in interest_tokens if token and token in text)

    skill_tokens = {_normalize(x) for x in skills if x.strip()}
    score += sum(1.5 for skill in opportunity.skills if _normalize(skill) in skill_tokens)

    if opportunity.urgency == "high":
        score += 1.0

    return round(score, 2)


def _extract_result_url(raw_href: str) -> str:
    """Convert DuckDuckGo redirect links into direct target URLs."""
    if raw_href.startswith("http"):
        return raw_href

    if raw_href.startswith("/"):
        parsed = urlparse(raw_href)
        query = parse_qs(parsed.query)
        redirect = query.get("uddg", [""])[0]
        if redirect:
            return unquote(redirect)

    return raw_href


async def _scrape_duckduckgo(query: str, limit: int) -> list[OpportunitySeed]:
    search_url = "https://duckduckgo.com/html/"
    headers = {"User-Agent": "Mozilla/5.0 (SummitVolunteerFinder/1.0)"}

    async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
        response = await client.get(search_url, params={"q": query}, headers=headers)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    results: list[OpportunitySeed] = []
    seen_urls: set[str] = set()

    for row in soup.select(".result"):
        title_link = row.select_one("a.result__a")
        snippet_el = row.select_one(".result__snippet")
        if title_link is None:
            continue

        title = title_link.get_text(strip=True)
        href = title_link.get("href", "").strip()
        snippet = snippet_el.get_text(strip=True) if snippet_el else ""
        if not title or not href:
            continue

        url = _extract_result_url(href)
        if not url or url in seen_urls:
            continue

        relevance_text = _normalize(f"{title} {snippet}")
        if not any(token in relevance_text for token in ["volunteer", "nonprofit", "charity", "community", "foundation", "event"]):
            continue

        results.append(OpportunitySeed(title=title, description=snippet or "No description provided.", url=url))
        seen_urls.add(url)
        if len(results) >= limit:
            break

    return results


def _build_opportunities_from_seeds(
    seeds: list[OpportunitySeed],
    *,
    location: str,
    query: str,
    interests: list[str],
    skills: list[str],
) -> list[Opportunity]:
    opportunities: list[Opportunity] = []
    for seed in seeds:
        cause = _classify_cause(f"{seed.title} {seed.description}")
        seed_hash = _hash_int(seed.url)
        volunteers_needed = 3 + (seed_hash % 18)
        urgency = "high" if volunteers_needed >= 15 else "medium" if volunteers_needed >= 9 else "low"
        latitude, longitude = _map_point_from_seed(seed.url)
        opp = Opportunity(
            id=hashlib.md5(seed.url.encode("utf-8")).hexdigest()[:12],
            title=seed.title,
            organization=_organization_from_url(seed.url),
            description=seed.description,
            url=seed.url,
            cause=cause,
            location=location or "Toronto",
            schedule="Flexible / Posted online",
            volunteers_needed=volunteers_needed,
            skills=_infer_skills(f"{seed.title} {seed.description}"),
            urgency=urgency,
            latitude=latitude,
            longitude=longitude,
        )
        opp.score = _score_opportunity(opp, interests, skills, query, location)
        opportunities.append(opp)

    opportunities.sort(key=lambda x: x.score, reverse=True)
    return opportunities


@app.get("/api/volunteer-organizations")
async def volunteer_organizations(
    q: str = Query(
        default="volunteer opportunities nonprofits community organizations",
        min_length=3,
    ),
    cause: str = Query(default=""),
    location: str = Query(default="Toronto"),
    interests: str = Query(default=""),
    skills: str = Query(default=""),
    limit: int = Query(default=12, ge=1, le=25),
) -> OpportunityResponse:
    """Discover volunteer opportunities from public sources with lightweight ranking."""
    seeds = await _scrape_duckduckgo(q, limit=max(limit * 2, 20))
    interest_tokens = [item.strip() for item in interests.split(",") if item.strip()]
    skill_tokens = [item.strip() for item in skills.split(",") if item.strip()]

    opportunities = _build_opportunities_from_seeds(
        seeds,
        location=location,
        query=q,
        interests=interest_tokens,
        skills=skill_tokens,
    )

    if cause.strip():
        opportunities = [item for item in opportunities if item.cause == _normalize(cause)]

    opportunities = opportunities[:limit]

    return OpportunityResponse(
        query=q,
        count=len(opportunities),
        source="DuckDuckGo public HTML results + Summit ranking",
        items=opportunities,
    )


@app.post("/api/recommendations")
async def recommendations(payload: RecommendationRequest) -> OpportunityResponse:
    """AI-like matching endpoint (heuristic scoring, no DB required)."""
    query = " ".join(payload.interests) if payload.interests else "volunteer opportunities students"
    seeds = await _scrape_duckduckgo(query, limit=max(payload.limit * 2, 20))
    opportunities = _build_opportunities_from_seeds(
        seeds,
        location=payload.location,
        query=query,
        interests=payload.interests,
        skills=payload.skills,
    )
    return OpportunityResponse(
        query=query,
        count=min(len(opportunities), payload.limit),
        source="Summit recommendation engine (v1 heuristic matcher)",
        items=opportunities[: payload.limit],
    )
