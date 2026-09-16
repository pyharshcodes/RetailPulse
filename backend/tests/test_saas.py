import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
import uuid

client = TestClient(app)

def test_saas_demo_session():
    """Verify demo session generates valid JWT for demo_tenant."""
    response = client.post("/api/auth/demo-session")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["tenant"]["id"] == "demo_tenant"
    assert data["tenant"]["name"] == "Vertex Retail Group"

def test_saas_register_and_login_flow():
    """Verify registration, login, and profile fetching for a new isolated tenant."""
    unique_suffix = uuid.uuid4().hex[:6]
    company_name = f"Apex Retail {unique_suffix}"
    email = f"ceo_{unique_suffix}@apexretail.com"
    password = "SecurePassword123"

    # 1. Register
    reg_payload = {
        "company_name": company_name,
        "full_name": "Alex Mercer",
        "email": email,
        "password": password,
        "industry": "Retail & Electronics",
        "currency": "USD",
        "currency_symbol": "$",
        "number_format": "international"
    }
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code in [200, 201]
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == email
    tenant_id = reg_data["tenant"]["id"]
    assert tenant_id.startswith("org_")
    assert reg_data["tenant"]["currency"] == "USD"
    token = reg_data["access_token"]

    # 2. Duplicate registration with same email should be rejected
    dup_resp = client.post("/api/auth/register", json=reg_payload)
    assert dup_resp.status_code == 400

    # 3. Login
    login_resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert login_data["tenant"]["id"] == tenant_id

    # 4. Wrong password login fails
    wrong_login = client.post("/api/auth/login", json={"email": email, "password": "WrongPassword"})
    assert wrong_login.status_code == 401

    # 5. Fetch /api/auth/me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["user"]["email"] == email
    assert me_data["tenant"]["id"] == tenant_id

    # 6. Tenant settings: regenerate API key
    key_resp = client.post("/api/tenants/api-key", headers=headers)
    assert key_resp.status_code == 200
    assert "api_key" in key_resp.json()
    assert key_resp.json()["api_key"].startswith("rp_live_")

    # 7. Update tenant currency to EUR
    patch_resp = client.patch(
        "/api/tenants/current",
        json={"currency": "EUR", "currency_symbol": "€", "industry": "Fashion & Apparel"},
        headers=headers
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["currency"] == "EUR"
    assert patch_resp.json()["industry"] == "Fashion & Apparel"

    # 8. Seed sample data for this tenant
    seed_resp = client.post("/api/onboarding/seed-sample-data?preset=retail", headers=headers)
    assert seed_resp.status_code == 200
    seed_data = seed_resp.json()
    assert seed_data["status"] == "success"
    assert seed_data["transactions_ingested"] > 0
    assert seed_data["tenant_id"] == tenant_id

    # 9. Simulate a real-time live POS transaction
    live_resp = client.post("/api/onboarding/simulate-live-transaction", headers=headers)
    assert live_resp.status_code == 200
    live_data = live_resp.json()
    assert "transaction_id" in live_data
    assert live_data["revenue"] > 0
    assert live_data["margin_pct"] > 0

    # 10. Team: Invite team member
    invite_resp = client.post(
        "/api/tenants/invite",
        json={
            "email": f"analyst_{unique_suffix}@apexretail.com",
            "full_name": "Jordan Smith",
            "role": "analyst"
        },
        headers=headers
    )
    assert invite_resp.status_code == 200
    assert invite_resp.json()["role"] == "analyst"

    team_resp = client.get("/api/tenants/team", headers=headers)
    assert team_resp.status_code == 200
    assert len(team_resp.json()) >= 2

    # 11. Reset tenant data
    reset_resp = client.delete("/api/onboarding/reset-tenant-data", headers=headers)
    assert reset_resp.status_code == 200
    assert reset_resp.json()["status"] == "success"

def test_saas_pricing_plans_and_tier_upgrade():
    """Verify SaaS pricing plans catalog and tier upgrade endpoint."""
    # 1. Fetch public plans catalog
    plans_resp = client.get("/api/tenants/plans")
    assert plans_resp.status_code == 200
    plans = plans_resp.json()
    assert len(plans) == 3
    plan_ids = [p["id"] for p in plans]
    assert "starter" in plan_ids
    assert "pro" in plan_ids
    assert "business" in plan_ids

    # 2. Register user on Starter tier
    unique_suffix = uuid.uuid4().hex[:6]
    reg_resp = client.post("/api/auth/register", json={
        "company_name": f"Boutique {unique_suffix}",
        "full_name": "Starter Owner",
        "email": f"owner_{unique_suffix}@boutique.com",
        "password": "Password@123",
        "plan_tier": "starter"
    })
    assert reg_resp.status_code in [200, 201]
    data = reg_resp.json()
    assert data["tenant"]["plan_tier"] == "starter"
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Upgrade tier to Business Enterprise
    change_resp = client.post("/api/tenants/change-plan", json={"plan_tier": "business"}, headers=headers)
    assert change_resp.status_code == 200
    assert change_resp.json()["plan_tier"] == "business"

    # 4. Verify /api/auth/me reflects the updated tier
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["tenant"]["plan_tier"] == "business"

    # 5. Invalid plan tier rejected
    bad_resp = client.post("/api/tenants/change-plan", json={"plan_tier": "invalid_plan"}, headers=headers)
    assert bad_resp.status_code == 400

