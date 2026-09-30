import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/* Next 16: `middleware.ts` is now `proxy.ts`. Handles locale detection + the `/hi` prefix. */
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals, Vercel internals and files with an extension.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
