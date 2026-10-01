CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_id` integer,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`summary` text NOT NULL,
	`diff` text,
	`ip` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_logs` (`entity`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `counters` (
	`key` text PRIMARY KEY NOT NULL,
	`value` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`bucket` text NOT NULL,
	`purpose` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`variants` text NOT NULL,
	`width` integer,
	`height` integer,
	`blur` text,
	`mime` text NOT NULL,
	`alt_en` text,
	`alt_hi` text,
	`owner_type` text,
	`owner_id` text,
	`claim_hash` text,
	`uploaded_by` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `media_status_idx` ON `media` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `media_owner_idx` ON `media` (`owner_type`,`owner_id`);--> statement-breakpoint
CREATE TABLE `otp_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`purpose` text NOT NULL,
	`channel` text DEFAULT 'email' NOT NULL,
	`identifier` text NOT NULL,
	`code_hash` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	`ip` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `otp_lookup_idx` ON `otp_codes` (`identifier`,`purpose`,`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limits_window_idx` ON `rate_limits` (`window_start`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`kind` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip` text,
	`user_agent` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text,
	`phone` text,
	`name` text,
	`role` text DEFAULT 'customer' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`email_verified_at` integer,
	`phone_verified_at` integer,
	`birth` text,
	`marketing_opt_in` integer DEFAULT false NOT NULL,
	`last_login_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_phone_idx` ON `users` (`phone`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`type` text NOT NULL,
	`received_at` integer NOT NULL,
	`processed_at` integer
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`key` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_hi` text NOT NULL,
	`short_en` text NOT NULL,
	`short_hi` text DEFAULT '' NOT NULL,
	`desc_en` text NOT NULL,
	`desc_hi` text NOT NULL,
	`seo_title_en` text,
	`seo_title_hi` text,
	`seo_desc_en` text,
	`seo_desc_hi` text,
	`sort` integer DEFAULT 0 NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `product_media` (
	`product_id` text NOT NULL,
	`media_id` integer NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`product_id`, `media_id`)
);
--> statement-breakpoint
CREATE INDEX `product_media_sort_idx` ON `product_media` (`product_id`,`sort`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`category_key` text NOT NULL,
	`sub` text,
	`mukhi` integer,
	`stone` text,
	`stone_name` text,
	`name_en` text NOT NULL,
	`name_hi` text NOT NULL,
	`long_en` text,
	`long_hi` text,
	`intent_en` text NOT NULL,
	`intent_hi` text DEFAULT '' NOT NULL,
	`intent_key` text NOT NULL,
	`price_inr` integer NOT NULL,
	`mrp_inr` integer NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`low_stock_at` integer DEFAULT 5 NOT NULL,
	`sizes` text,
	`badges` text NOT NULL,
	`rating_avg` real DEFAULT 0 NOT NULL,
	`rating_count` integer DEFAULT 0 NOT NULL,
	`popularity` real DEFAULT 0 NOT NULL,
	`art` text,
	`legacy_photo` text,
	`legacy_photo2` text,
	`content` text NOT NULL,
	`related_ids` text NOT NULL,
	`energizable` integer DEFAULT true NOT NULL,
	`gst_rate` real,
	`hsn` text,
	`weight_g` integer,
	`seo_title_en` text,
	`seo_title_hi` text,
	`seo_desc_en` text,
	`seo_desc_hi` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_list_idx` ON `products` (`status`,`category_key`,`sort`);--> statement-breakpoint
CREATE INDEX `products_sort_idx` ON `products` (`status`,`sort`);--> statement-breakpoint
CREATE INDEX `products_published_idx` ON `products` (`status`,`published_at`);--> statement-breakpoint
CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`category` text NOT NULL,
	`title_en` text NOT NULL,
	`title_hi` text DEFAULT '' NOT NULL,
	`excerpt_en` text NOT NULL,
	`excerpt_hi` text DEFAULT '' NOT NULL,
	`body_en` text NOT NULL,
	`body_hi` text,
	`cover_media_id` integer,
	`legacy_art` text,
	`read_mins` integer DEFAULT 5 NOT NULL,
	`faq` text NOT NULL,
	`product_ids` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`seo_title_en` text,
	`seo_title_hi` text,
	`seo_desc_en` text,
	`seo_desc_hi` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_unique` ON `articles` (`slug`);--> statement-breakpoint
CREATE INDEX `articles_list_idx` ON `articles` (`status`,`published_at`);--> statement-breakpoint
CREATE TABLE `courses` (
	`key` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_hi` text NOT NULL,
	`deity` text NOT NULL,
	`icon` text NOT NULL,
	`days` integer NOT NULL,
	`content` text NOT NULL,
	`fee_inr` integer,
	`sort` integer DEFAULT 0 NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_slug_unique` ON `courses` (`slug`);--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`set_key` text NOT NULL,
	`q_en` text NOT NULL,
	`q_hi` text DEFAULT '' NOT NULL,
	`a_en` text NOT NULL,
	`a_hi` text DEFAULT '' NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `faqs_set_idx` ON `faqs` (`set_key`,`visible`,`sort`);--> statement-breakpoint
CREATE TABLE `pages` (
	`slug` text PRIMARY KEY NOT NULL,
	`title_en` text NOT NULL,
	`title_hi` text DEFAULT '' NOT NULL,
	`body_en` text NOT NULL,
	`body_hi` text,
	`updated_by` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rashifal_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rashi` text NOT NULL,
	`period` text NOT NULL,
	`starts_on` text NOT NULL,
	`text_en` text NOT NULL,
	`text_hi` text DEFAULT '' NOT NULL,
	`scores` text,
	`lucky` text,
	`status` text DEFAULT 'published' NOT NULL,
	`updated_by` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rashifal_uniq` ON `rashifal_entries` (`rashi`,`period`,`starts_on`);--> statement-breakpoint
CREATE TABLE `rituals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`icon` text NOT NULL,
	`name_en` text NOT NULL,
	`name_hi` text NOT NULL,
	`line_en` text NOT NULL,
	`line_hi` text DEFAULT '' NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `service_tiers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service_key` text NOT NULL,
	`tier_key` text NOT NULL,
	`title_en` text NOT NULL,
	`title_hi` text DEFAULT '' NOT NULL,
	`price_inr` integer NOT NULL,
	`mins` integer NOT NULL,
	`recommended` integer DEFAULT false NOT NULL,
	`inclusions` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_tier_uniq` ON `service_tiers` (`service_key`,`tier_key`);--> statement-breakpoint
CREATE TABLE `services` (
	`key` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_hi` text NOT NULL,
	`icon` text NOT NULL,
	`modes` text NOT NULL,
	`guarantee` integer DEFAULT false NOT NULL,
	`content` text NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text DEFAULT 'text' NOT NULL,
	`quote_en` text NOT NULL,
	`quote_hi` text DEFAULT '' NOT NULL,
	`name` text NOT NULL,
	`city` text,
	`tag` text,
	`rating` integer,
	`youtube_id` text,
	`media_id` integer,
	`featured` integer DEFAULT false NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`youtube_id` text,
	`legacy_key` text,
	`category` text NOT NULL,
	`title_en` text NOT NULL,
	`title_hi` text NOT NULL,
	`desc_en` text,
	`desc_hi` text,
	`duration` text NOT NULL,
	`published_on` text,
	`motif` text,
	`featured` integer DEFAULT false NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `videos_youtube_id_unique` ON `videos` (`youtube_id`);--> statement-breakpoint
CREATE INDEX `videos_list_idx` ON `videos` (`kind`,`visible`,`sort`);