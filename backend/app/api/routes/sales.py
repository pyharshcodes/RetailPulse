"""
Sales Analytics REST API routes.
Delivers interactive sales trends (daily, weekly, monthly), sales channels, payment methods,
and day-of-week sales heatmaps.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from backend.app.core.database import get_db
from backend.app.core.filters import FilterParams, get_filter_params, apply_transaction_filters
from backend.app.models.transaction import Transaction
from backend.app.services.analytics_engine import calculate_kpis

router = APIRouter(prefix="/sales", tags=["Sales"])

@router.get("")
def get_sales_analytics(
    interval: str = Query("monthly", description="Trend interval: daily, weekly, monthly"),
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Returns comprehensive sales metrics, trendlines, channels, and payment breakdown."""
    kpis = calculate_kpis(db, filters)

    # 1. Sales Trend
    if interval == "daily":
        group_expr = Transaction.transaction_date
    elif interval == "weekly":
        # Approximate week or 7-day truncation
        group_expr = func.substr(Transaction.transaction_date, 1, 10)
    else:
        group_expr = func.substr(Transaction.transaction_date, 1, 7)

    trend_q = db.query(
        group_expr.label("period"),
        func.sum(Transaction.net_sales).label("revenue"),
        func.sum(Transaction.gross_profit).label("gross_profit"),
        func.count(distinct(Transaction.transaction_id)).label("orders"),
        func.sum(Transaction.quantity).label("units"),
        func.sum(Transaction.discount_amount).label("discounts"),
    )
    trend_q = apply_transaction_filters(trend_q, filters)
    trend_q = trend_q.group_by(group_expr).order_by(group_expr.asc())
    trend_records = trend_q.all()

    trend = []
    for r in trend_records:
        rev = round(float(r.revenue or 0.0), 2)
        gp = round(float(r.gross_profit or 0.0), 2)
        orders = int(r.orders or 0)
        units = int(r.units or 0)
        aov = round(rev / orders, 2) if orders > 0 else 0.0
        margin = round((gp / rev) * 100.0, 2) if rev > 0 else 0.0
        trend.append({
            "period": str(r.period),
            "revenue": rev,
            "gross_profit": gp,
            "orders": orders,
            "units": units,
            "aov": aov,
            "margin_percent": margin,
            "discounts": round(float(r.discounts or 0.0), 2),
        })

    # 2. Sales Channels Breakdown
    chan_q = db.query(
        Transaction.sales_channel,
        func.sum(Transaction.net_sales).label("revenue"),
        func.count(distinct(Transaction.transaction_id)).label("orders"),
        func.sum(Transaction.gross_profit).label("gross_profit")
    )
    chan_q = apply_transaction_filters(chan_q, filters)
    chan_results = chan_q.group_by(Transaction.sales_channel).all()
    
    total_chan_rev = sum(float(r.revenue or 0.0) for r in chan_results) or 1.0
    channels = []
    for r in chan_results:
        rev = round(float(r.revenue or 0.0), 2)
        channels.append({
            "channel": r.sales_channel,
            "revenue": rev,
            "orders": int(r.orders or 0),
            "revenue_share": round((rev / total_chan_rev) * 100.0, 2),
            "gross_profit": round(float(r.gross_profit or 0.0), 2),
        })

    # 3. Payment Methods Breakdown
    pm_q = db.query(
        Transaction.payment_method,
        func.sum(Transaction.net_sales).label("revenue"),
        func.count(distinct(Transaction.transaction_id)).label("orders")
    )
    pm_q = apply_transaction_filters(pm_q, filters)
    pm_results = pm_q.group_by(Transaction.payment_method).all()

    total_pm_rev = sum(float(r.revenue or 0.0) for r in pm_results) or 1.0
    payment_methods = []
    for r in pm_results:
        rev = round(float(r.revenue or 0.0), 2)
        payment_methods.append({
            "method": r.payment_method,
            "revenue": rev,
            "orders": int(r.orders or 0),
            "share_percent": round((rev / total_pm_rev) * 100.0, 2)
        })

    return {
        "kpis": kpis,
        "interval": interval,
        "trend": trend,
        "channels": channels,
        "payment_methods": payment_methods,
    }
