import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./components.module.css";
import { formatPrice } from "../lib/formatPrice";
import { snickeriPath } from "../lib/routes";
import { thumbUrl } from "../lib/images";

type SnickeriCardProps = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  priority?: boolean;
  /** Rubriknivå för titeln — 2 på sidor där korten ligger direkt under h1 */
  headingLevel?: 2 | 3;
};

export default function SnickeriCard({
  id,
  title,
  description,
  price,
  image,
  priority = false,
  headingLevel = 3,
}: SnickeriCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const [loaded, setLoaded] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);

  return (
    <Link to={snickeriPath(id, title)} className={styles.snickeriCardLink}>
      <div className={styles.snickeriCard}>
        <div className={styles.snickeriCardImageWrapper}>
          {!loaded && <div className={styles.snickeriCardImagePlaceholder} />}
          <img
            src={thumbFailed ? image : thumbUrl(image)}
            onError={() => setThumbFailed(true)}
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
            <Heading className={styles.snickeriCardTitle}>{title}</Heading>
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