"""
Core synthetic transaction data generator for RetailPulse / Vertex Retail Group.
Generates 80,000+ realistic, mathematically consistent transactions adhering to business logic.
Generates inventory movements and monthly store/category targets.
"""

import math
import random
import sys
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy.orm import Session

from backend.app.core.database import SessionLocal, init_db
from backend.app.models.store import Store
from backend.app.models.product import Product
from backend.app.models.customer import Customer
from backend.app.models.transaction import Transaction
from backend.app.models.inventory import Inventory
from backend.app.models.target import Target
from backend.data_generator.stores_data import STORES
from backend.data_generator.catalog_data import PRODUCTS
from backend.data_generator.customers_data import generate_customers

def get_seasonality_multiplier(date: datetime, category: str) -> float:
    """Calculates realistic seasonal multipliers for Indian retail."""
    month = date.month
    base = 1.0
    
    # 2026 baseline growth over 2025 (+12% YoY)
    if date.year == 2026:
        base *= 1.12
        
    # Summer peak (April, May, June)
    if month in (4, 5, 6):
        if category in ("Cooling", "Fans"):
            return base * 2.15
        elif category in ("Televisions", "Large Appliances"):
            return base * 1.05
        return base * 0.95
        
    # Monsoon peak (July, August) - Infrastructure, wiring and repairs
    if month in (7, 8):
        if category in ("Wires & Cables", "Switchgear", "Electrical Accessories"):
            return base * 1.55
        elif category in ("Cooling", "Fans"):
            return base * 0.45
        return base * 0.90
        
    # Festive peak (October, November) - Diwali, Dhanteras, Navratri
    if month in (10, 11):
        if category in ("Televisions", "Large Appliances", "Smart Home", "Lighting"):
            return base * 1.95
        elif category in ("Small Appliances", "Switches & Sockets"):
            return base * 1.45
        return base * 1.30
        
    # Year-end corporate & B2B procurement (March & December)
    if month in (3, 12):
        if category in ("Switchgear", "Wires & Cables", "Lighting"):
            return base * 1.35
        return base * 1.10
        
    return base * 0.92

def get_store_multiplier(store_id: str) -> float:
    """Assigns relative volume weight by store tier and performance."""
    # Flagships
    if store_id in ("STR-DEL-01", "STR-MUM-12", "STR-BLR-15"):
        return 1.45
    # Strong Tier 1 & Tier 2
    if store_id in ("STR-GUR-02", "STR-HYD-16", "STR-PUN-13", "STR-AHM-14", "STR-KOL-19", "STR-NOI-03"):
        return 1.25
    # Moderate Tier 2
    if store_id in ("STR-LKO-04", "STR-JAI-07", "STR-CHD-08", "STR-IND-18", "STR-KAN-05"):
        return 1.00
    # Underperforming stores specifically designed for alerts and turnaround analysis
    if store_id in ("STR-AGR-06", "STR-PAT-20"):
        return 0.72 # 28% below average, lags behind target
    return 0.88

def generate_all_data(target_transactions: int = 85000):
    print("==================================================")
    print("RETAILPULSE DATA GENERATION ENGINE: VERTEX RETAIL")
    print("==================================================")
    
    init_db()
    db: Session = SessionLocal()
    
    # 1. Clean existing records
    print("Clearing previous tables...")
    db.query(Transaction).delete()
    db.query(Inventory).delete()
    db.query(Target).delete()
    db.query(Customer).delete()
    db.query(Product).delete()
    db.query(Store).delete()
    db.commit()
    
    # 2. Insert Stores
    print(f"Inserting {len(STORES)} stores...")
    store_objs = [Store(**s) for s in STORES]
    db.add_all(store_objs)
    db.commit()
    
    # 3. Insert Products
    print(f"Inserting {len(PRODUCTS)} products across 11 categories...")
    prod_objs = [Product(**p) for p in PRODUCTS]
    db.add_all(prod_objs)
    db.commit()
    
    # Index products by category for fast seasonal sampling
    products_by_category: Dict[str, List[Dict[str, Any]]] = {}
    product_map: Dict[str, Dict[str, Any]] = {}
    for p in PRODUCTS:
        products_by_category.setdefault(p["category"], []).append(p)
        product_map[p["product_id"]] = p
        
    categories = list(products_by_category.keys())
    
    # 4. Insert Customers
    print("Generating 15,500 customer profiles...")
    customers_data = generate_customers(15500)
    customer_objs = [Customer(**c) for c in customers_data]
    
    # Insert customers in chunks of 3000
    for i in range(0, len(customer_objs), 3000):
        db.add_all(customer_objs[i:i+3000])
        db.commit()
    print("Customers successfully inserted.")
    
    # Segregate customers by type for realistic purchasing behavior
    b2c_customers = [c["customer_id"] for c in customers_data if c["customer_type"] == "Retail B2C"]
    contractor_customers = [c["customer_id"] for c in customers_data if c["customer_type"] == "Contractor/Electrician"]
    b2b_customers = [c["customer_id"] for c in customers_data if c["customer_type"] == "Commercial/B2B"]
    
    customer_type_map = {c["customer_id"]: c["customer_type"] for c in customers_data}
    
    # 5. Generate Transactions
    print(f"Generating {target_transactions} transaction records across Jan 2025 - Dec 2026...")
    start_date = datetime(2025, 1, 1)
    end_date = datetime(2026, 12, 31)
    total_days = (end_date - start_date).days + 1
    
    # Store sales tracking for inventory updates
    product_sales_tracker: Dict[str, Dict[str, int]] = {s["store_id"]: {p["product_id"]: 0 for p in PRODUCTS} for s in STORES}
    store_info_map = {s["store_id"]: s for s in STORES}
    
    payment_methods = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash", "B2B Credit Line"]
    sales_channels = ["In-Store Walk-in", "Click & Collect", "Store Assisted Online", "B2B Direct Order"]
    
    transactions_to_insert = []
    current_txn_num = 1
    
    # Distribute transactions daily across the 730 days
    base_txns_per_day = target_transactions / total_days
    
    for day_idx in range(total_days):
        current_dt = start_date + timedelta(days=day_idx)
        date_str = current_dt.strftime("%Y-%m-%d")
        
        # Day of week variation (Saturdays & Sundays +35% in retail footfall)
        dow = current_dt.weekday()
        dow_mult = 1.35 if dow in (5, 6) else 0.92
        
        for store in STORES:
            store_id = store["store_id"]
            store_mult = get_store_multiplier(store_id)
            
            # Estimate transactions for this store today
            daily_store_expected = (base_txns_per_day / len(STORES)) * store_mult * dow_mult
            # Add stochastic variation
            daily_txns = max(1, int(random.gauss(daily_store_expected, daily_store_expected * 0.18)))
            
            for _ in range(daily_txns):
                # Pick customer based on probability
                rand_c = random.random()
                if rand_c < 0.65:
                    cust_id = random.choice(b2c_customers)
                    cust_type = "Retail B2C"
                elif rand_c < 0.90:
                    cust_id = random.choice(contractor_customers)
                    cust_type = "Contractor/Electrician"
                else:
                    cust_id = random.choice(b2b_customers)
                    cust_type = "Commercial/B2B"
                    
                # Weighted category pick based on seasonality
                cat_weights = [get_seasonality_multiplier(current_dt, cat) for cat in categories]
                # Contractor & B2B bias towards wiring, switchgear, switches, lighting
                if cust_type in ("Contractor/Electrician", "Commercial/B2B"):
                    for idx, cat in enumerate(categories):
                        if cat in ("Wires & Cables", "Switchgear", "Switches & Sockets", "Lighting", "Electrical Accessories"):
                            cat_weights[idx] *= 2.2
                        elif cat in ("Televisions", "Large Appliances"):
                            cat_weights[idx] *= 0.2
                            
                chosen_category = random.choices(categories, weights=cat_weights, k=1)[0]
                chosen_product = random.choice(products_by_category[chosen_category])
                
                # Quantity calculation
                if cust_type == "Retail B2C":
                    if chosen_category in ("Televisions", "Cooling", "Large Appliances"):
                        qty = 1
                    elif chosen_category in ("Lighting", "Switches & Sockets", "Electrical Accessories"):
                        qty = random.choices([1, 2, 3, 4, 6], weights=[40, 30, 15, 10, 5])[0]
                    else:
                        qty = random.choices([1, 2, 3], weights=[70, 20, 10])[0]
                elif cust_type == "Contractor/Electrician":
                    if chosen_category in ("Wires & Cables", "Switches & Sockets", "Switchgear", "Lighting", "Electrical Accessories"):
                        qty = random.randint(5, 25)
                    else:
                        qty = random.randint(1, 4)
                else: # Commercial B2B
                    if chosen_category in ("Wires & Cables", "Switchgear", "Panel & Downlights", "Cooling", "Fans"):
                        qty = random.randint(4, 20)
                    else:
                        qty = random.randint(2, 8)
                        
                unit_price = chosen_product["selling_price"]
                unit_cost = chosen_product["unit_cost"]
                
                # Discount percent based on customer type, season and order volume
                discount_pct = 0.0
                if cust_type == "Contractor/Electrician":
                    discount_pct = random.choice([5.0, 8.0, 10.0, 12.0])
                elif cust_type == "Commercial/B2B":
                    discount_pct = random.choice([8.0, 10.0, 12.5, 15.0])
                else:
                    # B2C promotional discount
                    if random.random() < 0.35:
                        discount_pct = random.choice([3.0, 5.0, 7.5, 10.0])
                        
                # Mathematical formulas strictly followed
                gross_sales = round(qty * unit_price, 2)
                discount_amount = round(gross_sales * (discount_pct / 100.0), 2)
                net_sales = round(gross_sales - discount_amount, 2)
                cost = round(qty * unit_cost, 2)
                gross_profit = round(net_sales - cost, 2)
                gross_margin_percent = round((gross_profit / net_sales) * 100.0, 2) if net_sales > 0 else 0.0
                
                # Payment method & sales channel
                if cust_type == "Commercial/B2B":
                    pm = random.choice(["B2B Credit Line", "Net Banking", "Credit Card"])
                    sc = random.choice(["B2B Direct Order", "In-Store Walk-in"])
                elif cust_type == "Contractor/Electrician":
                    pm = random.choice(["UPI", "Net Banking", "Cash", "Credit Card"])
                    sc = random.choice(["In-Store Walk-in", "Click & Collect", "Store Assisted Online"])
                else:
                    pm = random.choice(["UPI", "Credit Card", "Debit Card", "Cash"])
                    sc = random.choice(["In-Store Walk-in", "Click & Collect", "Store Assisted Online"])
                    
                txn_id_str = f"TXN-{current_dt.year}-{current_txn_num:06d}"
                
                # Update inventory tracker
                product_sales_tracker[store_id][chosen_product["product_id"]] += qty
                inv_remaining = max(5, 120 - (product_sales_tracker[store_id][chosen_product["product_id"]] % 100))
                
                # Target allocation for this transaction (benchmark ~+5% above cost for target)
                target_benchmark = round(gross_sales * 0.98, 2)
                
                txn_record = {
                    "transaction_id": txn_id_str,
                    "transaction_date": date_str,
                    "store_id": store_id,
                    "store_name": store["store_name"],
                    "city": store["city"],
                    "state": store["state"],
                    "region": store["region"],
                    "customer_id": cust_id,
                    "customer_type": cust_type,
                    "product_id": chosen_product["product_id"],
                    "product_name": chosen_product["product_name"],
                    "category": chosen_product["category"],
                    "subcategory": chosen_product["subcategory"],
                    "quantity": qty,
                    "unit_price": unit_price,
                    "discount_percent": discount_pct,
                    "gross_sales": gross_sales,
                    "discount_amount": discount_amount,
                    "net_sales": net_sales,
                    "cost": cost,
                    "gross_profit": gross_profit,
                    "gross_margin_percent": gross_margin_percent,
                    "payment_method": pm,
                    "sales_channel": sc,
                    "inventory_after_sale": inv_remaining,
                    "target_amount": target_benchmark
                }
                
                transactions_to_insert.append(txn_record)
                current_txn_num += 1
                
        # Batch insert to prevent memory bloat
        if len(transactions_to_insert) >= 8000:
            db.bulk_insert_mappings(Transaction, transactions_to_insert)
            db.commit()
            print(f"  Inserted {current_txn_num - 1} transactions (progress: {date_str})...")
            transactions_to_insert.clear()
            
    if transactions_to_insert:
        db.bulk_insert_mappings(Transaction, transactions_to_insert)
        db.commit()
        transactions_to_insert.clear()
        
    print(f"Total transactions inserted: {current_txn_num - 1}")
    
    # 6. Generate Inventory Table
    print("Generating comprehensive store inventory records...")
    inventory_records = []
    
    # As of Dec 31, 2026
    as_of_date = datetime(2026, 12, 31)
    
    for store in STORES:
        store_id = store["store_id"]
        for prod in PRODUCTS:
            p_id = prod["product_id"]
            sold = product_sales_tracker[store_id][p_id]
            unit_cost = prod["unit_cost"]
            
            # Realistic inventory movement equation:
            # closing = opening + purchases + returns - sold
            # opening stock staggered
            opening = random.randint(40, 150)
            returns = int(sold * random.uniform(0.01, 0.03))
            
            # Determine if this SKU is intentionally aging or low stock for realistic alerts
            # Let ~5% of SKUs have 0 sales in the last 95 days (aging inventory)
            # Let ~6% of SKUs have low stock (below reorder point)
            # Let ~4% of SKUs be overstocked
            is_aging_candidate = (hash(f"{store_id}-{p_id}") % 19 == 0)
            is_low_stock_candidate = (hash(f"{store_id}-{p_id}") % 17 == 0)
            is_overstocked_candidate = (hash(f"{store_id}-{p_id}") % 23 == 0)
            
            if is_aging_candidate:
                days_since = random.randint(92, 180)
                closing = random.randint(18, 55)
                aging_bucket = "90+ days"
                stock_status = "Aging"
            elif is_low_stock_candidate:
                days_since = random.randint(1, 10)
                closing = random.randint(1, max(2, prod["reorder_point"] // 3))
                aging_bucket = "0-30 days"
                stock_status = "Low Stock"
            elif is_overstocked_candidate:
                days_since = random.randint(15, 45)
                closing = random.randint(prod["reorder_point"] * 4, prod["reorder_point"] * 8)
                aging_bucket = "31-60 days" if days_since > 30 else "0-30 days"
                stock_status = "Overstocked"
            else:
                days_since = random.randint(1, 28)
                closing = random.randint(prod["reorder_point"], prod["reorder_point"] * 3)
                aging_bucket = "0-30 days"
                stock_status = "Healthy"
                
            # Rigorous conservation equation: closing = opening + purchases + returns - sold
            # Ensure purchases is non-negative by adjusting opening if needed
            net_needed = closing + sold - returns
            if net_needed < opening:
                opening = max(10, net_needed)
            purchases = net_needed - opening
            
            # Re-verify identity
            assert closing == (opening + purchases + returns - sold)
            total_value = round(closing * unit_cost, 2)
            
            inventory_records.append({
                "store_id": store_id,
                "product_id": p_id,
                "opening_inventory": opening,
                "purchases": purchases,
                "returns": returns,
                "units_sold": sold,
                "closing_inventory": closing,
                "unit_cost": unit_cost,
                "total_value": total_value,
                "days_since_last_sale": days_since,
                "aging_bucket": aging_bucket,
                "stock_status": stock_status
            })
            
    db.bulk_insert_mappings(Inventory, inventory_records)
    db.commit()
    print(f"Inserted {len(inventory_records)} inventory tracking records.")
    
    # 7. Generate Monthly Targets
    print("Generating monthly store and category targets for 2025-2026...")
    target_records = []
    
    # For each month across the 24 months:
    for year in (2025, 2026):
        for month_num in range(1, 13):
            month_str = f"{year}-{month_num:02d}"
            
            # Seasonality for monthly target calculation
            dummy_dt = datetime(year, month_num, 15)
            
            for store in STORES:
                store_id = store["store_id"]
                base_monthly = store["monthly_target"]
                if year == 2026:
                    base_monthly *= 1.10 # Target is +10% in 2026
                    
                store_mult = get_store_multiplier(store_id)
                
                # Underperformer stores have targets they struggle to hit (e.g. Target is high relative to actual)
                if store_id in ("STR-AGR-06", "STR-PAT-20"):
                    monthly_store_target = base_monthly * 0.95
                else:
                    monthly_store_target = base_monthly * store_mult
                    
                # Distribute monthly store target across the 11 categories
                for cat in categories:
                    cat_season = get_seasonality_multiplier(dummy_dt, cat)
                    # Baseline weight by category size
                    if cat in ("Televisions", "Large Appliances", "Cooling"):
                        cat_share = 0.18
                    elif cat in ("Wires & Cables", "Lighting", "Fans"):
                        cat_share = 0.11
                    elif cat in ("Switches & Sockets", "Small Appliances", "Switchgear"):
                        cat_share = 0.08
                    else:
                        cat_share = 0.04
                        
                    target_rev = round(monthly_store_target * cat_share * (cat_season / 1.1), 2)
                    target_gp = round(target_rev * (store["target_margin_percent"] / 100.0), 2)
                    target_qty = int(target_rev / 1500.0) # approximate units
                    
                    target_records.append({
                        "month": month_str,
                        "store_id": store_id,
                        "category": cat,
                        "target_revenue": target_rev,
                        "target_gross_profit": target_gp,
                        "target_units": target_qty
                    })
                    
    db.bulk_insert_mappings(Target, target_records)
    db.commit()
    print(f"Inserted {len(target_records)} monthly target benchmarks.")
    
    db.close()
    print("==================================================")
    print("DATA GENERATION COMPLETE AND COMMITTED!")
    print("==================================================")

if __name__ == "__main__":
    generate_all_data(85000)
