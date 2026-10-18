// src/components/Admin/CategoryEditor.tsx
// Listan med kategorier i admin → Inställningar. Ingen egen spara-knapp —
// den ingår i inställningsformuläret.

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import Input from "../ui/Input";
import { slugify } from "../../lib/routes";
import { confirmAction } from "../../lib/notify";
import type { Category } from "../../lib/categories";
import styles from "../../admin.module.css";

interface Props {
  value: Category[];
  onChange: (categories: Category[]) => void;
  savedSlugs: ReadonlySet<string>;          // sparade kategorier — deras adress är låst
  projectCounts: Record<string, number>;    // antal projekt per kategori
}

let keySeq = 0;
const newKey = () => `c${keySeq++}`;

export default function CategoryEditor({ value, onChange, savedSlugs, projectCounts }: Props) {
  // Stabila nycklar per rad, så att fältet inte tappar fokus när namnet (och adressen) ändras
  const [keys, setKeys] = useState<string[]>(() => value.map(newKey));
  const rowKeys = keys.length === value.length ? keys : value.map((_, i) => keys[i] ?? `r${i}`);

  const update = (i: number, patch: Partial<Category>) =>
    onChange(value.map((c, j) => {
      if (j !== i) return c;
      const next = { ...c, ...patch };
      // Nya kategorier får adress efter namnet
      if (patch.name !== undefined && !savedSlugs.has(c.slug)) next.slug = slugify(patch.name);
      return next;
    }));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const reorder = <T,>(list: T[]) => { const l = [...list]; const [x] = l.splice(from, 1); l.splice(to, 0, x); return l; };
    setKeys(reorder(rowKeys));
    onChange(reorder(value));
  };

  const add = () => {
    setKeys([...rowKeys, newKey()]);
    onChange([...value, { slug: "", name: "", detail: "" }]);
  };

  const remove = async (i: number) => {
    const c = value[i];
    const n = projectCounts[c.slug] ?? 0;
    if (c.name && !(await confirmAction({
      title: `Ta bort kategorin "${c.name}"?`,
      message: n > 0 ? `${n} projekt har den här kategorin och visas då utan kategori.` : undefined,
      confirmLabel: "Ta bort",
      danger: true,
    }))) return;
    setKeys(rowKeys.filter((_, j) => j !== i));
    onChange(value.filter((_, j) => j !== i));
  };

  return (
    <div className={styles.categoryEditor}>
      <ol className={styles.categoryList}>
        {value.map((c, i) => {
          const id = `cat-${rowKeys[i]}`;
          const n = projectCounts[c.slug] ?? 0;
          return (
            <li key={rowKeys[i]} className={styles.categoryRow}>
              <div className={styles.formField}>
                <label htmlFor={`${id}-name`} className={styles.formLabel}>Namn</label>
                <Input id={`${id}-name`} value={c.name} maxLength={50} placeholder="t.ex. Altaner"
                  onChange={(e) => update(i, { name: e.target.value })} />
              </div>
              <div className={styles.formField}>
                <label htmlFor={`${id}-detail`} className={styles.formLabel}>Komplettering</label>
                <Input id={`${id}-detail`} value={c.detail} maxLength={100} placeholder="t.ex. och uteplatser"
                  onChange={(e) => update(i, { detail: e.target.value })} />
              </div>
              <div className={styles.categoryActions}>
                <button type="button" className={styles.tileBtn} aria-label={`Flytta ${c.name || "kategorin"} uppåt`}
                  aria-disabled={i === 0} onClick={() => move(i, i - 1)}><ArrowUp size={16} aria-hidden /></button>
                <button type="button" className={styles.tileBtn} aria-label={`Flytta ${c.name || "kategorin"} nedåt`}
                  aria-disabled={i === value.length - 1} onClick={() => move(i, i + 1)}><ArrowDown size={16} aria-hidden /></button>
                <button type="button" className={`${styles.tileBtn} ${styles.tileBtnDanger}`}
                  aria-label={`Ta bort ${c.name || "kategorin"}`} onClick={() => remove(i)}><Trash2 size={16} aria-hidden /></button>
              </div>
              <p className={styles.categoryMeta}>
                {c.slug ? `?kategori=${c.slug}` : "Adressen skapas från namnet"} · {n === 1 ? "1 projekt" : `${n} projekt`}
                {!savedSlugs.has(c.slug) && c.slug && " · ny"}
              </p>
            </li>
          );
        })}
      </ol>
      <button type="button" className={styles.btnGhost} onClick={add}>
        <Plus size={16} aria-hidden /> Lägg till kategori
      </button>
    </div>
  );
}
