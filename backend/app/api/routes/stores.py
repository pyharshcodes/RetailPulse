"""
Store Performance REST API routes.
Delivers store rankings, individual store deep-dive details, and multi-store comparison side-by-side.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from backend.app.core.database import get_db
from backend.app.core.filters import FilterParams, get_filter_params, apply_transaction_filters, get_previous_period_dates
from backend.app.models.transaction import Transaction
from backend.app.models.store import Store
from backend.app.models.target import Target

router = APIRouter(prefix="/stores", tags=["Stores"])

@router.get("")
def get_stores_overview(
    filters: FilterParams = Depends(get_filter_params),
    sort_by: str = Query("revenue", description="Sort by: revenue, growth, margin, achievement"),
    order: str = Query("desc", description="asc or desc"),
    db: Session = Depends(get_db)
):
    """Returns store rankings, achievement vs target, growth status, and summary KPIs."""
    prev_start, prev_end = get_previous_period_dates(filters.start_date, filters.end_date)
    start_month = (filters.start_date or "2026-01-01")[:7]
    end_month = (filters.end_date or "2026-12-31")[:7]

    # Current revenue by store
    curr_q = db.query(
        Transaction.store_id,
        Transaction.store_name,
        Transaction.city,
        Transaction.region,
        func.sum(Transaction.net_sales).label("revenue"),
        func.sum(Transaction.gross_profit).label("gross_profit"),
        func.count(distinct(Transaction.transaction_id)).label("orders"),
        func.sum(Transaction.quantity).label("units")
    )
    curr_q = apply_transaction_filters(curr_q, filters)
    curr_records = curr_q.group_by(
        Transaction.store_id, Transaction.store_name, Transaction.city, Transaction.region
    ).all()

    # Previous revenue by store
    prev_q = db.query(
        Transaction.store_id,
        func.sum(Transaction.net_sales).label("prev_revenue"),
    )
    prev_q = apply_transaction_filters(prev_q, filters, date_override=(prev_start, prev_end))
    prev_map = {r.store_id: float(r.prev_revenue or 0.0) for r in prev_q.group_by(Transaction.store_id).all()}

    # Targets by store
    t_q = db.query(
        Target.store_id,
        func.sum(Target.target_revenue).label("target_rev")
    ).filter(Target.month >= start_month, Target.month <= end_month).group_by(Target.store_id).all()
    target_map = {r.store_id: float(r.target_rev or 0.0) for r in t_q}

    stores_data = []
    above_target_count = 0
    below_target_count = 0

    for r in curr_records:
        rev = round(float(r.revenue or 0.0), 2)
        gp = round(float(r.gross_profit or 0.0), 2)
        orders = int(r.orders or 0)
        units = int(r.units or 0)
        margin = round((gp / rev) * 100.0, 2) if rev > 0 else 0.0
        aov = round(rev / orders, 2) if orders > 0 else 0.0

        prev_rev = prev_map.get(r.store_id, 0.0)
        growth = round(((rev - prev_rev) / prev_rev) * 100.0, 2) if prev_rev > 0 else 0.0

        target_rev = target_map.get(r.store_id, 0.0)
        achievement = round((rev / target_rev) * 100.0, 1) if target_rev > 0 else 0.0

        if achievement >= 100.0:
            status = "Above Target"
            above_target_count += 1
        elif achievement >= 90.0:
            status = "On Track"
        else:
            status = "Needs Attention"
            below_target_count += 1

        stores_data.append({
            "store_id": r.store_id,
            "store_name": r.store_name,
            "city": r.city,
            "region": r.region,
            "revenue": rev,
            "gross_profit": gp,
            "margin_percent": margin,
            "orders": orders,
            "units": units,
            "aov": aov,
            "growth": growth,
            "target": round(target_rev, 2),
            "achievement": achievement,
            "status": status,
        })

    # Sort
    reverse = (order == "desc")
    sort_key_map = {
        "revenue": lambda x: x["revenue"],
        "growth": lambda x: x["growth"],
        "margin": lambda x: x["margin_percent"],
        "achievement": lambda x: x["achievement"],
    }
    key_func = sort_key_map.get(sort_by, sort_key_map["revenue"])
    stores_data.sort(key=key_func, reverse=reverse)

    best_store = max(stores_data, key=lambda x: x["achievement"])["store_name"] if stores_data else "N/A"
    lowest_store = min(stores_data, key=lambda x: x["achievement"])["store_name"] if stores_data else "N/A"

    return {
        "kpis": {
            "total_stores": len(stores_data),
            "stores_above_target": above_target_count,
            "stores_below_target": below_target_count,
            "best_store": best_store,
            "lowest_performing_store": lowest_store,
        },
        "stores": stores_data,
    }

@router.get("/compare")
def compare_stores(
    store_ids: str = Query(..., description="Comma-separated store IDs, e.g. STR-DEL-01,STR-AGR-06"),
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Compares 2 to 4 selected stores side-by-side across key dimensions."""
    ids = [s.strip() for s in store_ids.split(",") if s.strip()]
    if len(ids) < 2 or len(ids) > 4:
        raise HTTPException(status_code=400, detail="Please select between 2 and 4 stores to compare.")

    prev_start, prev_end = get_previous_period_dates(filters.start_date, filters.end_date)
    start_month = (filters.start_date or "2026-01-01")[:7]
    end_month = (filters.end_date or "2026-12-31")[:7]

    results = []
    for s_id in ids:
        store_obj = db.query(Store).filter(Store.store_id == s_id).first()
        if not store_obj:
            continue

        # Current
        curr = db.query(
            func.sum(Transaction.net_sales).label("rev"),
            func.sum(Transaction.gross_profit).label("gp"),
            func.count(distinct(Transaction.transaction_id)).label("orders"),
            func.sum(Transaction.quantity).label("units")
        ).filter(
            Transaction.store_id == s_id,
            Transaction.transaction_date >= (filters.start_date or "2026-01-01"),
            Transaction.transaction_date <= (filters.end_date or "2026-12-31")
        ).one()

        rev = round(float(curr.rev or 0.0), 2)
        gp = round(float(curr.gp or 0.0), 2)
        orders = int(curr.orders or 0)
        margin = round((gp / rev) * 100.0, 2) if rev > 0 else 0.0
        aov = round(rev / orders, 2) if orders > 0 else 0.0

        # Previous
        prev_rev = db.query(func.sum(Transaction.net_sales)).filter(
            Transaction.store_id == s_id,
            Transaction.transaction_date >= prev_start,
            Transaction.transaction_date <= prev_end
        ).scalar() or 0.0
        growth = round(((rev - prev_rev) / prev_rev) * 100.0, 2) if prev_rev > 0 else 0.0

        # Target
        target_rev = db.query(func.sum(Target.target_revenue)).filter(
            Target.store_id == s_id,
            Target.month >= start_month,
            Target.month <= end_month
        ).scalar() or 0.0
        achievement = round((rev / target_rev) * 100.0, 1) if target_rev > 0 else 0.0

        results.append({
            "store_id": s_id,
            "store_name": store_obj.store_name,
            "city": store_obj.city,
            "region": store_obj.region,
            "tier": store_obj.tier,
            "square_feet": store_obj.square_feet,
            "revenue": rev,
            "gross_profit": gp,
            "margin_percent": margin,
            "orders": orders,
            "aov": aov,
            "growth": growth,
            "target": round(target_rev, 2),
            "achievement": achievement,
        })

    return {"comparison": results}

@router.get("/{store_id}")
def get_store_detail(
    store_id: str,
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Deep-dive analytics for a single store location."""
    store_obj = db.query(Store).filter(Store.store_id == store_id).first()
    if not store_obj:
        raise HTTPException(status_code=404, detail=f"Store {store_id} not found.")

    # Override store_id filter for store detail
    filters.store_id = store_id

    # Store KPIs
    curr = db.query(
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.gross_profit).label("gp"),
        func.count(distinct(Transaction.transaction_id)).label("orders"),
        func.sum(Transaction.quantity).label("units")
    ).filter(
        Transaction.store_id == store_id,
        Transaction.transaction_date >= (filters.start_date or "2026-01-01"),
        Transaction.transaction_date <= (filters.end_date or "2026-12-31")
    ).one()

    rev = round(float(curr.rev or 0.0), 2)
    gp = round(float(curr.gp or 0.0), 2)
    orders = int(curr.orders or 0)
    units = int(curr.units or 0)
    margin = round((gp / rev) * 100.0, 2) if rev > 0 else 0.0
    aov = round(rev / orders, 2) if orders > 0 else 0.0

    # Monthly Trend for this store
    trend_q = db.query(
        func.substr(Transaction.transaction_date, 1, 7).label("month"),
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.gross_profit).label("gp")
    ).filter(
        Transaction.store_id == store_id,
        Transaction.transaction_date >= (filters.start_date or "2026-01-01"),
        Transaction.transaction_date <= (filters.end_date or "2026-12-31")
    ).group_by(func.substr(Transaction.transaction_date, 1, 7)).order_by(func.substr(Transaction.transaction_date, 1, 7).asc()).all()

    trend = [
        {"month": r.month, "revenue": round(float(r.rev or 0.0), 2), "gross_profit": round(float(r.gp or 0.0), 2)}
        for r in trend_q
    ]

    # Category Mix
    cat_q = db.query(
        Transaction.category,
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.gross_profit).label("gp")
    ).filter(
        Transaction.store_id == store_id,
        Transaction.transaction_date >= (filters.start_date or "2026-01-01"),
        Transaction.transaction_date <= (filters.end_date or "2026-12-31")
    ).group_by(Transaction.category).order_by(func.sum(Transaction.net_sales).desc()).all()

    category_mix = [
        {
            "category": c.category,
            "revenue": round(float(c.rev or 0.0), 2),
            "gross_profit": round(float(c.gp or 0.0), 2),
            "margin_percent": round((float(c.gp or 0.0) / float(c.rev or 1.0)) * 100.0, 1) if float(c.rev or 0.0) > 0 else 0.0
        }
        for c in cat_q
    ]

    # Top 5 Products
    prod_q = db.query(
        Transaction.product_name,
        Transaction.category,
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.quantity).label("units")
    ).filter(
        Transaction.store_id == store_id,
        Transaction.transaction_date >= (filters.start_date or "2026-01-01"),
        Transaction.transaction_date <= (filters.end_date or "2026-12-31")
    ).group_by(Transaction.product_name, Transaction.category).order_by(func.sum(Transaction.net_sales).desc()).limit(5).all()

    top_products = [
        {"product_name": p.product_name, "category": p.category, "revenue": round(float(p.rev or 0.0), 2), "units": int(p.units or 0)}
        for p in prod_q
    ]

    return {
        "store": {
            "store_id": store_obj.store_id,
            "store_name": store_obj.store_name,
            "city": store_obj.city,
            "state": store_obj.state,
            "region": store_obj.region,
            "tier": store_obj.tier,
            "square_feet": store_obj.square_feet,
        },
        "kpis": {
            "revenue": rev,
            "gross_profit": gp,
            "margin_percent": margin,
            "orders": orders,
            "units": units,
            "aov": aov,
        },
        "trend": trend,
        "category_mix": category_mix,
        "top_products": top_products,
    }
