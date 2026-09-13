from sqlalchemy import String, Integer, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    store_id: Mapped[str] = mapped_column(String(50), ForeignKey("stores.store_id"), nullable=False, index=True)
    product_id: Mapped[str] = mapped_column(String(50), ForeignKey("products.product_id"), nullable=False, index=True)
    
    opening_inventory: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    purchases: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    returns: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    units_sold: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    closing_inventory: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    unit_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    days_since_last_sale: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    aging_bucket: Mapped[str] = mapped_column(String(30), nullable=False, default="0-30 days", index=True)
    stock_status: Mapped[str] = mapped_column(String(30), nullable=False, default="Healthy", index=True)

    # Relationships
    store = relationship("Store", back_populates="inventory_items")
    product = relationship("Product", back_populates="inventory_items")

Index("idx_inv_store_prod", Inventory.store_id, Inventory.product_id, unique=True)
Index("idx_inv_status", Inventory.stock_status)
Index("idx_inv_aging", Inventory.aging_bucket)
