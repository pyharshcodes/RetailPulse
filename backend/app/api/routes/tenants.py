import uuid
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_tenant, get_current_user, require_role
from backend.app.core.auth import hash_password
from backend.app.models.tenant import Tenant
from backend.app.models.user import User
from backend.app.schemas.saas import (
    TenantOut,
    TenantUpdateRequest,
    TeamInviteRequest,
    UserOut,
    PlanTierOut,
    PlanPricing,
    ChangePlanRequest
)

router = APIRouter()

@router.get("/current", response_model=TenantOut)
def get_current_tenant_settings(
    tenant: Tenant = Depends(get_current_tenant)
):
    """Retrieve active organization profile, currency, and subscription tier."""
    return TenantOut.model_validate(tenant)

@router.put("/current", response_model=TenantOut)
@router.patch("/current", response_model=TenantOut)
def update_tenant_settings(
    payload: TenantUpdateRequest,
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Update organization name, currency, currency symbol, or number formatting."""
    if payload.name:
        tenant.name = payload.name.strip()
    if payload.industry:
        tenant.industry = payload.industry.strip()
    if payload.currency:
        tenant.currency = payload.currency.strip().upper()
    if payload.currency_symbol:
        tenant.currency_symbol = payload.currency_symbol.strip()
    if payload.number_format:
        tenant.number_format = payload.number_format.strip()

    db.commit()
    db.refresh(tenant)
    return TenantOut.model_validate(tenant)

@router.post("/api-key")
def regenerate_api_key(
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Regenerate private API key for ERP or custom register syncing."""
    new_key = f"rp_live_{uuid.uuid4().hex}"
    tenant.api_key = new_key
    db.commit()
    return {
        "status": "success",
        "api_key": new_key,
        "message": "New API key generated. Use this in the X-API-Key header to ingest transaction feeds."
    }

@router.get("/team", response_model=List[UserOut])
def list_team_members(
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all user accounts in current organization."""
    users = db.query(User).filter(User.tenant_id == tenant.id, User.is_active == True).all()
    return [UserOut.model_validate(u) for u in users]

@router.post("/invite", response_model=UserOut)
def invite_team_member(
    payload: TeamInviteRequest,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Add a new colleague / team member to organization with assigned role."""
    existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    # Initial temporary password
    temp_pass = hash_password("RetailPulse2026!")
    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

    new_member = User(
        id=user_id,
        email=payload.email.lower().strip(),
        hashed_password=temp_pass,
        full_name=payload.full_name.strip(),
        role=payload.role,
        tenant_id=tenant.id,
        assigned_store_id=payload.assigned_store_id,
        is_active=True,
        created_at=now_str
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return UserOut.model_validate(new_member)

@router.get("/plans", response_model=List[PlanTierOut])
def get_available_plans():
    """Returns available SaaS plans, pricing in INR and USD, and feature matrices."""
    return [
        PlanTierOut(
            id="starter",
            name="Starter",
            tagline="For single stores and emerging retail outlets.",
            pricing=PlanPricing(
                inr_monthly=4999,
                inr_annual=3999,
                usd_monthly=59,
                usd_annual=49
            ),
            is_popular=False,
            badge=None,
            store_limit=3,
            txn_limit="25,000 / mo",
            features=[
                "Up to 3 Store Locations",
                "25,000 Monthly Transactions",
                "Historical CSV & Excel Ingestion",
                "Executive Sales & Margin Cockpit",
                "Standard Inventory Stock Tracking",
                "2 Team Seats",
                "Standard Email Support"
            ]
        ),
        PlanTierOut(
            id="pro",
            name="Professional",
            tagline="For fast-growing multi-store chains & regional brands.",
            pricing=PlanPricing(
                inr_monthly=14999,
                inr_annual=11999,
                usd_monthly=179,
                usd_annual=149
            ),
            is_popular=True,
            badge="MOST POPULAR",
            store_limit=15,
            txn_limit="250,000 / mo",
            features=[
                "Up to 15 Store Locations",
                "250,000 Monthly Transactions",
                "Real-Time Live POS Streamer Engine",
                "COGS Waterfall & Margin Risk Radar",
                "Automated Stockout Alarms",
                "REST API Key for SAP / ERP Ingestion",
                "Executive Board PDF Reports & CSV Exports",
                "10 Team Seats (Owner, Admin, Managers)",
                "Priority 24/7 SLA Support"
            ]
        ),
        PlanTierOut(
            id="business",
            name="Business Enterprise",
            tagline="For large warehouse networks, hypermarket chains & enterprise franchises.",
            pricing=PlanPricing(
                inr_monthly=39999,
                inr_annual=31999,
                usd_monthly=479,
                usd_annual=399
            ),
            is_popular=False,
            badge="ENTERPRISE",
            store_limit=999,
            txn_limit="Unlimited",
            features=[
                "Unlimited Stores & Warehouses",
                "Unlimited Transactions & Real-Time Ingestion",
                "Multi-Brand & Regional Franchise Isolation",
                "Custom ERP Connectors (SAP, Oracle, Tally)",
                "Omni-Search & Natural Language Receipt Auditing",
                "Store & Category Performance Quotas",
                "Unlimited Team Seats & Granular Permissions",
                "Dedicated Account Manager & 99.99% SLA",
                "Custom Data Retention & On-Premises Option"
            ]
        )
    ]

@router.post("/change-plan", response_model=TenantOut)
def change_tenant_plan(
    payload: ChangePlanRequest,
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Switch tenant subscription tier between starter, pro, and business."""
    if payload.plan_tier not in ["starter", "pro", "business"]:
        raise HTTPException(status_code=400, detail="Invalid plan tier. Must be starter, pro, or business.")
    tenant.plan_tier = payload.plan_tier
    db.commit()
    db.refresh(tenant)
    return TenantOut.model_validate(tenant)

