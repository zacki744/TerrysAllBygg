import styles from "./components.module.css";
import Link from "next/link";

type SnickeriCardProps = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
};

export default function SnickeriCard({
  id,
  title,
  description,
  price,
  image,
}: SnickeriCardProps) {
  return (
    <Link href={`/snickerier/detail/?id=${id}`} className={styles.snickeriCardLink}>
      <div className={styles.snickeriCard}>
        <img
          src={image}
          alt={title}
          className={styles.snickeriCardImage}
        />

        <div className={styles.snickeriCardBody}>
          <div className={styles.snickeriCardTop}>
            <h3 className={styles.snickeriCardTitle}>{title}</h3>
            <p className={styles.snickeriCardDescription}>{description}</p>
          </div>

          <div className={styles.snickeriCardFooter}>
            <span className={styles.snickeriCardPrice}>
              {price.toLocaleString("sv-SE")} kr
            </span>
            <span className={styles.snickeriCardCta}>Se mer →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
