import { LOGO_SVG } from "@/lib/art/logo";
import { InlineArt } from "./InlineArt";

/**
 * The Maa Kali Astuti emblem (M.logo). Inline so its wordmark uses the loaded Fraunces /
 * Manrope / Tiro fonts. `uid` must be unique per instance (design: 'hdr', 'foot', …).
 */
export function Logo({ uid, className }: { uid: string; className?: string }) {
  return <InlineArt svg={LOGO_SVG} uid={"lg" + uid} className={className} />;
}
