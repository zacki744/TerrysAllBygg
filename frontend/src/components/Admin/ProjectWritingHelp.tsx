// src/components/Admin/ProjectWritingHelp.tsx
// Visas under beskrivningen i projektformuläret: ordräknare, vilken
// tjänstesida projektet visas på, och tips om vad en bra text innehåller.

import { CircleCheck, CircleAlert, Wand2 } from "lucide-react";
import { TEMPLATE, WORDS_MAX, WORDS_MIN, hasPlaceholders, mentionsPlace, wordCount } from "../../lib/projectText";
import type { Service } from "../../lib/services";
import { confirmAction } from "../../lib/notify";
import styles from "../../admin.module.css";

interface Props {
  id?: string;   // kopplas till textfältet med aria-describedby
  service: Service | undefined;   // vald i formuläret
  description: string;
  onUseTemplate: (text: string) => void;
}

export default function ProjectWritingHelp({ id, service, description, onUseTemplate }: Props) {
  const words = wordCount(description);
  const placeholders = hasPlaceholders(description);

  const checks = [
    {
      ok: words >= WORDS_MIN,
      text: words >= WORDS_MIN
        ? `${words} ord${words > WORDS_MAX ? " – bra, men kortare texter läses oftare till slut" : ""}`
        : `${words} ord – sikta på ${WORDS_MIN}–${WORDS_MAX}. Längre texter hittas lättare på Google.`,
    },
    {
      ok: mentionsPlace(description),
      text: mentionsPlace(description)
        ? "Orten är nämnd"
        : "Nämn orten (t.ex. Simrishamn eller Kivik) – många söker på \"altan Simrishamn\".",
    },
    {
      ok: !!service,
      text: service
        ? `Visas som exempel på tjänstesidan "${service.name}"`
        : "Ingen tjänst vald – välj en under \"Tjänst\" så visas projektet på tjänstens sida.",
    },
  ];

  const useTemplate = async () => {
    if (description.trim()) {
      const ok = await confirmAction({
        title: "Ersätta texten med mallen?",
        message: "Det du har skrivit i beskrivningen tas bort.",
        confirmLabel: "Använd mallen",
      });
      if (!ok) return;
    }
    onUseTemplate(TEMPLATE);
  };

  return (
    <div className={styles.writingHelp}>
      <ul id={id} className={styles.writingChecks}>
        {checks.map((c) => (
          <li key={c.text} className={c.ok ? styles.writingOk : styles.writingTodo}>
            {c.ok ? <CircleCheck size={16} aria-hidden /> : <CircleAlert size={16} aria-hidden />}
            <span>{c.text}</span>
          </li>
        ))}
        {placeholders && (
          <li className={styles.writingTodo}>
            <CircleAlert size={16} aria-hidden />
            <span>Byt ut texten inom [hakparenteser] innan du sparar.</span>
          </li>
        )}
      </ul>

      <details className={styles.writingTips}>
        <summary>Tips för en bra projekttext</summary>
        <p>Några meningar räcker. Skriv som om du berättade för en granne:</p>
        <ul>
          <li><strong>Vad?</strong> Vad visar bilderna – ett projekt eller en typ av arbete?</li>
          <li><strong>Var?</strong> Ort eller område.</li>
          <li><strong>Hur?</strong> Material, och varför de valdes.</li>
          <li><strong>Det speciella:</strong> ett önskemål, en utmaning eller en detalj du är nöjd med.</li>
        </ul>
        <p>Titeln syns överallt: skriv ut den ("Förråd och bodar" i stället för "Förråd o dyl").</p>
        <p>Tom rad mellan stycken blir nytt stycke på sajten.</p>
        <button type="button" className={styles.btnGhost} onClick={useTemplate}>
          <Wand2 size={16} aria-hidden /> Använd mall
        </button>
      </details>
    </div>
  );
}
