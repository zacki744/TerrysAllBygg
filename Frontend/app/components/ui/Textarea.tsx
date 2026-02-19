type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`
        w-full rounded-md border p-3 bg-transparent
        focus:outline-none focus:ring-2 focus:ring-accent
        ${className}
      `}
      {...props}
    />
  );
}