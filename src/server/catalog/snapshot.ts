import "server-only";
import { getCatalog } from "@/server/catalog/queries";
import { getConsultRows } from "@/server/consult/queries";
import { getJournalRows } from "@/server/articles/queries";
import { getSetting } from "@/server/settings/queries";
import trendingData from "@/lib/data/trending.json";
import type { CatalogSnapshot, ProductLite } from "@/lib/domain/types";

export async function buildSnapshot(): Promise<CatalogSnapshot> {
  const [catalog, consultRows, journalRows, storeSettings] = await Promise.all([
    getCatalog(),
    getConsultRows(),
    getJournalRows(50),
    getSetting("store"),
  ]);

  const products: ProductLite[] = catalog.products.map((p) => ({
    id: p.id,
    slug: p.slug,
    cat: p.cat,
    name: p.name,
    hi: p.hi,
    price: p.price,
    mrp: p.mrp,
    stock: p.stock,
    sizes: p.sizes,
    art: p.art,
    photo: p.photo,
    photo2: p.photo2,
    buyUrl: p.buyUrl,
    badges: p.badges,
    rating: p.rating,
    reviews: p.reviews,
    intent: p.intent,
    ik: p.ik,
    sub: p.sub,
    mukhi: p.mukhi,
    stone: p.stone,
    stoneName: p.stoneName,
    catName: p.catName,
    images: p.images ?? [],
    catShort: p.catShort ?? "",
  }));

  const categories = catalog.categories.map((c) => ({
    key: c.key,
    slug: c.slug,
    name: { en: c.name, hi: c.hi },
    short: { en: c.short, hi: c.short },
  }));

  const services = consultRows.services.map((s) => {
    const essential =
      consultRows.tiers.find((t) => t.serviceKey === s.key && t.tierKey === "essential") ??
      consultRows.tiers.find((t) => t.serviceKey === s.key);
    const price = essential ? essential.priceInr : 0;
    const dur = essential ? `${essential.mins} min` : "";
    return {
      key: s.key,
      slug: s.slug,
      name: { en: s.nameEn, hi: s.nameHi },
      icon: s.icon,
      line: s.content.line,
      price,
      dur,
    };
  });

  const articles = journalRows.map((a) => ({
    slug: a.slug,
    title: { en: a.titleEn, hi: a.titleHi || a.titleEn },
    category: a.category,
    mins: a.readMins,
    pid: a.productIds[0] ?? a.legacyArt ?? null,
  }));

  const fees = {
    freeShippingInr: storeSettings.freeShippingInr,
    shippingInr: storeSettings.shippingInr,
    expressInr: storeSettings.expressInr,
    codFeeInr: storeSettings.codFeeInr,
    codEnabled: storeSettings.codEnabled,
    giftWrapInr: storeSettings.giftWrapInr,
    energizationInr: storeSettings.energizationInr,
    maxLineQty: storeSettings.maxLineQty,
  };

  return {
    v: Date.now(),
    products,
    categories,
    services,
    articles,
    trending: trendingData as string[],
    fees,
  };
}
