import sqlite3
from pathlib import Path
import bcrypt
import datetime
from backend.app.core.config import settings, DATA_DIR
from backend.app.core.database import Base, engine

def setup_saas_database():
    """
    Idempotent database initialization and migration:
    1. Creates tenants and users tables via SQLAlchemy Base.metadata.create_all
    2. Adds tenant_id column to existing tables if missing
    3. Seeds demo_tenant and default admin user
    4. Backfills all existing records to 'demo_tenant'
    """
    # Create any missing tables (including tenants and users)
    Base.metadata.create_all(bind=engine)
    
    # Run SQLite pragma and column checks
    db_path = DATA_DIR / "retailpulse.db"
    if not db_path.exists():
        return
        
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    tables = ["transactions", "stores", "products", "customers", "inventory", "targets"]
    for table in tables:
        cursor.execute(f"PRAGMA table_info({table});")
        columns = [col[1] for col in cursor.fetchall()]
        if "tenant_id" not in columns:
            print(f"Adding tenant_id column to {table}...")
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN tenant_id TEXT DEFAULT 'demo_tenant';")
            cursor.execute(f"UPDATE {table} SET tenant_id = 'demo_tenant' WHERE tenant_id IS NULL OR tenant_id = '';")
            cursor.execute(f"CREATE INDEX IF NOT EXISTS idx_{table}_tenant ON {table}(tenant_id);")

    # Check / seed demo_tenant
    cursor.execute("SELECT id FROM tenants WHERE id = 'demo_tenant';")
    demo_tenant = cursor.fetchone()
    if not demo_tenant:
        print("Seeding default demo_tenant (Vertex Retail Group)...")
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        cursor.execute(
            """
            INSERT INTO tenants (id, name, slug, industry, currency, currency_symbol, number_format, plan_tier, trial_ends_at, is_active, api_key, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "demo_tenant",
                "Vertex Retail Group",
                "vertex-retail-group",
                "Electrical & Consumer Electronics Retail",
                "INR",
                "₹",
                "indian",
                "enterprise",
                None,
                1,
                "rp_live_demo_vertex_key",
                now_str
            )
        )
        
    # Check / seed demo admin user
    cursor.execute("SELECT id FROM users WHERE email = 'admin@retailpulse.io';")
    demo_user = cursor.fetchone()
    if not demo_user:
        print("Seeding demo admin user...")
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        # Hash 'admin123'
        hashed = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode("utf-8")
        cursor.execute(
            """
            INSERT INTO users (id, email, hashed_password, full_name, role, tenant_id, assigned_store_id, is_active, created_at, last_login_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "user_demo_admin",
                "admin@retailpulse.io",
                hashed,
                "Rajiv Menon (Executive)",
                "owner",
                "demo_tenant",
                None,
                1,
                now_str,
                now_str
            )
        )

    conn.commit()
    conn.close()
    print("SaaS database verification and setup complete!")

if __name__ == "__main__":
    setup_saas_database()
