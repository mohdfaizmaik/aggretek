# Agriमूल्य — Agritech MVP Phase 1

A real-time commodity price monitoring app for farmers, fetching data from Agmarknet and eNAM with CSV fallback.

## 🚀 Features
- **Real-time Prices**: Polls Agmarknet + eNAM every 15 minutes.
- **Hindi + English Support**: Built-in i18n with Tiro Devanagari font.
- **7-Day Price Trends**: Interactive charts using Recharts.
- **MSP Comparison**: Automatically compares market prices with government MSP.
- **Watchlist**: Save your favorite crops to track them (requires login).

## 🛠 Tech Stack
- **Frontend**: React (Vite), react-i18next, Recharts, Axios.
- **Backend**: Node.js, Express, PostgreSQL, Redis (Caching), node-cron.
- **Localisation**: Hindi (Devanagari) + English.

## 📦 Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis

### Backend
1. `cd backend`
2. `npm install`
3. Create `.env` from `.env.example`
4. Run migrations: `psql -f src/db/schema.sql`
5. `npm start` (or `npm run dev` for nodemon)

### Frontend
1. `cd frontend`
2. `npm install`
3. Create `.env.local` for `VITE_API_URL`
4. `npm run dev`

## 🧪 Testing
Run backend unit tests:
```bash
cd backend
npm test
```
