"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SETTINGS_DEFAULTS, type SettingsMap } from "@/lib/validation/settings";

export type SiteSettingsContextValue = {
  contact: SettingsMap["contact"];
  social: SettingsMap["social"];
  announcement: SettingsMap["announcement"];
};

const DEFAULT_VALUE: SiteSettingsContextValue = {
  contact: SETTINGS_DEFAULTS.contact,
  social: SETTINGS_DEFAULTS.social,
  announcement: SETTINGS_DEFAULTS.announcement,
};

const SiteSettingsContext = createContext<SiteSettingsContextValue>(DEFAULT_VALUE);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettingsContextValue;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextValue {
  return useContext(SiteSettingsContext);
}
