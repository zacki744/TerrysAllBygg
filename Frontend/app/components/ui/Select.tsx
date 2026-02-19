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
    <div className="relative w-full">
      <select
        defaultValue=""
        className={`
          w-full rounded-md border bg-background p-3
          appearance-none pr-10
          focus:outline-none focus:ring-2 focus:ring-accent
          ${className}
        `}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>

      {/* Arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg
          className="h-4 w-4 text-gray-500"
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