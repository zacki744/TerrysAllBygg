import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./../components.module.css";
import { projectPath } from "../../lib/routes";
import { cardSrcSet, thumbUrl } from "../../lib/images";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  priority?: boolean; // true för de första korten — laddas eager
  /** Rubriknivå för titeln — 2 på sidor där korten ligger direkt under h1 */
  headingLevel?: 2 | 3;
}

export default function ProjectCard({
  id,
  title,
  description,
  image,
  priority = false,
  headingLevel = 3,
}: ProjectCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const [loaded, setLoaded] = useState(false);
  // Äldre bilder kan sakna miniatyr tills bildunderhållet körts — då används originalet
  const [thumbFailed, setThumbFailed] = useState(false);

  return (
    <Link to={projectPath(id, title)} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.cardImageWrapper}>
          {/* Placeholder visas tills bilden laddats */}
          {!loaded && <div className={styles.cardImagePlaceholder} />}
          <img
            src={thumbFailed ? image : thumbUrl(image)}
            srcSet={thumbFailed ? undefined : cardSrcSet(image)}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            onError={() => setThumbFailed(true)}
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
          <Heading className={styles.cardTitle}>{title}</Heading>
          <p className={styles.cardDescription}>{description}</p>
        </div>
      </div>
    </Link>
  );
}