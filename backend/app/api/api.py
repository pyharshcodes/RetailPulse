"""
Central API Router for RetailPulse.
Aggregates all domain routes under /api.
"""

from fastapi import APIRouter
from backend.app.api.routes import (
    overview,
    sales,
    stores,
    products,
    customers,
    inventory,
    profitability,
    geography,
    targets,
    alerts,
    reports,
    explorer,
    search,
    demo,
)

api_router = APIRouter()

api_router.include_router(overview.router)
api_router.include_router(sales.router)
api_router.include_router(stores.router)
api_router.include_router(products.router)
api_router.include_router(customers.router)
api_router.include_router(inventory.router)
api_router.include_router(profitability.router)
api_router.include_router(geography.router)
api_router.include_router(targets.router)
api_router.include_router(alerts.router)
api_router.include_router(reports.router)
api_router.include_router(explorer.router)
api_router.include_router(search.router)
api_router.include_router(demo.router)
