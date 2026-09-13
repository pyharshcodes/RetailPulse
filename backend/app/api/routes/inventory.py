"""
Inventory Intelligence REST API routes.
Delivers inventory valuation, turnover ratio, aging buckets (0-30, 31-60, 61-90, 90+),
and granular stock health table.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.filters import FilterParams, get_filter_params
from backend.app.services.inventory_engine import get_inventory_summary, get_inventory_items

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("")
def get_inventory_dashboard(
    status: Optional[str] = Query(None, description="Status filter: Healthy, Low Stock, Overstocked, Aging"),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Returns inventory health summary metrics and paginated SKU stock records."""
    summary = get_inventory_summary(db, filters)
    offset = (page - 1) * limit
    items_data = get_inventory_items(db, filters, status=status, limit=limit, offset=offset)

    return {
        "summary": summary,
        "items": items_data["items"],
        "pagination": {
            "total": items_data["total"],
            "page": page,
            "limit": limit,
            "pages": (items_data["total"] + limit - 1) // limit if limit > 0 else 1,
        }
    }
