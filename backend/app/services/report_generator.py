"""
Report Generation Engine for RetailPulse.
Compiles executive PDF reports with ReportLab and streams filtered CSV exports.
"""

import io
import csv
from datetime import datetime
from typing import Generator
from sqlalchemy.orm import Session
from sqlalchemy import func

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from backend.app.models.transaction import Transaction
from backend.app.core.filters import FilterParams, apply_transaction_filters
from backend.app.services.analytics_engine import calculate_kpis

def generate_executive_pdf_report(db: Session, filters: FilterParams, report_title: str = "Executive Performance Summary") -> bytes:
    """Generates an executive PDF report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    kpis = calculate_kpis(db, filters)

    styles = getSampleStyleSheet()
    
    # Custom professional styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=12,
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=12,
        spaceAfter=6,
    )
    cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#334155"),
    )
    cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#0F172A"),
    )
    header_cell = ParagraphStyle(
        'HeaderCell',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#FFFFFF"),
    )

    elements = []

    # 1. Header Banner
    elements.append(Paragraph(f"RETAILPULSE &bull; {report_title.upper()}", title_style))
    elements.append(Paragraph(
        f"Company: <b>Vertex Retail Group</b> | Period: <b>{filters.start_date} to {filters.end_date}</b> | Generated on: <b>{datetime.now().strftime('%Y-%m-%d %H:%M')}</b>",
        subtitle_style
    ))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563EB"), spaceAfter=14))

    # 2. Active Filters Banner
    filter_details = []
    if filters.region: filter_details.append(f"Region: {filters.region}")
    if filters.state: filter_details.append(f"State: {filters.state}")
    if filters.store_id: filter_details.append(f"Store: {filters.store_id}")
    if filters.category: filter_details.append(f"Category: {filters.category}")
    if filters.customer_type: filter_details.append(f"Segment: {filters.customer_type}")
    
    filter_str = " | ".join(filter_details) if filter_details else "All Regions, All Stores, All Categories"
    elements.append(Paragraph(f"<b>Active Filter Scope:</b> {filter_str}", cell_style))
    elements.append(Spacer(1, 10))

    # 3. Executive KPI Table
    elements.append(Paragraph("EXECUTIVE KPI SUMMARY", heading_style))
    
    rev_curr = f"Rs. {kpis['revenue']['current']:,.2f}"
    gp_curr = f"Rs. {kpis['gross_profit']['current']:,.2f}"
    margin_curr = f"{kpis['gross_margin']['current']}%"
    orders_curr = f"{kpis['orders']['current']:,}"
    units_curr = f"{kpis['units']['current']:,}"
    aov_curr = f"Rs. {kpis['aov']['current']:,.2f}"

    rev_change = f"{kpis['revenue']['percentage_change']:+}%" if kpis['revenue']['percentage_change'] is not None else "N/A"
    gp_change = f"{kpis['gross_profit']['percentage_change']:+}%" if kpis['gross_profit']['percentage_change'] is not None else "N/A"
    margin_change = f"{kpis['gross_margin']['absolute_change']:+} pts"

    kpi_data = [
        [Paragraph("Metric", header_cell), Paragraph("Current Period", header_cell), Paragraph("Previous Period", header_cell), Paragraph("Change vs Prev", header_cell)],
        [Paragraph("Net Sales Revenue", cell_bold), Paragraph(rev_curr, cell_style), Paragraph(f"Rs. {kpis['revenue']['previous']:,.2f}", cell_style), Paragraph(rev_change, cell_style)],
        [Paragraph("Gross Profit", cell_bold), Paragraph(gp_curr, cell_style), Paragraph(f"Rs. {kpis['gross_profit']['previous']:,.2f}", cell_style), Paragraph(gp_change, cell_style)],
        [Paragraph("Weighted Gross Margin", cell_bold), Paragraph(margin_curr, cell_style), Paragraph(f"{kpis['gross_margin']['previous']}%", cell_style), Paragraph(margin_change, cell_style)],
        [Paragraph("Total Orders", cell_bold), Paragraph(orders_curr, cell_style), Paragraph(f"{kpis['orders']['previous']:,}", cell_style), Paragraph(f"{kpis['orders']['percentage_change'] or 'N/A'}%", cell_style)],
        [Paragraph("Units Sold", cell_bold), Paragraph(units_curr, cell_style), Paragraph(f"{kpis['units']['previous']:,}", cell_style), Paragraph(f"{kpis['units']['percentage_change'] or 'N/A'}%", cell_style)],
        [Paragraph("Average Order Value (AOV)", cell_bold), Paragraph(aov_curr, cell_style), Paragraph(f"Rs. {kpis['aov']['previous']:,.2f}", cell_style), Paragraph(f"{kpis['aov']['percentage_change'] or 'N/A'}%", cell_style)],
    ]

    kpi_table = Table(kpi_data, colWidths=[150, 130, 130, 130])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    elements.append(kpi_table)
    elements.append(Spacer(1, 14))

    # 4. Store Performance Summary (Top 10 Stores)
    elements.append(Paragraph("STORE PERFORMANCE RANKINGS (TOP 10 LOCATIONS)", heading_style))
    store_q = db.query(
        Transaction.store_name,
        Transaction.city,
        Transaction.region,
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.gross_profit).label("gp"),
        func.count(Transaction.id).label("txns")
    )
    store_q = apply_transaction_filters(store_q, filters)
    store_results = store_q.group_by(Transaction.store_name, Transaction.city, Transaction.region).order_by(func.sum(Transaction.net_sales).desc()).limit(10).all()

    store_data = [
        [Paragraph("Store Name", header_cell), Paragraph("City", header_cell), Paragraph("Region", header_cell), Paragraph("Revenue", header_cell), Paragraph("Gross Profit", header_cell), Paragraph("Margin %", header_cell)]
    ]
    for s in store_results:
        s_rev = float(s.rev or 0.0)
        s_gp = float(s.gp or 0.0)
        s_margin = round((s_gp / s_rev) * 100.0, 1) if s_rev > 0 else 0.0
        store_data.append([
            Paragraph(s.store_name, cell_bold),
            Paragraph(s.city, cell_style),
            Paragraph(s.region, cell_style),
            Paragraph(f"Rs. {s_rev:,.0f}", cell_style),
            Paragraph(f"Rs. {s_gp:,.0f}", cell_style),
            Paragraph(f"{s_margin}%", cell_style),
        ])

    store_table = Table(store_data, colWidths=[170, 85, 75, 80, 80, 50])
    store_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    elements.append(store_table)
    elements.append(Spacer(1, 14))

    # 5. Category Breakdown Table
    elements.append(Paragraph("CATEGORY BREAKDOWN & PROFITABILITY", heading_style))
    cat_q = db.query(
        Transaction.category,
        func.sum(Transaction.net_sales).label("rev"),
        func.sum(Transaction.gross_profit).label("gp"),
        func.sum(Transaction.quantity).label("units")
    )
    cat_q = apply_transaction_filters(cat_q, filters)
    cat_results = cat_q.group_by(Transaction.category).order_by(func.sum(Transaction.net_sales).desc()).all()

    cat_data = [
        [Paragraph("Category", header_cell), Paragraph("Revenue", header_cell), Paragraph("Gross Profit", header_cell), Paragraph("Margin %", header_cell), Paragraph("Units Sold", header_cell)]
    ]
    for c in cat_results:
        c_rev = float(c.rev or 0.0)
        c_gp = float(c.gp or 0.0)
        c_margin = round((c_gp / c_rev) * 100.0, 1) if c_rev > 0 else 0.0
        cat_data.append([
            Paragraph(c.category, cell_bold),
            Paragraph(f"Rs. {c_rev:,.0f}", cell_style),
            Paragraph(f"Rs. {c_gp:,.0f}", cell_style),
            Paragraph(f"{c_margin}%", cell_style),
            Paragraph(f"{int(c.units or 0):,}", cell_style),
        ])

    cat_table = Table(cat_data, colWidths=[180, 100, 100, 70, 90])
    cat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    elements.append(cat_table)
    elements.append(Spacer(1, 14))

    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

def stream_filtered_transactions_csv(db: Session, filters: FilterParams, limit: int = 15000) -> Generator[str, None, None]:
    """Streams a filtered CSV export of transactions respecting all active dimensions."""
    output = io.StringIO()
    writer = csv.writer(output)

    # Write Header
    headers = [
        "Transaction ID", "Date", "Store ID", "Store Name", "City", "State", "Region",
        "Customer ID", "Customer Type", "Product ID", "Product Name", "Category",
        "Subcategory", "Quantity", "Unit Price (INR)", "Discount %", "Gross Sales",
        "Discount Amount", "Net Sales (INR)", "Cost (INR)", "Gross Profit (INR)",
        "Margin %", "Payment Method", "Sales Channel"
    ]
    writer.writerow(headers)
    yield output.getvalue()
    output.seek(0)
    output.truncate(0)

    q = db.query(Transaction)
    q = apply_transaction_filters(q, filters)
    q = q.order_by(Transaction.transaction_date.desc()).limit(limit)

    for txn in q.yield_per(1000):
        writer.writerow([
            txn.transaction_id,
            txn.transaction_date,
            txn.store_id,
            txn.store_name,
            txn.city,
            txn.state,
            txn.region,
            txn.customer_id,
            txn.customer_type,
            txn.product_id,
            txn.product_name,
            txn.category,
            txn.subcategory,
            txn.quantity,
            txn.unit_price,
            txn.discount_percent,
            txn.gross_sales,
            txn.discount_amount,
            txn.net_sales,
            txn.cost,
            txn.gross_profit,
            txn.gross_margin_percent,
            txn.payment_method,
            txn.sales_channel
        ])
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)
