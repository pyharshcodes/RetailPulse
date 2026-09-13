"""
Core Analytics Engine for RetailPulse.
Calculates executive KPIs, period comparisons, weighted margins, trends, category and store breakdowns.
Zero fabricated numbers: all calculations execute deterministic SQL aggregates against the live dataset.
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from backend.app.models.transaction import Transaction
from backend.app.models.target import Target
from backend.app.core.filters import FilterParams, apply_transaction_filters, get_previous_period_dates

def safe_pct_change(current: float, previous: float) -> Optional[float]:
    """Calculates percentage change, safely returning None if previous is zero or None."""
    if previous is None or previous == 0:
        return None
    return round(((current - previous) / previous) * 100.0, 2)

def calculate_kpis(db: Session, filters: FilterParams) -> Dict[str, Any]:
    """Calculates current period vs equivalent previous period KPIs."""
    # Current period query
    curr_q = db.query(
        func.sum(Transaction.net_sales).label("revenue"),
        func.sum(Transaction.gross_profit).label("gross_profit"),
        func.count(distinct(Transaction.transaction_id)).label("orders"),
        func.sum(Transaction.quantity).label("units"),
    )
    curr_q = apply_transaction_filters(curr_q, filters)
    curr_res = curr_q.one()

    curr_rev = float(curr_res.revenue or 0.0)
    curr_gp = float(curr_res.gross_profit or 0.0)
    curr_orders = int(curr_res.orders or 0)
    curr_units = int(curr_res.units or 0)
    curr_aov = round(curr_rev / curr_orders, 2) if curr_orders > 0 else 0.0
    curr_margin = round((curr_gp / curr_rev) * 100.0, 2) if curr_rev > 0 else 0.0

    # Previous period calculation
    prev_start, prev_end = get_previous_period_dates(filters.start_date, filters.end_date)
    prev_q = db.query(
        func.sum(Transaction.net_sales).label("revenue"),
        func.sum(Transaction.gross_profit).label("gross_profit"),
        func.count(distinct(Transaction.transaction_id)).label("orders"),
        func.sum(Transaction.quantity).label("units"),
    )
    prev_q = apply_transaction_filters(prev_q, filters, date_override=(prev_start, prev_end))
    prev_res = prev_q.one()

    prev_rev = float(prev_res.revenue or 0.0)
    prev_gp = float(prev_res.gross_profit or 0.0)
    prev_orders = int(prev_res.orders or 0)
    prev_units = int(prev_res.units or 0)
    prev_aov = round(prev_rev / prev_orders, 2) if prev_orders > 0 else 0.0
    prev_margin = round((prev_gp / prev_rev) * 100.0, 2) if prev_rev > 0 else 0.0

    return {
        "period": {
            "current_start": filters.start_date,
            "current_end": filters.end_date,
            "previous_start": prev_start,
            "previous_end": prev_end,
        },
        "revenue": {
            "current": round(curr_rev, 2),
            "previous": round(prev_rev, 2),
            "absolute_change": round(curr_rev - prev_rev, 2),
            "percentage_change": safe_pct_change(curr_rev, prev_rev),
        },
        "gross_profit": {
            "current": round(curr_gp, 2),
            "previous": round(prev_gp, 2),
            "absolute_change": round(curr_gp - prev_gp, 2),
            "percentage_change": safe_pct_change(curr_gp, prev_gp),
        },
        "gross_margin": {
            "current": curr_margin,
            "previous": prev_margin,
            "absolute_change": round(curr_margin - prev_margin, 2),
            "percentage_change": safe_pct_change(curr_margin, prev_margin),
        },
        "orders": {
            "current": curr_orders,
            "previous": prev_orders,
            "absolute_change": curr_orders - prev_orders,
            "percentage_change": safe_pct_change(curr_orders, prev_orders),
        },
        "units": {
            "current": curr_units,
            "previous": prev_units,
            "absolute_change": curr_units - prev_units,
            "percentage_change": safe_pct_change(curr_units, prev_units),
        },
        "aov": {
            "current": curr_aov,
            "previous": prev_aov,
            "absolute_change": round(curr_aov - prev_aov, 2),
            "percentage_change": safe_pct_change(curr_aov, prev_aov),
        },
    }

def get_revenue_trend(db: Session, filters: FilterParams, interval: str = "monthly") -> List[Dict[str, Any]]:
    """
    Returns aggregated revenue, gross profit, orders, and units grouped by month or day.
    Includes target comparison for monthly interval.
    """
    # SQLite / PostgreSQL compatible date substr / truncation
    # Format: YYYY-MM
    date_group = func.substr(Transaction.transaction_date, 1, 7) if interval == "monthly" else Transaction.transaction_date

    q = db.query(
        date_group.label("period"),
        func.sum(Transaction.net_sales).label("revenue"),
        func.sum(Transaction.gross_profit).label("gross_profit"),
        func.count(distinct(Transaction.transaction_id)).label("orders"),
        func.sum(Transaction.quantity).label("units"),
    )
    q = apply_transaction_filters(q, filters)
    q = q.group_by(date_group).order_by(date_group.asc())
    results = q.all()

    # Pre-fetch monthly targets if monthly interval
    target_map = {}
    if interval == "monthly":
        t_q = db.query(
            Target.month,
            func.sum(Target.target_revenue).label("target_rev"),
            func.sum(Target.target_gross_profit).label("target_gp"),
        )
        if filters.store_id:
            t_q = t_q.filter(Target.store_id == filters.store_id)
        if filters.category:
            t_q = t_q.filter(Target.category == filters.category)
        t_q = t_q.group_by(Target.month)
        for t in t_q.all():
            target_map[t.month] = {
                "target_revenue": float(t.target_rev or 0.0),
                "target_gross_profit": float(t.target_gp or 0.0),
            }

    trend = []
    for r in results:
        period_str = str(r.period)
        rev = round(float(r.revenue or 0.0), 2)
        gp = round(float(r.gross_profit or 0.0), 2)
        orders = int(r.orders or 0)
        units = int(r.units or 0)
        margin = round((gp / rev) * 100.0, 2) if rev > 0 else 0.0
        aov = round(rev / orders, 2) if orders > 0 else 0.0

        t_data = target_map.get(period_str, {"target_revenue": 0.0, "target_gross_profit": 0.0})
        t_rev = t_data["target_revenue"]
        achievement = round((rev / t_rev) * 100.0, 2) if t_rev > 0 else None
        variance = round(rev - t_rev, 2) if t_rev > 0 else None

        trend.append({
            "period": period_str,
            "revenue": rev,
            "gross_profit": gp,
            "gross_margin": margin,
            "orders": orders,
            "units": units,
            "aov": aov,
            "target_revenue": t_rev,
            "target_achievement": achievement,
            "variance": variance,
        })

    return trend

def get_category_performance(db: Session, filters: FilterParams) -> List[Dict[str, Any]]:
    """Calculates performance breakdown by Category."""
    q = db.query(
        Transaction.category,
        func.sum(Transaction.net_sales).label("revenue"),
        func.sum(Transaction.gross_profit).label("gross_profit"),
        func.sum(Transaction.quantity).label("units"),
        func.count(distinct(Transaction.transaction_id)).label("orders"),
    )
    q = apply_transaction_filters(q, filters)
    q = q.group_by(Transaction.category).order_by(func.sum(Transaction.net_sales).desc())
    results = q.all()

    total_rev = sum(float(r.revenue or 0.0) for r in results) or 1.0

    categories = []
    for r in results:
        rev = round(float(r.revenue or 0.0), 2)
        gp = round(float(r.gross_profit or 0.0), 2)
        margin = round((gp / rev) * 100.0, 2) if rev > 0 else 0.0
        categories.append({
            "category": r.category,
            "revenue": rev,
            "gross_profit": gp,
            "gross_margin": margin,
            "units": int(r.units or 0),
            "orders": int(r.orders or 0),
            "revenue_share": round((rev / total_rev) * 100.0, 2),
        })
    return categories
