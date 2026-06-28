import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./../components.module.css";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  priority?: boolean; // true för första 2 korten — laddas eager
}

export default function ProjectCard({
  id,
  title,
  description,
  image,
  priority = false,
}: ProjectCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link to={`/projects?id=${id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.cardImageWrapper}>
          {/* Placeholder visas tills bilden laddats */}
          {!loaded && <div className={styles.cardImagePlaceholder} />}
          <img
            src={image}
            alt={title}
            className={`${styles.cardImage} ${loaded ? styles.cardImageLoaded : styles.cardImageHidden}`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            width={600}
            height={400}
            onLoad={() => setLoaded(true)}
          />
        </div>
        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardDescription}>{description}</p>
        </div>
      </div>
    </Link>
  );
}