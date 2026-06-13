-- Agritech MVP Database Schema

-- Crop master with Hindi + transliteration aliases
CREATE TABLE IF NOT EXISTS commodities (
  id           SERIAL PRIMARY KEY,
  name_en      TEXT NOT NULL UNIQUE,
  name_hi      TEXT NOT NULL,
  aliases      TEXT[] DEFAULT '{}',
  category     TEXT DEFAULT 'general',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Mandi / market master
CREATE TABLE IF NOT EXISTS markets (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  state        TEXT NOT NULL,
  district     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, state)
);

-- Raw price records (one row per commodity+market+poll cycle)
CREATE TABLE IF NOT EXISTS prices (
  id             SERIAL PRIMARY KEY,
  commodity_id   INTEGER REFERENCES commodities(id) ON DELETE CASCADE,
  market_id      INTEGER REFERENCES markets(id) ON DELETE CASCADE,
  min_price      NUMERIC(10,2),
  max_price      NUMERIC(10,2),
  modal_price    NUMERIC(10,2),
  price_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  fetched_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source         TEXT NOT NULL DEFAULT 'agmarknet', -- 'agmarknet' | 'enam' | 'csv_fallback'
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prices_commodity ON prices(commodity_id);
CREATE INDEX IF NOT EXISTS idx_prices_market    ON prices(market_id);
CREATE INDEX IF NOT EXISTS idx_prices_date      ON prices(price_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_prices_unique
  ON prices (commodity_id, market_id, price_date, source);

-- Government MSP (Minimum Support Price)
CREATE TABLE IF NOT EXISTS msp (
  id             SERIAL PRIMARY KEY,
  commodity_id   INTEGER REFERENCES commodities(id) ON DELETE CASCADE,
  season         TEXT NOT NULL,  -- 'kharif' | 'rabi'
  year           INTEGER NOT NULL,
  msp_price      NUMERIC(10,2) NOT NULL,
  announced_at   DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(commodity_id, season, year)
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  preferred_lang TEXT DEFAULT 'en',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlist
CREATE TABLE IF NOT EXISTS watchlist (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
  commodity_id   INTEGER REFERENCES commodities(id) ON DELETE CASCADE,
  market_id      INTEGER REFERENCES markets(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, commodity_id, market_id)
);

-- Seed core commodities with Hindi names + aliases
INSERT INTO commodities (name_en, name_hi, aliases, category) VALUES
  ('Wheat',          'गेहूँ',      ARRAY['gehu','gehun','wheat'],              'cereal'),
  ('Rice',           'चावल',       ARRAY['paddy','dhan','dhaan','rice'],        'cereal'),
  ('Maize',          'मक्का',      ARRAY['makka','corn','maize'],               'cereal'),
  ('Soybean',        'सोयाबीन',    ARRAY['soyabean','soy','soybean'],           'oilseed'),
  ('Mustard',        'सरसों',      ARRAY['sarson','mustard','rapeseed'],        'oilseed'),
  ('Cotton',         'कपास',       ARRAY['kapas','cotton'],                     'fiber'),
  ('Onion',          'प्याज',      ARRAY['pyaaz','pyaj','onion'],               'vegetable'),
  ('Potato',         'आलू',        ARRAY['aloo','potato'],                      'vegetable'),
  ('Tomato',         'टमाटर',      ARRAY['tamatar','tomato'],                   'vegetable'),
  ('Chana',          'चना',        ARRAY['gram','chana','chickpea'],            'pulse'),
  ('Tur Dal',        'तुअर दाल',   ARRAY['arhar','toor','tur'],                 'pulse'),
  ('Moong',          'मूंग',       ARRAY['moong','mung','green gram'],          'pulse'),
  ('Sugarcane',      'गन्ना',      ARRAY['ganna','sugarcane'],                  'cash crop'),
  ('Bajra',          'बाजरा',      ARRAY['bajra','pearl millet'],               'cereal'),
  ('Jowar',          'ज्वार',      ARRAY['jowar','sorghum'],                    'cereal'),
  ('Groundnut',      'मूँगफली',    ARRAY['moongfali','peanut','groundnut'],     'oilseed'),
  ('Sunflower',      'सूरजमुखी',   ARRAY['surajmukhi','sunflower'],             'oilseed'),
  ('Urad Dal',       'उड़द दाल',   ARRAY['urad','black gram'],                  'pulse'),
  ('Barley',         'जौ',         ARRAY['jau','barley'],                       'cereal'),
  ('Turmeric',       'हल्दी',      ARRAY['haldi','turmeric'],                   'spice')
ON CONFLICT (name_en) DO NOTHING;

-- Seed sample MSP data (2024-25)
INSERT INTO msp (commodity_id, season, year, msp_price) VALUES
  ((SELECT id FROM commodities WHERE name_en = 'Wheat'),         'rabi',   2025, 2275),
  ((SELECT id FROM commodities WHERE name_en = 'Rice'),          'kharif', 2024, 2300),
  ((SELECT id FROM commodities WHERE name_en = 'Maize'),         'kharif', 2024, 2090),
  ((SELECT id FROM commodities WHERE name_en = 'Soybean'),       'kharif', 2024, 4892),
  ((SELECT id FROM commodities WHERE name_en = 'Mustard'),       'rabi',   2025, 5950),
  ((SELECT id FROM commodities WHERE name_en = 'Cotton'),        'kharif', 2024, 7121),
  ((SELECT id FROM commodities WHERE name_en = 'Chana'),         'rabi',   2025, 5650),
  ((SELECT id FROM commodities WHERE name_en = 'Tur Dal'),       'kharif', 2024, 7550),
  ((SELECT id FROM commodities WHERE name_en = 'Moong'),         'kharif', 2024, 8682),
  ((SELECT id FROM commodities WHERE name_en = 'Bajra'),         'kharif', 2024, 2625),
  ((SELECT id FROM commodities WHERE name_en = 'Sunflower'),     'kharif', 2024, 7280),
  ((SELECT id FROM commodities WHERE name_en = 'Urad Dal'),      'kharif', 2024, 7400),
  ((SELECT id FROM commodities WHERE name_en = 'Groundnut'),     'kharif', 2024, 6783),
  ((SELECT id FROM commodities WHERE name_en = 'Barley'),        'rabi',   2025, 1935),
  ((SELECT id FROM commodities WHERE name_en = 'Jowar'),         'rabi',   2025, 3371)
ON CONFLICT (commodity_id, season, year) DO NOTHING;
