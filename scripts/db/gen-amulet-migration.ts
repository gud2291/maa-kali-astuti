// One-off generator for drizzle/0006_amulet_products.sql (kept so the SQL can be re-derived from amulet-content.ts).
import { writeFileSync } from "node:fs";
import { AMULET_COPY, AMULET_PRICE_INR, amuletContent } from "./amulet-content";

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const stmts = Object.entries(AMULET_COPY).map(([id, c]) => {
  if (c.seoDesc.length > 160) throw new Error(`${id}: seo description is ${c.seoDesc.length} chars`);
  if (c.seoTitle.length > 60) throw new Error(`${id}: seo title is ${c.seoTitle.length} chars`);
  // only the text fields: certificateMediaId / youtubeId are left exactly as an admin set them
  const full = amuletContent(id)!;
  const content = JSON.stringify({
    description: full.description,
    benefits: full.benefits,
    howToWear: full.howToWear,
    specs: full.specs,
    placement: full.placement,
  });
  // `||` merges, so a certificate or YouTube id an admin attached to the product is kept
  return (
    `UPDATE "products" SET "name_en" = ${q(c.nameEn)}, "name_hi" = ${q(c.nameHi)}, ` +
    `"price_inr" = ${AMULET_PRICE_INR}, "mrp_inr" = ${AMULET_PRICE_INR}, ` +
    `"seo_title_en" = ${q(c.seoTitle)}, "seo_desc_en" = ${q(c.seoDesc)}, ` +
    `"content" = COALESCE("content", '{}'::jsonb) || ${q(content)}::jsonb WHERE "id" = ${q(id)};`
  );
});
writeFileSync("drizzle/0006_amulet_products.sql", stmts.join("--> statement-breakpoint\n") + "\n");
console.log(stmts.length, "statements");
