from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.auth import decode_access_token
from backend.app.models.user import User
from backend.app.models.tenant import Tenant

security = HTTPBearer(auto_error=False)

def get_current_user_optional(
    request: Request,
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Extract user from Bearer token if provided.
    Returns None if no token or token is invalid.
    """
    token = None
    if auth and auth.credentials:
        token = auth.credentials
    else:
        # Check authorization header directly
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
            
    if not token:
        return None
        
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
        
    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    return user

def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    """
    Enforce authenticated user. Raises 401 Unauthorized if missing.
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_current_tenant(
    request: Request,
    user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Tenant:
    """
    Resolve active tenant workspace:
    1. If user authenticated -> User's tenant
    2. If X-Tenant-ID header provided -> Tenant by ID/slug
    3. If API Key provided in X-API-Key header -> Tenant by API key
    4. Fallback -> Default public 'demo_tenant' (Vertex Retail Group)
    """
    # 1. Logged in user tenant
    if user and user.tenant:
        return user.tenant
        
    # 2. X-API-Key header (for ERP/POS ingestion)
    api_key = request.headers.get("X-API-Key")
    if api_key:
        tenant = db.query(Tenant).filter(Tenant.api_key == api_key, Tenant.is_active == True).first()
        if tenant:
            return tenant
            
    # 3. X-Tenant-ID header
    tenant_id = request.headers.get("X-Tenant-ID")
    if tenant_id:
        tenant = db.query(Tenant).filter(
            (Tenant.id == tenant_id) | (Tenant.slug == tenant_id),
            Tenant.is_active == True
        ).first()
        if tenant:
            return tenant
            
    # 4. Fallback to demo_tenant (guarantees zero breakages for public visitors/tests)
    demo = db.query(Tenant).filter(Tenant.id == "demo_tenant").first()
    if not demo:
        # Auto-create if database was just initialized
        demo = Tenant(
            id="demo_tenant",
            name="Vertex Retail Group",
            slug="vertex-retail-group",
            industry="Electrical & Consumer Electronics Retail",
            currency="INR",
            currency_symbol="₹",
            number_format="indian",
            plan_tier="enterprise",
            is_active=True
        )
        db.add(demo)
        db.commit()
        db.refresh(demo)
        
    return demo

def require_role(allowed_roles: list):
    """RBAC dependency checking role permissions."""
    def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(allowed_roles)}"
            )
        return user
    return role_checker
