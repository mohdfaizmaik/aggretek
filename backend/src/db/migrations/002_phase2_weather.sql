-- Phase 2 Week 7: user location, weather snapshots, crop calendar

ALTER TABLE users ADD COLUMN IF NOT EXISTS village       TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS district      TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state         TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude      NUMERIC(9,6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude     NUMERIC(9,6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_enabled BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_users_district ON users(district, state);

CREATE TABLE IF NOT EXISTS weather_snapshots (
  id             SERIAL PRIMARY KEY,
  latitude       NUMERIC(9,6) NOT NULL,
  longitude      NUMERIC(9,6) NOT NULL,
  district       TEXT,
  state          TEXT,
  temp_c         NUMERIC(5,2),
  humidity_pct   SMALLINT,
  rainfall_mm    NUMERIC(6,2),
  wind_kmh       NUMERIC(5,2),
  condition_en   TEXT,
  condition_hi   TEXT,
  forecast_json  JSONB,
  fetched_at     TIMESTAMPTZ DEFAULT NOW(),
  source         TEXT DEFAULT 'open_meteo'
);

CREATE INDEX IF NOT EXISTS idx_weather_loc ON weather_snapshots(latitude, longitude, fetched_at DESC);

CREATE TABLE IF NOT EXISTS crop_calendar (
  id             SERIAL PRIMARY KEY,
  commodity_id   INTEGER REFERENCES commodities(id) ON DELETE CASCADE,
  state          TEXT NOT NULL,
  sow_start      DATE NOT NULL,
  sow_end        DATE NOT NULL,
  harvest_start  DATE NOT NULL,
  harvest_end    DATE NOT NULL,
  min_rain_mm    NUMERIC(6,2) DEFAULT 15,
  max_temp_c     NUMERIC(5,2) DEFAULT 38,
  UNIQUE(commodity_id, state)
);

-- Sowing/harvest windows (approximate; MH, MP, Delhi focus)
INSERT INTO crop_calendar (commodity_id, state, sow_start, sow_end, harvest_start, harvest_end, min_rain_mm, max_temp_c)
SELECT c.id, s.state, s.sow_start, s.sow_end, s.harvest_start, s.harvest_end, s.min_rain_mm, s.max_temp_c
FROM commodities c
CROSS JOIN (VALUES
  ('Maharashtra',     '2026-06-15'::date, '2026-07-15'::date, '2026-09-15'::date, '2026-10-31'::date, 80, 35),
  ('Madhya Pradesh',  '2026-06-15'::date, '2026-07-15'::date, '2026-09-15'::date, '2026-10-31'::date, 80, 35)
) AS s(state, sow_start, sow_end, harvest_start, harvest_end, min_rain_mm, max_temp_c)
WHERE c.name_en = 'Soybean'
ON CONFLICT (commodity_id, state) DO NOTHING;

INSERT INTO crop_calendar (commodity_id, state, sow_start, sow_end, harvest_start, harvest_end, min_rain_mm, max_temp_c)
SELECT c.id, s.state, s.sow_start, s.sow_end, s.harvest_start, s.harvest_end, s.min_rain_mm, s.max_temp_c
FROM commodities c
CROSS JOIN (VALUES
  ('Maharashtra',     '2026-10-15'::date, '2026-11-30'::date, '2027-03-15'::date, '2027-04-30'::date, 20, 35),
  ('Madhya Pradesh',  '2026-10-15'::date, '2026-11-30'::date, '2027-03-15'::date, '2027-04-30'::date, 20, 35),
  ('Delhi',           '2026-11-01'::date, '2026-11-30'::date, '2027-04-01'::date, '2027-04-30'::date, 15, 35)
) AS s(state, sow_start, sow_end, harvest_start, harvest_end, min_rain_mm, max_temp_c)
WHERE c.name_en = 'Wheat'
ON CONFLICT (commodity_id, state) DO NOTHING;

INSERT INTO crop_calendar (commodity_id, state, sow_start, sow_end, harvest_start, harvest_end, min_rain_mm, max_temp_c)
SELECT c.id, s.state, s.sow_start, s.sow_end, s.harvest_start, s.harvest_end, s.min_rain_mm, s.max_temp_c
FROM commodities c
CROSS JOIN (VALUES
  ('Maharashtra',     '2026-06-01'::date, '2026-07-15'::date, '2026-10-01'::date, '2026-11-30'::date, 100, 38),
  ('Madhya Pradesh',  '2026-06-01'::date, '2026-07-15'::date, '2026-10-01'::date, '2026-11-30'::date, 100, 38),
  ('Delhi',           '2026-06-15'::date, '2026-07-15'::date, '2026-10-15'::date, '2026-11-15'::date, 80, 38)
) AS s(state, sow_start, sow_end, harvest_start, harvest_end, min_rain_mm, max_temp_c)
WHERE c.name_en = 'Rice'
ON CONFLICT (commodity_id, state) DO NOTHING;

INSERT INTO crop_calendar (commodity_id, state, sow_start, sow_end, harvest_start, harvest_end, min_rain_mm, max_temp_c)
SELECT c.id, s.state, s.sow_start, s.sow_end, s.harvest_start, s.harvest_end, s.min_rain_mm, s.max_temp_c
FROM commodities c
CROSS JOIN (VALUES
  ('Maharashtra',     '2026-10-01'::date, '2026-11-15'::date, '2027-02-01'::date, '2027-03-31'::date, 15, 32),
  ('Madhya Pradesh',  '2026-10-01'::date, '2026-11-15'::date, '2027-02-01'::date, '2027-03-31'::date, 15, 32)
) AS s(state, sow_start, sow_end, harvest_start, harvest_end, min_rain_mm, max_temp_c)
WHERE c.name_en = 'Onion'
ON CONFLICT (commodity_id, state) DO NOTHING;

INSERT INTO crop_calendar (commodity_id, state, sow_start, sow_end, harvest_start, harvest_end, min_rain_mm, max_temp_c)
SELECT c.id, s.state, s.sow_start, s.sow_end, s.harvest_start, s.harvest_end, s.min_rain_mm, s.max_temp_c
FROM commodities c
CROSS JOIN (VALUES
  ('Maharashtra',     '2026-06-15'::date, '2026-07-31'::date, '2026-11-01'::date, '2026-12-31'::date, 90, 35),
  ('Madhya Pradesh',  '2026-06-15'::date, '2026-07-31'::date, '2026-11-01'::date, '2026-12-31'::date, 90, 35)
) AS s(state, sow_start, sow_end, harvest_start, harvest_end, min_rain_mm, max_temp_c)
WHERE c.name_en = 'Cotton'
ON CONFLICT (commodity_id, state) DO NOTHING;
