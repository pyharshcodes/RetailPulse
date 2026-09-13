"""
Profitability Intelligence REST API routes.
Delivers waterfall breakdown (Revenue -> COGS -> Gross Profit), margin analysis by dimension,
and highlights products in the High Revenue / Low Margin quadrant.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import get_db
from backend.app.core.filters import FilterParams, get_filter_params, apply_transaction_filters
from backend.app.models.transaction import Transaction

router = APIRouter(prefix="/profitability", tags=["Profitability"])

@router.get("")
def get_profitability_analytics(
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Returns profitability waterfall, margin by dimension, and high-revenue low-margin analysis."""
    # 1. High-level financial totals
    q = db.query(
        func.sum(Transaction.net_sales).label("revenue"),
        func.sum(Transaction.cost).label("cogs"),
        func.sum(Transaction.gross_profit).label("gross_profit"),
    )
    q = apply_transaction_filters(q, filters)
    totals = q.one()

    revenue = round(float(totals.revenue or 0.0), 2)
    cogs = round(float(totals.cogs or 0.0), 2)
    gross_profit = round(float(totals.gross_profit or 0.0), 2)
    margin_percent = round((gross_profit / revenue) * 100.0, 2) if revenue > 0 else 0.0

    # Waterfall elements
    waterfall = [
        {"name": "Net Revenue", "value": revenue, "type": "total"},
        {"name": "Cost of Goods Sold (COGS)", "value": -cogs, "type": "deduction"},
        {"name": "Gross Profit", "value": gross_profit, "type": "subtotal"},
    ]

    # 2. Profitability by Category
    cat_q = db.query(
        Transaction.category,
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.cost).label("cogs"),
        func.sum(Transaction.gross_profit).label("gp"),
    )
    cat_q = apply_transaction_filters(cat_q, filters)
    cat_records = cat_q.group_by(Transaction.category).order_by(func.sum(Transaction.gross_profit).desc()).all()

    by_category = []
    for c in cat_records:
        c_rev = float(c.rev or 0.0)
        c_cogs = float(c.cogs or 0.0)
        c_gp = float(c.gp or 0.0)
        by_category.append({
            "category": c.category,
            "revenue": round(c_rev, 2),
            "cogs": round(c_cogs, 2),
            "gross_profit": round(c_gp, 2),
            "margin_percent": round((c_gp / c_rev) * 100.0, 2) if c_rev > 0 else 0.0,
        })

    # 3. Profitability by Region
    reg_q = db.query(
        Transaction.region,
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.cost).label("cogs"),
        func.sum(Transaction.gross_profit).label("gp"),
    )
    reg_q = apply_transaction_filters(reg_q, filters)
    reg_records = reg_q.group_by(Transaction.region).order_by(func.sum(Transaction.gross_profit).desc()).all()

    by_region = []
    for r in reg_records:
        r_rev = float(r.rev or 0.0)
        r_cogs = float(r.cogs or 0.0)
        r_gp = float(r.gp or 0.0)
        by_region.append({
            "region": r.region,
            "revenue": round(r_rev, 2),
            "cogs": round(r_cogs, 2),
            "gross_profit": round(r_gp, 2),
            "margin_percent": round((r_gp / r_rev) * 100.0, 2) if r_rev > 0 else 0.0,
        })

    # 4. High Revenue + Low Margin Products Analysis
    # Products with top 25% revenue but bottom 33% gross margin
    prod_q = db.query(
        Transaction.product_id,
        Transaction.product_name,
        Transaction.category,
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.cost).label("cogs"),
        func.sum(Transaction.gross_profit).label("gp"),
        func.sum(Transaction.quantity).label("units")
    )
    prod_q = apply_transaction_filters(prod_q, filters)
    prod_records = prod_q.group_by(
        Transaction.product_id, Transaction.product_name, Transaction.category
    ).all()

    all_prods = []
    for p in prod_records:
        p_rev = float(p.rev or 0.0)
        p_gp = float(p.gp or 0.0)
        p_margin = (p_gp / p_rev * 100.0) if p_rev > 0 else 0.0
        all_prods.append({
            "product_id": p.product_id,
            "product_name": p.product_name,
            "category": p.category,
            "revenue": round(p_rev, 2),
            "gross_profit": round(p_gp, 2),
            "margin_percent": round(p_margin, 2),
            "units": int(p.units or 0),
        })

    # Dynamic calculation of High-Revenue Low-Margin quadrant
    high_rev_threshold = sorted([p["revenue"] for p in all_prods], reverse=True)[len(all_prods) // 4] if all_prods else 0.0
    overall_margin = margin_percent

    high_rev_low_margin = [
        p for p in all_prods 
        if p["revenue"] >= high_rev_threshold and p["margin_percent"] < (overall_margin * 0.85)
    ]
    high_rev_low_margin.sort(key=lambda x: x["revenue"], reverse=True)

    return {
        "kpis": {
            "net_revenue": revenue,
            "cogs": cogs,
            "gross_profit": gross_profit,
            "gross_margin_percent": margin_percent,
        },
        "waterfall": waterfall,
        "by_category": by_category,
        "by_region": by_region,
        "high_revenue_low_margin": high_rev_low_margin[:10],
    }
