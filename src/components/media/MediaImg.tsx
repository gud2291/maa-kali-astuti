import type { MediaRef } from "@/lib/domain/media";
import { cn } from "@/lib/utils/cn";

export type MediaImgProps = {
  media: MediaRef;
  sizes: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
};

export function MediaImg({
  media,
  sizes,
  alt,
  className,
  priority,
  fill,
}: MediaImgProps) {
  const style: React.CSSProperties = media.blur
    ? {
        backgroundImage: `url("${media.blur}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.src}
      srcSet={media.srcSet || undefined}
      sizes={sizes}
      alt={alt}
      width={fill ? undefined : media.w}
      height={fill ? undefined : media.h}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      draggable={false}
      style={style}
      className={cn(
        fill ? "absolute inset-0 size-full object-cover" : "block object-cover",
        className,
      )}
    />
  );
}
