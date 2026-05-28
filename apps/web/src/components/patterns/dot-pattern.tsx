import type { ComponentProps, CSSProperties } from "react";

import { cn } from "@/lib/utils";

type DotPatternProps = ComponentProps<"div"> & {
  dotColor?: string;
  dotOpacity?: number;
  dotSize?: number;
  fade?: boolean;
  gap?: number;
  offsetX?: number;
  offsetY?: number;
};

export function DotPattern({
  className,
  dotColor = "currentColor",
  dotOpacity = 0.28,
  dotSize = 1.2,
  fade = true,
  gap = 22,
  offsetX = 0,
  offsetY = 0,
  style,
  ...props
}: DotPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "text-foreground pointer-events-none absolute inset-0",
        fade && "mask-radial-from-40% mask-radial-to-90% mask-radial-at-center",
        className,
      )}
      style={
        {
          backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundPosition: `${offsetX}px ${offsetY}px`,
          backgroundSize: `${gap}px ${gap}px`,
          opacity: dotOpacity,
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  );
}
