"""
Customer Intelligence REST API routes.
Delivers customer KPIs, RFM segmentation, customer retention cohort matrix, and top customer accounts.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from backend.app.core.database import get_db
from backend.app.core.filters import FilterParams, get_filter_params, apply_transaction_filters
from backend.app.models.transaction import Transaction
from backend.app.models.customer import Customer
from backend.app.services.rfm_segmentation import calculate_customer_overview, get_rfm_segmentation, get_retention_cohort

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("")
def get_customer_analytics(
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Returns customer overview KPIs, RFM segmentation segments, and retention cohort matrix."""
    overview = calculate_customer_overview(db, filters)
    rfm = get_rfm_segmentation(db, filters)
    cohort = get_retention_cohort(db)

    # Top 15 Customer Accounts
    top_cust_q = db.query(
        Transaction.customer_id,
        Transaction.customer_type,
        func.max(Transaction.city).label("city"),
        func.sum(Transaction.net_sales).label("total_spent"),
        func.count(distinct(Transaction.transaction_id)).label("orders"),
        func.max(Transaction.transaction_date).label("last_purchase")
    )
    top_cust_q = apply_transaction_filters(top_cust_q, filters)
    top_cust_q = top_cust_q.group_by(
        Transaction.customer_id, Transaction.customer_type
    ).order_by(func.sum(Transaction.net_sales).desc()).limit(15)

    top_customers = []
    # Fetch names from Customer table
    cust_ids = [r.customer_id for r in top_cust_q.all()]
    names_q = db.query(Customer.customer_id, Customer.customer_name).filter(Customer.customer_id.in_(cust_ids)).all()
    name_map = {c.customer_id: c.customer_name for c in names_q}

    for r in top_cust_q.all():
        top_customers.append({
            "customer_id": r.customer_id,
            "customer_name": name_map.get(r.customer_id, "Customer"),
            "customer_type": r.customer_type,
            "city": r.city,
            "total_spent": round(float(r.total_spent or 0.0), 2),
            "orders": int(r.orders or 0),
            "last_purchase": r.last_purchase,
        })

    return {
        "kpis": overview,
        "rfm": rfm,
        "retention_cohort": cohort,
        "top_customers": top_customers,
    }
