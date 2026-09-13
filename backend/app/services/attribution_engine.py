"""
Deterministic Metric Attribution Engine ("Why Did This Change?").
Decomposes revenue, gross profit, or order changes between the current and previous period
into exact category, regional, and store variance contributors.
"""

from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.transaction import Transaction
from backend.app.core.filters import FilterParams, apply_transaction_filters, get_previous_period_dates

def explain_metric_change(db: Session, filters: FilterParams, metric: str = "revenue") -> Dict[str, Any]:
    """
    Decomposes variance into dimension contributions.
    metric can be: 'revenue', 'gross_profit', 'orders', 'units'.
    """
    prev_start, prev_end = get_previous_period_dates(filters.start_date, filters.end_date)
    
    col_map = {
        "revenue": Transaction.net_sales,
        "gross_profit": Transaction.gross_profit,
        "units": Transaction.quantity,
    }
    target_col = col_map.get(metric, Transaction.net_sales)

    # 1. Category contribution
    curr_cat = db.query(
        Transaction.category,
        func.sum(target_col).label("curr_val")
    )
    curr_cat = apply_transaction_filters(curr_cat, filters)
    curr_cat = {r.category: float(r.curr_val or 0.0) for r in curr_cat.group_by(Transaction.category).all()}

    prev_cat = db.query(
        Transaction.category,
        func.sum(target_col).label("prev_val")
    )
    prev_cat = apply_transaction_filters(prev_cat, filters, date_override=(prev_start, prev_end))
    prev_cat = {r.category: float(r.prev_val or 0.0) for r in prev_cat.group_by(Transaction.category).all()}

    all_cats = set(curr_cat.keys()).union(set(prev_cat.keys()))
    cat_deltas = []
    for c in all_cats:
        c_curr = curr_cat.get(c, 0.0)
        c_prev = prev_cat.get(c, 0.0)
        delta = c_curr - c_prev
        pct = ((delta / c_prev) * 100.0) if c_prev > 0 else 0.0
        cat_deltas.append({
            "name": c,
            "current": round(c_curr, 2),
            "previous": round(c_prev, 2),
            "delta": round(delta, 2),
            "pct_change": round(pct, 2)
        })
    cat_deltas.sort(key=lambda x: abs(x["delta"]), reverse=True)

    # 2. Regional contribution
    curr_reg = db.query(
        Transaction.region,
        func.sum(target_col).label("curr_val")
    )
    curr_reg = apply_transaction_filters(curr_reg, filters)
    curr_reg = {r.region: float(r.curr_val or 0.0) for r in curr_reg.group_by(Transaction.region).all()}

    prev_reg = db.query(
        Transaction.region,
        func.sum(target_col).label("prev_val")
    )
    prev_reg = apply_transaction_filters(prev_reg, filters, date_override=(prev_start, prev_end))
    prev_reg = {r.region: float(r.prev_val or 0.0) for r in prev_reg.group_by(Transaction.region).all()}

    all_regs = set(curr_reg.keys()).union(set(prev_reg.keys()))
    reg_deltas = []
    for r in all_regs:
        r_curr = curr_reg.get(r, 0.0)
        r_prev = prev_reg.get(r, 0.0)
        delta = r_curr - r_prev
        pct = ((delta / r_prev) * 100.0) if r_prev > 0 else 0.0
        reg_deltas.append({
            "name": r,
            "current": round(r_curr, 2),
            "previous": round(r_prev, 2),
            "delta": round(delta, 2),
            "pct_change": round(pct, 2)
        })
    reg_deltas.sort(key=lambda x: abs(x["delta"]), reverse=True)

    # 3. Store contribution
    curr_str = db.query(
        Transaction.store_name,
        func.sum(target_col).label("curr_val")
    )
    curr_str = apply_transaction_filters(curr_str, filters)
    curr_str = {r.store_name: float(r.curr_val or 0.0) for r in curr_str.group_by(Transaction.store_name).all()}

    prev_str = db.query(
        Transaction.store_name,
        func.sum(target_col).label("prev_val")
    )
    prev_str = apply_transaction_filters(prev_str, filters, date_override=(prev_start, prev_end))
    prev_str = {r.store_name: float(r.prev_val or 0.0) for r in prev_str.group_by(Transaction.store_name).all()}

    all_stores = set(curr_str.keys()).union(set(prev_str.keys()))
    store_deltas = []
    for s in all_stores:
        s_curr = curr_str.get(s, 0.0)
        s_prev = prev_str.get(s, 0.0)
        delta = s_curr - s_prev
        pct = ((delta / s_prev) * 100.0) if s_prev > 0 else 0.0
        store_deltas.append({
            "name": s,
            "current": round(s_curr, 2),
            "previous": round(s_prev, 2),
            "delta": round(delta, 2),
            "pct_change": round(pct, 2)
        })
    store_deltas.sort(key=lambda x: abs(x["delta"]), reverse=True)

    total_curr = sum(curr_cat.values())
    total_prev = sum(prev_cat.values())
    total_delta = total_curr - total_prev
    total_pct = ((total_delta / total_prev) * 100.0) if total_prev > 0 else 0.0

    return {
        "metric": metric,
        "total_current": round(total_curr, 2),
        "total_previous": round(total_prev, 2),
        "total_delta": round(total_delta, 2),
        "total_pct_change": round(total_pct, 2),
        "category_contributors": cat_deltas[:5],
        "regional_contributors": reg_deltas[:5],
        "store_contributors": store_deltas[:5],
    }
