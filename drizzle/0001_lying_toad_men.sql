CREATE TABLE "shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"provider" text DEFAULT 'shiprocket' NOT NULL,
	"status" text DEFAULT 'creating' NOT NULL,
	"provider_order_id" text,
	"shipment_id" text,
	"awb" text,
	"courier" text,
	"provider_status" text,
	"label_url" text,
	"last_error" text,
	"weight_kg" double precision,
	"length_cm" integer,
	"breadth_cm" integer,
	"height_cm" integer,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "shipments_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE INDEX "shipments_awb_idx" ON "shipments" USING btree ("awb");