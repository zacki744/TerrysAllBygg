// src/lib/settingsContext.ts
import { createContext, useContext } from "react";
import { DEFAULT_SETTINGS, type SiteSettings } from "./settings";

export interface SettingsContextValue {
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
}

// Utan provider (t.ex. i enhetstester) gäller standardvärdena
export const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  setSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext).settings;
export const useSetSettings = () => useContext(SettingsContext).setSettings;
