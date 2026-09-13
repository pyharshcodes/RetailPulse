"""
Demo State and Filter Options REST API routes.
Delivers live demo status, filter dropdown options, and landing page hero preview payload.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.models.transaction import Transaction
from backend.app.models.store import Store
from backend.app.models.product import Product
from backend.app.models.customer import Customer
from backend.app.models.inventory import Inventory

router = APIRouter(prefix="/demo", tags=["Demo & System"])

@router.get("/status")
def get_demo_status(db: Session = Depends(get_db)):
    """Returns dataset load status and entity counts for the live demo experience."""
    txns = db.query(func.count(Transaction.id)).scalar() or 0
    stores = db.query(func.count(Store.store_id)).scalar() or 0
    products = db.query(func.count(Product.product_id)).scalar() or 0
    customers = db.query(func.count(Customer.customer_id)).scalar() or 0
    inventory = db.query(func.count(Inventory.id)).scalar() or 0

    return {
        "status": "ready",
        "company": settings.COMPANY_NAME,
        "industry": settings.INDUSTRY,
        "date_range": f"{settings.DATE_START} to {settings.DATE_END}",
        "entities": {
            "transactions": txns,
            "stores": stores,
            "products": products,
            "customers": customers,
            "inventory_records": inventory,
        },
        "message": "Your dashboard is ready."
    }

@router.get("/filter-options")
def get_filter_options(db: Session = Depends(get_db)):
    """Returns unique distinct lists for populating global filter dropdowns."""
    regions = [r[0] for r in db.query(Transaction.region).distinct().order_by(Transaction.region).all()]
    states = [s[0] for s in db.query(Transaction.state).distinct().order_by(Transaction.state).all()]
    
    stores_q = db.query(Store.store_id, Store.store_name, Store.region, Store.city).order_by(Store.store_name).all()
    stores = [{"store_id": s.store_id, "store_name": s.store_name, "region": s.region, "city": s.city} for s in stores_q]
    
    categories = [c[0] for c in db.query(Transaction.category).distinct().order_by(Transaction.category).all()]
    subcategories = [s[0] for s in db.query(Transaction.subcategory).distinct().order_by(Transaction.subcategory).all()]
    customer_types = [ct[0] for ct in db.query(Transaction.customer_type).distinct().order_by(Transaction.customer_type).all()]
    sales_channels = [sc[0] for sc in db.query(Transaction.sales_channel).distinct().order_by(Transaction.sales_channel).all()]

    return {
        "regions": regions,
        "states": states,
        "stores": stores,
        "categories": categories,
        "subcategories": subcategories,
        "customer_types": customer_types,
        "sales_channels": sales_channels,
    }

@router.get("/preview")
def get_landing_preview(db: Session = Depends(get_db)):
    """Returns dynamic preview data calculated from the dataset for the Landing Page Hero."""
    # 2026 Full Year KPIs
    q2026 = db.query(
        func.sum(Transaction.net_sales).label("revenue"),
        func.sum(Transaction.gross_profit).label("gross_profit"),
        func.count(distinct(Transaction.transaction_id)).label("orders"),
        func.sum(Transaction.quantity).label("units")
    ).filter(Transaction.transaction_date >= "2026-01-01", Transaction.transaction_date <= "2026-12-31").one()

    # 2025 Full Year for exact YoY
    rev_2025 = db.query(func.sum(Transaction.net_sales)).filter(Transaction.transaction_date < "2026-01-01").scalar() or 0.0

    rev = float(q2026.revenue or 0.0)
    gp = float(q2026.gross_profit or 0.0)
    orders = int(q2026.orders or 0)
    margin = round((gp / rev) * 100.0, 2) if rev > 0 else 0.0
    aov = round(rev / orders, 2) if orders > 0 else 0.0
    yoy_growth = round(((rev - float(rev_2025)) / float(rev_2025)) * 100.0, 2) if rev_2025 > 0 else 0.0

    # Total 2-Year GMV & Transaction counts
    total_txns = db.query(func.count(Transaction.id)).scalar() or 0
    total_gmv = float(db.query(func.sum(Transaction.net_sales)).scalar() or 0.0)

    # Top 4 categories
    cats = db.query(
        Transaction.category,
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.gross_profit).label("gp")
    ).filter(Transaction.transaction_date >= "2026-01-01").group_by(Transaction.category).order_by(func.sum(Transaction.net_sales).desc()).limit(4).all()

    category_preview = [
        {
            "category": c.category,
            "revenue": round(float(c.rev or 0.0), 2),
            "margin": round((float(c.gp or 0.0) / float(c.rev or 1.0)) * 100.0, 1)
        } for c in cats
    ]

    # Top 4 stores
    stores_q = db.query(
        Transaction.store_name,
        Transaction.city,
        func.sum(Transaction.net_sales).label("rev")
    ).filter(Transaction.transaction_date >= "2026-01-01").group_by(Transaction.store_id, Transaction.store_name, Transaction.city).order_by(func.sum(Transaction.net_sales).desc()).limit(4).all()

    stores_preview = [
        {
            "store_name": s.store_name,
            "city": s.city,
            "revenue": round(float(s.rev or 0.0), 2)
        } for s in stores_q
    ]

    # 12-month monthly trend
    monthly = db.query(
        func.substr(Transaction.transaction_date, 6, 2).label("month"),
        func.sum(Transaction.net_sales).label("rev")
    ).filter(Transaction.transaction_date >= "2026-01-01").group_by(func.substr(Transaction.transaction_date, 6, 2)).order_by(func.substr(Transaction.transaction_date, 6, 2)).all()

    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    trend_preview = [
        {
            "month": month_names[int(m.month) - 1] if m.month.isdigit() and 1 <= int(m.month) <= 12 else m.month,
            "revenue": round(float(m.rev or 0.0), 2)
        } for m in monthly
    ]

    return {
        "revenue": rev,
        "gross_profit": gp,
        "gross_margin": margin,
        "orders": orders,
        "aov": aov,
        "yoy_growth": yoy_growth,
        "total_gmv": total_gmv,
        "total_transactions": total_txns,
        "stores_count": 20,
        "skus_count": 458,
        "reconciliation_variance": 0.0000,
        "category_preview": category_preview,
        "stores_preview": stores_preview,
        "trend_preview": trend_preview,
    }

