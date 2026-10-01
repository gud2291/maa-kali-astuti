import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/* Next 16: `proxy.ts` handles locale detection + the `/hi` prefix. */
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, admin, Next internals, Vercel internals and files with an extension.
  matcher: "/((?!api|admin|trpc|_next|_vercel|.*\\..*).*)",
};