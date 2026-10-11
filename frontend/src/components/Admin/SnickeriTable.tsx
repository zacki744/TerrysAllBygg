import { thumbUrl } from "../../lib/images";
import styles from "../../admin.module.css";
import { Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "../../lib/formatPrice";

interface SnickeriItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

interface SnickeriTableProps {
  items: SnickeriItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
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
                <div className={styles.tableTitleCell}>
                  {item.image
                    ? <img src={thumbUrl(item.image)} alt="" className={styles.tableThumb} loading="lazy"
                        onError={(e) => { if (e.currentTarget.src !== item.image) e.currentTarget.src = item.image; }} />
                    : <span className={styles.tableThumb} aria-hidden />}
                  <div>
                    <div className={styles.tablePrimary}>{item.title}</div>
                    <div className={styles.tableSecondary}>{item.description}</div>
                  </div>
                </div>
              </td>
              <td className={styles.tableCell}>
                <span className={styles.tablePrimary}>
                  {formatPrice(item.price)}
                </span>
              </td>
              <td className={styles.tableCellRight}>
                <button
                  onClick={() => onEdit(item.id)}
                  className={styles.tableActionEdit}
                  aria-label={`Redigera ${item.title}`}
                  title="Redigera"
                >
                  <Pencil size={16} strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => onDelete(item.id, item.title)}
                  className={styles.tableActionDelete}
                  aria-label={`Radera ${item.title}`}
                  title="Radera"
                >
                  <Trash2 size={16} strokeWidth={1.75} />
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
