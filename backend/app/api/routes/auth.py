import uuid
import datetime
import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.auth import hash_password, verify_password, create_access_token
from backend.app.core.deps import get_current_user, get_current_tenant
from backend.app.models.tenant import Tenant
from backend.app.models.user import User
from backend.app.schemas.saas import UserRegisterRequest, UserLoginRequest, AuthResponse, UserOut, TenantOut

router = APIRouter()

def slugify(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    return slug.strip('-')

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_organization(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    SaaS Registration: Atomically create Organization (Tenant) and Owner User.
    """
    # 1. Check if email already exists
    existing_user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in."
        )

    # 2. Generate unique slug and tenant ID
    base_slug = slugify(payload.company_name) or "retail-org"
    slug = base_slug
    counter = 1
    while db.query(Tenant).filter(Tenant.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    tenant_id = f"org_{uuid.uuid4().hex[:12]}"
    api_key = f"rp_live_{uuid.uuid4().hex}"
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
    trial_end = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=14)).isoformat()

    # 3. Create Tenant
    tenant = Tenant(
        id=tenant_id,
        name=payload.company_name.strip(),
        slug=slug,
        industry=payload.industry or "Retail",
        currency=payload.currency or "INR",
        currency_symbol=payload.currency_symbol or "₹",
        number_format=payload.number_format or "indian",
        plan_tier=payload.plan_tier or "pro",
        trial_ends_at=trial_end,
        is_active=True,
        api_key=api_key,
        created_at=now_str
    )
    db.add(tenant)

    # 4. Create Owner User
    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    user = User(
        id=user_id,
        email=payload.email.lower().strip(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role="owner",
        tenant_id=tenant_id,
        is_active=True,
        created_at=now_str,
        last_login_at=now_str
    )
    db.add(user)
    db.commit()
    db.refresh(tenant)
    db.refresh(user)

    # 5. Generate JWT Token
    token_payload = {
        "sub": user.id,
        "org": tenant.id,
        "role": user.role,
        "email": user.email
    }
    token = create_access_token(token_payload)

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user),
        tenant=TenantOut.model_validate(tenant)
    )

@router.post("/login", response_model=AuthResponse)
def login_user(payload: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return access token with tenant workspace info.
    """
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact your workspace administrator."
        )

    tenant = user.tenant
    if not tenant or not tenant.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your organization workspace is inactive. Please contact support."
        )

    # Update last login
    user.last_login_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    db.commit()

    token_payload = {
        "sub": user.id,
        "org": tenant.id,
        "role": user.role,
        "email": user.email
    }
    token = create_access_token(token_payload)

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user),
        tenant=TenantOut.model_validate(tenant)
    )

@router.get("/me", response_model=AuthResponse)
def get_current_user_profile(
    user: User = Depends(get_current_user)
):
    """
    Get currently authenticated user details and active organization.
    """
    token_payload = {
        "sub": user.id,
        "org": user.tenant_id,
        "role": user.role,
        "email": user.email
    }
    token = create_access_token(token_payload)

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user),
        tenant=TenantOut.model_validate(user.tenant)
    )

@router.get("/demo-session", response_model=AuthResponse)
@router.post("/demo-session", response_model=AuthResponse)
def get_demo_session(db: Session = Depends(get_db)):
    """
    Convenience endpoint: Generates an instantaneous guest token for the Vertex Retail Group demo.
    Allows prospective clients to seamlessly explore without sign up friction.
    """
    demo_tenant = db.query(Tenant).filter(Tenant.id == "demo_tenant").first()
    if not demo_tenant:
        raise HTTPException(status_code=404, detail="Demo tenant not initialized.")

    demo_user = db.query(User).filter(User.email == "admin@retailpulse.io").first()
    if not demo_user:
        raise HTTPException(status_code=404, detail="Demo user not initialized.")

    token_payload = {
        "sub": demo_user.id,
        "org": demo_tenant.id,
        "role": demo_user.role,
        "email": demo_user.email
    }
    token = create_access_token(token_payload)

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(demo_user),
        tenant=TenantOut.model_validate(demo_tenant)
    )
