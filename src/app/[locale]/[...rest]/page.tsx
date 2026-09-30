import { notFound } from "next/navigation";

/* Any unknown path under a locale renders the branded [locale]/not-found.tsx inside the site
   chrome (next-intl pattern: notFound() here instead of Next's bare default 404). */
export default function CatchAll() {
  notFound();
}
