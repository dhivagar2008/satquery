from typing import List, Optional
from fastapi import APIRouter, Query
from app.schemas.analysis import SearchResponse, SearchResultItem
from app.services.search_service import search_service, GLOBAL_HOTSPOTS

router = APIRouter()

@router.get("/search", response_model=SearchResponse)
async def search_locations(
    q: str = Query(..., min_length=1, description="Event phrase or location query")
):
    """
    Reverse Find-The-Change semantic search:
    Accepts queries like 'shrinking lakes', 'deforestation by fire', 'industrial growth',
    or geographic locations like 'Dubai', 'Amazon', 'Aral Sea', and returns
    curated coordinates, bounding boxes, default years, and optimal index presets.
    """
    raw_results = await search_service.search(q)
    items = [
        SearchResultItem(
            id=item["id"],
            name=item["name"],
            lat=item["lat"],
            lng=item["lng"],
            zoom=item["zoom"],
            default_index=item["default_index"],
            default_years=item["default_years"],
            preview_delta=item["preview_delta"],
            category=item.get("category", "Environmental Shift"),
            description=item.get("description"),
            bbox=item.get("bbox")
        )
        for item in raw_results
    ]
    return SearchResponse(
        results=items,
        query=q,
        total=len(items)
    )

@router.get("/hotspots", response_model=List[SearchResultItem])
async def list_all_hotspots():
    """Returns the full catalog of 50+ pre-seeded global change hotspots."""
    return [
        SearchResultItem(
            id=item["id"],
            name=item["name"],
            lat=item["lat"],
            lng=item["lng"],
            zoom=item["zoom"],
            default_index=item["default_index"],
            default_years=item["default_years"],
            preview_delta=item["preview_delta"],
            category=item.get("category", "Environmental Shift"),
            description=item.get("description"),
            bbox=item.get("bbox")
        )
        for item in GLOBAL_HOTSPOTS
    ]
