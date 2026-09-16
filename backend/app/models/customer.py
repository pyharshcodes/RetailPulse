from sqlalchemy import String, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class Customer(Base):
    __tablename__ = "customers"

    customer_id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    tenant_id: Mapped[str] = mapped_column(String(50), nullable=False, default="demo_tenant", index=True)
    customer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    customer_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    email: Mapped[str] = mapped_column(String(100), nullable=True)
    city: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    signup_date: Mapped[str] = mapped_column(String(20), nullable=False)

    # Relationships
    transactions = relationship("Transaction", back_populates="customer")
