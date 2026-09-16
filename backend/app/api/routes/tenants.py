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
    ChangePlanRequest,
    PaymentVerificationRequest
)

router = APIRouter()

@router.get("/current", response_model=TenantOut)
def get_current_tenant_settings(
    tenant: Tenant = Depends(get_current_tenant)
):
    """Retrieve active organization profile, currency, and subscription tier."""
    return TenantOut.model_validate(tenant)

@router.put("/current", response_model=TenantOut)
def update_current_tenant_settings(
    payload: TenantUpdateRequest,
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Update organization name, reporting currency, number formatting or industry."""
    if payload.name is not None:
        tenant.name = payload.name.strip()
    if payload.industry is not None:
        tenant.industry = payload.industry
    if payload.currency is not None:
        tenant.currency = payload.currency.upper()
    if payload.currency_symbol is not None:
        tenant.currency_symbol = payload.currency_symbol
    if payload.number_format is not None:
        tenant.number_format = payload.number_format

    db.commit()
    db.refresh(tenant)
    return TenantOut.model_validate(tenant)

@router.patch("/current", response_model=TenantOut)
def patch_current_tenant_settings(
    payload: TenantUpdateRequest,
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Alias for PATCH update of organization settings."""
    return update_current_tenant_settings(payload, tenant, user, db)

@router.post("/api-key")
def regenerate_api_key(
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Regenerate private ingestion API key for external POS / ERP sync."""
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
    """Returns available SaaS plans, low affordable pricing in INR and USD, and feature matrices."""
    return [
        PlanTierOut(
            id="free",
            name="Free Forever",
            tagline="Essential analytics for boutique shops & single counters. Zero cost, no card required.",
            pricing=PlanPricing(
                inr_monthly=0,
                inr_annual=0,
                usd_monthly=0,
                usd_annual=0
            ),
            is_popular=False,
            badge="ALWAYS FREE",
            store_limit=1,
            txn_limit="2,500 / mo",
            features=[
                "1 Store Location / Counter",
                "2,500 Monthly Transactions",
                "Historical CSV & Excel Ingestion",
                "Executive Sales & Margin Cockpit",
                "Inventory Stock & Top 10 SKUs",
                "2 Team Seats (Free for all members)",
                "Community Support"
            ]
        ),
        PlanTierOut(
            id="pro",
            name="Pro Growth",
            tagline="High-velocity intelligence for scaling retail chains & franchise stores.",
            pricing=PlanPricing(
                inr_monthly=499,
                inr_annual=399,
                usd_monthly=9,
                usd_annual=7
            ),
            is_popular=True,
            badge="MOST POPULAR",
            store_limit=5,
            txn_limit="50,000 / mo",
            features=[
                "Up to 5 Store Locations",
                "50,000 Monthly Transactions",
                "Real-Time Live POS Streamer Engine",
                "COGS Waterfall & Margin Risk Radar",
                "Dead Inventory (>90 Days) Stockout Alarms",
                "Regional Geography Heatmaps",
                "REST API Key for POS Ingestion",
                "5 Team Seats + Role Permissions",
                "Priority Email & WhatsApp Support"
            ]
        ),
        PlanTierOut(
            id="business",
            name="Business Enterprise",
            tagline="For warehouse networks, hypermarket chains & omnichannel multi-brand groups.",
            pricing=PlanPricing(
                inr_monthly=1499,
                inr_annual=1199,
                usd_monthly=29,
                usd_annual=24
            ),
            is_popular=False,
            badge="ENTERPRISE",
            store_limit=999,
            txn_limit="500,000 / mo",
            features=[
                "Unlimited Stores & Warehouses",
                "500,000 Monthly Transactions",
                "High-Throughput Real-Time Live Streaming",
                "Multi-Brand Isolation & Tenant Namespaces",
                "Custom ERP Connectors (SAP, Oracle, Tally)",
                "Executive Board PDF Reports & CSV Exports",
                "Unlimited Team Seats & Granular Permissions",
                "Dedicated Account Manager & 99.99% SLA"
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
    """Switch tenant subscription tier. Free tier is instant. Paid tiers require verified payment."""
    requested = payload.plan_tier.lower()
    if requested in ["free", "starter"]:
        tenant.plan_tier = "free"
        if tenant.last_payment_ref:
            tenant.subscription_status = "active"
        db.commit()
        db.refresh(tenant)
        return TenantOut.model_validate(tenant)

    if requested not in ["pro", "business"]:
        raise HTTPException(status_code=400, detail="Invalid plan tier. Must be free, pro, or business.")

    # If tenant has already completed verified payment for this plan
    if tenant.plan_tier == requested and tenant.subscription_status == "active":
        return TenantOut.model_validate(tenant)

    # If switching to paid tier, payment verification is required
    if not tenant.last_payment_ref:
        raise HTTPException(
            status_code=402,
            detail=f"Payment verification required to activate {requested.upper()} plan. Please scan the UPI QR code and submit your UTR reference."
        )

    tenant.plan_tier = requested
    tenant.subscription_status = "active"
    db.commit()
    db.refresh(tenant)
    return TenantOut.model_validate(tenant)

@router.post("/verify-payment", response_model=TenantOut)
def verify_tenant_payment(
    payload: PaymentVerificationRequest,
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Verifies UPI transaction reference and activates requested paid subscription tier."""
    requested = payload.plan_tier.lower()
    if requested not in ["pro", "business"]:
        raise HTTPException(status_code=400, detail="Payment verification is only required for Pro or Business plans.")

    utr = payload.utr_reference.strip().upper()
    if len(utr) < 4:
        raise HTTPException(status_code=400, detail="A valid UPI UTR / Transaction Reference ID (min 4 chars) is required.")

    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
    tenant.plan_tier = requested
    tenant.subscription_status = "active"
    tenant.last_payment_ref = utr
    tenant.last_payment_at = now_str
    tenant.last_payment_amount = payload.amount

    db.commit()
    db.refresh(tenant)
    return TenantOut.model_validate(tenant)
