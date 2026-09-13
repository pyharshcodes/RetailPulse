# RetailPulse — Analytics Logic & Mathematical Reference Manual

## Executive Summary
RetailPulse is engineered with **zero fabricated numbers**, **zero hardcoded KPIs**, and **strict mathematical reconciliation**. In retail decision-making, reporting errors such as computing the arithmetic average of margins or ignoring inventory conservation destroy executive trust.

This document formalizes every mathematical metric, financial definition, reconciliation invariant, anomaly detection formula, and attribution algorithm implemented within the RetailPulse analytics engine.

---

## 1. Core Financial & Performance Metrics

### 1.1 Net Sales (Revenue)
Net sales represents the actual top-line revenue captured after deductions for customer returns and volume/promotional discounts.

$$\text{Net Sales} = \sum_{i \in \text{Transactions}} (\text{Gross Amount}_i - \text{Discount Amount}_i - \text{Return Amount}_i)$$

* **Input fields**: `gross_sales`, `discount_amount`, `return_amount`
* **Invariant**: $\text{Net Sales} \ge 0$ (negative lines denote net returns for that line item)
* **Code Reference**: `backend/app/services/analytics_engine.py`

### 1.2 Cost of Goods Sold (COGS)
COGS reflects the wholesale purchase cost of units actually sold, adjusted for returned goods re-entering salable stock:

$$\text{COGS} = \sum_{i \in \text{Transactions}} (\text{Unit Cost}_i \times (\text{Quantity Sold}_i - \text{Quantity Returned}_i))$$

### 1.3 Gross Profit (GP)
Gross profit is the monetary margin remaining after accounting for inventory costs:

$$\text{Gross Profit} = \text{Net Sales} - \text{COGS}$$

### 1.4 Weighted Gross Margin % (Crucial Distinction)
**Common Industry Mistake**: Taking the arithmetic mean of store or product margin percentages:
$$\text{Arithmetic Average} = \frac{1}{N} \sum_{j=1}^N \text{Margin}_j \quad \text{\textbf{[INCORRECT / MISLEADING]}}$$
An outlet generating ₹1,000 at 50% margin and a flagship store generating ₹10,00,000 at 10% margin do not yield a 30% business margin.

**RetailPulse Formula (Weighted Gross Margin)**:
$$\text{Weighted Margin \%} = \left( \frac{\sum_{i} \text{Gross Profit}_i}{\sum_{i} \text{Net Sales}_i} \right) \times 100$$
* **Edge Case Handling**: If $\sum \text{Net Sales} = 0$, $\text{Margin} = 0.0\%$, avoiding division by zero or `NaN`.
* **Reconciliation Guarantee**: Sub-aggregates weighted by revenue sum exactly to the parent aggregate margin.

### 1.5 Average Order Value (AOV)
$$\text{AOV} = \frac{\text{Net Sales}}{\text{Total Orders}}$$
Where $\text{Total Orders} = \text{COUNT}(\text{DISTINCT transaction\_id})$.

### 1.6 Units Per Transaction (UPT)
$$\text{UPT} = \frac{\sum \text{Units Sold}}{\text{Total Orders}}$$

### 1.7 Return Rate %
$$\text{Return Rate \%} = \left( \frac{\sum \text{Return Amount}}{\sum \text{Gross Sales}} \right) \times 100$$

### 1.8 Discount Rate %
$$\text{Discount Rate \%} = \left( \frac{\sum \text{Discount Amount}}{\sum \text{Gross Sales}} \right) \times 100$$

### 1.9 Sales Per Square Foot (Store Productivity)
$$\text{Sales PSF} = \frac{\text{Store Net Sales}}{\text{Store Carpet Area (sq. ft.)}}$$
Allows normalized performance comparisons between flagship 15,000 sq.ft. destinations and 2,500 sq.ft. express tier-2 stores.

---

## 2. Multi-Dimensional Reconciliation Invariant

Every aggregate figure in RetailPulse conforms to the strict identity:

$$\sum_{s \in \text{Stores}} \text{Revenue}_s \equiv \sum_{c \in \text{Categories}} \text{Revenue}_c \equiv \sum_{r \in \text{Regions}} \text{Revenue}_r \equiv \text{Total Portfolio Revenue}$$

The dataset validation script (`backend/data_generator/validate_dataset.py`) validates this continuously with zero-tolerance:
$$\left| \sum \text{Dimension} - \text{Total} \right| < 0.0001$$

---

## 3. Inventory Conservation Law & Metrics

### 3.1 Inventory Conservation Identity
Inventory balance is strictly conservative. Units cannot materialize or evaporate:

$$\text{Closing Stock}_t \equiv \text{Opening Stock}_t + \text{Purchased}_t + \text{Customer Returns}_t - \text{Units Sold}_t$$

* **Verification**: In `backend/data_generator/generator.py`, all monthly store-SKU snapshots are computed through this differential equation.

### 3.2 Inventory Turnover Ratio (ITR)
Measures the velocity at which stock is sold and replenished:

$$\text{Inventory Turnover} = \frac{\text{Annualized COGS}}{\text{Average Salable Inventory Value}}$$
Where:
$$\text{Average Inventory Value} = \frac{\text{Opening Value} + \text{Closing Value}}{2}$$

### 3.3 Days Sales of Inventory (DSI / DIO)
$$\text{DSI} = \frac{365}{\text{Inventory Turnover}} = \frac{\text{Average Inventory Value}}{\text{COGS} / 365}$$

### 3.4 Inventory Aging Buckets
Every product batch in stock is evaluated based on days elapsed since the latest supplier receipt:
1. **Fresh (0–30 Days)**: High velocity, standard retail shelf life.
2. **Normal (31–60 Days)**: Regular turnover cycle.
3. **Slow-Moving (61–90 Days)**: Requires targeted store displays or bundle promotions.
4. **Dead Stock / Critical Aging (>90 Days)**: Trapped working capital; triggers automated clearance recommendations.

### 3.5 GMROI (Gross Margin Return on Investment)
$$\text{GMROI} = \frac{\text{Gross Profit}}{\text{Average Inventory Cost}}$$
A GMROI of 2.8 means every ₹1.0 invested in product inventory generated ₹2.80 in gross margin over the period.

---

## 4. Customer Intelligence & Segmentation

### 4.1 RFM Matrix Scoring
Customers are scored deterministically on a $1\text{ to }5$ scale across three dimensions:
- **Recency ($R$)**: Days between customer's most recent transaction and the analysis cutoff date.
  - $R \le 30 \implies 5$
  - $30 < R \le 60 \implies 4$
  - $60 < R \le 120 \implies 3$
  - $120 < R \le 240 \implies 2$
  - $R > 240 \implies 1$
- **Frequency ($F$)**: Total distinct purchase visits.
  - $F \ge 15 \implies 5$
  - $10 \le F < 15 \implies 4$
  - $5 \le F < 10 \implies 3$
  - $2 \le F < 5 \implies 2$
  - $F = 1 \implies 1$
- **Monetary ($M$)**: Cumulative lifetime net spend.
  - $M \ge ₹2,00,000 \implies 5$
  - $₹1,00,000 \le M < ₹2,00,000 \implies 4$
  - $₹50,000 \le M < ₹1,00,000 \implies 3$
  - $₹20,000 \le M < ₹50,000 \implies 2$
  - $M < ₹20,000 \implies 1$

### 4.2 Deterministic Customer Personas
Segments are defined by logic without black-box drift:
* **High Value Champions**: $R \ge 4 \land F \ge 4 \land M \ge 4$ (Account for disproportionate revenue and VIP margin).
* **Loyal Regulars**: $R \ge 3 \land F \ge 3$
* **Growing / Promising**: $R \ge 4 \land F \le 2 \land M \ge 2$ (Recent first or second-time buyers with high basket size).
* **At Risk**: $R \le 2 \land F \ge 3 \land M \ge 3$ (Historically high-value accounts that haven't purchased in >90 days).
* **Low Engagement / Hibernating**: $R \le 2 \land F \le 2$

### 4.3 12-Month Cohort Retention
Cohorts are grouped by the calendar month of the customer's **first transaction** ($M_0$).
For each subsequent month $M_k$ ($k \in [0, 11]$):

$$\text{Retention Rate}(M_0, M_k) = \left( \frac{\text{Active Customers in } M_k \text{ from Cohort } M_0}{\text{Total Initial Customers in Cohort } M_0} \right) \times 100$$

---

## 5. Anomaly Detection & Statistical Quality

### 5.1 Rolling Z-Score Formulation
To identify unexpected sales spikes or catastrophic store dips without false alarms caused by weekly seasonality:

$$Z_t = \frac{x_t - \mu_{t-14, t-1}}{\sigma_{t-14, t-1} + \epsilon}$$

Where:
* $x_t$ is the observed daily net sales.
* $\mu_{t-14, t-1}$ is the rolling 14-day sample mean.
* $\sigma_{t-14, t-1}$ is the sample standard deviation over the prior 14 days:
  $$\sigma = \sqrt{\frac{1}{13} \sum_{i=1}^{14} (x_{t-i} - \mu)^2}$$
* $\epsilon = 1.0$ (smoothing constant preventing zero-division on flat periods).

### 5.2 Alert Thresholds
* **Critical Negative Deviation**: $Z_t < -2.2$ (Sudden supply chain rupture, POS outage, or localized disruption).
* **High Positive Surge**: $Z_t > +2.5$ (Flash viral promotion, festival eve peak, or unexpected B2B wholesale order).
* **Explanation Synthesis**: The anomaly engine inspects concurrent returns, top product delta, and category mix to generate human-readable explanations (e.g., *"Large commercial order for Air Conditioners drove +280% deviation vs 14-day baseline"*).

---

## 6. Deterministic Root-Cause Attribution ("Why Did This Change?")

When executive metrics change between Period $A$ and Period $B$ (e.g., this month vs last month, or year-over-year), RetailPulse computes an exact additive decomposition:

$$\Delta \text{Total} = \text{Metric}_B - \text{Metric}_A \equiv \sum_{k} \Delta \text{Component}_k$$

### 6.1 Dimension Contribution
For any categorical dimension $D$ (e.g., Region, Store, Product Category):
$$\Delta_k = \text{Metric}_{B, k} - \text{Metric}_{A, k}$$
$$\text{Contribution Share \%}_k = \left( \frac{\Delta_k}{|\Delta \text{Total}|} \right) \times 100$$

The Attribution Drawer categorizes top positive contributors (Growth Drivers) and top negative drags (Leakage Points), guaranteeing that the sum of all deltas matches the executive KPI delta to the last paisa.

---

## 7. Target Achievement & Pacing

### 7.1 Pacing Rate
$$\text{Pacing \%} = \left( \frac{\text{Current Period Elapsed Days}}{\text{Total Days in Period}} \right) \times 100$$

### 7.2 Run Rate Forecast
$$\text{Projected Total} = \left( \frac{\text{Actual Revenue to Date}}{\text{Days Elapsed}} \right) \times \text{Days in Month}$$

### 7.3 Target Attainment
$$\text{Achievement \%} = \left( \frac{\text{Actual Revenue}}{\text{Monthly Target}} \right) \times 100$$
* $\ge 100\%$: Target Exceeded (Emerald)
* $90\% - 99.9\%$: On Track (Sky Blue)
* $75\% - 89.9\%$: At Risk (Amber)
* $< 75\%$: Underperforming / Off Track (Rose Red)
