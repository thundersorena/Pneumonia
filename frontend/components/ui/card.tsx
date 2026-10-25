import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLElement>;

export function Card({ className = "", ...props }: CardProps) {
  return <section className={`panel ${className}`} {...props} />;
}
