# Database Changes Log

## [2026-06-28] Added `brand_extra_cards` Table
To support adding "Extra Cards" to Brand detail pages (similar to how it is done on Solutions pages), a new table was added.

```sql
CREATE TABLE `brand_extra_cards` (
  `id` varchar(255) NOT NULL,
  `brand_id` varchar(255) NOT NULL,
  `heading` varchar(255) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## [2026-06-30] Added SEO Image Fields to Entity Tables
To support adding Image Title, Image Caption, and Image Description for SEO purposes when uploading images from the admin panel, new columns were added to the relevant entity tables.

```sql
ALTER TABLE `brands`
ADD COLUMN `image_title` varchar(255) DEFAULT NULL,
ADD COLUMN `image_caption` varchar(255) DEFAULT NULL,
ADD COLUMN `image_description` text DEFAULT NULL;

ALTER TABLE `solutions`
ADD COLUMN `image_title` varchar(255) DEFAULT NULL,
ADD COLUMN `image_caption` varchar(255) DEFAULT NULL,
ADD COLUMN `image_description` text DEFAULT NULL;

ALTER TABLE `blog_posts`
ADD COLUMN `image_title` varchar(255) DEFAULT NULL,
ADD COLUMN `image_caption` varchar(255) DEFAULT NULL,
ADD COLUMN `image_description` text DEFAULT NULL;

ALTER TABLE `resources`
ADD COLUMN `image_title` varchar(255) DEFAULT NULL,
ADD COLUMN `image_caption` varchar(255) DEFAULT NULL,
ADD COLUMN `image_description` text DEFAULT NULL;

ALTER TABLE `solution_feature_cards`
ADD COLUMN `image_title` varchar(255) DEFAULT NULL,
ADD COLUMN `image_caption` varchar(255) DEFAULT NULL,
ADD COLUMN `image_description` text DEFAULT NULL;

ALTER TABLE `solution_extra_cards`
ADD COLUMN `image_title` varchar(255) DEFAULT NULL,
ADD COLUMN `image_caption` varchar(255) DEFAULT NULL,
ADD COLUMN `image_description` text DEFAULT NULL;
```
