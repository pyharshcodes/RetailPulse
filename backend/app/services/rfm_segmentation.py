"""
Deterministic Customer RFM Segmentation & Retention Cohort Engine.
Computes Recency, Frequency, and Monetary scores, segments customers,
and calculates true retention cohorts from transaction history.
"""

from datetime import datetime
from typing import Dict, Any, List
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from backend.app.models.transaction import Transaction
from backend.app.models.customer import Customer
from backend.app.core.filters import FilterParams, apply_transaction_filters

def calculate_customer_overview(db: Session, filters: FilterParams) -> Dict[str, Any]:
    """Calculates customer metrics for current period: total, new, returning, repeat rate, avg rev."""
    # Find all transactions within current filter
    q = db.query(
        Transaction.customer_id,
        func.count(distinct(Transaction.transaction_id)).label("orders"),
        func.sum(Transaction.net_sales).label("total_spent"),
        func.min(Transaction.transaction_date).label("first_txn_date_in_period"),
    )
    q = apply_transaction_filters(q, filters)
    q = q.group_by(Transaction.customer_id)
    cust_records = q.all()

    total_active_customers = len(cust_records)
    if total_active_customers == 0:
        return {
            "total_customers": 0,
            "new_customers": 0,
            "returning_customers": 0,
            "repeat_purchase_rate": 0.0,
            "average_revenue_per_customer": 0.0,
        }

    # Query customer lifetime first purchase date to accurately separate new vs returning
    cust_ids = [r.customer_id for r in cust_records]
    first_ever_q = db.query(
        Transaction.customer_id,
        func.min(Transaction.transaction_date).label("lifetime_first_date")
    ).filter(Transaction.customer_id.in_(cust_ids)).group_by(Transaction.customer_id).all()
    first_ever_map = {r.customer_id: r.lifetime_first_date for r in first_ever_q}

    new_custs = 0
    returning_custs = 0
    repeat_buyers = 0
    total_revenue = 0.0

    start_date = filters.start_date or "2026-01-01"

    for r in cust_records:
        total_revenue += float(r.total_spent or 0.0)
        lifetime_first = first_ever_map.get(r.customer_id, r.first_txn_date_in_period)
        if lifetime_first >= start_date:
            new_custs += 1
        else:
            returning_custs += 1
            
        if r.orders > 1:
            repeat_buyers += 1

    repeat_rate = round((repeat_buyers / total_active_customers) * 100.0, 2)
    arpu = round(total_revenue / total_active_customers, 2)

    return {
        "total_customers": total_active_customers,
        "new_customers": new_custs,
        "returning_customers": returning_custs,
        "repeat_purchase_rate": repeat_rate,
        "average_revenue_per_customer": arpu,
    }

def get_rfm_segmentation(db: Session, filters: FilterParams) -> Dict[str, Any]:
    """
    Computes RFM scores across all active customers within filters.
    Assigns: High Value, Loyal, Growing, At Risk, Low Engagement.
    """
    ref_date_str = filters.end_date or "2026-12-31"
    ref_date = datetime.strptime(ref_date_str, "%Y-%m-%d")

    q = db.query(
        Transaction.customer_id,
        Transaction.customer_type,
        func.max(Transaction.transaction_date).label("last_purchase_date"),
        func.count(distinct(Transaction.transaction_id)).label("frequency"),
        func.sum(Transaction.net_sales).label("monetary"),
    )
    q = apply_transaction_filters(q, filters)
    q = q.group_by(Transaction.customer_id, Transaction.customer_type)
    results = q.all()

    if not results:
        return {"segments": [], "summary": {}}

    data = []
    for r in results:
        last_dt = datetime.strptime(r.last_purchase_date, "%Y-%m-%d")
        recency_days = (ref_date - last_dt).days
        data.append({
            "customer_id": r.customer_id,
            "customer_type": r.customer_type,
            "recency": max(0, recency_days),
            "frequency": int(r.frequency),
            "monetary": round(float(r.monetary or 0.0), 2),
        })

    df = pd.DataFrame(data)

    # Calculate quantile cuts for R, F, M
    # Higher score is better: R (lower days = higher score), F (higher = higher score), M (higher = higher score)
    try:
        df["r_score"] = pd.qcut(df["recency"], 4, labels=[4, 3, 2, 1])
    except Exception:
        df["r_score"] = 3

    try:
        # Frequency often has duplicates, so use rank method
        df["f_score"] = pd.qcut(df["frequency"].rank(method="first"), 4, labels=[1, 2, 3, 4])
    except Exception:
        df["f_score"] = 3

    try:
        df["m_score"] = pd.qcut(df["monetary"], 4, labels=[1, 2, 3, 4])
    except Exception:
        df["m_score"] = 3

    df["r_score"] = df["r_score"].astype(int)
    df["f_score"] = df["f_score"].astype(int)
    df["m_score"] = df["m_score"].astype(int)

    def assign_segment(row):
        r, f, m = row["r_score"], row["f_score"], row["m_score"]
        # High Value: High monetary, frequent, recent
        if m == 4 and (f >= 3 or r >= 3):
            return "High Value"
        # Loyal: High frequency and recent
        if f >= 3 and r >= 3:
            return "Loyal"
        # Growing: Recent, moderate frequency/monetary
        if r >= 3 and f <= 2:
            return "Growing"
        # At Risk: Previously high frequency/monetary, but high recency days (hasn't bought recently)
        if r <= 2 and (f >= 3 or m >= 3):
            return "At Risk"
        # Low Engagement: Low scores across the board
        return "Low Engagement"

    df["segment"] = df.apply(assign_segment, axis=1)

    # Segment summary
    seg_summary = df.groupby("segment").agg(
        customer_count=("customer_id", "count"),
        total_revenue=("monetary", "sum"),
        avg_frequency=("frequency", "mean"),
        avg_recency=("recency", "mean"),
        avg_revenue=("monetary", "mean"),
    ).reset_index()

    total_customers = len(df)
    total_rev = df["monetary"].sum() or 1.0

    segments_list = []
    for _, row in seg_summary.iterrows():
        segments_list.append({
            "segment": row["segment"],
            "count": int(row["customer_count"]),
            "share_percent": round((row["customer_count"] / total_customers) * 100.0, 2),
            "revenue": round(float(row["total_revenue"]), 2),
            "revenue_share": round((row["total_revenue"] / total_rev) * 100.0, 2),
            "avg_frequency": round(float(row["avg_frequency"]), 1),
            "avg_recency_days": round(float(row["avg_recency"]), 0),
            "avg_monetary": round(float(row["avg_revenue"]), 2),
        })

    # Order segments logically
    order = ["High Value", "Loyal", "Growing", "At Risk", "Low Engagement"]
    segments_list.sort(key=lambda x: order.index(x["segment"]) if x["segment"] in order else 99)

    return {
        "total_analyzed_customers": total_customers,
        "segments": segments_list,
        "methodology": "RFM quantile scoring on active customer orders with recency, frequency, and monetary quartiles.",
    }

def get_retention_cohort(db: Session) -> Dict[str, Any]:
    """
    Computes true monthly retention cohorts.
    Rows: Cohort (First purchase month, e.g. 2025-01 to 2025-12)
    Columns: Months since acquisition (Month 0 to Month 11)
    Values: Retention %
    """
    # 1. Get first purchase date for each customer
    first_purchase = db.query(
        Transaction.customer_id,
        func.min(Transaction.transaction_date).label("first_txn")
    ).group_by(Transaction.customer_id).all()

    first_map = {r.customer_id: r.first_txn[:7] for r in first_purchase} # YYYY-MM

    # 2. Get all distinct active months for each customer
    active_months = db.query(
        Transaction.customer_id,
        func.substr(Transaction.transaction_date, 1, 7).label("active_month")
    ).distinct().all()

    records = []
    for r in active_months:
        cohort = first_map.get(r.customer_id)
        if not cohort:
            continue
        # Only analyze cohorts in 2025 for sufficient tracking runway
        if not cohort.startswith("2025"):
            continue
            
        c_year, c_month = int(cohort[:4]), int(cohort[5:7])
        a_year, a_month = int(r.active_month[:4]), int(r.active_month[5:7])
        
        months_diff = (a_year - c_year) * 12 + (a_month - c_month)
        if 0 <= months_diff <= 11:
            records.append({
                "cohort": cohort,
                "customer_id": r.customer_id,
                "month_offset": months_diff
            })

    if not records:
        return {"cohorts": [], "columns": []}

    df = pd.DataFrame(records)
    cohort_sizes = df[df["month_offset"] == 0].groupby("cohort")["customer_id"].nunique()

    cohort_matrix = df.groupby(["cohort", "month_offset"])["customer_id"].nunique().unstack(fill_value=0)

    # Convert to retention %
    retention_table = []
    for cohort, size in cohort_sizes.items():
        row_data = {"cohort": cohort, "cohort_size": int(size), "retention": []}
        for offset in range(12):
            if offset in cohort_matrix.columns and cohort in cohort_matrix.index:
                active_count = cohort_matrix.loc[cohort, offset]
                pct = round((active_count / size) * 100.0, 1) if size > 0 else 0.0
            else:
                pct = 0.0
            row_data["retention"].append(pct)
        retention_table.append(row_data)

    retention_table.sort(key=lambda x: x["cohort"])

    return {
        "columns": [f"M+{i}" for i in range(12)],
        "cohorts": retention_table,
    }
