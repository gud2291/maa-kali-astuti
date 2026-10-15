import { getCatalog } from "@/server/catalog/queries";
import { getConsultRows } from "@/server/consult/queries";
import { getCourseRows } from "@/server/courses/queries";
import { getSetting } from "@/server/settings/queries";
import { SITE_URL } from "@/lib/site";
import { fmt } from "@/lib/core/format";

export async function GET(): Promise<Response> {
  const [catalog, consultData, courseData, contact] = await Promise.all([
    getCatalog(),
    getConsultRows(),
    getCourseRows(),
    getSetting("contact"),
  ]);

  const lines: string[] = [];

  lines.push("# Maa Kali Astuti (sadhakpawanpandey.com)");
  lines.push("> Authentic Vedic astrology consultations, energized spiritual remedies, and sacred sadhana guidance by Sadhak Pawan Pandey.\n");

  lines.push("## About Sadhak Pawan Pandey & Maa Kali Astuti");
  lines.push("Maa Kali Astuti is a sacred spiritual sanctum guided by Sadhak Pawan Pandey, dedicated to traditional Shakta upasana, classical Vedic astrology (Jyotish), and energized spiritual remedies. All spiritual items, rudrakshas, and yantras offered on the storefront are personally purified and energized with authentic Vedic mantras before dispatch.\n");

  lines.push("## Offerings & Services\n");

  // 1. Products by Category
  lines.push("### Sacred Products & Storefront");
  lines.push(`URL: ${SITE_URL}/shop`);
  for (const cat of catalog.categories) {
    const prodsInCat = catalog.products.filter((p) => p.cat === cat.key);
    lines.push(`- **${cat.name}** (${SITE_URL}/shop/${cat.slug}): ${prodsInCat.length} items`);
  }
  lines.push("");

  // 2. Consultations
  lines.push("### Personal Consultations with Sadhak Pawan Pandey");
  lines.push(`URL: ${SITE_URL}/consultations`);
  for (const svc of consultData.services) {
    const svcTiers = consultData.tiers.filter((t) => t.serviceKey === svc.key);
    const minPrice = svcTiers.length > 0 ? Math.min(...svcTiers.map((t) => t.priceInr)) : 0;
    lines.push(
      `- **${svc.nameEn}** (${SITE_URL}/consultations/${svc.slug}): Starting from ${fmt(minPrice)} (${svc.modes.join(", ")})`,
    );
  }
  lines.push("");

  // 3. Kundali Analysis
  lines.push("### Comprehensive Vedic Kundali Report");
  lines.push(`URL: ${SITE_URL}/kundali-99`);
  lines.push(
    `- Free, instant comprehensive 28-page computerized astrological birth chart analysis, planetary strengths, dasha timelines, and personalized remedial measures delivered in PDF format.\n`,
  );

  // 4. Sadhana Courses
  lines.push("### Tantra & Sadhana Deeksha Courses");
  lines.push(`URL: ${SITE_URL}/sadhana-courses`);
  for (const c of courseData) {
    lines.push(`- **${c.nameEn}** (${SITE_URL}/sadhana-courses/${c.slug}): ${c.days} days guided sadhana (${c.deity})`);
  }
  lines.push("");

  // 5. Sacred Rituals & Anushthans
  lines.push("### Sacred Vedic Rituals & Mahapujas");
  lines.push(`URL: ${SITE_URL}/rituals`);
  lines.push("- Vedic Havans, Navgrah Shanti, Baglamukhi Anushthan, and Mahakali Puja performed according to classical scriptural injunctions.\n");

  // Key URLs
  lines.push("## Key URLs");
  lines.push(`- Home: ${SITE_URL}`);
  lines.push(`- Shop: ${SITE_URL}/shop`);
  lines.push(`- Personal Consultations: ${SITE_URL}/consultations`);
  lines.push(`- Vedic Kundali (free): ${SITE_URL}/kundali-99`);
  lines.push(`- Daily Rashifal (Horoscope): ${SITE_URL}/rashifal`);
  lines.push(`- Kundali Milan / Love Compatibility: ${SITE_URL}/love-calculator`);
  lines.push(`- Sadhana Courses: ${SITE_URL}/sadhana-courses`);
  lines.push(`- Sacred Rituals: ${SITE_URL}/rituals`);
  lines.push(`- Pravachans & Videos: ${SITE_URL}/videos`);
  lines.push(`- Spiritual Journal (Blog): ${SITE_URL}/blog`);
  lines.push(`- About Sadhak Ji: ${SITE_URL}/about`);
  lines.push(`- Contact & Temple Visit: ${SITE_URL}/contact`);
  lines.push(`- Frequently Asked Questions: ${SITE_URL}/faq\n`);

  // Contact Information
  lines.push("## Contact & Support");
  if (contact.phoneDisplay) lines.push(`- Phone: ${contact.phoneDisplay}`);
  if (contact.email) lines.push(`- Email: ${contact.email}`);
  if (contact.whatsapp) lines.push(`- WhatsApp Support: ${contact.whatsapp}`);
  lines.push(`- Website: ${SITE_URL}\n`);

  // Honesty & Disclaimer note
  lines.push("## Note on Honesty & Spiritual Guidance");
  lines.push(
    "Maa Kali Astuti strictly adheres to honest spiritual guidance without false claims or superstition. Vedic astrology and energized remedies are traditional spiritual supports; they do not replace medical, legal, or professional counsel. We do not claim 100% supernatural guarantees; the efficacy of sadhana and upasana relies on divine grace, individual karma, and pure faith.",
  );

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
