CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" integer,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"summary" text NOT NULL,
	"diff" jsonb,
	"ip" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "counters" (
	"key" text PRIMARY KEY NOT NULL,
	"value" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"bucket" text NOT NULL,
	"purpose" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"variants" jsonb NOT NULL,
	"width" integer,
	"height" integer,
	"blur" text,
	"mime" text NOT NULL,
	"alt_en" text,
	"alt_hi" text,
	"owner_type" text,
	"owner_id" text,
	"claim_hash" text,
	"uploaded_by" integer,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"purpose" text NOT NULL,
	"channel" text DEFAULT 'email' NOT NULL,
	"identifier" text NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"ip" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"window_start" integer NOT NULL,
	"count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"kind" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"phone" text,
	"name" text,
	"role" text DEFAULT 'customer' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"email_verified_at" timestamp with time zone,
	"phone_verified_at" timestamp with time zone,
	"birth" jsonb,
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"type" text NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"key" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_hi" text NOT NULL,
	"short_en" text NOT NULL,
	"short_hi" text DEFAULT '' NOT NULL,
	"desc_en" text NOT NULL,
	"desc_hi" text NOT NULL,
	"seo_title_en" text,
	"seo_title_hi" text,
	"seo_desc_en" text,
	"seo_desc_hi" text,
	"sort" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"product_id" text NOT NULL,
	"media_id" integer NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_media_product_id_media_id_pk" PRIMARY KEY("product_id","media_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"category_key" text NOT NULL,
	"sub" text,
	"mukhi" integer,
	"stone" text,
	"stone_name" text,
	"name_en" text NOT NULL,
	"name_hi" text NOT NULL,
	"long_en" text,
	"long_hi" text,
	"intent_en" text NOT NULL,
	"intent_hi" text DEFAULT '' NOT NULL,
	"intent_key" text NOT NULL,
	"price_inr" integer NOT NULL,
	"mrp_inr" integer NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"low_stock_at" integer DEFAULT 5 NOT NULL,
	"sizes" jsonb,
	"badges" jsonb NOT NULL,
	"rating_avg" double precision DEFAULT 0 NOT NULL,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"popularity" double precision DEFAULT 0 NOT NULL,
	"art" jsonb,
	"legacy_photo" text,
	"legacy_photo2" text,
	"content" jsonb NOT NULL,
	"related_ids" jsonb NOT NULL,
	"energizable" boolean DEFAULT true NOT NULL,
	"gst_rate" double precision,
	"hsn" text,
	"weight_g" integer,
	"seo_title_en" text,
	"seo_title_hi" text,
	"seo_desc_en" text,
	"seo_desc_hi" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"title_en" text NOT NULL,
	"title_hi" text DEFAULT '' NOT NULL,
	"excerpt_en" text NOT NULL,
	"excerpt_hi" text DEFAULT '' NOT NULL,
	"body_en" jsonb NOT NULL,
	"body_hi" jsonb,
	"cover_media_id" integer,
	"legacy_art" text,
	"read_mins" integer DEFAULT 5 NOT NULL,
	"faq" jsonb NOT NULL,
	"product_ids" jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"seo_title_en" text,
	"seo_title_hi" text,
	"seo_desc_en" text,
	"seo_desc_hi" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"key" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_hi" text NOT NULL,
	"deity" text NOT NULL,
	"icon" text NOT NULL,
	"days" integer NOT NULL,
	"content" jsonb NOT NULL,
	"fee_inr" integer,
	"sort" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"set_key" text NOT NULL,
	"q_en" text NOT NULL,
	"q_hi" text DEFAULT '' NOT NULL,
	"a_en" text NOT NULL,
	"a_hi" text DEFAULT '' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"slug" text PRIMARY KEY NOT NULL,
	"title_en" text NOT NULL,
	"title_hi" text DEFAULT '' NOT NULL,
	"body_en" jsonb NOT NULL,
	"body_hi" jsonb,
	"updated_by" integer,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rashifal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"rashi" text NOT NULL,
	"period" text NOT NULL,
	"starts_on" text NOT NULL,
	"text_en" text NOT NULL,
	"text_hi" text DEFAULT '' NOT NULL,
	"scores" jsonb,
	"lucky" jsonb,
	"status" text DEFAULT 'published' NOT NULL,
	"updated_by" integer,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rituals" (
	"id" serial PRIMARY KEY NOT NULL,
	"icon" text NOT NULL,
	"name_en" text NOT NULL,
	"name_hi" text NOT NULL,
	"line_en" text NOT NULL,
	"line_hi" text DEFAULT '' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_key" text NOT NULL,
	"tier_key" text NOT NULL,
	"title_en" text NOT NULL,
	"title_hi" text DEFAULT '' NOT NULL,
	"price_inr" integer NOT NULL,
	"mins" integer NOT NULL,
	"recommended" boolean DEFAULT false NOT NULL,
	"inclusions" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"key" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_hi" text NOT NULL,
	"icon" text NOT NULL,
	"modes" jsonb NOT NULL,
	"guarantee" boolean DEFAULT false NOT NULL,
	"content" jsonb NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text DEFAULT 'text' NOT NULL,
	"quote_en" text NOT NULL,
	"quote_hi" text DEFAULT '' NOT NULL,
	"name" text NOT NULL,
	"city" text,
	"tag" text,
	"rating" integer,
	"youtube_id" text,
	"media_id" integer,
	"featured" boolean DEFAULT false NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"youtube_id" text,
	"legacy_key" text,
	"category" text NOT NULL,
	"title_en" text NOT NULL,
	"title_hi" text NOT NULL,
	"desc_en" text,
	"desc_hi" text,
	"duration" text NOT NULL,
	"published_on" text,
	"motif" text,
	"featured" boolean DEFAULT false NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "videos_youtube_id_unique" UNIQUE("youtube_id")
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"line1" text NOT NULL,
	"line2" text DEFAULT '' NOT NULL,
	"landmark" text DEFAULT '' NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"pincode" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"name" text,
	"locale" text NOT NULL,
	"lines" jsonb NOT NULL,
	"total_inr" integer NOT NULL,
	"reminded_at" timestamp with time zone,
	"order_id" integer,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "checkout_drafts_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"coupon_id" integer NOT NULL,
	"order_id" integer NOT NULL,
	"email" text NOT NULL,
	"discount_inr" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "coupon_redemptions_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"kind" text NOT NULL,
	"value" integer NOT NULL,
	"min_cart_inr" integer DEFAULT 0 NOT NULL,
	"max_discount_inr" integer,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"usage_limit" integer,
	"per_customer_limit" integer,
	"first_order_only" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"note" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "order_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"type" text NOT NULL,
	"from_status" text,
	"to_status" text,
	"message" text,
	"public" boolean DEFAULT false NOT NULL,
	"actor_id" integer,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" text NOT NULL,
	"name_en" text NOT NULL,
	"name_hi" text NOT NULL,
	"slug" text NOT NULL,
	"image" text,
	"variant" text,
	"qty" integer NOT NULL,
	"price_inr" integer NOT NULL,
	"mrp_inr" integer NOT NULL,
	"energ_inr" integer DEFAULT 0 NOT NULL,
	"energ_name" text,
	"energ_gotra" text,
	"line_total_inr" integer NOT NULL,
	"gst_rate" double precision,
	"hsn" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"access_hash" text NOT NULL,
	"user_id" integer,
	"locale" text DEFAULT 'en' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"ship_address" jsonb NOT NULL,
	"status" text NOT NULL,
	"payment_method" text NOT NULL,
	"payment_status" text NOT NULL,
	"pay_pref" text,
	"delivery" text DEFAULT 'standard' NOT NULL,
	"items_inr" integer NOT NULL,
	"mrp_inr" integer NOT NULL,
	"energ_inr" integer NOT NULL,
	"discount_inr" integer NOT NULL,
	"gift_inr" integer NOT NULL,
	"shipping_inr" integer NOT NULL,
	"express_inr" integer NOT NULL,
	"cod_inr" integer NOT NULL,
	"total_inr" integer NOT NULL,
	"refunded_inr" integer DEFAULT 0 NOT NULL,
	"coupon_code" text,
	"gift" boolean DEFAULT false NOT NULL,
	"gift_message" text,
	"customer_note" text,
	"energization_on" text,
	"courier" text,
	"awb" text,
	"tracking_url" text,
	"invoice_no" text,
	"razorpay_order_id" text,
	"needs_attention" boolean DEFAULT false NOT NULL,
	"attention_reason" text,
	"admin_note" text,
	"ip" text,
	"placed_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "orders_number_unique" UNIQUE("number"),
	CONSTRAINT "orders_invoice_no_unique" UNIQUE("invoice_no"),
	CONSTRAINT "orders_razorpay_order_id_unique" UNIQUE("razorpay_order_id")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity" text NOT NULL,
	"entity_id" integer NOT NULL,
	"provider" text NOT NULL,
	"rzp_order_id" text,
	"rzp_payment_id" text,
	"amount_inr" integer NOT NULL,
	"status" text NOT NULL,
	"method" text,
	"error" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "payments_rzp_payment_id_unique" UNIQUE("rzp_payment_id")
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_id" integer NOT NULL,
	"entity" text NOT NULL,
	"entity_id" integer NOT NULL,
	"rzp_refund_id" text,
	"amount_inr" integer NOT NULL,
	"reason" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"actor_id" integer,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "refunds_rzp_refund_id_unique" UNIQUE("rzp_refund_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"order_id" integer,
	"user_id" integer,
	"name" text NOT NULL,
	"city" text,
	"rating" integer NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"media_ids" jsonb NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"show_on_home" boolean DEFAULT false NOT NULL,
	"legacy_date" text,
	"created_at" timestamp with time zone NOT NULL,
	"approved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref" text NOT NULL,
	"access_hash" text NOT NULL,
	"user_id" integer,
	"locale" text NOT NULL,
	"service_key" text NOT NULL,
	"tier_key" text NOT NULL,
	"mode" text NOT NULL,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"price_inr" integer NOT NULL,
	"pay_pref" text,
	"status" text NOT NULL,
	"hold_expires_at" timestamp with time zone,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"details" jsonb NOT NULL,
	"palm_media_ids" jsonb NOT NULL,
	"meeting_link" text,
	"report_media_id" integer,
	"reschedule_count" integer DEFAULT 0 NOT NULL,
	"admin_note" text,
	"reminder_day_at" timestamp with time zone,
	"reminder_hour_at" timestamp with time zone,
	"razorpay_order_id" text,
	"paid_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "bookings_ref_unique" UNIQUE("ref"),
	CONSTRAINT "bookings_razorpay_order_id_unique" UNIQUE("razorpay_order_id")
);
--> statement-breakpoint
CREATE TABLE "kundali_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref" text NOT NULL,
	"access_hash" text NOT NULL,
	"user_id" integer,
	"locale" text NOT NULL,
	"report_lang" text NOT NULL,
	"name" text NOT NULL,
	"dob" text NOT NULL,
	"tob" text,
	"tob_unknown" boolean DEFAULT false NOT NULL,
	"place" text NOT NULL,
	"lat" double precision NOT NULL,
	"lon" double precision NOT NULL,
	"tz" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"price_inr" integer NOT NULL,
	"status" text NOT NULL,
	"chart" jsonb,
	"pdf_media_id" integer,
	"emailed_at" timestamp with time zone,
	"gen_started_at" timestamp with time zone,
	"gen_attempts" integer DEFAULT 0 NOT NULL,
	"error" text,
	"razorpay_order_id" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "kundali_orders_ref_unique" UNIQUE("ref"),
	CONSTRAINT "kundali_orders_razorpay_order_id_unique" UNIQUE("razorpay_order_id")
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref" text NOT NULL,
	"kind" text NOT NULL,
	"course_key" text,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"city" text NOT NULL,
	"exp" text,
	"area" text,
	"lang" text NOT NULL,
	"why" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"assigned_to" integer,
	"next_action_at" timestamp with time zone,
	"fee_inr" integer,
	"paid_inr" integer DEFAULT 0 NOT NULL,
	"user_id" integer,
	"ip" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "inquiries_ref_unique" UNIQUE("ref")
);
--> statement-breakpoint
CREATE TABLE "inquiry_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"inquiry_id" integer NOT NULL,
	"type" text NOT NULL,
	"from_status" text,
	"to_status" text,
	"message" text,
	"actor_id" integer,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"topic" text NOT NULL,
	"body" text NOT NULL,
	"locale" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"ip" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"rzp_link_id" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" integer,
	"amount_inr" integer NOT NULL,
	"purpose" text NOT NULL,
	"short_url" text NOT NULL,
	"status" text DEFAULT 'created' NOT NULL,
	"customer" jsonb NOT NULL,
	"created_by" integer,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "payment_links_rzp_link_id_unique" UNIQUE("rzp_link_id")
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"locale" text NOT NULL,
	"source" text NOT NULL,
	"status" text DEFAULT 'subscribed' NOT NULL,
	"unsub_token" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email"),
	CONSTRAINT "subscribers_unsub_token_unique" UNIQUE("unsub_token")
);
--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "media_status_idx" ON "media" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "media_owner_idx" ON "media" USING btree ("owner_type","owner_id");--> statement-breakpoint
CREATE INDEX "otp_lookup_idx" ON "otp_codes" USING btree ("identifier","purpose","created_at");--> statement-breakpoint
CREATE INDEX "rate_limits_window_idx" ON "rate_limits" USING btree ("window_start");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "product_media_sort_idx" ON "product_media" USING btree ("product_id","sort");--> statement-breakpoint
CREATE INDEX "products_list_idx" ON "products" USING btree ("status","category_key","sort");--> statement-breakpoint
CREATE INDEX "products_sort_idx" ON "products" USING btree ("status","sort");--> statement-breakpoint
CREATE INDEX "products_published_idx" ON "products" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "articles_list_idx" ON "articles" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "faqs_set_idx" ON "faqs" USING btree ("set_key","visible","sort");--> statement-breakpoint
CREATE UNIQUE INDEX "rashifal_uniq" ON "rashifal_entries" USING btree ("rashi","period","starts_on");--> statement-breakpoint
CREATE UNIQUE INDEX "service_tier_uniq" ON "service_tiers" USING btree ("service_key","tier_key");--> statement-breakpoint
CREATE INDEX "videos_list_idx" ON "videos" USING btree ("kind","visible","sort");--> statement-breakpoint
CREATE INDEX "addresses_user_idx" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "checkout_drafts_remind_idx" ON "checkout_drafts" USING btree ("order_id","reminded_at","updated_at");--> statement-breakpoint
CREATE INDEX "coupon_red_email_idx" ON "coupon_redemptions" USING btree ("coupon_id","email");--> statement-breakpoint
CREATE INDEX "order_events_order_idx" ON "order_events" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "orders_phone_idx" ON "orders" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "orders_created_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payments_entity_idx" ON "payments" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "payments_rzp_order_idx" ON "payments" USING btree ("rzp_order_id");--> statement-breakpoint
CREATE INDEX "refunds_entity_idx" ON "refunds" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("product_id","status","created_at");--> statement-breakpoint
CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "bookings_start_idx" ON "bookings" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status","start_at");--> statement-breakpoint
CREATE INDEX "bookings_user_idx" ON "bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookings_email_idx" ON "bookings" USING btree ("email");--> statement-breakpoint
CREATE INDEX "bookings_phone_idx" ON "bookings" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "kundali_status_idx" ON "kundali_orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "kundali_user_idx" ON "kundali_orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "kundali_email_idx" ON "kundali_orders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "kundali_phone_idx" ON "kundali_orders" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "inquiries_status_idx" ON "inquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "inquiries_kind_idx" ON "inquiries" USING btree ("kind","status");--> statement-breakpoint
CREATE INDEX "inquiries_phone_idx" ON "inquiries" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "inquiry_events_idx" ON "inquiry_events" USING btree ("inquiry_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_status_idx" ON "messages" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "payment_links_entity_idx" ON "payment_links" USING btree ("entity","entity_id");