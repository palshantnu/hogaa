ALTER TABLE products
ADD COLUMN product_video VARCHAR(255) NULL COMMENT 'Optional product video filename'
AFTER images;
