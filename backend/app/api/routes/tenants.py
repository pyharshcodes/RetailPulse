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
from backend.app.schemas.saas import TenantOut, TenantUpdateRequest, TeamInviteRequest, UserOut

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
