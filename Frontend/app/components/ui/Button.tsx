import { JSX } from "react/jsx-dev-runtime";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * A reusable button component with customizable styling.
 * 
 * @component
 * @param {ButtonProps} props - The button component props
 * @param {string} [props.className=""] - Additional CSS classes to merge with default styles
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} props - Standard HTML button attributes
 * @returns {JSX.Element} A styled button element with rounded corners, shadow effects, and hover transitions
 * 
 * @example
 * ```tsx
 * <Button onClick={() => console.log('clicked')}>Click me</Button>
 * ```
 * 
 * @remarks
 * The button applies default styling including:
 * - Primary color background (burnt orange)
 * - Rounded corners with full border-radius
 * - White text for contrast
 * - Shadow effect with smooth transition on hover and transform
 * - Disabled state styling
 */
export default function Button({ className = "", disabled, ...props }: ButtonProps): JSX.Element {
  return (
    <button
      className={`
        rounded-full bg-primary px-8 py-4 font-semibold
        shadow-[0_4px_12px_rgba(200,107,60,0.3)]
        hover:shadow-[0_6px_20px_rgba(200,107,60,0.4)]
        hover:scale-105
        active:scale-95
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
      disabled={disabled}
      {...props}
    />
  );
}