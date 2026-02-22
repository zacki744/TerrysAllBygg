"use client";

import styles from "../admin.module.css";

interface SnickeriItem {
  id: string;
  title: string;
  description: string;
  price: number;
}

interface SnickeriTableProps {
  items: SnickeriItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SnickeriTable({ items, onEdit, onDelete }: SnickeriTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.tableHeadCell}>Titel</th>
            <th className={styles.tableHeadCell}>Pris</th>
            <th className={styles.tableHeadCellRight}>Åtgärder</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {items.map((item) => (
            <tr key={item.id} className={styles.tableRow}>
              <td className={styles.tableCell}>
                <div className={styles.tablePrimary}>{item.title}</div>
                <div className={styles.tableSecondary}>{item.description}</div>
              </td>
              <td className={styles.tableCell}>
                <span className={styles.tablePrimary}>
                  {item.price.toLocaleString("sv-SE")} kr
                </span>
              </td>
              <td className={styles.tableCellRight}>
                <button
                  onClick={() => onEdit(item.id)}
                  className={styles.tableActionEdit}
                >
                  Redigera
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className={styles.tableActionDelete}
                >
                  Radera
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && (
        <div className={styles.tableEmpty}>
          Inga snickerier hittades. Skapa ditt första!
        </div>
      )}
    </div>
  );
}
