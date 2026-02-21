import { JSX } from "react/jsx-dev-runtime";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Primary action button. Uses --primary color from the global theme.
 * Pass className to override sizing or add layout utilities.
 */
export default function Button({ className = "", disabled, ...props }: ButtonProps): JSX.Element {
  return (
    <button
      style={{
        borderRadius: "9999px",
        backgroundColor: "var(--primary)",
        padding: "1rem 2rem",
        fontWeight: 600,
        color: "#ffffff",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        boxShadow: "0 4px 12px rgba(200,107,60,0.3)",
        transition: "box-shadow 0.2s, transform 0.2s",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 6px 20px rgba(200,107,60,0.45)";
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 4px 12px rgba(200,107,60,0.3)";
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
      onMouseDown={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
      }}
      onMouseUp={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
      }}
      disabled={disabled}
      className={className}
      {...props}
    />
  );
}
