-- Remove duplicate price rows, keeping the newest by id
DELETE FROM prices p1
USING prices p2
WHERE p1.id > p2.id
  AND p1.commodity_id = p2.commodity_id
  AND p1.market_id = p2.market_id
  AND p1.price_date = p2.price_date
  AND p1.source = p2.source;

CREATE UNIQUE INDEX IF NOT EXISTS idx_prices_unique
  ON prices (commodity_id, market_id, price_date, source);
