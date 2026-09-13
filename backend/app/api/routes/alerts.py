"""
Business Alerts & Anomaly Detection REST API routes.
Generates deterministic business alerts from live performance thresholds and statistical anomaly models.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import get_db
from backend.app.core.filters import FilterParams, get_filter_params, apply_transaction_filters, get_previous_period_dates
from backend.app.models.transaction import Transaction
from backend.app.models.target import Target
from backend.app.models.inventory import Inventory
from backend.app.models.product import Product
from backend.app.models.store import Store
from backend.app.services.anomaly_detection import detect_anomalies

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("")
def get_business_alerts(
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """
    Evaluates business rules and statistical anomalies against the current dataset.
    Returns categorized alerts with severity, metrics, actual vs expected, and actionable explanations.
    """
    alerts = []
    start_month = (filters.start_date or "2026-01-01")[:7]
    end_month = (filters.end_date or "2026-12-31")[:7]
    prev_start, prev_end = get_previous_period_dates(filters.start_date, filters.end_date)

    # 1. Stores Below Target Alerts (<88% achievement)
    store_act_q = db.query(
        Transaction.store_id,
        Transaction.store_name,
        func.sum(Transaction.net_sales).label("act_rev")
    )
    store_act_q = apply_transaction_filters(store_act_q, filters)
    store_act_res = store_act_q.group_by(Transaction.store_id, Transaction.store_name).all()

    store_tgt_q = db.query(
        Target.store_id,
        func.sum(Target.target_revenue).label("tgt_rev")
    ).filter(Target.month >= start_month, Target.month <= end_month).group_by(Target.store_id).all()
    tgt_map = {r.store_id: float(r.tgt_rev or 0.0) for r in store_tgt_q}

    for s in store_act_res:
        act = float(s.act_rev or 0.0)
        tgt = tgt_map.get(s.store_id, 0.0)
        if tgt > 0:
            ach = (act / tgt) * 100.0
            variance_pct = round(((act - tgt) / tgt) * 100.0, 1)
            if ach < 90.0:
                severity = "Critical" if ach < 80.0 else "Warning"
                alerts.append({
                    "id": f"alt-tgt-{s.store_id}",
                    "severity": severity,
                    "category": "Target Shortfall",
                    "entity_type": "Store",
                    "entity_name": s.store_name,
                    "metric": "Revenue Achievement",
                    "actual": f"₹{act/100000.0:.1f} L",
                    "expected": f"₹{tgt/100000.0:.1f} L",
                    "variance": f"{variance_pct:+}%",
                    "explanation": f"{s.store_name} is {abs(variance_pct)}% below its period revenue target."
                })

    # 2. Critical Low Stock Alerts (Stock < 25% of reorder point)
    low_stock_q = db.query(
        Inventory,
        Product.product_name,
        Product.category,
        Product.reorder_point,
        Store.store_name
    ).join(Product, Inventory.product_id == Product.product_id)\
     .join(Store, Inventory.store_id == Store.store_id)\
     .filter(Inventory.closing_inventory <= (Product.reorder_point * 0.35))\
     .order_by(Inventory.closing_inventory.asc()).limit(6).all()

    for inv, p_name, cat, reorder, s_name in low_stock_q:
        alerts.append({
            "id": f"alt-stock-{inv.id}",
            "severity": "Critical",
            "category": "Inventory Depletion",
            "entity_type": "Product & Store",
            "entity_name": f"{p_name} ({s_name})",
            "metric": "Closing Stock",
            "actual": f"{inv.closing_inventory} units",
            "expected": f"{reorder} units (Reorder point)",
            "variance": f"{inv.closing_inventory - reorder} units",
            "explanation": f"Stock is depleted to critical level ({inv.closing_inventory} remaining) against reorder threshold of {reorder}."
        })

    # 3. High Capital Aging Inventory (>90 days aging)
    aging_q = db.query(
        Inventory,
        Product.product_name,
        Product.category,
        Store.store_name
    ).join(Product, Inventory.product_id == Product.product_id)\
     .join(Store, Inventory.store_id == Store.store_id)\
     .filter(Inventory.aging_bucket == "90+ days", Inventory.total_value > 25000)\
     .order_by(Inventory.total_value.desc()).limit(6).all()

    for inv, p_name, cat, s_name in aging_q:
        alerts.append({
            "id": f"alt-aging-{inv.id}",
            "severity": "Warning",
            "category": "Aging Capital",
            "entity_type": "Inventory",
            "entity_name": f"{p_name} @ {s_name}",
            "metric": "Days Since Last Sale",
            "actual": f"{inv.days_since_last_sale} days",
            "expected": "< 30 days",
            "variance": f"+{inv.days_since_last_sale - 30} days",
            "explanation": f"Unsold stock valued at ₹{inv.total_value:,.0f} has remained idle for {inv.days_since_last_sale} days without transactions."
        })

    # 4. Statistical Anomalies from Machine/Statistical Detector
    anomalies = detect_anomalies(db, filters)
    for idx, a in enumerate(anomalies[:8]):
        alerts.append({
            "id": f"alt-anom-{idx}",
            "severity": a["severity"],
            "category": "Statistical Anomaly",
            "entity_type": "System Metric",
            "entity_name": f"{a['metric']} ({a['date']})",
            "metric": a["metric"],
            "actual": f"{a['actual']:,.2f}",
            "expected": f"{a['expected']:,.2f}",
            "variance": f"{a['deviation_percent']:+}%",
            "explanation": a["explanation"]
        })

    # Group counts
    severity_counts = {
        "Critical": sum(1 for a in alerts if a["severity"] == "Critical"),
        "Warning": sum(1 for a in alerts if a["severity"] == "Warning"),
        "Info": sum(1 for a in alerts if a["severity"] == "Info"),
    }

    return {
        "total_alerts": len(alerts),
        "severity_counts": severity_counts,
        "alerts": alerts,
    }
