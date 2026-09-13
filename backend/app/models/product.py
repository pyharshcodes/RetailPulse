from sqlalchemy import String, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class Product(Base):
    __tablename__ = "products"

    product_id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    product_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    subcategory: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    brand: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    unit_cost: Mapped[float] = mapped_column(Float, nullable=False)
    selling_price: Mapped[float] = mapped_column(Float, nullable=False)
    reorder_point: Mapped[int] = mapped_column(Integer, default=20)
    target_margin_percent: Mapped[float] = mapped_column(Float, default=25.0)

    # Relationships
    transactions = relationship("Transaction", back_populates="product", cascade="all, delete-orphan")
    inventory_items = relationship("Inventory", back_populates="product", cascade="all, delete-orphan")
