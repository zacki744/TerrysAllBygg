import styles from "./../components.module.css";

type Props = {
  constructionDate: string;
};

export default function ProjectMeta({ constructionDate }: Props) {
  return (
    <div className={styles.meta}>
      <div>
        <span className={styles.metaLabel}></span>{" "}
      </div>
    </div>
  );
}
