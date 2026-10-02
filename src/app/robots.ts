import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const disallowedPaths = [
    "/admin",
    "/api",
    "/account",
    "/checkout",
    "/cart",
    "/order",
    "/invoice",
    "/booking",
    "/kundali/report",
    "/newsletter",
  ];

  const disallow = [
    ...disallowedPaths,
    ...disallowedPaths.map((p) => `/hi${p}`),
  ];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
