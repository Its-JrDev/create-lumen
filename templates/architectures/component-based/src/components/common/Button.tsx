import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  children,
  className,
  ...props
}: ButtonProps) {
  const styles = {
    primary: { backgroundColor: "#2563eb", color: "white" },
    secondary: { backgroundColor: "#e5e7eb", color: "#1f2937" },
  };

  return (
    <button
      style={{
        padding: "8px 16px",
        borderRadius: "8px",
        fontWeight: 500,
        border: "none",
        cursor: "pointer",
        ...styles[variant],
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}
