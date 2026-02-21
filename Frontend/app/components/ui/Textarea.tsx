import styles from "./ui.module.css";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`${styles.textarea} ${className}`}
      {...props}
    />
  );
}
