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
            <th className={styles.tableHeadCell}>Title</th>
            <th className={styles.tableHeadCell}>Href</th>
            <th className={styles.tableHeadCell}>Construction Date</th>
            <th className={styles.tableHeadCellRight}>Actions</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {projects.map((project) => (
            <tr key={project.id} className={styles.tableRow}>
              <td className={styles.tableCell}>
                <div className={styles.tablePrimary}>{project.title}</div>
                <div className={styles.tableSecondary}>{project.description}</div>
              </td>
              <td className={styles.tableCell}>
                <span className={styles.tableSecondary}>{project.herf}</span>
              </td>
              <td className={styles.tableCell}>
                {new Date(project.constructionDate).toLocaleDateString("sv-SE")}
              </td>
              <td className={styles.tableCellRight}>
                <button
                  onClick={() => onEdit(project.id)}
                  className={styles.tableActionEdit}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className={styles.tableActionDelete}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {projects.length === 0 && (
        <div className={styles.tableEmpty}>
          No projects found. Create your first project!
        </div>
      )}
    </div>
  );
}
