"""
Product Intelligence REST API routes.
Delivers product performance rankings, Gross Margin vs Revenue Matrix, and product deep dives.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import get_db
from backend.app.core.filters import FilterParams, get_filter_params, apply_transaction_filters, get_previous_period_dates
from backend.app.models.transaction import Transaction
from backend.app.models.product import Product
from backend.app.models.inventory import Inventory

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("")
def get_products_catalog(
    search: Optional[str] = Query(None, description="Search product name or SKU"),
    sort_by: str = Query("revenue", description="Sort by: revenue, units, gross_profit, margin, growth"),
    order: str = Query("desc", description="asc or desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=200),
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Returns paginated product intelligence table with summary KPIs."""
    prev_start, prev_end = get_previous_period_dates(filters.start_date, filters.end_date)

    # Base current period query
    q = db.query(
        Transaction.product_id,
        Transaction.product_name,
        Transaction.category,
        Transaction.subcategory,
        func.sum(Transaction.net_sales).label("revenue"),
        func.sum(Transaction.gross_profit).label("gross_profit"),
        func.sum(Transaction.quantity).label("units")
    )
    q = apply_transaction_filters(q, filters)
    if search:
        q = q.filter(
            (Transaction.product_name.ilike(f"%{search}%")) |
            (Transaction.product_id.ilike(f"%{search}%"))
        )
    q = q.group_by(
        Transaction.product_id, Transaction.product_name, Transaction.category, Transaction.subcategory
    )
    all_current = q.all()

    # Previous period for growth
    prev_q = db.query(
        Transaction.product_id,
        func.sum(Transaction.net_sales).label("prev_revenue")
    )
    prev_q = apply_transaction_filters(prev_q, filters, date_override=(prev_start, prev_end))
    prev_map = {r.product_id: float(r.prev_revenue or 0.0) for r in prev_q.group_by(Transaction.product_id).all()}

    products_list = []
    for r in all_current:
        rev = round(float(r.revenue or 0.0), 2)
        gp = round(float(r.gross_profit or 0.0), 2)
        units = int(r.units or 0)
        margin = round((gp / rev) * 100.0, 2) if rev > 0 else 0.0
        prev_rev = prev_map.get(r.product_id, 0.0)
        growth = round(((rev - prev_rev) / prev_rev) * 100.0, 1) if prev_rev > 0 else 0.0

        products_list.append({
            "product_id": r.product_id,
            "product_name": r.product_name,
            "category": r.category,
            "subcategory": r.subcategory,
            "revenue": rev,
            "gross_profit": gp,
            "units": units,
            "margin_percent": margin,
            "growth": growth,
        })

    # Summary KPIs
    total_skus = len(products_list)
    top_rev_prod = max(products_list, key=lambda x: x["revenue"])["product_name"] if products_list else "N/A"
    top_margin_prod = max(products_list, key=lambda x: x["margin_percent"])["product_name"] if products_list else "N/A"
    fastest_growth_prod = max(products_list, key=lambda x: x["growth"])["product_name"] if products_list else "N/A"
    declining_count = sum(1 for p in products_list if p["growth"] < 0)

    # Sort
    reverse = (order == "desc")
    sort_key_map = {
        "revenue": lambda x: x["revenue"],
        "units": lambda x: x["units"],
        "gross_profit": lambda x: x["gross_profit"],
        "margin": lambda x: x["margin_percent"],
        "growth": lambda x: x["growth"],
    }
    key_fn = sort_key_map.get(sort_by, sort_key_map["revenue"])
    products_list.sort(key=key_fn, reverse=reverse)

    # Pagination
    offset = (page - 1) * limit
    paginated_items = products_list[offset : offset + limit]

    return {
        "kpis": {
            "total_skus": total_skus,
            "top_revenue_product": top_rev_prod,
            "top_margin_product": top_margin_prod,
            "fastest_growing_product": fastest_growth_prod,
            "declining_products_count": declining_count,
        },
        "pagination": {
            "total": total_skus,
            "page": page,
            "limit": limit,
            "pages": (total_skus + limit - 1) // limit if limit > 0 else 1,
        },
        "products": paginated_items,
    }

@router.get("/matrix")
def get_product_matrix(
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """
    Returns Product Performance Matrix (Scatter / Bubble Plot data).
    X-axis: Gross Margin %
    Y-axis: Net Sales Revenue
    Bubble Size: Units Sold
    """
    prev_start, prev_end = get_previous_period_dates(filters.start_date, filters.end_date)

    q = db.query(
        Transaction.product_id,
        Transaction.product_name,
        Transaction.category,
        func.sum(Transaction.net_sales).label("revenue"),
        func.sum(Transaction.gross_profit).label("gross_profit"),
        func.sum(Transaction.quantity).label("units")
    )
    q = apply_transaction_filters(q, filters)
    records = q.group_by(Transaction.product_id, Transaction.product_name, Transaction.category).all()

    prev_q = db.query(
        Transaction.product_id,
        func.sum(Transaction.net_sales).label("prev_rev")
    )
    prev_q = apply_transaction_filters(prev_q, filters, date_override=(prev_start, prev_end))
    prev_map = {r.product_id: float(r.prev_rev or 0.0) for r in prev_q.group_by(Transaction.product_id).all()}

    matrix_points = []
    for r in records:
        rev = round(float(r.revenue or 0.0), 2)
        gp = round(float(r.gross_profit or 0.0), 2)
        units = int(r.units or 0)
        margin = round((gp / rev) * 100.0, 2) if rev > 0 else 0.0
        prev_rev = prev_map.get(r.product_id, 0.0)
        growth = round(((rev - prev_rev) / prev_rev) * 100.0, 1) if prev_rev > 0 else 0.0

        matrix_points.append({
            "product_id": r.product_id,
            "product_name": r.product_name,
            "category": r.category,
            "revenue": rev,
            "gross_profit": gp,
            "margin_percent": margin,
            "units": units,
            "growth": growth,
        })

    return {"points": matrix_points}

@router.get("/{product_id}")
def get_product_detail(
    product_id: str,
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Deep dive on a specific product SKU."""
    prod = db.query(Product).filter(Product.product_id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found.")

    # Historical sales across months
    monthly_q = db.query(
        func.substr(Transaction.transaction_date, 1, 7).label("month"),
        func.sum(Transaction.net_sales).label("revenue"),
        func.sum(Transaction.quantity).label("units")
    ).filter(Transaction.product_id == product_id).group_by(func.substr(Transaction.transaction_date, 1, 7)).order_by(func.substr(Transaction.transaction_date, 1, 7).asc()).all()

    monthly_trend = [
        {"month": r.month, "revenue": round(float(r.revenue or 0.0), 2), "units": int(r.units or 0)}
        for r in monthly_q
    ]

    # Inventory distribution across stores
    inv_q = db.query(
        Inventory.store_id,
        Inventory.closing_inventory,
        Inventory.stock_status,
        Inventory.aging_bucket,
        Inventory.days_since_last_sale,
    ).filter(Inventory.product_id == product_id).all()

    store_inventory = [
        {
            "store_id": inv.store_id,
            "closing_inventory": inv.closing_inventory,
            "stock_status": inv.stock_status,
            "aging_bucket": inv.aging_bucket,
            "days_since_last_sale": inv.days_since_last_sale,
        }
        for inv in inv_q
    ]

    return {
        "product": {
            "product_id": prod.product_id,
            "product_name": prod.product_name,
            "category": prod.category,
            "subcategory": prod.subcategory,
            "brand": prod.brand,
            "unit_cost": prod.unit_cost,
            "selling_price": prod.selling_price,
            "reorder_point": prod.reorder_point,
            "target_margin_percent": prod.target_margin_percent,
        },
        "monthly_trend": monthly_trend,
        "store_inventory": store_inventory,
    }
