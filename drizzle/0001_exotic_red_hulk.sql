CREATE TABLE `addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`line1` text NOT NULL,
	`line2` text DEFAULT '' NOT NULL,
	`landmark` text DEFAULT '' NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`pincode` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `addresses_user_idx` ON `addresses` (`user_id`);--> statement-breakpoint
CREATE TABLE `checkout_drafts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`name` text,
	`locale` text NOT NULL,
	`lines` text NOT NULL,
	`total_inr` integer NOT NULL,
	`reminded_at` integer,
	`order_id` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checkout_drafts_token_unique` ON `checkout_drafts` (`token`);--> statement-breakpoint
CREATE INDEX `checkout_drafts_remind_idx` ON `checkout_drafts` (`order_id`,`reminded_at`,`updated_at`);--> statement-breakpoint
CREATE TABLE `coupon_redemptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`coupon_id` integer NOT NULL,
	`order_id` integer NOT NULL,
	`email` text NOT NULL,
	`discount_inr` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupon_redemptions_order_id_unique` ON `coupon_redemptions` (`order_id`);--> statement-breakpoint
CREATE INDEX `coupon_red_email_idx` ON `coupon_redemptions` (`coupon_id`,`email`);--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`kind` text NOT NULL,
	`value` integer NOT NULL,
	`min_cart_inr` integer DEFAULT 0 NOT NULL,
	`max_discount_inr` integer,
	`starts_at` integer,
	`ends_at` integer,
	`usage_limit` integer,
	`per_customer_limit` integer,
	`first_order_only` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`used_count` integer DEFAULT 0 NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
CREATE TABLE `order_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`type` text NOT NULL,
	`from_status` text,
	`to_status` text,
	`message` text,
	`public` integer DEFAULT false NOT NULL,
	`actor_id` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `order_events_order_idx` ON `order_events` (`order_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` text NOT NULL,
	`name_en` text NOT NULL,
	`name_hi` text NOT NULL,
	`slug` text NOT NULL,
	`image` text,
	`variant` text,
	`qty` integer NOT NULL,
	`price_inr` integer NOT NULL,
	`mrp_inr` integer NOT NULL,
	`energ_inr` integer DEFAULT 0 NOT NULL,
	`energ_name` text,
	`energ_gotra` text,
	`line_total_inr` integer NOT NULL,
	`gst_rate` real,
	`hsn` text
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_product_idx` ON `order_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` text NOT NULL,
	`access_hash` text NOT NULL,
	`user_id` integer,
	`locale` text DEFAULT 'en' NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`ship_address` text NOT NULL,
	`status` text NOT NULL,
	`payment_method` text NOT NULL,
	`payment_status` text NOT NULL,
	`pay_pref` text,
	`delivery` text DEFAULT 'standard' NOT NULL,
	`items_inr` integer NOT NULL,
	`mrp_inr` integer NOT NULL,
	`energ_inr` integer NOT NULL,
	`discount_inr` integer NOT NULL,
	`gift_inr` integer NOT NULL,
	`shipping_inr` integer NOT NULL,
	`express_inr` integer NOT NULL,
	`cod_inr` integer NOT NULL,
	`total_inr` integer NOT NULL,
	`refunded_inr` integer DEFAULT 0 NOT NULL,
	`coupon_code` text,
	`gift` integer DEFAULT false NOT NULL,
	`gift_message` text,
	`customer_note` text,
	`energization_on` text,
	`courier` text,
	`awb` text,
	`tracking_url` text,
	`invoice_no` text,
	`razorpay_order_id` text,
	`needs_attention` integer DEFAULT false NOT NULL,
	`attention_reason` text,
	`admin_note` text,
	`ip` text,
	`placed_at` integer,
	`paid_at` integer,
	`shipped_at` integer,
	`delivered_at` integer,
	`cancelled_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_number_unique` ON `orders` (`number`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_invoice_no_unique` ON `orders` (`invoice_no`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_razorpay_order_id_unique` ON `orders` (`razorpay_order_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_user_idx` ON `orders` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_email_idx` ON `orders` (`email`);--> statement-breakpoint
CREATE INDEX `orders_phone_idx` ON `orders` (`phone`);--> statement-breakpoint
CREATE INDEX `orders_created_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity` text NOT NULL,
	`entity_id` integer NOT NULL,
	`provider` text NOT NULL,
	`rzp_order_id` text,
	`rzp_payment_id` text,
	`amount_inr` integer NOT NULL,
	`status` text NOT NULL,
	`method` text,
	`error` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_rzp_payment_id_unique` ON `payments` (`rzp_payment_id`);--> statement-breakpoint
CREATE INDEX `payments_entity_idx` ON `payments` (`entity`,`entity_id`);--> statement-breakpoint
CREATE INDEX `payments_rzp_order_idx` ON `payments` (`rzp_order_id`);--> statement-breakpoint
CREATE TABLE `refunds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`payment_id` integer NOT NULL,
	`entity` text NOT NULL,
	`entity_id` integer NOT NULL,
	`rzp_refund_id` text,
	`amount_inr` integer NOT NULL,
	`reason` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`actor_id` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `refunds_rzp_refund_id_unique` ON `refunds` (`rzp_refund_id`);--> statement-breakpoint
CREATE INDEX `refunds_entity_idx` ON `refunds` (`entity`,`entity_id`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` text NOT NULL,
	`order_id` integer,
	`user_id` integer,
	`name` text NOT NULL,
	`city` text,
	`rating` integer NOT NULL,
	`title` text,
	`body` text NOT NULL,
	`media_ids` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`show_on_home` integer DEFAULT false NOT NULL,
	`legacy_date` text,
	`created_at` integer NOT NULL,
	`approved_at` integer
);
--> statement-breakpoint
CREATE INDEX `reviews_product_idx` ON `reviews` (`product_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `reviews_status_idx` ON `reviews` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ref` text NOT NULL,
	`access_hash` text NOT NULL,
	`user_id` integer,
	`locale` text NOT NULL,
	`service_key` text NOT NULL,
	`tier_key` text NOT NULL,
	`mode` text NOT NULL,
	`start_at` integer,
	`end_at` integer,
	`price_inr` integer NOT NULL,
	`pay_pref` text,
	`status` text NOT NULL,
	`hold_expires_at` integer,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`details` text NOT NULL,
	`palm_media_ids` text NOT NULL,
	`meeting_link` text,
	`report_media_id` integer,
	`reschedule_count` integer DEFAULT 0 NOT NULL,
	`admin_note` text,
	`reminder_day_at` integer,
	`reminder_hour_at` integer,
	`razorpay_order_id` text,
	`paid_at` integer,
	`cancelled_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_ref_unique` ON `bookings` (`ref`);--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_razorpay_order_id_unique` ON `bookings` (`razorpay_order_id`);--> statement-breakpoint
CREATE INDEX `bookings_start_idx` ON `bookings` (`start_at`);--> statement-breakpoint
CREATE INDEX `bookings_status_idx` ON `bookings` (`status`,`start_at`);--> statement-breakpoint
CREATE INDEX `bookings_user_idx` ON `bookings` (`user_id`);--> statement-breakpoint
CREATE INDEX `bookings_email_idx` ON `bookings` (`email`);--> statement-breakpoint
CREATE INDEX `bookings_phone_idx` ON `bookings` (`phone`);--> statement-breakpoint
CREATE TABLE `kundali_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ref` text NOT NULL,
	`access_hash` text NOT NULL,
	`user_id` integer,
	`locale` text NOT NULL,
	`report_lang` text NOT NULL,
	`name` text NOT NULL,
	`dob` text NOT NULL,
	`tob` text,
	`tob_unknown` integer DEFAULT false NOT NULL,
	`place` text NOT NULL,
	`lat` real NOT NULL,
	`lon` real NOT NULL,
	`tz` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`price_inr` integer NOT NULL,
	`status` text NOT NULL,
	`chart` text,
	`pdf_media_id` integer,
	`emailed_at` integer,
	`gen_started_at` integer,
	`gen_attempts` integer DEFAULT 0 NOT NULL,
	`error` text,
	`razorpay_order_id` text,
	`paid_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kundali_orders_ref_unique` ON `kundali_orders` (`ref`);--> statement-breakpoint
CREATE UNIQUE INDEX `kundali_orders_razorpay_order_id_unique` ON `kundali_orders` (`razorpay_order_id`);--> statement-breakpoint
CREATE INDEX `kundali_status_idx` ON `kundali_orders` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `kundali_user_idx` ON `kundali_orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `kundali_email_idx` ON `kundali_orders` (`email`);--> statement-breakpoint
CREATE INDEX `kundali_phone_idx` ON `kundali_orders` (`phone`);--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ref` text NOT NULL,
	`kind` text NOT NULL,
	`course_key` text,
	`locale` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`city` text NOT NULL,
	`exp` text,
	`area` text,
	`lang` text NOT NULL,
	`why` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`assigned_to` integer,
	`next_action_at` integer,
	`fee_inr` integer,
	`paid_inr` integer DEFAULT 0 NOT NULL,
	`user_id` integer,
	`ip` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_ref_unique` ON `inquiries` (`ref`);--> statement-breakpoint
CREATE INDEX `inquiries_status_idx` ON `inquiries` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `inquiries_kind_idx` ON `inquiries` (`kind`,`status`);--> statement-breakpoint
CREATE INDEX `inquiries_phone_idx` ON `inquiries` (`phone`);--> statement-breakpoint
CREATE TABLE `inquiry_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inquiry_id` integer NOT NULL,
	`type` text NOT NULL,
	`from_status` text,
	`to_status` text,
	`message` text,
	`actor_id` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `inquiry_events_idx` ON `inquiry_events` (`inquiry_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`email` text,
	`topic` text NOT NULL,
	`body` text NOT NULL,
	`locale` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`ip` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `messages_status_idx` ON `messages` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `payment_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rzp_link_id` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` integer,
	`amount_inr` integer NOT NULL,
	`purpose` text NOT NULL,
	`short_url` text NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`customer` text NOT NULL,
	`created_by` integer,
	`paid_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_links_rzp_link_id_unique` ON `payment_links` (`rzp_link_id`);--> statement-breakpoint
CREATE INDEX `payment_links_entity_idx` ON `payment_links` (`entity`,`entity_id`);--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`locale` text NOT NULL,
	`source` text NOT NULL,
	`status` text DEFAULT 'subscribed' NOT NULL,
	`unsub_token` text NOT NULL,
	`created_at` integer NOT NULL,
	`unsubscribed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_unsub_token_unique` ON `subscribers` (`unsub_token`);