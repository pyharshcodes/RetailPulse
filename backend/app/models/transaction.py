from sqlalchemy import String, Integer, Float, Date, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    transaction_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    transaction_date: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    
    # Store dimensions
    store_id: Mapped[str] = mapped_column(String(50), ForeignKey("stores.store_id"), nullable=False, index=True)
    store_name: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    region: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    # Customer dimensions
    customer_id: Mapped[str] = mapped_column(String(50), ForeignKey("customers.customer_id"), nullable=False, index=True)
    customer_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    # Product dimensions
    product_id: Mapped[str] = mapped_column(String(50), ForeignKey("products.product_id"), nullable=False, index=True)
    product_name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    subcategory: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    # Sales metrics
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    discount_percent: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    gross_sales: Mapped[float] = mapped_column(Float, nullable=False)
    discount_amount: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    net_sales: Mapped[float] = mapped_column(Float, nullable=False)
    cost: Mapped[float] = mapped_column(Float, nullable=False)
    gross_profit: Mapped[float] = mapped_column(Float, nullable=False)
    gross_margin_percent: Mapped[float] = mapped_column(Float, nullable=False)

    # Operational attributes
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    sales_channel: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    inventory_after_sale: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    target_amount: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    # Relationships
    store = relationship("Store", back_populates="transactions")
    product = relationship("Product", back_populates="transactions")
    customer = relationship("Customer", back_populates="transactions")

# Compound composite indexes for high-speed analytical queries
Index("idx_txn_date_store", Transaction.transaction_date, Transaction.store_id)
Index("idx_txn_date_category", Transaction.transaction_date, Transaction.category)
Index("idx_txn_date_region", Transaction.transaction_date, Transaction.region)
