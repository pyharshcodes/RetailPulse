"""
Automated backend test suite for RetailPulse.
Tests mathematical formulas, reconciliation, filter consistency, and REST API endpoints.
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func
from backend.app.main import app
from backend.app.core.database import SessionLocal
from backend.app.models.transaction import Transaction
from backend.app.services.analytics_engine import safe_pct_change

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "RetailPulse"

def test_safe_pct_change():
    # Normal positive
    assert safe_pct_change(120, 100) == 20.0
    # Normal negative
    assert safe_pct_change(80, 100) == -20.0
    # Zero previous should return None, NOT divide by zero or NaN/Infinity
    assert safe_pct_change(100, 0) is None
    assert safe_pct_change(100, None) is None

def test_demo_status():
    response = client.get("/api/demo/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["entities"]["stores"] == 20
    assert data["entities"]["transactions"] >= 75000

def test_overview_endpoint():
    response = client.get("/api/overview?start_date=2026-01-01&end_date=2026-12-31")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "revenue" in data["kpis"]
    assert "gross_profit" in data["kpis"]
    assert "gross_margin" in data["kpis"]
    assert data["kpis"]["revenue"]["current"] > 0
    assert data["kpis"]["gross_profit"]["current"] > 0
    assert 0 < data["kpis"]["gross_margin"]["current"] < 100
    # Verify weighted margin formula: gross_profit / revenue * 100
    expected_margin = round((data["kpis"]["gross_profit"]["current"] / data["kpis"]["revenue"]["current"]) * 100.0, 2)
    assert abs(data["kpis"]["gross_margin"]["current"] - expected_margin) < 0.05
    assert len(data["revenue_trend"]) > 0
    assert len(data["category_performance"]) == 11

def test_stores_endpoint():
    response = client.get("/api/stores?start_date=2026-01-01&end_date=2026-12-31")
    assert response.status_code == 200
    data = response.json()
    assert data["kpis"]["total_stores"] == 20
    assert len(data["stores"]) == 20

def test_store_detail_endpoint():
    response = client.get("/api/stores/STR-DEL-01?start_date=2026-01-01&end_date=2026-12-31")
    assert response.status_code == 200
    data = response.json()
    assert data["store"]["store_id"] == "STR-DEL-01"
    assert "Connaught Place" in data["store"]["store_name"]
    assert data["kpis"]["revenue"] > 0

def test_store_compare_endpoint():
    response = client.get("/api/stores/compare?store_ids=STR-DEL-01,STR-MUM-12,STR-AGR-06")
    assert response.status_code == 200
    data = response.json()
    assert len(data["comparison"]) == 3

def test_products_endpoint():
    response = client.get("/api/products?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["kpis"]["total_skus"] >= 300
    assert len(data["products"]) == 10

def test_customers_endpoint():
    response = client.get("/api/customers?start_date=2026-01-01&end_date=2026-12-31")
    assert response.status_code == 200
    data = response.json()
    assert data["kpis"]["total_customers"] > 0
    assert len(data["rfm"]["segments"]) > 0
    assert len(data["retention_cohort"]["cohorts"]) > 0

def test_inventory_endpoint():
    response = client.get("/api/inventory")
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["inventory_value"] > 0
    assert len(data["summary"]["aging_distribution"]) == 4

def test_profitability_endpoint():
    response = client.get("/api/profitability?start_date=2026-01-01&end_date=2026-12-31")
    assert response.status_code == 200
    data = response.json()
    assert len(data["waterfall"]) == 3
    assert len(data["high_revenue_low_margin"]) > 0

def test_geography_endpoint():
    response = client.get("/api/geography?start_date=2026-01-01&end_date=2026-12-31")
    assert response.status_code == 200
    data = response.json()
    assert len(data["regions"]) == 5

def test_alerts_endpoint():
    response = client.get("/api/alerts?start_date=2026-01-01&end_date=2026-12-31")
    assert response.status_code == 200
    data = response.json()
    assert data["total_alerts"] > 0
    assert len(data["alerts"]) > 0

def test_pdf_report_endpoint():
    response = client.get("/api/reports/pdf?report_type=executive&start_date=2026-01-01&end_date=2026-12-31")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 1000 # Valid PDF bytes

def test_csv_export_endpoint():
    response = client.get("/api/reports/csv?limit=50&start_date=2026-01-01&end_date=2026-12-31")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    lines = response.text.strip().split("\n")
    assert len(lines) > 1
    assert "Transaction ID" in lines[0]

def test_search_endpoint():
    response = client.get("/api/search?q=Delhi")
    assert response.status_code == 200
    data = response.json()
    assert data["total_results"] > 0

def test_cross_filtering_consistency():
    # Calling overview with region=North should match sum of stores in North
    resp_north = client.get("/api/overview?region=North&start_date=2026-01-01&end_date=2026-12-31")
    assert resp_north.status_code == 200
    north_rev = resp_north.json()["kpis"]["revenue"]["current"]

    db = SessionLocal()
    direct_north_rev = db.query(func.sum(Transaction.net_sales)).filter(
        Transaction.region == "North",
        Transaction.transaction_date >= "2026-01-01",
        Transaction.transaction_date <= "2026-12-31"
    ).scalar() or 0.0
    db.close()

    assert abs(north_rev - round(direct_north_rev, 2)) < 0.05
