import "server-only";
import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "@/server/db/client";
import { services, serviceTiers } from "@/server/db/schema/content";
import { requireAdmin } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { AppError } from "@/server/result";
import { getSetting } from "@/server/settings/queries";
import { writeSetting } from "@/server/settings/admin";
import {
  serviceAdminSchema,
  tierAdminSchema,
  consultSettingsAdminSchema,
  type ServiceAdminInput,
  type TierAdminInput,
  type ConsultSettingsAdminInput,
} from "@/lib/validation/consult-admin";
import type { ServiceKey, TierKey } from "@/lib/domain/enums";
import type { ConsultServiceRow, ConsultTierRow } from "@/server/consult/queries";
import type { ConsultSettings } from "@/lib/validation/settings";

export type ServiceWithTiers = ConsultServiceRow & {
  visible: boolean;
  tiers: ConsultTierRow[];
  fromPriceInr: number;
};

export async function listServicesAdmin(): Promise<ServiceWithTiers[]> {
  await requireAdmin("consult.edit");

  const serviceRows = await db
    .select({
      key: services.key,
      slug: services.slug,
      nameEn: services.nameEn,
      nameHi: services.nameHi,
      icon: services.icon,
      modes: services.modes,
      guarantee: services.guarantee,
      content: services.content,
      sort: services.sort,
      visible: services.visible,
    })
    .from(services)
    .orderBy(asc(services.sort));

  if (serviceRows.length === 0) {
    return [];
  }

  const allTiers = await db
    .select({
      id: serviceTiers.id,
      serviceKey: serviceTiers.serviceKey,
      tierKey: serviceTiers.tierKey,
      titleEn: serviceTiers.titleEn,
      titleHi: serviceTiers.titleHi,
      priceInr: serviceTiers.priceInr,
      mins: serviceTiers.mins,
      recommended: serviceTiers.recommended,
      inclusions: serviceTiers.inclusions,
    })
    .from(serviceTiers);

  return serviceRows.map((svc) => {
    const tiers = allTiers.filter((t) => t.serviceKey === svc.key);
    const fromPriceInr =
      tiers.length > 0 ? Math.min(...tiers.map((t) => t.priceInr)) : 0;
    return {
      ...svc,
      tiers,
      fromPriceInr,
    };
  });
}

export async function getServiceAdmin(
  key: ServiceKey,
): Promise<ServiceWithTiers | null> {
  await requireAdmin("consult.edit");

  const [svc] = await db
    .select({
      key: services.key,
      slug: services.slug,
      nameEn: services.nameEn,
      nameHi: services.nameHi,
      icon: services.icon,
      modes: services.modes,
      guarantee: services.guarantee,
      content: services.content,
      sort: services.sort,
      visible: services.visible,
    })
    .from(services)
    .where(eq(services.key, key))
    .limit(1);

  if (!svc) return null;

  const tiers = await db
    .select({
      id: serviceTiers.id,
      serviceKey: serviceTiers.serviceKey,
      tierKey: serviceTiers.tierKey,
      titleEn: serviceTiers.titleEn,
      titleHi: serviceTiers.titleHi,
      priceInr: serviceTiers.priceInr,
      mins: serviceTiers.mins,
      recommended: serviceTiers.recommended,
      inclusions: serviceTiers.inclusions,
    })
    .from(serviceTiers)
    .where(eq(serviceTiers.serviceKey, key));

  const fromPriceInr =
    tiers.length > 0 ? Math.min(...tiers.map((t) => t.priceInr)) : 0;

  return {
    ...svc,
    tiers,
    fromPriceInr,
  };
}

export async function updateService(
  key: ServiceKey,
  input: ServiceAdminInput | unknown,
): Promise<void> {
  const admin = await requireAdmin("consult.edit");
  const parsed = serviceAdminSchema.parse(input);

  const [existing] = await db
    .select()
    .from(services)
    .where(eq(services.key, key))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND", "Service not found");
  }

  const diff: Record<string, [unknown, unknown]> = {};
  if (existing.nameEn !== parsed.nameEn) {
    diff.nameEn = [existing.nameEn, parsed.nameEn];
  }
  if (existing.nameHi !== parsed.nameHi) {
    diff.nameHi = [existing.nameHi, parsed.nameHi];
  }
  if (parsed.icon && existing.icon !== parsed.icon) {
    diff.icon = [existing.icon, parsed.icon];
  }
  if (JSON.stringify(existing.modes) !== JSON.stringify(parsed.modes)) {
    diff.modes = [existing.modes, parsed.modes];
  }
  if (existing.guarantee !== parsed.guarantee) {
    diff.guarantee = [existing.guarantee, parsed.guarantee];
  }
  if (JSON.stringify(existing.content) !== JSON.stringify(parsed.content)) {
    diff.content = [existing.content, parsed.content];
  }
  if (existing.sort !== parsed.sort) {
    diff.sort = [existing.sort, parsed.sort];
  }
  if (existing.visible !== parsed.visible) {
    diff.visible = [existing.visible, parsed.visible];
  }

  await db
    .update(services)
    .set({
      nameEn: parsed.nameEn,
      nameHi: parsed.nameHi,
      ...(parsed.icon ? { icon: parsed.icon } : {}),
      modes: parsed.modes,
      guarantee: parsed.guarantee,
      content: parsed.content,
      sort: parsed.sort,
      visible: parsed.visible,
    })
    .where(eq(services.key, key));

  await audit({
    actorId: admin.id,
    action: "service.update",
    entity: "service",
    entityId: key,
    summary: `Updated service ${key}`,
    diff,
  });
}

export async function updateTier(
  serviceKey: ServiceKey,
  tierKey: TierKey,
  input: TierAdminInput | unknown,
): Promise<void> {
  const admin = await requireAdmin("consult.edit");
  const parsed = tierAdminSchema.parse(input);

  const existingTiers = await db
    .select()
    .from(serviceTiers)
    .where(eq(serviceTiers.serviceKey, serviceKey));

  const existing = existingTiers.find((t) => t.tierKey === tierKey);
  if (!existing) {
    throw new AppError("NOT_FOUND", "Service tier not found");
  }

  // Exactly one recommended tier per service rule
  let recommended = parsed.recommended;
  if (!recommended) {
    const otherRecommended = existingTiers.some(
      (t) => t.tierKey !== tierKey && t.recommended,
    );
    if (!otherRecommended) {
      recommended = true;
    }
  }

  const diff: Record<string, [unknown, unknown]> = {};
  if (existing.titleEn !== parsed.titleEn) {
    diff.titleEn = [existing.titleEn, parsed.titleEn];
  }
  if (existing.titleHi !== parsed.titleHi) {
    diff.titleHi = [existing.titleHi, parsed.titleHi];
  }
  if (existing.priceInr !== parsed.priceInr) {
    diff.priceInr = [existing.priceInr, parsed.priceInr];
  }
  if (existing.mins !== parsed.mins) {
    diff.mins = [existing.mins, parsed.mins];
  }
  if (existing.recommended !== recommended) {
    diff.recommended = [existing.recommended, recommended];
  }
  if (
    JSON.stringify(existing.inclusions) !== JSON.stringify(parsed.inclusions)
  ) {
    diff.inclusions = [existing.inclusions, parsed.inclusions];
  }

  await db.transaction(async (tx) => {
    if (recommended) {
      await tx
        .update(serviceTiers)
        .set({ recommended: false })
        .where(
          and(
            eq(serviceTiers.serviceKey, serviceKey),
            ne(serviceTiers.tierKey, tierKey),
          ),
        );
    }

    await tx
      .update(serviceTiers)
      .set({
        titleEn: parsed.titleEn,
        titleHi: parsed.titleHi,
        priceInr: parsed.priceInr,
        mins: parsed.mins,
        recommended,
        inclusions: parsed.inclusions,
      })
      .where(
        and(
          eq(serviceTiers.serviceKey, serviceKey),
          eq(serviceTiers.tierKey, tierKey),
        ),
      );
  });

  await audit({
    actorId: admin.id,
    action: "tier.update",
    entity: "tier",
    entityId: `${serviceKey}:${tierKey}`,
    summary: `Updated tier ${tierKey} for service ${serviceKey}`,
    diff,
  });
}

export async function getConsultSettings(): Promise<ConsultSettings> {
  await requireAdmin("consult.edit");
  return getSetting("consult");
}

export async function updateConsultSettings(
  input: ConsultSettingsAdminInput | unknown,
): Promise<void> {
  const admin = await requireAdmin("consult.edit");
  const parsed = consultSettingsAdminSchema.parse(input);
  await writeSetting("consult", parsed, admin);
}
