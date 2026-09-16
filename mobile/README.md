# RetailPulse Mobile App (React Native + Expo)

Cyber-dark executive mobile application for **RetailPulse SaaS** featuring real-time POS live stream telemetry, margin risk radar, and direct UPI QR subscription gating.

---

## 📱 Mobile Features

1. **Executive Dashboard (Home)**:
   - Real-time Gross Revenue, Gross Margin %, Orders, and YoY Growth indicators.
   - **Live POS Stream Ticker**: Sub-second ticker showing store checkouts, basket items, payment modes, and margins.
   - **Simulate Sale (+1)**: Instant interactive button to trigger simulated retail sales with dynamic state propagation.

2. **Performance Analytics**:
   - Time filters (`Today`, `7D`, `30D`, `1Y`).
   - SVG visual charts for weekly revenue trends and day-by-day velocity.
   - Category contribution bars with margin percentage tracking.
   - Store efficiency leaderboard with PSF (Per Square Foot) rankings.

3. **AI Risk Radar & Prescriptive Insights**:
   - **Margin Risk Radar**: Instant detection of products selling below cost price (negative margin leakage) with 1-tap AI price adjustment.
   - **Stockout Predictor**: Velocity-based Days of Supply forecast with critical threshold badges.
   - **Autonomous Recommendations**: Financial uplift predictions with AI confidence scoring.

4. **SaaS Plans & Instant UPI QR Gateway**:
   - Plan tiers: **Free Forever** (₹0), **Pro Growth** (₹499/mo), and **Business Enterprise** (₹1,499/mo).
   - High-contrast UPI QR Code modal with 10-minute session countdown.
   - Copyable official merchant VPA (`retailpulse@upi`).
   - 12-digit bank UTR verification connected to backend `POST /api/tenants/verify-payment`.
   - Multi-currency switcher (₹ INR, $ USD, € EUR).
   - Team member seat allocation management.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Run in Web Browser Preview
You can run the mobile app directly in any browser (Chrome, Edge, Safari):
```bash
npm run web
```
or
```bash
npx expo start --web
```

### 3. Run on Physical Device (Android / iOS)
1. Install **Expo Go** from Google Play Store or Apple App Store.
2. Start the development server:
```bash
npm start
```
3. Scan the generated QR code in your terminal with your phone camera (iOS) or the Expo Go app (Android).

---

## 🏗️ Architecture

```
                  RetailPulse SaaS
                         │
        ┌────────────────┴────────────────┐
        │                                 │
   Web App                          Mobile App
 (React + Vite)                (React Native + Expo)
        │                                 │
        └────────────────┬────────────────┘
                         │
                    FastAPI REST
                         │
                  SQLite Database
              (Multi-Tenant Isolation)
```
