import type { Project } from "../../lib/auth";
import { Pencil, Trash2 } from "lucide-react";
import { thumbUrl } from "../../lib/images";
import styles from "../../admin.module.css";

interface ProjectTableProps {
  projects: Project[];
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
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
                <div className={styles.tableTitleCell}>
                  {project.image
                    ? <img src={thumbUrl(project.image)} alt="" className={styles.tableThumb} loading="lazy"
                        onError={(e) => { if (e.currentTarget.src !== project.image) e.currentTarget.src = project.image; }} />
                    : <span className={styles.tableThumb} aria-hidden />}
                  <div>
                    <div className={styles.tablePrimary}>{project.title}</div>
                    <div className={styles.tableSecondary}>{project.description}</div>
                  </div>
                </div>
              </td>
              <td className={styles.tableCellRight}>
                <button
                  onClick={() => onEdit(project.id)}
                  className={styles.tableActionEdit}
                  aria-label={`Redigera ${project.title}`}
                  title="Redigera"
                >
                  <Pencil size={16} strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => onDelete(project.id, project.title)}
                  className={styles.tableActionDelete}
                  aria-label={`Radera ${project.title}`}
                  title="Radera"
                >
                  <Trash2 size={16} strokeWidth={1.75} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {projects.length === 0 && (
        <div className={styles.tableEmpty}>
          Inga projekt än. Skapa ditt första!
        </div>
      )}
    </div>
  );
}
