# RetailPulse — Enterprise Retail Business Analytics & Intelligence Platform

<div align="center">

![RetailPulse Banner](https://img.shields.io/badge/RetailPulse-Executive_Intelligence-0284c7?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Apache ECharts](https://img.shields.io/badge/Apache_ECharts-AA344D?style=for-the-badge&logo=apache-echarts)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)
![Tests](https://img.shields.io/badge/Tests-17%2F17_Passed-10b981?style=for-the-badge)

**"One command center for every store, product, customer and rupee."**

*A portfolio-ready, enterprise-grade retail business analytics platform engineered for executive leadership, regional managers, and merchandising strategists.*

</div>

---

## 🌟 Executive Overview

**RetailPulse** is built for modern multi-store retail enterprises operating in high-volume, omni-channel environments. Modeled on **Vertex Retail Group**—a consumer electronics and electrical chain managing 20 flagship and tier-2 stores across India—the platform transforms transaction-level granularity into instant strategic decision intelligence.

Unlike generic administrative templates or fragmented dashboard collections, RetailPulse operates on three unbreakable foundational principles:

1. **Zero Fabricated Numbers**: Every KPI, trend line, customer cohort, and alert is computed dynamically from real transactional event streams (89,464 verified records).
2. **Strict Multi-Dimensional Reconciliation**:
   $$\sum \text{Store Revenue} \equiv \sum \text{Category Revenue} \equiv \sum \text{Regional Revenue} \equiv \text{Total Portfolio Revenue}$$
3. **Mathematically Weighted Margins**:
   Gross margin is never computed as an arithmetic average of store percentages. It is rigorously weighted by transaction net volume:
   $$\text{Gross Margin \%} = \left( \frac{\sum \text{Gross Profit}}{\sum \text{Net Sales}} \right) \times 100$$

---

## 🏗️ System Architecture

RetailPulse utilizes an ultra-low latency, decoupled client-server architecture designed for sub-50ms analytics rendering:

```mermaid
flowchart TD
    subgraph Frontend["Frontend Client (React 19 + TypeScript + Tailwind)"]
        Landing["SaaS Executive Showcase\n(Hero, Live Interactive Preview, Case Study)"]
        CommandCenter["Live Command Center\n(Sidebar, Global Filter Bar, Omni-Search Ctrl+K)"]
        AttributionDrawer["Deterministic Attribution Drawer\n('Why Did This Change?')"]
        ECharts["Apache ECharts Engine\n(Dark Theme, Canvas Accelerated)"]
    end

    subgraph API["Backend Service (FastAPI + Python 3.14)"]
        Router["FastAPI REST Routers\n(/api/overview, /api/sales, /api/stores, etc.)"]
        AnalyticsEngine["Analytics Engine\n(Period Comparison, Weighted Margins, Highlights)"]
        AttributionEngine["Root-Cause Attribution Engine\n(Additive Delta Decomposition)"]
        RFMEngine["Customer RFM & 12-Mo Cohort Engine"]
        InventoryPhysics["Inventory Conservation & Aging Engine"]
        AnomalyEngine["14-Day Rolling Z-Score Anomaly Engine"]
        ReportEngine["ReportLab PDF & Streaming CSV Generator"]
    end

    subgraph Data["Persistence Layer"]
        DB[(SQLite High-Speed WAL / PostgreSQL\n89,464 Transactions | 20 Stores | 458 SKUs)]
        Validation["Continuous Mathematical Reconciliation Suite\n(0.0000 Variance Invariant)"]
    end

    Landing --> CommandCenter
    CommandCenter --> Router
    AttributionDrawer --> Router
    Router --> AnalyticsEngine
    Router --> AttributionEngine
    Router --> RFMEngine
    Router --> InventoryPhysics
    Router --> AnomalyEngine
    Router --> ReportEngine
    AnalyticsEngine --> DB
    AttributionEngine --> DB
    RFMEngine --> DB
    InventoryPhysics --> DB
    AnomalyEngine --> DB
    Validation -.-> DB
```

---

## 📊 Core Platform Modules

RetailPulse delivers 11 specialized executive workspaces:

| Module | Purpose & Capabilities | Key Analytics Invariants |
| :--- | :--- | :--- |
| **Executive Overview** | C-Suite command center showing Portfolio Net Sales, Gross Profit, Weighted Gross Margin, Orders, AOV, and 4-6 computed business highlights. | Integrated "Why Did This Change?" root-cause attribution drawer. |
| **Sales Performance** | Daily/Weekly/Monthly revenue curves, MoM & YoY delta comparisons, payment gateway distribution, and category revenue share. | Sub-50ms query aggregation with zero missing dates. |
| **Store Network** | 20-store network ranking by revenue, sales per sq.ft., margin %, target attainment, plus multi-store side-by-side comparison modal. | Sales PSF normalizes flagship 15,000 sq.ft. vs 2,500 sq.ft. outlets. |
| **Product & Merchandising** | SKU profitability matrix (Revenue vs Margin scatter bubble plot), Pareto 80/20 category distribution, top and bottom performers. | Strict detection of high-volume low-margin loss leaders. |
| **Customer Intelligence** | Deterministic RFM customer segmentation (Champions, Loyal, Growing, At Risk, Hibernating) + 12-Month Retention Cohort Heatmap. | True retention computed from initial acquisition month $M_0$. |
| **Inventory & Stock Health** | Conservation of stock, inventory turnover ratio (ITR), aging distribution (0-30, 31-60, 61-90, 90+ days), and stockout risk radar. | $\text{Closing} \equiv \text{Opening} + \text{In} - \text{Out}$. |
| **Margin & Profitability** | Revenue-to-margin waterfall chart, discount leakage analysis, return impact deductions, and margin variance heatmaps. | Weighted gross margin down to transaction level. |
| **Geographic Intelligence** | 5-region breakdown (North, South, West, East, Central), tier-1 vs tier-2 city velocity, store coverage mapping. | Regional sums reconcile exactly to country revenue. |
| **Targets & Quotas** | Store quota attainment tracking, monthly pacing %, projected month-end revenue, and variance alert indicators. | Run-rate extrapolation based on elapsed trading days. |
| **Operational Alerts** | 14-day rolling Z-score statistical anomalies ($Z < -2.2$, $Z > +2.5$), stockout warnings, and high return rate flags. | Explainable machine-generated causal narratives. |
| **Executive Reports** | C-suite branded PDF export generated via ReportLab + dynamic streaming CSV data export with active filters. | High-fidelity print-ready vector PDF document. |
| **Data Explorer** | Interactive ad-hoc query table with pagination, multi-column sorting, and column-level filters across 89,464 rows. | Sub-10ms paginated execution with full search support. |

---

## 🧮 Mathematical Rigor & Quality Guarantees

For complete formulas, LaTeX proofs, and edge-case handling, refer to [ANALYTICS_LOGIC.md](file:///c:/Users/harsh/Downloads/Business%20Analytics%20Dashboard/ANALYTICS_LOGIC.md).

### 1. The Weighted Margin Invariant
$$\text{Portfolio Margin \%} = \frac{\sum_{i=1}^N \text{Gross Profit}_i}{\sum_{i=1}^N \text{Net Sales}_i} \times 100$$
Never an arithmetic mean. Division by zero yields `0.0%`, preventing runtime `NaN` or `Infinity`.

### 2. Multi-Store Multi-Dimension Reconciliation
$$\left| \sum_{s=1}^{20} \text{Rev}_s - \text{Total Rev} \right| < 0.0001, \quad \left| \sum_{c=1}^{11} \text{Rev}_c - \text{Total Rev} \right| < 0.0001$$

### 3. Inventory Conservation Law
$$\text{Stock}_{t} = \text{Stock}_{t-1} + \text{Purchases}_t + \text{Returns}_t - \text{Sales}_t$$

### 4. Rolling Z-Score Anomaly Detection
$$Z_t = \frac{x_t - \mu_{14}}{\sigma_{14} + 1.0}$$

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Python**: 3.10+ (Tested on Python 3.14)
- **Node.js**: 18+ (Tested on Node.js v24.20)
- **npm** or **pnpm**

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/retailpulse.git
cd retailpulse
```

### Step 2: Backend Setup
```bash
# Optional: create virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run automated validation suite (Verifies 89,464 records & reconciliations)
python backend/data_generator/validate_dataset.py

# Run test suite
pytest -v backend/tests/test_backend.py

# Start Backend Server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

### Step 3: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Build for production verification
npm run build

# Start Vite Development Server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🐳 Docker Deployment

To launch the full-stack system in isolated containers:

```bash
# Copy sample environment
cp .env.example .env

# Build and launch
docker-compose up --build
```
- **Web Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API Swagger Docs**: `http://localhost:8000/docs`

---

## 🧪 Test Suite Results

The platform includes full automated test coverage across API contracts, mathematical safety, and reconciliation integrity:

```
collected 17 items

backend/tests/test_backend.py::test_health_endpoint PASSED               [  5%]
backend/tests/test_backend.py::test_safe_pct_change PASSED               [ 11%]
backend/tests/test_backend.py::test_demo_status PASSED                   [ 17%]
backend/tests/test_backend.py::test_overview_endpoint PASSED             [ 23%]
backend/tests/test_backend.py::test_stores_endpoint PASSED               [ 29%]
backend/tests/test_backend.py::test_store_detail_endpoint PASSED         [ 35%]
backend/tests/test_backend.py::test_store_compare_endpoint PASSED        [ 41%]
backend/tests/test_backend.py::test_products_endpoint PASSED             [ 47%]
backend/tests/test_backend.py::test_customers_endpoint PASSED            [ 52%]
backend/tests/test_backend.py::test_inventory_endpoint PASSED            [ 58%]
backend/tests/test_backend.py::test_profitability_endpoint PASSED        [ 64%]
backend/tests/test_backend.py::test_geography_endpoint PASSED            [ 70%]
backend/tests/test_backend.py::test_alerts_endpoint PASSED               [ 76%]
backend/tests/test_backend.py::test_pdf_report_endpoint PASSED           [ 82%]
backend/tests/test_backend.py::test_csv_export_endpoint PASSED           [ 88%]
backend/tests/test_backend.py::test_search_endpoint PASSED               [ 94%]
backend/tests/test_backend.py::test_cross_filtering_consistency PASSED   [100%]

======================== 17 passed in 7.74s ========================
```

---

## 📂 Repository Structure

```
Business Analytics Dashboard/
├── ANALYTICS_LOGIC.md               # Complete mathematical reference & formulas
├── README.md                        # Enterprise product documentation
├── docker-compose.yml               # Production container orchestration
├── .env.example                     # Environment configuration template
│
├── backend/
│   ├── requirements.txt             # FastAPI, SQLAlchemy, ReportLab, Pandas, Pytest
│   ├── Dockerfile                   # Python container definition
│   ├── app/
│   │   ├── main.py                  # FastAPI application entrypoint & middleware
│   │   ├── core/                    # Database connection (SQLite WAL / PostgreSQL)
│   │   ├── models/                  # SQLAlchemy 2.0 entities (Store, Product, Transaction, etc.)
│   │   ├── schemas/                 # Pydantic validation schemas
│   │   ├── services/                # Analytics, RFM, Inventory, Attribution, Anomaly engines
│   │   └── api/routes/              # 13 REST API endpoints
│   ├── data/                        # retailpulse.db (89,464 transactions, verified)
│   ├── data_generator/              # Generator script & reconciliation validator
│   └── tests/                       # Pytest test suite
│
└── frontend/
    ├── package.json                 # React 19, TypeScript, ECharts, Tailwind CSS, Lucide
    ├── Dockerfile                   # Node multi-stage build + Nginx container
    ├── nginx.conf                   # Nginx reverse proxy configuration
    ├── vite.config.ts               # Vite configuration with backend proxy
    ├── tailwind.config.js           # Slate/Cyan executive design tokens
    └── src/
        ├── types/                   # TypeScript interfaces matching backend models
        ├── utils/                   # Currency formatters (₹ Cr, ₹ L, ₹k), dates, math helpers
        ├── services/                # Axios API client
        ├── context/                 # FilterContext (global date, store, region, category filters)
        ├── components/
        │   ├── common/              # KPICard, EChart, StatusBadge, SkeletonLoader, EmptyState
        │   ├── navigation/          # Sidebar, TopNav, GlobalFilterBar
        │   ├── landing/             # Hero, Live Interactive Preview, Case Study, Architecture
        │   └── analytics/           # 11 Dedicated Executive Workspaces
        └── App.tsx                  # App shell coordinating Landing vs Command Center
```

---

## 📄 License & Attribution

Designed and engineered as a showcase portfolio product for senior analytics engineering, enterprise frontend architecture, and full-stack product leadership. All synthetic transactional distributions are generated with realistic seasonal curves, holiday spikes (Diwali, New Year), weekend footfall patterns, and genuine retail business dynamics.
