// src/hooks/useFetch.ts
// ── Hämtar JSON från en URL och håller reda på laddning och fel ──
//
// const { data, loading, error, reload } = useFetch<Typ>(url);
//   url = null  → inget hämtas (t.ex. när ett id saknas)
//   reload()    → hämtar igen (används av "Försök igen")
//
// Tillståndet är kopplat till url + försök, så ett nytt id visar aldrig
// föregående sidas data, och inget setState sker synkront i effekten.

import { useCallback, useEffect, useState } from "react";
import { getJson } from "../lib/api";

interface Result<T> {
  key: string;
  data?: T;
  error?: unknown;
}

export function useFetch<T>(url: string | null) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult]   = useState<Result<T> | null>(null);

  const key = url === null ? null : `${url}#${attempt}`;

  useEffect(() => {
    if (url === null || key === null) return;
    const controller = new AbortController();

    getJson<T>(url, controller.signal).then(
      (data)  => setResult({ key, data }),
      (error) => { if (!controller.signal.aborted) setResult({ key, error }); },
    );

    return () => controller.abort();
  }, [url, key]);

  const reload = useCallback(() => setAttempt((a) => a + 1), []);
  const current = result !== null && result.key === key ? result : null;

  return {
    data:    current?.data,
    error:   current?.error,
    loading: key !== null && current === null,
    reload,
  };
}
