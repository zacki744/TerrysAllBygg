// src/components/SettingsProvider.tsx
// Startar med inställningarna som förrenderingen bäddade in (eller
// standardvärdena) och hämtar sedan färska från API:t — så syns en ändring
// i admin direkt, utan att sajten behöver byggas om.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { mergeSettings, type ApiSettings, type SiteSettings } from "../lib/settings";
import { SettingsContext } from "../lib/settingsContext";
import { API } from "../lib/api";

interface Props {
  initial: SiteSettings;
  fetchOnMount?: boolean;   // av vid förrendering
  children: ReactNode;
}

export default function SettingsProvider({ initial, fetchOnMount = true, children }: Props) {
  const [settings, setSettings] = useState(initial);

  useEffect(() => {
    if (!fetchOnMount) return;
    const ctrl = new AbortController();
    fetch(API.settings, { signal: ctrl.signal, headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? (res.json() as Promise<ApiSettings>) : null))
      .then((data) => { if (data) setSettings(mergeSettings(data)); })
      .catch(() => { /* behåll förrenderade värden */ });
    return () => ctrl.abort();
  }, [fetchOnMount]);

  const value = useMemo(() => ({ settings, setSettings }), [settings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
