-- Adds support for multiple product videos and per-variation videos
-- (parallel to the existing `images` JSON columns).
-- Safe/non-destructive: old `product_video` column is left in place and untouched.

ALTER TABLE products
ADD COLUMN product_videos JSON NULL COMMENT 'Array of product video filenames' AFTER product_video;

-- Migrate any existing single video into the new array column
UPDATE products
SET product_videos = JSON_ARRAY(product_video)
WHERE product_video IS NOT NULL AND product_video <> '';

ALTER TABLE product_variations
ADD COLUMN videos JSON NULL COMMENT 'Array of variation video filenames' AFTER images;
