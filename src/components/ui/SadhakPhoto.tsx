import { cn } from "@/lib/utils/cn";

type Props = {
  alt: string;
  /** Rendered width hint for picking the 400 or 676 px file. */
  sizes: string;
  /** Above-the-fold use (home hero): load eagerly with high priority. */
  priority?: boolean;
  /** Clip to the 300×380 portrait arch (semicircle top), same shape as the gold outline. */
  arch?: boolean;
  className?: string;
};

/* r = 150 on a 300×380 box: 50% of the width, 150/380 of the height. */
const ARCH_RADIUS = "50% 50% 0 0 / 39.47% 39.47% 0 0";

/**
 * Sadhak Pawan Pandey's photo (client-supplied, cropped 4:5 above the printed name). Replaces the
 * illustrated placeholder portraits; fills its sized container, which supplies the arch shape.
 */
export function SadhakPhoto({ alt, sizes, priority = false, arch = false, className }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/sadhak/portrait-676.webp"
      srcSet="/images/sadhak/portrait-400.webp 400w, /images/sadhak/portrait-676.webp 676w"
      sizes={sizes}
      width={676}
      height={845}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      style={arch ? { borderRadius: ARCH_RADIUS } : undefined}
      className={cn("block size-full object-cover object-top", className)}
    />
  );
}
