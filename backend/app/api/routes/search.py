"""
Global Omni-Search REST API routes.
Delivers unified search results across Stores, Products, Categories, and Customers.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import get_db
from backend.app.models.store import Store
from backend.app.models.product import Product
from backend.app.models.customer import Customer
from backend.app.models.transaction import Transaction

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("")
def omni_search(
    q: str = Query(..., min_length=2, description="Search query string"),
    db: Session = Depends(get_db)
):
    """Searches across stores, products, categories, and customers."""
    term = f"%{q}%"

    # 1. Matching Stores
    stores_q = db.query(Store).filter(
        (Store.store_name.ilike(term)) |
        (Store.city.ilike(term)) |
        (Store.region.ilike(term)) |
        (Store.store_id.ilike(term))
    ).limit(5).all()

    stores_matches = [
        {"id": s.store_id, "title": s.store_name, "subtitle": f"{s.city}, {s.state} ({s.region})", "type": "store"}
        for s in stores_q
    ]

    # 2. Matching Products
    prods_q = db.query(Product).filter(
        (Product.product_name.ilike(term)) |
        (Product.product_id.ilike(term)) |
        (Product.brand.ilike(term)) |
        (Product.subcategory.ilike(term))
    ).limit(6).all()

    prods_matches = [
        {"id": p.product_id, "title": p.product_name, "subtitle": f"{p.category} • Rs. {p.selling_price:,.0f}", "type": "product"}
        for p in prods_q
    ]

    # 3. Matching Categories
    cats_q = db.query(Transaction.category).filter(
        Transaction.category.ilike(term)
    ).distinct().limit(4).all()

    cats_matches = [
        {"id": c[0], "title": c[0], "subtitle": "Category drilldown", "type": "category"}
        for c in cats_q
    ]

    # 4. Matching Customers
    cust_q = db.query(Customer).filter(
        (Customer.customer_name.ilike(term)) |
        (Customer.customer_id.ilike(term)) |
        (Customer.city.ilike(term))
    ).limit(5).all()

    cust_matches = [
        {"id": c.customer_id, "title": c.customer_name, "subtitle": f"{c.customer_type} • {c.city}", "type": "customer"}
        for c in cust_q
    ]

    total_results = len(stores_matches) + len(prods_matches) + len(cats_matches) + len(cust_matches)

    return {
        "query": q,
        "total_results": total_results,
        "stores": stores_matches,
        "products": prods_matches,
        "categories": cats_matches,
        "customers": cust_matches,
    }
