from sqlalchemy import String, Integer, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class Target(Base):
    __tablename__ = "targets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    month: Mapped[str] = mapped_column(String(7), nullable=False, index=True) # "YYYY-MM"
    store_id: Mapped[str] = mapped_column(String(50), ForeignKey("stores.store_id"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    target_revenue: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    target_gross_profit: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    target_units: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

Index("idx_target_lookup", Target.month, Target.store_id, Target.category, unique=True)
