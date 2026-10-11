// src/lib/notify.ts
// ══════════════════════════════════════════════════════════
// Notiser och bekräftelsedialog för admin — ersätter alert() och confirm().
//
// Ligger i en delad store (inte i en React-provider) så att en notis
// överlever navigering: "Projektet sparat" visas på översikten som man
// skickas till efter att ha sparat. Visas av <Notifier /> (components/Admin).
//
//   notify.success("Projektet sparat");
//   if (await confirmAction({ title: "Radera projektet?", … })) { … }
// ══════════════════════════════════════════════════════════

export type ToastKind = "success" | "error" | "info";

export interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

export interface ConfirmRequest {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface State {
  toasts: Toast[];
  confirm: (ConfirmRequest & { resolve: (ok: boolean) => void }) | null;
}

const TOAST_MS = { success: 4000, info: 5000, error: 8000 } as const;
const MAX_TOASTS = 3;

let state: State = { toasts: [], confirm: null };
let nextId = 1;
const listeners = new Set<() => void>();

function setState(update: Partial<State>) {
  state = { ...state, ...update };
  listeners.forEach((l) => l());
}

export const notifyStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  getSnapshot: () => state,
};

export function dismissToast(id: number) {
  setState({ toasts: state.toasts.filter((t) => t.id !== id) });
}

function show(kind: ToastKind, text: string) {
  const id = nextId++;
  setState({ toasts: [...state.toasts, { id, kind, text }].slice(-MAX_TOASTS) });
  setTimeout(() => dismissToast(id), TOAST_MS[kind]);
  return id;
}

export const notify = {
  success: (text: string) => show("success", text),
  error:   (text: string) => show("error", text),
  info:    (text: string) => show("info", text),
};

/** Visar en bekräftelsedialog. Svarar true om användaren bekräftar. */
export function confirmAction(request: ConfirmRequest): Promise<boolean> {
  // En tidigare dialog som fortfarande är öppen räknas som avbruten
  state.confirm?.resolve(false);
  return new Promise((resolve) => setState({ confirm: { ...request, resolve } }));
}

export function answerConfirm(ok: boolean) {
  const pending = state.confirm;
  if (!pending) return;
  setState({ confirm: null });
  pending.resolve(ok);
}

/** Endast för tester */
export function resetNotify() {
  state = { toasts: [], confirm: null };
  listeners.forEach((l) => l());
}
