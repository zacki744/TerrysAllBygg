import styles from "./ui.module.css";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  placeholder: string;
};

export default function Select({
  placeholder,
  children,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className={styles.selectWrapper}>
      <select
        defaultValue=""
        className={`${styles.select} ${className}`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>

      <div className={styles.selectArrow}>
        <svg
          className={styles.selectArrowIcon}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
