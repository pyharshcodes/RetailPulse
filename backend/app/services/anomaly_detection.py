"""
Explainable Anomaly Detection Engine for RetailPulse.
Detects statistical anomalies on daily sales volume and profit margins using rolling Z-scores.
Does not claim causality — delivers explainable variance details.
"""

from typing import List, Dict, Any
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.transaction import Transaction
from backend.app.core.filters import FilterParams, apply_transaction_filters

def detect_anomalies(db: Session, filters: FilterParams) -> List[Dict[str, Any]]:
    """
    Analyzes daily net sales and gross margin percentage to identify statistical outliers.
    Uses rolling 14-day window mean and standard deviation.
    """
    q = db.query(
        Transaction.transaction_date,
        func.sum(Transaction.net_sales).label("daily_sales"),
        func.sum(Transaction.gross_profit).label("daily_profit"),
        func.count(Transaction.id).label("txn_count"),
    )
    q = apply_transaction_filters(q, filters)
    q = q.group_by(Transaction.transaction_date).order_by(Transaction.transaction_date.asc())
    records = q.all()

    if len(records) < 14:
        return []

    data = []
    for r in records:
        sales = float(r.daily_sales or 0.0)
        profit = float(r.daily_profit or 0.0)
        margin = round((profit / sales) * 100.0, 2) if sales > 0 else 0.0
        data.append({
            "date": r.transaction_date,
            "sales": sales,
            "profit": profit,
            "margin": margin,
            "txns": int(r.txn_count),
        })

    df = pd.DataFrame(data)

    # Rolling statistics (14-day window)
    df["sales_rolling_mean"] = df["sales"].rolling(window=14, min_periods=7).mean()
    df["sales_rolling_std"] = df["sales"].rolling(window=14, min_periods=7).std().fillna(1.0)
    df["sales_zscore"] = (df["sales"] - df["sales_rolling_mean"]) / df["sales_rolling_std"].replace(0, 1.0)

    df["margin_rolling_mean"] = df["margin"].rolling(window=14, min_periods=7).mean()
    df["margin_rolling_std"] = df["margin"].rolling(window=14, min_periods=7).std().fillna(0.5)
    df["margin_zscore"] = (df["margin"] - df["margin_rolling_mean"]) / df["margin_rolling_std"].replace(0, 0.5)

    anomalies = []

    # Flag absolute Z-score >= 2.25 as statistical anomalies
    for _, row in df.iterrows():
        # Sales anomalies
        if abs(row["sales_zscore"]) >= 2.25:
            actual = round(row["sales"], 2)
            expected = round(row["sales_rolling_mean"], 2)
            dev_pct = round(((actual - expected) / expected) * 100.0, 1) if expected > 0 else 0.0
            direction = "spike" if actual > expected else "drop"
            severity = "Critical" if abs(row["sales_zscore"]) >= 3.0 else "Warning"
            
            anomalies.append({
                "metric": "Daily Net Sales",
                "date": row["date"],
                "actual": actual,
                "expected": expected,
                "deviation_percent": dev_pct,
                "z_score": round(row["sales_zscore"], 2),
                "severity": severity,
                "explanation": f"Unusual daily revenue {direction} detected: actual revenue deviated by {dev_pct:+}% from the 14-day moving baseline."
            })

        # Margin anomalies
        if abs(row["margin_zscore"]) >= 2.4:
            actual_m = round(row["margin"], 2)
            expected_m = round(row["margin_rolling_mean"], 2)
            dev_pts = round(actual_m - expected_m, 2)
            direction = "expansion" if actual_m > expected_m else "compression"
            severity = "Critical" if actual_m < expected_m and abs(row["margin_zscore"]) >= 2.8 else "Warning"
            
            anomalies.append({
                "metric": "Gross Margin %",
                "date": row["date"],
                "actual": actual_m,
                "expected": expected_m,
                "deviation_percent": dev_pts, # in percentage points
                "z_score": round(row["margin_zscore"], 2),
                "severity": severity,
                "explanation": f"Unusual margin {direction} observed: gross margin shifted by {dev_pts:+} percentage points relative to normal operating variance."
            })

    # Sort most recent first
    anomalies.sort(key=lambda x: x["date"], reverse=True)
    return anomalies[:30]
