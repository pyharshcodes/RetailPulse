"""
Factual Business Highlights Generator.
Extracts 4-6 high-impact factual insights directly from computed metrics.
Zero fabrication — every statement is backed by verifiable arithmetic.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.transaction import Transaction
from backend.app.models.inventory import Inventory
from backend.app.core.filters import FilterParams, apply_transaction_filters

def generate_business_highlights(db: Session, filters: FilterParams) -> List[Dict[str, Any]]:
    highlights = []

    # 1. Total revenue & top category
    cat_q = db.query(
        Transaction.category,
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.gross_profit).label("gp"),
    )
    cat_q = apply_transaction_filters(cat_q, filters)
    cat_results = cat_q.group_by(Transaction.category).order_by(func.sum(Transaction.net_sales).desc()).all()

    if cat_results:
        total_rev = sum(float(r.rev or 0.0) for r in cat_results)
        top_cat = cat_results[0]
        top_cat_share = round((float(top_cat.rev or 0.0) / total_rev) * 100.0, 1) if total_rev > 0 else 0.0
        
        # Find category with highest margin
        best_margin_cat = max(
            cat_results, 
            key=lambda x: (float(x.gp or 0.0) / float(x.rev or 1.0)) if float(x.rev or 0.0) > 0 else 0.0
        )
        best_margin_pct = round((float(best_margin_cat.gp or 0.0) / float(best_margin_cat.rev or 1.0)) * 100.0, 1)

        highlights.append({
            "type": "category_leader",
            "title": f"Category Leadership: {top_cat.category}",
            "text": f"{top_cat.category} is the largest revenue generator, driving {top_cat_share}% of total network sales.",
            "impact": "neutral"
        })

        highlights.append({
            "type": "margin_efficiency",
            "title": f"Highest Margin Efficiency: {best_margin_cat.category}",
            "text": f"{best_margin_cat.category} achieved the highest profitability with a {best_margin_pct}% gross margin.",
            "impact": "positive"
        })

    # 2. Store concentration
    store_q = db.query(
        Transaction.store_name,
        func.sum(Transaction.net_sales).label("rev")
    )
    store_q = apply_transaction_filters(store_q, filters)
    store_results = store_q.group_by(Transaction.store_name).order_by(func.sum(Transaction.net_sales).desc()).all()

    if len(store_results) >= 3:
        total_store_rev = sum(float(r.rev or 0.0) for r in store_results)
        top3_rev = sum(float(r.rev or 0.0) for r in store_results[:3])
        top3_share = round((top3_rev / total_store_rev) * 100.0, 1) if total_store_rev > 0 else 0.0
        top_store_name = store_results[0].store_name

        highlights.append({
            "type": "store_concentration",
            "title": "Top 3 Store Concentration",
            "text": f"The top 3 locations (led by {top_store_name}) account for {top3_share}% of total revenue.",
            "impact": "neutral"
        })

    # 3. Regional growth / volume leader
    reg_q = db.query(
        Transaction.region,
        func.sum(Transaction.net_sales).label("rev"),
    )
    reg_q = apply_transaction_filters(reg_q, filters)
    reg_results = reg_q.group_by(Transaction.region).order_by(func.sum(Transaction.net_sales).desc()).all()

    if reg_results:
        top_reg = reg_results[0]
        total_reg_rev = sum(float(r.rev or 0.0) for r in reg_results)
        reg_share = round((float(top_reg.rev or 0.0) / total_reg_rev) * 100.0, 1) if total_reg_rev > 0 else 0.0
        highlights.append({
            "type": "regional_dominance",
            "title": f"Regional Benchmark: {top_reg.region} Region",
            "text": f"The {top_reg.region} region dominates performance, contributing {reg_share}% of total net sales.",
            "impact": "positive"
        })

    # 4. Inventory health warning
    aging_val = db.query(func.sum(Inventory.total_value)).filter(Inventory.aging_bucket == "90+ days").scalar() or 0.0
    total_inv_val = db.query(func.sum(Inventory.total_value)).scalar() or 1.0
    aging_pct = round((float(aging_val) / float(total_inv_val)) * 100.0, 1)

    if aging_pct > 0:
        highlights.append({
            "type": "inventory_risk",
            "title": "Aging Inventory Capital Allocation",
            "text": f"₹{aging_val/10000000.0:.2f} Cr ({aging_pct}% of total inventory value) is tied up in stock aged beyond 90 days.",
            "impact": "negative" if aging_pct > 10 else "warning"
        })

    return highlights
