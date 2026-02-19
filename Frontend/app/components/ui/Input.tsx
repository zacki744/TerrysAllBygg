type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`
        w-full rounded-md border p-3 bg-transparent
        focus:outline-none focus:ring-2 focus:ring-accent
        ${className}
      `}
      {...props}
    />
  );
}