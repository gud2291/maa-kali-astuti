# NEXT16 — the Next.js 16.3 APIs this project uses

Verified against the installed `node_modules/next/dist/docs` and source (Next 16.3.7, React 19.2).
Use this sheet instead of memory. Open the bundled docs only for an API that is not listed here.

## Async request APIs
```ts
export default async function Page({ params, searchParams }: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>; // dynamic pages only
}) { const { locale, slug } = await params; }
const store = await cookies();   // import { cookies, headers } from "next/headers"
const h = await headers();
```
`generateMetadata({ params })`, `opengraph-image` and `sitemap` `id` params are Promises too.

## Static pages (this project's storefront)
- Keep `setRequestLocale(locale)` at the top of every `[locale]` page and layout (next-intl static rendering).
- `export async function generateStaticParams()` for dynamic segments; `export const dynamicParams = true` where admins can add items later (product, article).
- Reading `cookies()`, `headers()` or `searchParams` makes the route dynamic — allowed only in the dynamic pages listed in ARCHITECTURE §4.
- `export const revalidate = <seconds>` (a literal number) is allowed only where a step says so.

## Data cache (previous model — `cacheComponents` is OFF)
```ts
import { unstable_cache } from "next/cache";            // wrapped by cached() in src/server/cache.ts
import { updateTag, revalidateTag } from "next/cache";  // wrapped by invalidate() / invalidateLater()
updateTag("catalog");                 // Server Actions only; next request waits for fresh data
revalidateTag("catalog", "max");      // anywhere server-side; stale-while-revalidate
revalidateTag("catalog", { expire: 0 }); // only if a route handler must expire immediately
```
- `revalidateTag(tag)` with one argument is deprecated — never use it.
- `refresh()` (from `next/cache`, Server Actions only) re-renders the current page's dynamic data on the client.
- Do **not** use `"use cache"`, `cacheTag`, `cacheLife` or `cacheComponents`.
- `import { cache } from "react"` dedupes a function within one request.

## Server Actions
```ts
"use server";                                   // first line of actions.ts / admin-actions.ts
export async function saveThing(input: unknown): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => { const v = thingSchema.parse(input); /* … */ return { id }; });
}
```
- They are public POST endpoints: validate, authorise and rate-limit inside every one.
- Built-in CSRF check compares `Origin` with `Host`. Body limit 1 MB (uploads go straight to R2, so we keep the default).
- Client usage: call inside `startTransition` (or `useActionState` for `<form action>`); results must be serializable (no class instances, no functions).
- `redirect()` / `notFound()` from `next/navigation` throw control-flow errors: rethrow them in `catch` with `unstable_rethrow(err)` (`next/navigation`) — `runAction` already does.
- `cookies().set()` / `.delete()` work in Server Actions and Route Handlers, **not** during page render.

## Route Handlers (`src/app/api/**/route.ts`)
```ts
export async function GET(request: Request, ctx: { params: Promise<{ pin: string }> }): Promise<Response> {
  const { pin } = await ctx.params;
  return Response.json(data, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
}
export const maxDuration = 60;        // literal; only where a step says so
```
- GET handlers are dynamic by default (not cached by Next). CDN caching = the `Cache-Control: s-maxage` header we set.
- Webhooks: read `await request.text()` (raw body) before verifying the signature.
- `updateTag` and `refresh` throw in route handlers — use `invalidateLater()`.

## after()
```ts
import { after } from "next/server";
after(async () => { await sendOrderPlaced(orderId); });   // runs after the response is sent
```
Works in Server Actions, Route Handlers and server components. Errors inside must be caught and logged.

## Proxy (`src/proxy.ts`)
- `middleware.ts` is renamed `proxy.ts`; Node runtime only. Ours runs next-intl routing. The matcher must exclude `api`, `admin`, `_next`, `_vercel` and files with an extension: `"/((?!api|admin|trpc|_next|_vercel|.*\\..*).*)"`.
- Never do auth or DB work in the proxy.

## Root layouts
`src/app/[locale]/layout.tsx` and `src/app/admin/layout.tsx` are separate root layouts (each renders `<html>` and `<body>` and imports `globals.css`). There is no `src/app/layout.tsx`. Moving between them is a full page load — expected.

## Metadata & SEO files
- `generateMetadata` returns `Metadata` (`alternates.canonical`, `alternates.languages`, `openGraph`, `robots`).
- `src/app/sitemap.ts` (default export → `MetadataRoute.Sitemap`), `src/app/robots.ts`, `src/app/llms.txt/route.ts`.
- `opengraph-image.tsx` uses `ImageResponse` from `next/og`; `params` is a Promise.

## Images
- Local phase-F images keep `next/image`. `images.qualities` defaults to `[75]` — don't pass other `quality` values.
- R2 uploads use `MediaImg` (plain `<img>`), never `next/image`.

## React 19.2 in client components
`useActionState`, `useFormStatus`, `useOptimistic`, `useTransition`/`startTransition` are available. Prefer `startTransition(async () => { const r = await action(input); … })` with react-hook-form.

## Not available / not used here
`forbidden()` / `unauthorized()` (need experimental `authInterrupts`) · edge runtime · `next lint` (removed) · parallel routes (would need `default.tsx` files) · `images.domains` (deprecated).
