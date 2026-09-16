from sqlalchemy import String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[str] = mapped_column(String(30), nullable=False, default="admin") # owner, admin, store_manager, viewer
    tenant_id: Mapped[str] = mapped_column(String(50), ForeignKey("tenants.id"), nullable=False, index=True)
    assigned_store_id: Mapped[str] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[str] = mapped_column(String(30), nullable=True)
    last_login_at: Mapped[str] = mapped_column(String(30), nullable=True)

    # Relationship
    tenant = relationship("Tenant", back_populates="users")
