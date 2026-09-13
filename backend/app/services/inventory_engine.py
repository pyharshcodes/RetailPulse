"""
Inventory Intelligence & Health Engine for RetailPulse.
Calculates stock valuation, aging buckets (0-30, 31-60, 61-90, 90+),
turnover ratio, low stock alerts, and capital tied in aging inventory.
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.inventory import Inventory
from backend.app.models.product import Product
from backend.app.models.store import Store
from backend.app.models.transaction import Transaction
from backend.app.core.filters import FilterParams

def get_inventory_summary(db: Session, filters: FilterParams) -> Dict[str, Any]:
    """Calculates overall inventory health metrics based on active store filter."""
    q = db.query(
        func.sum(Inventory.total_value).label("total_inventory_value"),
        func.sum(Inventory.closing_inventory).label("total_units"),
        func.count(Inventory.id).label("total_skus"),
    )
    if filters.store_id:
        q = q.filter(Inventory.store_id == filters.store_id)
        
    summary_res = q.one()
    total_val = float(summary_res.total_inventory_value or 0.0)
    total_units = int(summary_res.total_units or 0)
    total_skus = int(summary_res.total_skus or 0)

    # 90+ days aging value
    aging_q = db.query(func.sum(Inventory.total_value)).filter(Inventory.aging_bucket == "90+ days")
    if filters.store_id:
        aging_q = aging_q.filter(Inventory.store_id == filters.store_id)
    aging_val = float(aging_q.scalar() or 0.0)

    # Low stock SKUs count
    low_stock_q = db.query(func.count(Inventory.id)).filter(Inventory.stock_status == "Low Stock")
    if filters.store_id:
        low_stock_q = low_stock_q.filter(Inventory.store_id == filters.store_id)
    low_stock_count = int(low_stock_q.scalar() or 0)

    # Overstocked SKUs count
    overstocked_q = db.query(func.count(Inventory.id)).filter(Inventory.stock_status == "Overstocked")
    if filters.store_id:
        overstocked_q = overstocked_q.filter(Inventory.store_id == filters.store_id)
    overstocked_count = int(overstocked_q.scalar() or 0)

    # Aging SKUs count
    aging_count_q = db.query(func.count(Inventory.id)).filter(Inventory.aging_bucket == "90+ days")
    if filters.store_id:
        aging_count_q = aging_count_q.filter(Inventory.store_id == filters.store_id)
    aging_skus_count = int(aging_count_q.scalar() or 0)

    # Inventory Turnover calculation: Annual COGS / Average Inventory Value
    # For period 2026, compute COGS from transactions
    cogs_q = db.query(func.sum(Transaction.cost))
    if filters.store_id:
        cogs_q = cogs_q.filter(Transaction.store_id == filters.store_id)
    if filters.start_date:
        cogs_q = cogs_q.filter(Transaction.transaction_date >= filters.start_date)
    if filters.end_date:
        cogs_q = cogs_q.filter(Transaction.transaction_date <= filters.end_date)
    total_cogs = float(cogs_q.scalar() or 0.0)

    turnover = round(total_cogs / total_val, 2) if total_val > 0 else 0.0

    # Aging buckets breakdown
    buckets_q = db.query(
        Inventory.aging_bucket,
        func.count(Inventory.id).label("sku_count"),
        func.sum(Inventory.total_value).label("value"),
        func.sum(Inventory.closing_inventory).label("units"),
    )
    if filters.store_id:
        buckets_q = buckets_q.filter(Inventory.store_id == filters.store_id)
    buckets_q = buckets_q.group_by(Inventory.aging_bucket)
    
    bucket_map = {b: {"sku_count": 0, "value": 0.0, "units": 0, "share": 0.0} for b in ["0-30 days", "31-60 days", "61-90 days", "90+ days"]}
    for r in buckets_q.all():
        b_val = float(r.value or 0.0)
        bucket_map[r.aging_bucket] = {
            "sku_count": int(r.sku_count),
            "value": round(b_val, 2),
            "units": int(r.units or 0),
            "share": round((b_val / total_val) * 100.0, 2) if total_val > 0 else 0.0
        }

    aging_distribution = [
        {"bucket": k, **v} for k, v in bucket_map.items()
    ]

    return {
        "inventory_value": round(total_val, 2),
        "total_units": total_units,
        "total_tracked_skus": total_skus,
        "low_stock_skus": low_stock_count,
        "overstocked_skus": overstocked_count,
        "aging_skus": aging_skus_count,
        "aging_value_90_plus": round(aging_val, 2),
        "inventory_turnover": turnover,
        "aging_distribution": aging_distribution,
    }

def get_inventory_items(db: Session, filters: FilterParams, status: Optional[str] = None, limit: int = 100, offset: int = 0) -> Dict[str, Any]:
    """Returns detailed inventory items table with product details and store location."""
    q = db.query(
        Inventory,
        Product.product_name,
        Product.category,
        Product.subcategory,
        Product.reorder_point,
        Store.store_name,
        Store.city,
    ).join(Product, Inventory.product_id == Product.product_id)\
     .join(Store, Inventory.store_id == Store.store_id)

    if filters.store_id:
        q = q.filter(Inventory.store_id == filters.store_id)
    if filters.category:
        q = q.filter(Product.category == filters.category)
    if status and status != "All":
        q = q.filter(Inventory.stock_status == status)

    total_count = q.count()
    items = q.order_by(Inventory.days_since_last_sale.desc()).offset(offset).limit(limit).all()

    results = []
    for inv, p_name, cat, subcat, reorder, s_name, city in items:
        results.append({
            "id": inv.id,
            "store_id": inv.store_id,
            "store_name": s_name,
            "city": city,
            "product_id": inv.product_id,
            "product_name": p_name,
            "category": cat,
            "subcategory": subcat,
            "closing_stock": inv.closing_inventory,
            "reorder_point": reorder,
            "unit_cost": inv.unit_cost,
            "total_value": inv.total_value,
            "days_since_last_sale": inv.days_since_last_sale,
            "aging_bucket": inv.aging_bucket,
            "stock_status": inv.stock_status,
            "opening_stock": inv.opening_inventory,
            "purchases": inv.purchases,
            "returns": inv.returns,
            "units_sold": inv.units_sold,
        })

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "items": results,
    }
