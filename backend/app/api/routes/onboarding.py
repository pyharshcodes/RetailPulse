import io
import csv
import uuid
import datetime
import random
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_tenant, get_current_user
from backend.app.models.tenant import Tenant
from backend.app.models.user import User
from backend.app.models.transaction import Transaction
from backend.app.models.store import Store
from backend.app.models.product import Product
from backend.app.models.customer import Customer
from backend.app.schemas.saas import IngestionSummary

router = APIRouter()

def clean_float(val: str, default: float = 0.0) -> float:
    if not val:
        return default
    val_clean = str(val).replace(",", "").replace("₹", "").replace("$", "").replace("€", "").strip()
    try:
        return float(val_clean)
    except ValueError:
        return default

def clean_int(val: str, default: int = 1) -> int:
    if not val:
        return default
    val_clean = str(val).replace(",", "").strip()
    try:
        return int(float(val_clean))
    except ValueError:
        return default

@router.post("/upload-csv", response_model=IngestionSummary)
async def upload_transactions_csv(
    file: UploadFile = File(...),
    tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """
    SaaS CSV Bulk Ingestion Engine:
    Auto-detects common POS column formats, registers new stores/products, and calculates weighted margins.
    """
    if not file.filename.lower().endswith(('.csv', '.txt')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a CSV (.csv) file."
        )

    content = await file.read()
    try:
        decoded = content.decode('utf-8-sig', errors='replace')
    except Exception:
        decoded = content.decode('latin1', errors='replace')

    reader = csv.DictReader(io.StringIO(decoded))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV file is empty or missing headers.")

    # Normalize header mapping
    header_map = {}
    for h in reader.fieldnames:
        norm = h.strip().lower().replace("_", " ").replace("-", " ")
        if any(x in norm for x in ["date", "time", "created"]):
            header_map["date"] = h
        elif any(x in norm for x in ["store", "outlet", "branch", "location"]):
            header_map["store"] = h
        elif any(x in norm for x in ["city", "town"]):
            header_map["city"] = h
        elif any(x in norm for x in ["sku", "product", "item", "description"]):
            header_map["product"] = h
        elif any(x in norm for x in ["category", "dept", "department"]):
            header_map["category"] = h
        elif any(x in norm for x in ["qty", "quantity", "units"]):
            header_map["quantity"] = h
        elif any(x in norm for x in ["price", "rate", "unit price"]):
            header_map["unit_price"] = h
        elif any(x in norm for x in ["sales", "net", "amount", "total"]):
            header_map["net_sales"] = h
        elif any(x in norm for x in ["cost", "cogs", "buy price"]):
            header_map["cost"] = h

    # Check store and product caches for fast lookups
    existing_stores = {s.store_name.lower(): s for s in db.query(Store).filter(Store.tenant_id == tenant.id).all()}
    existing_products = {p.product_name.lower(): p for p in db.query(Product).filter(Product.tenant_id == tenant.id).all()}

    txns_to_add = []
    total_net = 0.0
    total_gross = 0.0
    total_profit = 0.0
    now_date = datetime.date.today().isoformat()

    for idx, row in enumerate(reader):
        date_val = row.get(header_map.get("date", ""), now_date).strip() or now_date
        store_val = row.get(header_map.get("store", ""), "Main Flagship Store").strip() or "Main Flagship Store"
        city_val = row.get(header_map.get("city", ""), "HQ").strip() or "HQ"
        product_val = row.get(header_map.get("product", ""), "Standard Item").strip() or "Standard Item"
        category_val = row.get(header_map.get("category", ""), "General").strip() or "General"
        
        qty_val = clean_int(row.get(header_map.get("quantity", ""), "1"), 1)
        price_val = clean_float(row.get(header_map.get("unit_price", ""), "0.0"), 0.0)
        net_val = clean_float(row.get(header_map.get("net_sales", ""), "0.0"), 0.0)
        cost_val = clean_float(row.get(header_map.get("cost", ""), "0.0"), 0.0)

        # Fallbacks for financial reconciliation
        if net_val <= 0.0 and price_val > 0.0:
            net_val = price_val * qty_val
        elif price_val <= 0.0 and net_val > 0.0:
            price_val = net_val / max(1, qty_val)

        if cost_val <= 0.0:
            cost_val = net_val * 0.75 # 25% default margin if cost unknown

        gross_sales = max(net_val, price_val * qty_val)
        discount_amount = max(0.0, gross_sales - net_val)
        gross_profit = net_val - cost_val
        gross_margin_percent = round((gross_profit / max(1.0, net_val)) * 100, 2)

        # Register store if new
        store_key = store_val.lower()
        if store_key not in existing_stores:
            s_id = f"st_{slug_simple(store_val)}_{uuid.uuid4().hex[:4]}"
            new_store = Store(
                store_id=s_id,
                tenant_id=tenant.id,
                store_name=store_val,
                city=city_val,
                state="General",
                region="National",
                tier="Tier 1",
                square_feet=3500,
                monthly_target=5000000.0,
                target_margin_percent=24.0
            )
            db.add(new_store)
            existing_stores[store_key] = new_store

        store_obj = existing_stores[store_key]

        # Register product if new
        prod_key = product_val.lower()
        if prod_key not in existing_products:
            p_id = f"prd_{slug_simple(product_val)}_{uuid.uuid4().hex[:4]}"
            new_prod = Product(
                product_id=p_id,
                tenant_id=tenant.id,
                product_name=product_val,
                category=category_val,
                subcategory=category_val,
                brand=tenant.name,
                unit_cost=cost_val / max(1, qty_val),
                selling_price=price_val,
                reorder_point=20,
                target_margin_percent=25.0
            )
            db.add(new_prod)
            existing_products[prod_key] = new_prod

        prod_obj = existing_products[prod_key]

        # Build transaction record
        t_id = f"txn_{uuid.uuid4().hex[:10]}"
        txn = Transaction(
            transaction_id=t_id,
            tenant_id=tenant.id,
            transaction_date=date_val[:10],
            store_id=store_obj.store_id,
            store_name=store_obj.store_name,
            city=store_obj.city,
            state=store_obj.state,
            region=store_obj.region,
            customer_id="cust_walkin",
            customer_type="Retail Customer",
            product_id=prod_obj.product_id,
            product_name=prod_obj.product_name,
            category=prod_obj.category,
            subcategory=prod_obj.subcategory,
            quantity=qty_val,
            unit_price=price_val,
            discount_percent=round((discount_amount / max(1.0, gross_sales)) * 100, 2),
            gross_sales=gross_sales,
            discount_amount=discount_amount,
            net_sales=net_val,
            cost=cost_val,
            gross_profit=gross_profit,
            gross_margin_percent=gross_margin_percent,
            payment_method="UPI/Card",
            sales_channel="Store POS",
            inventory_after_sale=100,
            target_amount=net_val * 1.05
        )
        txns_to_add.append(txn)
        total_net += net_val
        total_gross += gross_sales
        total_profit += gross_profit

        # Batch flush to avoid memory strain
        if len(txns_to_add) >= 500:
            db.add_all(txns_to_add)
            db.commit()
            txns_to_add = []

    if txns_to_add:
        db.add_all(txns_to_add)
        db.commit()

    weighted_margin = round((total_profit / max(1.0, total_net)) * 100, 2)

    return IngestionSummary(
        status="success",
        message=f"Successfully imported data for {tenant.name}!",
        transactions_ingested=len(txns_to_add) + (reader.line_num - 1),
        stores_count=len(existing_stores),
        products_count=len(existing_products),
        gross_sales=round(total_gross, 2),
        net_sales=round(total_net, 2),
        weighted_margin_percent=weighted_margin
    )

def slug_simple(text: str) -> str:
    return "".join(c for c in text if c.isalnum())[:8].lower()

@router.post("/seed-sample-data", response_model=IngestionSummary)
def seed_tenant_sample_data(
    tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """
    1-Click Sandbox Template Seed:
    Populates 4 stores, 12 products, and 80 historical transactions so a newly signed up business can test the full capabilities suite immediately.
    """
    if tenant.id == "demo_tenant":
        return IngestionSummary(
            status="info",
            message="Vertex Retail Group is already populated with 89,464 records."
        )

    # Stores
    store_configs = [
        ("Store-01 Flagship", "Bengaluru", "Karnataka", "South"),
        ("Store-02 Mall Hub", "Mumbai", "Maharashtra", "West"),
        ("Store-03 Metro Plaza", "Delhi", "NCR", "North"),
        ("Store-04 City Center", "Hyderabad", "Telangana", "South"),
    ]
    created_stores = []
    for s_name, city, state, reg in store_configs:
        s_id = f"st_{tenant.slug}_{slug_simple(s_name)}"
        st = db.query(Store).filter(Store.store_id == s_id, Store.tenant_id == tenant.id).first()
        if not st:
            st = Store(
                store_id=s_id,
                tenant_id=tenant.id,
                store_name=f"{tenant.name} - {s_name}",
                city=city,
                state=state,
                region=reg,
                tier="Tier 1",
                square_feet=4000,
                monthly_target=4500000.0,
                target_margin_percent=22.5
            )
            db.add(st)
        created_stores.append(st)

    # Products
    product_configs = [
        ("Smart 4K LED TV 55\"", "Electronics", "Visual", 32000, 44990),
        ("Inverter Split AC 1.5T", "Appliances", "Cooling", 26500, 36990),
        ("Direct Cool Refrigerator", "Appliances", "Cooling", 14500, 19990),
        ("Front Load Washing Machine", "Appliances", "Home", 21000, 29990),
        ("Mechanical Keyboard & Mouse", "Computing", "Accessories", 2200, 3990),
        ("Noise Cancelling Headphones", "Audio", "Accessories", 4500, 7990),
        ("Modular Switchgear Panel", "Electrical", "Industrial", 8500, 12500),
        ("Smart Home LED Hub", "Lighting", "Smart Home", 1800, 2990),
    ]
    created_prods = []
    for p_name, cat, subcat, cost, price in product_configs:
        p_id = f"prd_{tenant.slug}_{slug_simple(p_name)}"
        pr = db.query(Product).filter(Product.product_id == p_id, Product.tenant_id == tenant.id).first()
        if not pr:
            pr = Product(
                product_id=p_id,
                tenant_id=tenant.id,
                product_name=p_name,
                category=cat,
                subcategory=subcat,
                brand=tenant.name,
                unit_cost=cost,
                selling_price=price,
                reorder_point=15,
                target_margin_percent=25.0
            )
            db.add(pr)
        created_prods.append(pr)

    db.commit()

    # Generate 90 transactions
    today = datetime.date.today()
    total_net = 0.0
    total_gross = 0.0
    total_profit = 0.0
    txns = []

    for i in range(90):
        rand_days = random.randint(0, 75)
        txn_date = (today - datetime.timedelta(days=rand_days)).isoformat()
        store = random.choice(created_stores)
        prod = random.choice(created_prods)
        qty = random.randint(1, 3)
        price = prod.selling_price
        cost = prod.unit_cost * qty
        disc_pct = random.choice([0.0, 5.0, 8.0, 10.0])
        gross = price * qty
        disc_amt = gross * (disc_pct / 100.0)
        net = gross - disc_amt
        profit = net - cost
        margin_pct = (profit / max(1.0, net)) * 100

        txn = Transaction(
            transaction_id=f"txn_{uuid.uuid4().hex[:10]}",
            tenant_id=tenant.id,
            transaction_date=txn_date,
            store_id=store.store_id,
            store_name=store.store_name,
            city=store.city,
            state=store.state,
            region=store.region,
            customer_id="cust_walkin",
            customer_type=random.choice(["Walk-in Customer", "Contractor", "Loyalty Member"]),
            product_id=prod.product_id,
            product_name=prod.product_name,
            category=prod.category,
            subcategory=prod.subcategory,
            quantity=qty,
            unit_price=price,
            discount_percent=disc_pct,
            gross_sales=gross,
            discount_amount=disc_amt,
            net_sales=net,
            cost=cost,
            gross_profit=profit,
            gross_margin_percent=round(margin_pct, 2),
            payment_method=random.choice(["UPI Express", "Credit Card", "Bank Transfer"]),
            sales_channel="Store Register",
            inventory_after_sale=random.randint(20, 80),
            target_amount=net * 1.05
        )
        txns.append(txn)
        total_net += net
        total_gross += gross
        total_profit += profit

    db.add_all(txns)
    db.commit()

    return IngestionSummary(
        status="success",
        message=f"Sample retail dataset populated for {tenant.name}!",
        tenant_id=tenant.id,
        transactions_ingested=len(txns),
        stores_count=len(created_stores),
        products_count=len(created_prods),
        gross_sales=round(total_gross, 2),
        net_sales=round(total_net, 2),
        weighted_margin_percent=round((total_profit / max(1.0, total_net)) * 100, 2)
    )

@router.post("/simulate-live-transaction")
def simulate_live_pos_transaction(
    tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """
    Live POS Transaction Generator:
    Injects an instantaneous real-time POS event for this tenant, refreshing real-time telemetry with zero lag!
    """
    # Fetch random store and product
    store = db.query(Store).filter(Store.tenant_id == tenant.id).first()
    product = db.query(Product).filter(Product.tenant_id == tenant.id).first()

    if not store or not product:
        # Fallback to demo store/product if tenant has none yet
        store = db.query(Store).first()
        product = db.query(Product).first()

    if not store or not product:
        raise HTTPException(status_code=400, detail="Please seed or upload data before generating live transactions.")

    now_date = datetime.date.today().isoformat()
    qty = random.randint(1, 2)
    price = product.selling_price or 15000.0
    cost = (product.unit_cost or 11000.0) * qty
    disc_pct = random.choice([0.0, 3.0, 5.0])
    gross = price * qty
    disc_amt = gross * (disc_pct / 100.0)
    net = gross - disc_amt
    profit = net - cost
    margin_pct = (profit / max(1.0, net)) * 100

    txn = Transaction(
        transaction_id=f"live_{uuid.uuid4().hex[:8]}",
        tenant_id=tenant.id,
        transaction_date=now_date,
        store_id=store.store_id,
        store_name=store.store_name,
        city=store.city,
        state=store.state,
        region=store.region,
        customer_id="cust_live_stream",
        customer_type="Store Register Walk-in",
        product_id=product.product_id,
        product_name=product.product_name,
        category=product.category,
        subcategory=product.subcategory,
        quantity=qty,
        unit_price=price,
        discount_percent=disc_pct,
        gross_sales=gross,
        discount_amount=disc_amt,
        net_sales=net,
        cost=cost,
        gross_profit=profit,
        gross_margin_percent=round(margin_pct, 2),
        payment_method="Live UPI Checkout",
        sales_channel="Store POS Register #1",
        inventory_after_sale=random.randint(15, 60),
        target_amount=net * 1.05
    )
    db.add(txn)
    db.commit()

    live_dict = {
        "transaction_id": txn.transaction_id,
        "city": txn.city,
        "store": txn.store_name,
        "store_name": txn.store_name,
        "item": txn.product_name,
        "product_name": txn.product_name,
        "amount": round(txn.net_sales, 2),
        "revenue": round(txn.net_sales, 2),
        "gross_profit": round(txn.gross_profit, 2),
        "margin_percent": txn.gross_margin_percent,
        "margin_pct": txn.gross_margin_percent,
        "quantity": txn.quantity,
        "channel": txn.sales_channel,
        "transaction_date": txn.transaction_date,
        "timestamp": "Just now"
    }

    return {
        "status": "success",
        "live_event": live_dict,
        **live_dict
    }

@router.delete("/reset-tenant-data")
def reset_tenant_uploaded_data(
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Safely purges tenant uploaded transactions to allow fresh CSV re-imports.
    Guaranteed: Cannot purge public demo_tenant.
    """
    if tenant.id == "demo_tenant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The public Vertex Retail Group demo dataset cannot be deleted."
        )

    db.query(Transaction).filter(Transaction.tenant_id == tenant.id).delete()
    db.commit()

    return {
        "status": "success",
        "message": f"All uploaded transactions for {tenant.name} have been cleared."
    }
