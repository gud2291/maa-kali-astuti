/* Instance suffixes for inline SVG strings from src/lib/art/*.
   Generated strings carry the token __U__ wherever the design used its `u` param
   (<defs> ids, url(#…), href="#…"). Each rendered instance swaps in its own suffix so
   two copies on one page never share gradient / clip ids. */

export const UID_TOKEN = "__U__";

/** Replace the id token. `uid` must be unique per page instance (letters, digits, - or _). */
export function withUid(svg: string, uid: string): string {
  const safe = uid.replace(/[^A-Za-z0-9_-]/g, "");
  return svg.split(UID_TOKEN).join(safe);
}
