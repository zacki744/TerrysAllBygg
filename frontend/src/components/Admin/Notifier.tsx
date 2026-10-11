// src/components/Admin/Notifier.tsx
// Visar notiser och bekräftelsedialogen från lib/notify.ts.

import { useEffect, useRef, useSyncExternalStore } from "react";
import { CircleCheck, CircleAlert, Info, X } from "lucide-react";
import { answerConfirm, dismissToast, notifyStore } from "../../lib/notify";
import styles from "../../admin.module.css";

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info } as const;

export default function Notifier() {
  const { toasts, confirm } = useSyncExternalStore(
    notifyStore.subscribe, notifyStore.getSnapshot, notifyStore.getSnapshot);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (confirm && !dialog.open) dialog.showModal();
    if (!confirm && dialog.open) dialog.close();
  }, [confirm]);

  return (
    <>
      {/* Notiser. Felmeddelanden läses upp direkt (alert), övriga artigt (status). */}
      <div className={styles.toastRegion}>
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <div key={t.id} className={`${styles.toast} ${styles[`toast_${t.kind}`]}`}
              role={t.kind === "error" ? "alert" : "status"}>
              <Icon size={18} aria-hidden className={styles.toastIcon} />
              <span className={styles.toastText}>{t.text}</span>
              <button type="button" className={styles.toastClose} onClick={() => dismissToast(t.id)}
                aria-label="Stäng meddelandet">
                <X size={16} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>

      {/* Bekräftelse. Esc eller klick utanför = avbryt. */}
      <dialog
        ref={dialogRef}
        className={styles.confirmDialog}
        aria-labelledby="confirm-title"
        aria-describedby={confirm?.message ? "confirm-message" : undefined}
        onCancel={(e) => { e.preventDefault(); answerConfirm(false); }}
        onClick={(e) => { if (e.target === e.currentTarget) answerConfirm(false); }}
      >
        {confirm && (
          <div className={styles.confirmBody}>
            <h2 id="confirm-title" className={styles.confirmTitle}>{confirm.title}</h2>
            {confirm.message && <p id="confirm-message" className={styles.confirmMessage}>{confirm.message}</p>}
            <div className={styles.confirmActions}>
              <button type="button" className={styles.btnGhost} onClick={() => answerConfirm(false)} autoFocus>
                {confirm.cancelLabel ?? "Avbryt"}
              </button>
              <button type="button"
                className={confirm.danger ? styles.dangerButton : styles.addButton}
                onClick={() => answerConfirm(true)}>
                {confirm.confirmLabel ?? "OK"}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
