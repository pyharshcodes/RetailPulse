"""
Reports and Exports REST API routes.
Delivers on-the-fly PDF executive report generation and filtered CSV streaming.
"""

from fastapi import APIRouter, Depends, Response, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.filters import FilterParams, get_filter_params
from backend.app.services.report_generator import generate_executive_pdf_report, stream_filtered_transactions_csv

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/pdf")
def download_pdf_report(
    report_type: str = Query("executive", description="executive, store, product, inventory, profitability"),
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Generates and returns an executive PDF report respecting current filters."""
    title_map = {
        "executive": "Executive Performance Summary",
        "store": "Store Operations & Performance Audit",
        "product": "Product Portfolio Intelligence Report",
        "inventory": "Inventory Health & Aging Audit",
        "profitability": "Financial Profitability & Margin Analysis",
    }
    title = title_map.get(report_type, "Retail Analytics Performance Report")
    pdf_bytes = generate_executive_pdf_report(db, filters, report_title=title)

    filename = f"RetailPulse_{report_type}_report_{filters.start_date}_to_{filters.end_date}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/csv")
def download_filtered_csv(
    limit: int = Query(25000, le=50000, description="Max rows to export"),
    filters: FilterParams = Depends(get_filter_params),
    db: Session = Depends(get_db)
):
    """Streams a filtered CSV file containing transaction records matching active dimensions."""
    filename = f"RetailPulse_transactions_{filters.start_date}_to_{filters.end_date}.csv"
    generator = stream_filtered_transactions_csv(db, filters, limit=limit)

    return StreamingResponse(
        generator,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
