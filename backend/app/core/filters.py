"""
Reusable global filter parser and SQLAlchemy query builder.
Supports start_date, end_date, region, state, store_id, category, subcategory, customer_type, sales_channel.
Provides period comparison window calculations.
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple
from fastapi import Query, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Query as SQLQuery
from backend.app.models.transaction import Transaction
from backend.app.core.deps import get_current_tenant
from backend.app.models.tenant import Tenant

class FilterParams(BaseModel):
    start_date: Optional[str] = "2026-01-01"
    end_date: Optional[str] = "2026-12-31"
    tenant_id: Optional[str] = "demo_tenant"
    region: Optional[str] = None
    state: Optional[str] = None
    store_id: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    customer_type: Optional[str] = None
    sales_channel: Optional[str] = None


def get_filter_params(
    start_date: Optional[str] = Query("2026-01-01", description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query("2026-12-31", description="End date YYYY-MM-DD"),
    region: Optional[str] = Query(None, description="Region filter"),
    state: Optional[str] = Query(None, description="State filter"),
    store: Optional[str] = Query(None, description="Store ID filter"),
    category: Optional[str] = Query(None, description="Category filter"),
    subcategory: Optional[str] = Query(None, description="Subcategory filter"),
    customer_type: Optional[str] = Query(None, description="Customer Type filter"),
    sales_channel: Optional[str] = Query(None, description="Sales Channel filter"),
    tenant: Tenant = Depends(get_current_tenant),
) -> FilterParams:
    return FilterParams(
        start_date=start_date,
        end_date=end_date,
        tenant_id=tenant.id if tenant else "demo_tenant",
        region=region,
        state=state,
        store_id=store,
        category=category,
        subcategory=subcategory,
        customer_type=customer_type,
        sales_channel=sales_channel,
    )

def apply_transaction_filters(query: SQLQuery, filters: FilterParams, date_override: Optional[Tuple[str, str]] = None) -> SQLQuery:
    """Applies dimensional filters to any Transaction query."""
    if getattr(filters, "tenant_id", None):
        query = query.filter(Transaction.tenant_id == filters.tenant_id)

    start = date_override[0] if date_override else filters.start_date
    end = date_override[1] if date_override else filters.end_date

    if start:
        query = query.filter(Transaction.transaction_date >= start)
    if end:
        query = query.filter(Transaction.transaction_date <= end)
    if filters.region:
        query = query.filter(Transaction.region == filters.region)
    if filters.state:
        query = query.filter(Transaction.state == filters.state)
    if filters.store_id:
        query = query.filter(Transaction.store_id == filters.store_id)
    if filters.category:
        query = query.filter(Transaction.category == filters.category)
    if filters.subcategory:
        query = query.filter(Transaction.subcategory == filters.subcategory)
    if filters.customer_type:
        query = query.filter(Transaction.customer_type == filters.customer_type)
    if filters.sales_channel:
        query = query.filter(Transaction.sales_channel == filters.sales_channel)

    return query

def get_previous_period_dates(start_date_str: str, end_date_str: str) -> Tuple[str, str]:
    """
    Calculates the exact previous equivalent period window.
    Example: 2026-04-01 to 2026-06-30 (91 days) -> 2025-12-31 to 2026-03-31.
    """
    try:
        start = datetime.strptime(start_date_str, "%Y-%m-%d")
        end = datetime.strptime(end_date_str, "%Y-%m-%d")
        diff_days = (end - start).days + 1
        
        prev_end = start - timedelta(days=1)
        prev_start = prev_end - timedelta(days=diff_days - 1)
        
        return prev_start.strftime("%Y-%m-%d"), prev_end.strftime("%Y-%m-%d")
    except Exception:
        # Fallback default
        return "2025-01-01", "2025-12-31"
