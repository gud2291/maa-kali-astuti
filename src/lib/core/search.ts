/* Ported from mka-core.js 543–552. Pure: the caller passes the collections (lib/api/catalog does). */

type SearchProduct = { name: string; hi: string; intent: string; catName: string; stoneName?: string; mukhi?: number; pop: number };
type SearchService = { name: string; hi: string; line: string };
type SearchArticle = { t: string; c: string };

export function search<P extends SearchProduct, S extends SearchService, A extends SearchArticle>(
  q: string,
  data: { products: readonly P[]; services: readonly S[]; articles: readonly A[] },
): { products: P[]; services: S[]; articles: A[] } {
  const toks = String(q || "").toLowerCase().split(/\s+/).filter(Boolean);
  if (!toks.length) return { products: [], services: [], articles: [] };
  const hit = (s: string) => {
    const l = s.toLowerCase();
    return toks.every((t) => l.includes(t) || (t === "kavach" && l.includes("amulet")) || (t.startsWith("mukhi") && l.includes("mukhi")));
  };
  return {
    products: data.products
      .filter((p) => hit([p.name, p.hi, p.intent, p.catName, p.stoneName || "", p.mukhi ? p.mukhi + " mukhi" : ""].join(" ")))
      .sort((a, b) => b.pop - a.pop),
    services: data.services.filter((s) => hit(s.name + " " + s.hi + " " + s.line)),
    articles: data.articles.filter((a) => hit(a.t + " " + a.c)),
  };
}
