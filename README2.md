# Agritech Multi-Phase Development Roadmap

This document outlines the full lifecycle of the **Agriमूल्य** application, from its initial MVP foundation to a comprehensive ecosystem for farmers.

---

## ✅ Phase 1: Foundation (Weeks 1–6) — COMPLETE
**Goal:** Establish the core value proposition: "Fair price discovery."

### Delivered Features:
- **Agmarknet & eNAM Integration**: Real-time polling of commodity prices.
- **Fail-safe Scraper**: Automatic fallback to CSV data when official APIs are unstable.
- **Price Table & Charts**: Sortable data with 7-day sparkline trends using Recharts.
- **MSP Comparison**: Visual indicators for prices above or below Government MSP.
- **Localisation**: Support for Hindi (**Tiro Devanagari**) and English.
- **Watchlist**: JWT-protected personal dashboard for tracking specific mandis.

---

## 🚀 Phase 2: Hyper-Local Insights (Weeks 7–12) — IN PROGRESS
**Goal:** Provide actionable data beyond just market prices.

### Week 7 — ✅ Weather & location (shipped)
- **Open-Meteo** integration (free, no API key) with Redis cache (30 min)
- User profile: village, district, state, optional GPS
- **`GET /api/insights`** — weather + sowing/harvest alerts in one call (low bandwidth)
- **WeatherCard** + **AlertsBanner** on home page
- **crop_calendar** seeded for Wheat, Rice, Soybean, Cotton, Onion (MH, MP, Delhi)

### Upcoming (Weeks 8–12)
- Price threshold push notifications (FCM)
- Mandi closure feed + news RSS
- Basic price forecast (EMA, nightly job)

**Migration (Neon / local):**
```bash
psql "$DATABASE_URL" -f backend/src/db/migrations/002_phase2_weather.sql
```

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
- **Overall Completion:** ~30% (Phase 1 done; Phase 2 Week 7 started)
- **Primary Tech Stack:** Node.js, React (Vite), PostgreSQL, Redis.
- **Primary Markets:** Maharashtra, Madhya Pradesh, Delhi (Initial Data Focus).
