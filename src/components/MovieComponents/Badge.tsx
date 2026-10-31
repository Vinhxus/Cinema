import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

/* ---------- Badge ---------- */
function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-bold leading-none ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge