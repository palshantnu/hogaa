-- Adds a `sequence` column to products for manual display ordering.
-- Lower sequence = shown first. Safe / non-destructive.
--
-- Run once against the database:
--   mysql -u <user> -p <db_name> < scripts/add-product-sequence-column.sql

ALTER TABLE products
  ADD COLUMN sequence INT NOT NULL DEFAULT 0
  COMMENT 'Manual display order; lower number is shown first' AFTER is_active;

-- Backfill using the current default ordering (newest product first),
-- so the visible order does not change when listings switch to `sequence ASC`.
UPDATE products p
JOIN (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC, id DESC) AS rn
  FROM products
) seq ON seq.id = p.id
SET p.sequence = seq.rn;

ALTER TABLE products
  ADD INDEX idx_products_sequence (sequence);
