import type { ReactElement } from "react";

/** Small icon button used in header toolbars. */
export const IconButton = ({
  onClick,
  label,
  isActive,
  variant = "accent",
  children,
}: {
  onClick: () => void;
  label: string;
  isActive?: boolean;
  variant?: "accent" | "primary" | "destructive";
  children: React.ReactNode;
}): ReactElement => {
  const activeClass =
    variant === "primary"
      ? "text-primary bg-primary/15"
      : variant === "destructive"
        ? "text-red-400 bg-red-500/15"
        : "text-accent bg-accent/15";
  const hoverClass =
    variant === "primary"
      ? "text-muted-foreground/40 hover:text-primary hover:bg-primary/10"
      : variant === "destructive"
        ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
        : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50";

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`p-1 rounded transition-colors ${
        isActive ? activeClass : hoverClass
      }`}
    >
      {children}
    </button>
  );
};
