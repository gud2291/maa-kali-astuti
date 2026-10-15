import { LOGO_REPORT_DATA_URI } from "@/lib/art/brand-logo";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Kept for existing call sites (the old inline SVG needed unique ids); unused now. */
  uid?: string;
  className?: string;
  /** Rendered width hint for picking the 160 or 512 px file (largest site use is 112 px). */
  sizes?: string;
  /** Inline the logo as a data URI (Kundali PDF report: rendered off-site, cannot load /brand). */
  inline?: boolean;
};

/**
 * The Maa Kali Astuti logo (client artwork, logo.pdf). The artwork contains raster leaves, so it
 * ships as transparent WebP from /public/brand and fills its sized container.
 */
export function Logo({ className, sizes = "76px", inline = false }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={inline ? LOGO_REPORT_DATA_URI : "/brand/logo-512.webp"}
      srcSet={inline ? undefined : "/brand/logo-160.webp 160w, /brand/logo-512.webp 512w"}
      sizes={inline ? undefined : sizes}
      width={512}
      height={512}
      alt="Maa Kali Astuti — Sadhak Pawan Pandey"
      decoding="async"
      className={cn("block size-full object-contain", className)}
    />
  );
}
