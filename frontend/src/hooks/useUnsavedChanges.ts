// src/hooks/useUnsavedChanges.ts
// Varnar innan ett formulär med osparade ändringar lämnas:
// • stänga fliken / ladda om → webbläsarens egen varning
// • "Avbryt" i formuläret → vår bekräftelsedialog
// (Klick på länkar i adminmenyn fångas inte — det kräver React Routers
//  data-router, som sajten inte använder.)

import { useCallback, useEffect } from "react";
import { confirmAction } from "../lib/notify";

export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /** Kör leave() direkt om inget är ändrat, annars efter bekräftelse. */
  return useCallback(async (leave: () => void) => {
    if (!dirty) return leave();
    const ok = await confirmAction({
      title: "Lämna utan att spara?",
      message: "Ändringarna du har gjort sparas inte.",
      confirmLabel: "Lämna sidan",
      cancelLabel: "Fortsätt redigera",
      danger: true,
    });
    if (ok) leave();
  }, [dirty]);
}
