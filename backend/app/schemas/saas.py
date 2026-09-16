from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserRegisterRequest(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=150)
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    industry: Optional[str] = "Retail & Electronics"
    currency: Optional[str] = "INR"
    currency_symbol: Optional[str] = "₹"
    number_format: Optional[str] = "indian"

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: str
    tenant_id: str
    assigned_store_id: Optional[str] = None
    created_at: Optional[str] = None

class TenantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    industry: str
    currency: str
    currency_symbol: str
    number_format: str
    plan_tier: str
    api_key: Optional[str] = None
    is_active: bool

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
    tenant: TenantOut

class TenantUpdateRequest(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    currency: Optional[str] = None
    currency_symbol: Optional[str] = None
    number_format: Optional[str] = None

class TeamInviteRequest(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "viewer" # admin, store_manager, viewer
    assigned_store_id: Optional[str] = None

class IngestionSummary(BaseModel):
    status: str = "success"
    message: str
    tenant_id: Optional[str] = None
    transactions_ingested: int = 0
    stores_count: int = 0
    products_count: int = 0
    gross_sales: float = 0.0
    net_sales: float = 0.0
    weighted_margin_percent: float = 0.0
