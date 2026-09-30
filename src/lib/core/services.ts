/* Pure consultation helpers with no data imports, so client islands (the booking stepper) can use
   them without pulling the services / FAQ JSON into their bundle. `@/lib/api/consult` re-exports
   them for server code. */
import type { Service, Tier } from "@/lib/api/consult";

/** Palmistry is a written report: its duration reads "Report in 48 hrs" instead of minutes
 *  (Consultations 280, Consultation-Detail 211, 216, 223). */
export const isReport = (s: Pick<Service, "key">) => s.key === "palm";

/** The recommended ("Most chosen") tier. */
export const recTier = (s: Pick<Service, "tiers">): Tier => s.tiers.find((t) => t.rec) ?? s.tiers[1];
