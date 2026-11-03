-- One-time data update: new customer-care phone/WhatsApp number and support email.
-- Only touches an existing "contact" settings row; fresh databases get the new defaults from the seed.
UPDATE "settings"
SET "value" = jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set("value", '{phoneDisplay}', '"+91 93553 19051"'::jsonb),
          '{phoneTel}', '"+919355319051"'::jsonb),
        '{whatsapp}', '"919355319051"'::jsonb),
      '{email}', '"support@sadhakpawanpandey.com"'::jsonb),
    "updated_at" = now()
WHERE "key" = 'contact' AND jsonb_typeof("value") = 'object';
--> statement-breakpoint
-- Policy pages quote the care email; point them to the support address.
UPDATE "pages"
SET "body_en" = replace("body_en"::text, 'care@sadhakpawanpandey.com', 'support@sadhakpawanpandey.com')::jsonb,
    "body_hi" = CASE WHEN "body_hi" IS NULL THEN NULL
                     ELSE replace("body_hi"::text, 'care@sadhakpawanpandey.com', 'support@sadhakpawanpandey.com')::jsonb END
WHERE "body_en"::text LIKE '%care@sadhakpawanpandey.com%'
   OR COALESCE("body_hi"::text, '') LIKE '%care@sadhakpawanpandey.com%';
