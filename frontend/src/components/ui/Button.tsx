import styles from "./ui.module.css";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ className = "", disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={`${styles.btn} ${disabled ? styles.btnDisabled : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}