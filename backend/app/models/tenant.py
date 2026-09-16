from sqlalchemy import String, Integer, Float, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    industry: Mapped[str] = mapped_column(String(100), nullable=False, default="Retail")
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="INR")
    currency_symbol: Mapped[str] = mapped_column(String(10), nullable=False, default="₹")
    number_format: Mapped[str] = mapped_column(String(20), nullable=False, default="indian")
    plan_tier: Mapped[str] = mapped_column(String(30), nullable=False, default="trial")
    trial_ends_at: Mapped[str] = mapped_column(String(30), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    api_key: Mapped[str] = mapped_column(String(100), nullable=True, index=True)
    created_at: Mapped[str] = mapped_column(String(30), nullable=True)

    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
