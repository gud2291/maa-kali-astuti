import { InlineArt } from "@/components/ui/InlineArt";
import { PANDIT_SVG } from "@/lib/art/pandit";

/* Pandit Ji (mka-home.js 22–123): server-rendered inline SVG. Its ambient parts (diya flicker,
   glow, incense smoke) run through data-amb; blink, japa, breath and gaze are driven by
   usePanditMotion on a client ancestor. The group ids are not suffixed: one Pandit per page. */
export function PanditJi({ className }: { className?: string }) {
  return <InlineArt svg={PANDIT_SVG} uid="hm" className={className} />;
}
