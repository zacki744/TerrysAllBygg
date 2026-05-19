import styles from "./../components.module.css";
import { Link } from "react-router-dom";

type ProjectCardProps = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export default function ProjectCard({ id, title, description, image }: ProjectCardProps) {
  return (
    <Link to={`/projects?id=${id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <img
          src={image}
          alt={title}
          className={styles.cardImage}
        />
        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardDescription}>{description}</p>
        </div>
      </div>
    </Link>
  );
}
