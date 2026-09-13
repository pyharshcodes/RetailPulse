"""
Geographic Analytics REST API routes.
Delivers regional performance, state and city drilldowns, and store density metrics.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from backend.app.core.database import get_db
from backend.app.core.filters import FilterParams, get_filter_params, apply_transaction_filters, get_previous_period_dates
from backend.app.models.transaction import Transaction

router = APIRouter(prefix="/geography", tags=["Geography"])

@router.get("")
def get_geography_analytics(
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Returns regional, state, and city level performance metrics."""
    prev_start, prev_end = get_previous_period_dates(filters.start_date, filters.end_date)

    # 1. Regional performance
    curr_reg = db.query(
        Transaction.region,
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.gross_profit).label("gp"),
        func.count(distinct(Transaction.store_id)).label("store_count"),
        func.count(distinct(Transaction.transaction_id)).label("orders"),
        func.sum(Transaction.quantity).label("units"),
    )
    curr_reg = apply_transaction_filters(curr_reg, filters)
    curr_results = curr_reg.group_by(Transaction.region).order_by(func.sum(Transaction.net_sales).desc()).all()

    prev_reg = db.query(
        Transaction.region,
        func.sum(Transaction.net_sales).label("prev_rev")
    )
    prev_reg = apply_transaction_filters(prev_reg, filters, date_override=(prev_start, prev_end))
    prev_map = {r.region: float(r.prev_rev or 0.0) for r in prev_reg.group_by(Transaction.region).all()}

    total_net_sales = sum(float(r.rev or 0.0) for r in curr_results) or 1.0

    regions = []
    for r in curr_results:
        rev = round(float(r.rev or 0.0), 2)
        gp = round(float(r.gp or 0.0), 2)
        margin = round((gp / rev) * 100.0, 2) if rev > 0 else 0.0
        prev_rev = prev_map.get(r.region, 0.0)
        growth = round(((rev - prev_rev) / prev_rev) * 100.0, 2) if prev_rev > 0 else 0.0
        orders = int(r.orders or 0)
        aov = round(rev / orders, 2) if orders > 0 else 0.0

        regions.append({
            "region": r.region,
            "revenue": rev,
            "gross_profit": gp,
            "margin_percent": margin,
            "orders": orders,
            "units": int(r.units or 0),
            "aov": aov,
            "growth": growth,
            "store_count": int(r.store_count or 0),
            "revenue_share": round((rev / total_net_sales) * 100.0, 2)
        })

    # 2. State Drilldown
    state_q = db.query(
        Transaction.region,
        Transaction.state,
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.gross_profit).label("gp"),
        func.count(distinct(Transaction.store_id)).label("store_count")
    )
    state_q = apply_transaction_filters(state_q, filters)
    state_results = state_q.group_by(Transaction.region, Transaction.state).order_by(func.sum(Transaction.net_sales).desc()).all()

    states = []
    for s in state_results:
        rev = round(float(s.rev or 0.0), 2)
        gp = round(float(s.gp or 0.0), 2)
        margin = round((gp / rev) * 100.0, 2) if rev > 0 else 0.0
        states.append({
            "region": s.region,
            "state": s.state,
            "revenue": rev,
            "gross_profit": gp,
            "margin_percent": margin,
            "store_count": int(s.store_count or 0),
        })

    # 3. City Breakdown
    city_q = db.query(
        Transaction.city,
        Transaction.state,
        Transaction.region,
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.gross_profit).label("gp"),
        func.count(distinct(Transaction.transaction_id)).label("orders")
    )
    city_q = apply_transaction_filters(city_q, filters)
    city_results = city_q.group_by(Transaction.city, Transaction.state, Transaction.region).order_by(func.sum(Transaction.net_sales).desc()).all()

    cities = []
    for c in city_results:
        rev = round(float(c.rev or 0.0), 2)
        gp = round(float(c.gp or 0.0), 2)
        margin = round((gp / rev) * 100.0, 2) if rev > 0 else 0.0
        cities.append({
            "city": c.city,
            "state": c.state,
            "region": c.region,
            "revenue": rev,
            "gross_profit": gp,
            "margin_percent": margin,
            "orders": int(c.orders or 0),
        })

    return {
        "regions": regions,
        "states": states,
        "cities": cities,
    }
