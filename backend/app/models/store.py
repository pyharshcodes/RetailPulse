from sqlalchemy import String, Integer, Float, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class Store(Base):
    __tablename__ = "stores"

    store_id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    store_name: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    region: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    tier: Mapped[str] = mapped_column(String(20), default="Tier 1")
    square_feet: Mapped[int] = mapped_column(Integer, default=3500)
    monthly_target: Mapped[float] = mapped_column(Float, default=5000000.0)
    target_margin_percent: Mapped[float] = mapped_column(Float, default=24.0)

    # Relationships
    transactions = relationship("Transaction", back_populates="store", cascade="all, delete-orphan")
    inventory_items = relationship("Inventory", back_populates="store", cascade="all, delete-orphan")
