import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export function Button({
  className = "",
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button ${variant === "outline" ? "button-outline" : "button-primary"} ${className}`}
      {...props}
    />
  );
}
