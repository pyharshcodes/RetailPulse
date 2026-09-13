"""
Executive Overview REST API routes.
Delivers executive KPIs, period comparison, monthly revenue trend, category performance,
store rankings, highlights, and deterministic attribution.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import get_db
from backend.app.core.filters import FilterParams, get_filter_params, apply_transaction_filters
from backend.app.models.transaction import Transaction
from backend.app.models.store import Store
from backend.app.models.target import Target
from backend.app.services.analytics_engine import calculate_kpis, get_revenue_trend, get_category_performance
from backend.app.services.highlights_engine import generate_business_highlights
from backend.app.services.attribution_engine import explain_metric_change

router = APIRouter(prefix="/overview", tags=["Overview"])

@router.get("")
def get_overview(
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Returns the full executive overview dashboard payload."""
    kpis = calculate_kpis(db, filters)
    trend = get_revenue_trend(db, filters, interval="monthly")
    categories = get_category_performance(db, filters)
    highlights = generate_business_highlights(db, filters)

    # Top store rankings
    store_q = db.query(
        Transaction.store_id,
        Transaction.store_name,
        Transaction.city,
        Transaction.region,
        func.sum(Transaction.net_sales).label("revenue"),
        func.sum(Transaction.gross_profit).label("gross_profit"),
        func.count(Transaction.id).label("txns")
    )
    store_q = apply_transaction_filters(store_q, filters)
    store_q = store_q.group_by(
        Transaction.store_id, Transaction.store_name, Transaction.city, Transaction.region
    ).order_by(func.sum(Transaction.net_sales).desc()).limit(8)
    
    store_rankings = []
    for r in store_q.all():
        rev = float(r.revenue or 0.0)
        gp = float(r.gross_profit or 0.0)
        margin = round((gp / rev) * 100.0, 1) if rev > 0 else 0.0
        store_rankings.append({
            "store_id": r.store_id,
            "store_name": r.store_name,
            "city": r.city,
            "region": r.region,
            "revenue": round(rev, 2),
            "gross_profit": round(gp, 2),
            "margin_percent": margin,
            "transactions": int(r.txns or 0)
        })

    # Overall target achievement for current period
    curr_rev = kpis["revenue"]["current"]
    # Sum targets for active store/category across the selected months
    start_month = (filters.start_date or "2026-01-01")[:7]
    end_month = (filters.end_date or "2026-12-31")[:7]
    
    target_q = db.query(
        func.sum(Target.target_revenue).label("target_rev"),
        func.sum(Target.target_gross_profit).label("target_gp")
    ).filter(Target.month >= start_month, Target.month <= end_month)
    
    if filters.store_id:
        target_q = target_q.filter(Target.store_id == filters.store_id)
    if filters.category:
        target_q = target_q.filter(Target.category == filters.category)
        
    t_res = target_q.one()
    t_rev = float(t_res.target_rev or 0.0)
    t_gp = float(t_res.target_gp or 0.0)
    achievement_rev = round((curr_rev / t_rev) * 100.0, 1) if t_rev > 0 else 0.0

    return {
        "kpis": kpis,
        "targets": {
            "target_revenue": round(t_rev, 2),
            "target_gross_profit": round(t_gp, 2),
            "revenue_achievement": achievement_rev,
            "variance": round(curr_rev - t_rev, 2),
        },
        "revenue_trend": trend,
        "category_performance": categories,
        "top_stores": store_rankings,
        "highlights": highlights,
    }

@router.get("/attribution")
def get_metric_attribution(
    metric: str = Query("revenue", description="Metric to decompose: revenue, gross_profit, units"),
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Decomposes the variance of a metric into category, regional, and store contributors."""
    return explain_metric_change(db, filters, metric=metric)
