import styles from "./ui.module.css";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`${styles.input} ${className}`}
      {...props}
    />
  );
}
