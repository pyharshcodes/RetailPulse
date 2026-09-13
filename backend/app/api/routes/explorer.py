"""
Data Explorer REST API routes.
Delivers paginated, searchable, sortable raw transaction data with column visibility and metadata.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from backend.app.core.database import get_db
from backend.app.core.filters import FilterParams, get_filter_params, apply_transaction_filters
from backend.app.models.transaction import Transaction

router = APIRouter(prefix="/explorer", tags=["Data Explorer"])

@router.get("")
def query_transactions_explorer(
    search: Optional[str] = Query(None, description="Free text search on ID, product, store, customer"),
    sort_by: str = Query("transaction_date", description="Column to sort by"),
    order: str = Query("desc", description="asc or desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Returns paginated, searchable, and sortable transactions table."""
    q = db.query(Transaction)
    q = apply_transaction_filters(q, filters)

    if search:
        s = f"%{search}%"
        q = q.filter(
            (Transaction.transaction_id.ilike(s)) |
            (Transaction.product_name.ilike(s)) |
            (Transaction.store_name.ilike(s)) |
            (Transaction.customer_id.ilike(s)) |
            (Transaction.city.ilike(s))
        )

    total_count = q.count()

    # Column sort mapping
    col_map = {
        "transaction_date": Transaction.transaction_date,
        "transaction_id": Transaction.transaction_id,
        "store_name": Transaction.store_name,
        "product_name": Transaction.product_name,
        "category": Transaction.category,
        "quantity": Transaction.quantity,
        "unit_price": Transaction.unit_price,
        "net_sales": Transaction.net_sales,
        "gross_profit": Transaction.gross_profit,
        "gross_margin_percent": Transaction.gross_margin_percent,
    }
    sort_col = col_map.get(sort_by, Transaction.transaction_date)
    sort_expr = desc(sort_col) if order == "desc" else asc(sort_col)

    offset = (page - 1) * limit
    records = q.order_by(sort_expr).offset(offset).limit(limit).all()

    items = []
    for t in records:
        items.append({
            "id": t.id,
            "transaction_id": t.transaction_id,
            "transaction_date": t.transaction_date,
            "store_id": t.store_id,
            "store_name": t.store_name,
            "city": t.city,
            "state": t.state,
            "region": t.region,
            "customer_id": t.customer_id,
            "customer_type": t.customer_type,
            "product_id": t.product_id,
            "product_name": t.product_name,
            "category": t.category,
            "subcategory": t.subcategory,
            "quantity": t.quantity,
            "unit_price": t.unit_price,
            "discount_percent": t.discount_percent,
            "gross_sales": t.gross_sales,
            "discount_amount": t.discount_amount,
            "net_sales": t.net_sales,
            "cost": t.cost,
            "gross_profit": t.gross_profit,
            "gross_margin_percent": t.gross_margin_percent,
            "payment_method": t.payment_method,
            "sales_channel": t.sales_channel,
        })

    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": (total_count + limit - 1) // limit if limit > 0 else 1,
        "items": items,
    }
