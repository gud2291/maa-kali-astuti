import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { settings } from "@/server/db/schema/core";
import { requireAdmin, type AdminUser } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { AppError } from "@/server/result";
import {
  SETTINGS_KEYS,
  SETTINGS_SCHEMAS,
  SETTINGS_DEFAULTS,
  type SettingsKey,
  type SettingsMap,
} from "@/lib/validation/settings";

export const ADMIN_SETTINGS_KEYS = [
  "store",
  "contact",
  "social",
  "seo",
  "notify",
  "kundali",
  "courses",
  "invoice",
] as const;

export type AdminSettingsKey = (typeof ADMIN_SETTINGS_KEYS)[number];

export async function getSettingsForAdmin(): Promise<SettingsMap> {
  await requireAdmin("settings.edit");

  const rows = await db.select().from(settings);
  const rowMap = new Map<string, unknown>();
  for (const r of rows) {
    rowMap.set(r.key, r.value);
  }

  const result = {} as SettingsMap;

  for (const key of SETTINGS_KEYS) {
    const raw = rowMap.get(key);
    const def = SETTINGS_DEFAULTS[key];
    const schema = SETTINGS_SCHEMAS[key];

    if (raw === undefined) {
      result[key] = def as never;
      continue;
    }

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      result[key] = def as never;
      continue;
    }

    const val = parsed.data;
    if (val === null) {
      result[key] = null as never;
    } else if (
      typeof val === "object" &&
      !Array.isArray(val) &&
      def !== null &&
      typeof def === "object" &&
      !Array.isArray(def)
    ) {
      result[key] = { ...def, ...val } as never;
    } else {
      result[key] = val as never;
    }
  }

  return result;
}

export async function updateSetting<K extends SettingsKey>(
  key: K,
  value: unknown,
  actor?: AdminUser,
): Promise<void> {
  const admin = actor ?? (await requireAdmin("settings.edit"));

  if (!ADMIN_SETTINGS_KEYS.includes(key as AdminSettingsKey)) {
    throw new AppError("FORBIDDEN");
  }

  const schema = SETTINGS_SCHEMAS[key];
  const parsed = schema.parse(value);

  const existingRows = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  const existingRaw = existingRows[0]?.value ?? SETTINGS_DEFAULTS[key];
  const parsedExisting = (schema.safeParse(existingRaw).data ??
    SETTINGS_DEFAULTS[key]) as Record<string, unknown>;
  const parsedNew = parsed as Record<string, unknown>;

  const diff: Record<string, [unknown, unknown]> = {};
  if (
    parsedNew &&
    typeof parsedNew === "object" &&
    !Array.isArray(parsedNew) &&
    parsedExisting &&
    typeof parsedExisting === "object" &&
    !Array.isArray(parsedExisting)
  ) {
    const allKeys = Array.from(
      new Set([...Object.keys(parsedExisting), ...Object.keys(parsedNew)]),
    );
    for (const k of allKeys) {
      const bVal = parsedExisting[k];
      const aVal = parsedNew[k];
      if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
        diff[k] = [bVal, aVal];
      }
    }
  }

  await db
    .insert(settings)
    .values({
      key,
      value: parsed,
      updatedAt: new Date(),
      updatedBy: admin.id,
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        value: parsed,
        updatedAt: new Date(),
        updatedBy: admin.id,
      },
    });

  await audit({
    actorId: admin.id,
    action: "settings.update",
    entity: "settings",
    entityId: key,
    summary: `Updated ${key} settings`,
    diff,
  });
}
