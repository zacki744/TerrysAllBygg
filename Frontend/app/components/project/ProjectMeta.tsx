import styles from "./../components.module.css";

type Props = {
  constructionDate: string;
};

export default function ProjectMeta({ constructionDate }: Props) {
  return (
    <div className={styles.meta}>
      <div>
        <span className={styles.metaLabel}>Construction date:</span>{" "}
        {new Date(constructionDate).toLocaleDateString()}
      </div>
    </div>
  );
}
