"""
Strict dataset validation & multi-dimensional reconciliation engine.
Verifies business logic, constraints, non-negativity, foreign keys, and reconciliation equations.
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import func, distinct
from backend.app.core.database import SessionLocal
from backend.app.models.store import Store
from backend.app.models.product import Product
from backend.app.models.customer import Customer
from backend.app.models.transaction import Transaction
from backend.app.models.inventory import Inventory
from backend.app.models.target import Target

def run_dataset_validation() -> bool:
    print("==================================================")
    print("RUNNING STRICT DATASET VALIDATION & RECONCILIATION")
    print("==================================================")
    
    db = SessionLocal()
    has_errors = False
    
    # 1. Row counts
    txn_count = db.query(func.count(Transaction.id)).scalar() or 0
    store_count = db.query(func.count(Store.store_id)).scalar() or 0
    prod_count = db.query(func.count(Product.product_id)).scalar() or 0
    cust_count = db.query(func.count(Customer.customer_id)).scalar() or 0
    inv_count = db.query(func.count(Inventory.id)).scalar() or 0
    target_count = db.query(func.count(Target.id)).scalar() or 0
    
    print(f"Entities in database:")
    print(f"  Stores:        {store_count}")
    print(f"  Products:      {prod_count}")
    print(f"  Customers:     {cust_count}")
    print(f"  Transactions:  {txn_count}")
    print(f"  Inventory SKUs:{inv_count}")
    print(f"  Targets:       {target_count}")
    
    if txn_count < 75000:
        print(f"[FAIL] Transaction count {txn_count} is below minimum requirement of 75,000!")
        has_errors = True
    else:
        print(f"[PASS] Transaction count {txn_count} meets requirement.")
        
    if store_count != 20:
        print(f"[FAIL] Store count {store_count} != 20!")
        has_errors = True
    else:
        print(f"[PASS] 20 stores present.")
        
    if prod_count < 300:
        print(f"[FAIL] Product count {prod_count} < 300!")
        has_errors = True
    else:
        print(f"[PASS] Product count {prod_count} >= 300.")
        
    # 2. Non-negativity & validity checks
    bad_quantities = db.query(func.count(Transaction.id)).filter(Transaction.quantity <= 0).scalar() or 0
    if bad_quantities > 0:
        print(f"[FAIL] Found {bad_quantities} transactions with quantity <= 0!")
        has_errors = True
    else:
        print("[PASS] All quantities are positive integers.")
        
    bad_prices = db.query(func.count(Transaction.id)).filter(Transaction.unit_price <= 0).scalar() or 0
    if bad_prices > 0:
        print(f"[FAIL] Found {bad_prices} transactions with unit_price <= 0!")
        has_errors = True
    else:
        print("[PASS] All unit prices are positive.")
        
    bad_discounts = db.query(func.count(Transaction.id)).filter(
        (Transaction.discount_percent < 0) | (Transaction.discount_percent > 100)
    ).scalar() or 0
    if bad_discounts > 0:
        print(f"[FAIL] Found {bad_discounts} transactions with invalid discount percentages!")
        has_errors = True
    else:
        print("[PASS] All discounts within valid range [0, 100]%.")
        
    # 3. Formula integrity checks (sample or full check)
    # Check max tolerance for floating-point calculation on roundings
    sample_txns = db.query(Transaction).limit(5000).all()
    formula_errors = 0
    for t in sample_txns:
        expected_gross = round(t.quantity * t.unit_price, 2)
        expected_disc = round(expected_gross * (t.discount_percent / 100.0), 2)
        expected_net = round(expected_gross - expected_disc, 2)
        expected_gp = round(expected_net - t.cost, 2)
        
        if abs(t.gross_sales - expected_gross) > 0.02:
            formula_errors += 1
        if abs(t.discount_amount - expected_disc) > 0.02:
            formula_errors += 1
        if abs(t.net_sales - expected_net) > 0.02:
            formula_errors += 1
        if abs(t.gross_profit - expected_gp) > 0.02:
            formula_errors += 1
            
    if formula_errors > 0:
        print(f"[FAIL] Found {formula_errors} formula discrepancies in transaction sample!")
        has_errors = True
    else:
        print("[PASS] Transaction formula mathematical consistency verified.")
        
    # 4. Inventory Ledger Equation Check
    # closing_inventory == opening_inventory + purchases + returns - units_sold
    inv_discrepancies = db.query(func.count(Inventory.id)).filter(
        Inventory.closing_inventory != (Inventory.opening_inventory + Inventory.purchases + Inventory.returns - Inventory.units_sold)
    ).scalar() or 0
    if inv_discrepancies > 0:
        print(f"[FAIL] Found {inv_discrepancies} inventory ledger records violating: closing = opening + purchases + returns - sold!")
        has_errors = True
    else:
        print("[PASS] Inventory movement equation rigorously satisfied across all SKUs.")
        
    # 5. Multi-dimensional Reconciliation Checks
    print("\n--- RECONCILIATION VERIFICATION ---")
    total_net_sales = db.query(func.sum(Transaction.net_sales)).scalar() or 0.0
    total_gross_profit = db.query(func.sum(Transaction.gross_profit)).scalar() or 0.0
    total_orders = db.query(func.count(distinct(Transaction.transaction_id))).scalar() or 0
    total_units = db.query(func.sum(Transaction.quantity)).scalar() or 0
    
    print(f"Total Dataset Net Sales:    Rs. {total_net_sales:,.2f}")
    print(f"Total Dataset Gross Profit: Rs. {total_gross_profit:,.2f}")
    print(f"Total Distinct Orders:      {total_orders:,}")
    print(f"Total Units Sold:           {total_units:,}")
    
    # Reconcile Store Sums vs Total
    store_sums = db.query(
        func.sum(Transaction.net_sales).label("store_sales"),
        func.sum(Transaction.gross_profit).label("store_profit")
    ).group_by(Transaction.store_id).all()
    sum_store_sales = sum(s.store_sales for s in store_sums)
    sum_store_profit = sum(s.store_profit for s in store_sums)
    
    diff_store_sales = abs(sum_store_sales - total_net_sales)
    diff_store_profit = abs(sum_store_profit - total_gross_profit)
    if diff_store_sales > 0.05 or diff_store_profit > 0.05:
        print(f"[FAIL] Store totals discrepancy: Sales diff={diff_store_sales:.4f}, Profit diff={diff_store_profit:.4f}")
        has_errors = True
    else:
        print(f"[PASS] SUM(stores) == SUM(total) [Sales diff: {diff_store_sales:.4f}, Profit diff: {diff_store_profit:.4f}]")
        
    # Reconcile Category Sums vs Total
    cat_sums = db.query(
        func.sum(Transaction.net_sales).label("cat_sales"),
        func.sum(Transaction.gross_profit).label("cat_profit")
    ).group_by(Transaction.category).all()
    sum_cat_sales = sum(c.cat_sales for c in cat_sums)
    sum_cat_profit = sum(c.cat_profit for c in cat_sums)
    
    diff_cat_sales = abs(sum_cat_sales - total_net_sales)
    diff_cat_profit = abs(sum_cat_profit - total_gross_profit)
    if diff_cat_sales > 0.05 or diff_cat_profit > 0.05:
        print(f"[FAIL] Category totals discrepancy: Sales diff={diff_cat_sales:.4f}, Profit diff={diff_cat_profit:.4f}")
        has_errors = True
    else:
        print(f"[PASS] SUM(categories) == SUM(total) [Sales diff: {diff_cat_sales:.4f}, Profit diff: {diff_cat_profit:.4f}]")
        
    # Reconcile Region Sums vs Total
    region_sums = db.query(
        func.sum(Transaction.net_sales).label("reg_sales"),
        func.sum(Transaction.gross_profit).label("reg_profit")
    ).group_by(Transaction.region).all()
    sum_reg_sales = sum(r.reg_sales for r in region_sums)
    sum_reg_profit = sum(r.reg_profit for r in region_sums)
    
    diff_reg_sales = abs(sum_reg_sales - total_net_sales)
    diff_reg_profit = abs(sum_reg_profit - total_gross_profit)
    if diff_reg_sales > 0.05 or diff_reg_profit > 0.05:
        print(f"[FAIL] Region totals discrepancy: Sales diff={diff_reg_sales:.4f}, Profit diff={diff_reg_profit:.4f}")
        has_errors = True
    else:
        print(f"[PASS] SUM(regions) == SUM(total) [Sales diff: {diff_reg_sales:.4f}, Profit diff: {diff_reg_profit:.4f}]")
        
    db.close()
    
    if has_errors:
        print("\n==================================================")
        print("VALIDATION STATUS: FAILED")
        print("==================================================")
        return False
    else:
        print("\n==================================================")
        print("VALIDATION STATUS: ALL RECONCILIATIONS PASSED 100%")
        print("==================================================")
        return True

if __name__ == "__main__":
    success = run_dataset_validation()
    sys.exit(0 if success else 1)
