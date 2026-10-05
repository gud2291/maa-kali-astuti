import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { settings } from "@/server/db/schema/core";
import { cached, TAG } from "@/server/cache";
import { log } from "@/server/log";
import {
  SETTINGS_SCHEMAS,
  SETTINGS_DEFAULTS,
  type SettingsKey,
  type SettingsMap,
} from "@/lib/validation/settings";

const warnedKeys = new Set<string>();

// DB errors propagate on purpose: a fallback returned here would be cached until the next settings save.
async function fetchSetting<K extends SettingsKey>(key: K): Promise<SettingsMap[K]> {
  const rows = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  const row = rows[0];
  if (!row) {
    if (!warnedKeys.has(key)) {
      warnedKeys.add(key);
      log.warn("setting.missing", { key });
    }
    return SETTINGS_DEFAULTS[key];
  }

  const schema = SETTINGS_SCHEMAS[key];
  const parsed = schema.safeParse(row.value);
  if (!parsed.success) {
    if (!warnedKeys.has(key)) {
      warnedKeys.add(key);
      log.warn("setting.invalid", { key, error: parsed.error.message });
    }
    return SETTINGS_DEFAULTS[key];
  }

  const val = parsed.data;
  const def = SETTINGS_DEFAULTS[key];

  if (val === null) {
    return null as SettingsMap[K];
  }

  if (
    typeof val === "object" &&
    !Array.isArray(val) &&
    def !== null &&
    typeof def === "object" &&
    !Array.isArray(def)
  ) {
    return { ...def, ...val } as SettingsMap[K];
  }

  return val as SettingsMap[K];
}

// `cached` cannot carry the generic key through, so the per-key return type is restored here.
export const getSetting = cached<[SettingsKey], SettingsMap[SettingsKey]>(
  "setting",
  fetchSetting,
  () => [TAG.settings],
) as <K extends SettingsKey>(key: K) => Promise<SettingsMap[K]>;
