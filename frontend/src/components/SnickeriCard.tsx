import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./components.module.css";
import { formatPrice } from "../lib/formatPrice";

type SnickeriCardProps = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  priority?: boolean;
};

export default function SnickeriCard({
  id,
  title,
  description,
  price,
  image,
  priority = false,
}: SnickeriCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link to={`/snickeri?id=${id}`} className={styles.snickeriCardLink}>
      <div className={styles.snickeriCard}>
        <div className={styles.snickeriCardImageWrapper}>
          {!loaded && <div className={styles.snickeriCardImagePlaceholder} />}
          <img
            src={image}
            alt={title}
            className={`${styles.snickeriCardImage} ${loaded ? styles.cardImageLoaded : styles.cardImageHidden}`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            width={208}
            height={160}
            onLoad={() => setLoaded(true)}
          />
        </div>
        <div className={styles.snickeriCardBody}>
          <div className={styles.snickeriCardTop}>
            <h3 className={styles.snickeriCardTitle}>{title}</h3>
            <p className={styles.snickeriCardDescription}>{description}</p>
          </div>
          <div className={styles.snickeriCardFooter}>
            <span className={styles.snickeriCardPrice}>{formatPrice(price)}</span>
            <span className={styles.snickeriCardCta}>Se mer →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}