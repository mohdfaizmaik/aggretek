# Agritech Multi-Phase Development Roadmap

This document outlines the full lifecycle of the **Agriमूल्य** application, from its initial MVP foundation to a comprehensive ecosystem for farmers.

---

## ✅ Phase 1: Foundation (Weeks 1–6) — NEAR COMPLETE
**Goal:** Establish the core value proposition: "Fair price discovery."

### Delivered Features:
- **Agmarknet & eNAM Integration**: Real-time polling of commodity prices.
- **Fail-safe Scraper**: Automatic fallback to CSV data when official APIs are unstable.
- **Price Table & Charts**: Sortable data with 7-day sparkline trends using Recharts.
- **MSP Comparison**: Visual indicators for prices above or below Government MSP.
- **Localisation**: Support for Hindi (**Tiro Devanagari**) and English.
- **Watchlist**: JWT-protected personal dashboard for tracking specific mandis.

---

## 🚀 Phase 2: Hyper-Local Insights (Weeks 7–12) — UP NEXT
**Goal:** Provide actionable data beyond just market prices.

- **Village-Level Weather**: Integration with hyper-local weather APIs for sowing/harvesting alerts.
- **Price Predictions**: Basic ML-driven price trend forecasting based on historical data.
- **Mandi News**: A curated feed of local mandi closures, news, and agricultural updates.
- **Push Notifications**: Real-time alerts when a tracked crop hits a target price or MSP changes.

---

## 🤝 Phase 3: Community & Marketplace (Weeks 13–18)
**Goal:** Enable commerce and peer-to-peer resource sharing.

- **Equipment Rental**: A P2P marketplace for farmers to rent out tractors, harvesters, and tools.
- **Community Buying**: Group-buying portal for seeds and fertilizers to get bulk discount rates.
- **Government Schemes**: A searchable library of state/central schemes with an eligibility checker.
- **Expert Q&A**: A forum or chat interface for consulting with agricultural scientists.

---

## 🏦 Phase 4: Financial & Logistics Ecosystem (Weeks 19–24)
**Goal:** Close the loop from farm to bank.

- **Transport Booking**: Integration with local logistics providers to book trucks for mandi delivery.
- **Digital Finance (KCC)**: Facilitating applications for Kisan Credit Cards and micro-loans.
- **Soil Health Logs**: A digital ledger for soil health cards and historical land usage.
- **Direct-to-Consumer**: A pilot portal for high-volume buyers to source directly from farmer groups.

---

## 📊 Current Status
- **Overall Completion:** 25% (Foundation 100% Done)
- **Primary Tech Stack:** Node.js, React (Vite), PostgreSQL, Redis.
- **Primary Markets:** Maharashtra, Madhya Pradesh, Delhi (Initial Data Focus).
