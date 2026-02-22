"use client";

import { Project } from "@/app/lib/auth";
import Button from "@/app/components/ui/Button";
import styles from "../admin.module.css";

interface ProjectTableProps {
  projects: Project[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProjectTable({ projects, onEdit, onDelete }: ProjectTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.tableHeadCell}>Titel</th>
            <th className={styles.tableHeadCellRight}>Åtgärder</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {projects.map((project) => (
            <tr key={project.id} className={styles.tableRow}>
              <td className={styles.tableCell}>
                <div className={styles.tablePrimary}>{project.title}</div>
                <div className={styles.tableSecondary}>{project.description}</div>
              </td>
              <td className={styles.tableCellRight}>
                <button
                  onClick={() => onEdit(project.id)}
                  className={styles.tableActionEdit}
                >
                  Redigera
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className={styles.tableActionDelete}
                >
                  Radera
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {projects.length === 0 && (
        <div className={styles.tableEmpty}>
          Inga snickerier hittades. Skapa ditt första!
        </div>
      )}
    </div>
  );
}
