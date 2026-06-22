import { cn } from "@/lib/utils";

interface NovaPOSLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: "w-6 h-6 text-xs", text: "text-base" },
  md: { icon: "w-8 h-8 text-sm", text: "text-xl" },
  lg: { icon: "w-10 h-10 text-base", text: "text-2xl" },
};

export function NovaLogo({ size = "md", className }: NovaPOSLogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "shrink-0 rounded-xl flex items-center justify-center font-bold text-white",
          "bg-gradient-to-br from-[var(--nova-accent)] to-[var(--nova-accent-secondary)]",
          icon
        )}
        aria-hidden="true"
      >
        P
      </div>
      <span className={cn("font-semibold tracking-tight text-[var(--nova-text)]", text)}>
        Nova<span className="text-[var(--nova-accent)]">POS</span>
      </span>
    </div>
  );
}
