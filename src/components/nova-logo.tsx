import Image from "next/image";
import { cn } from "@/lib/utils";

interface NovaPOSLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  iconOnly?: boolean;
}

const iconSizes = {
  sm: 24,
  md: 32,
  lg: 40,
};

const textSizes = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

export function NovaLogo({ size = "md", className, iconOnly = false }: NovaPOSLogoProps) {
  const px = iconSizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo-pos.png"
        alt="NovaPOS"
        width={px}
        height={px}
        className="shrink-0"
        priority
      />
      {!iconOnly && (
        <span className={cn("font-semibold tracking-tight text-[var(--nova-text)]", textSizes[size])}>
          Nova<span className="text-[var(--nova-accent)]">POS</span>
        </span>
      )}
    </div>
  );
}
