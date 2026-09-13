"""
Targets & Performance REST API routes.
Delivers Target vs Actual variance and achievement % by month, region, store, and category.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import get_db
from backend.app.core.filters import FilterParams, get_filter_params, apply_transaction_filters
from backend.app.models.transaction import Transaction
from backend.app.models.target import Target
from backend.app.models.store import Store

router = APIRouter(prefix="/targets", tags=["Targets"])

@router.get("")
def get_targets_performance(
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Returns actual vs target comparisons across months, stores, and categories."""
    start_month = (filters.start_date or "2026-01-01")[:7]
    end_month = (filters.end_date or "2026-12-31")[:7]

    # 1. Monthly Target vs Actual
    actual_monthly_q = db.query(
        func.substr(Transaction.transaction_date, 1, 7).label("month"),
        func.sum(Transaction.net_sales).label("actual_rev"),
        func.sum(Transaction.gross_profit).label("actual_gp"),
    )
    actual_monthly_q = apply_transaction_filters(actual_monthly_q, filters)
    actual_monthly = {
        r.month: {"rev": float(r.actual_rev or 0.0), "gp": float(r.actual_gp or 0.0)}
        for r in actual_monthly_q.group_by(func.substr(Transaction.transaction_date, 1, 7)).all()
    }

    target_monthly_q = db.query(
        Target.month,
        func.sum(Target.target_revenue).label("target_rev"),
        func.sum(Target.target_gross_profit).label("target_gp"),
    ).filter(Target.month >= start_month, Target.month <= end_month)
    if filters.store_id:
        target_monthly_q = target_monthly_q.filter(Target.store_id == filters.store_id)
    if filters.category:
        target_monthly_q = target_monthly_q.filter(Target.category == filters.category)
    target_monthly = {
        r.month: {"rev": float(r.target_rev or 0.0), "gp": float(r.target_gp or 0.0)}
        for r in target_monthly_q.group_by(Target.month).all()
    }

    all_months = sorted(list(set(actual_monthly.keys()).union(set(target_monthly.keys()))))
    monthly_targets = []
    total_act_rev, total_tgt_rev = 0.0, 0.0
    total_act_gp, total_tgt_gp = 0.0, 0.0

    for m in all_months:
        act_rev = actual_monthly.get(m, {}).get("rev", 0.0)
        tgt_rev = target_monthly.get(m, {}).get("rev", 0.0)
        act_gp = actual_monthly.get(m, {}).get("gp", 0.0)
        tgt_gp = target_monthly.get(m, {}).get("gp", 0.0)

        total_act_rev += act_rev
        total_tgt_rev += tgt_rev
        total_act_gp += act_gp
        total_tgt_gp += tgt_gp

        var_rev = act_rev - tgt_rev
        ach_rev = (act_rev / tgt_rev * 100.0) if tgt_rev > 0 else 0.0

        monthly_targets.append({
            "month": m,
            "actual_revenue": round(act_rev, 2),
            "target_revenue": round(tgt_rev, 2),
            "variance": round(var_rev, 2),
            "achievement_percent": round(ach_rev, 1),
            "actual_profit": round(act_gp, 2),
            "target_profit": round(tgt_gp, 2),
        })

    # 2. Store Target Breakdown
    store_act_q = db.query(
        Transaction.store_id,
        Transaction.store_name,
        func.sum(Transaction.net_sales).label("actual_rev"),
    )
    store_act_q = apply_transaction_filters(store_act_q, filters)
    store_act = {
        r.store_id: {"name": r.store_name, "rev": float(r.actual_rev or 0.0)}
        for r in store_act_q.group_by(Transaction.store_id, Transaction.store_name).all()
    }

    store_tgt_q = db.query(
        Target.store_id,
        func.sum(Target.target_revenue).label("target_rev")
    ).filter(Target.month >= start_month, Target.month <= end_month)
    if filters.category:
        store_tgt_q = store_tgt_q.filter(Target.category == filters.category)
    store_tgt = {r.store_id: float(r.target_rev or 0.0) for r in store_tgt_q.group_by(Target.store_id).all()}

    store_targets = []
    for s_id, s_info in store_act.items():
        act_rev = s_info["rev"]
        tgt_rev = store_tgt.get(s_id, 0.0)
        store_targets.append({
            "store_id": s_id,
            "store_name": s_info["name"],
            "actual_revenue": round(act_rev, 2),
            "target_revenue": round(tgt_rev, 2),
            "variance": round(act_rev - tgt_rev, 2),
            "achievement_percent": round((act_rev / tgt_rev * 100.0), 1) if tgt_rev > 0 else 0.0,
        })
    store_targets.sort(key=lambda x: x["achievement_percent"], reverse=True)

    # 3. Category Target Breakdown
    cat_act_q = db.query(
        Transaction.category,
        func.sum(Transaction.net_sales).label("actual_rev")
    )
    cat_act_q = apply_transaction_filters(cat_act_q, filters)
    cat_act = {r.category: float(r.actual_rev or 0.0) for r in cat_act_q.group_by(Transaction.category).all()}

    cat_tgt_q = db.query(
        Target.category,
        func.sum(Target.target_revenue).label("target_rev")
    ).filter(Target.month >= start_month, Target.month <= end_month)
    if filters.store_id:
        cat_tgt_q = cat_tgt_q.filter(Target.store_id == filters.store_id)
    cat_tgt = {r.category: float(r.target_rev or 0.0) for r in cat_tgt_q.group_by(Target.category).all()}

    category_targets = []
    for c_name, act_rev in cat_act.items():
        tgt_rev = cat_tgt.get(c_name, 0.0)
        category_targets.append({
            "category": c_name,
            "actual_revenue": round(act_rev, 2),
            "target_revenue": round(tgt_rev, 2),
            "variance": round(act_rev - tgt_rev, 2),
            "achievement_percent": round((act_rev / tgt_rev * 100.0), 1) if tgt_rev > 0 else 0.0,
        })
    category_targets.sort(key=lambda x: x["achievement_percent"], reverse=True)

    overall_ach = (total_act_rev / total_tgt_rev * 100.0) if total_tgt_rev > 0 else 0.0

    return {
        "summary": {
            "total_actual_revenue": round(total_act_rev, 2),
            "total_target_revenue": round(total_tgt_rev, 2),
            "overall_variance": round(total_act_rev - total_tgt_rev, 2),
            "overall_achievement_percent": round(overall_ach, 1),
        },
        "monthly_targets": monthly_targets,
        "store_targets": store_targets,
        "category_targets": category_targets,
    }
