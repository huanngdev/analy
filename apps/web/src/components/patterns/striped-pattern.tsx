import type { ComponentProps, CSSProperties } from "react";

import { cn } from "@/lib/utils";

type StripeDirection =
  | "horizontal"
  | "vertical"
  | "diagonal-up"
  | "diagonal-down";

type StripedPatternProps = ComponentProps<"div"> & {
  direction?: StripeDirection;
  fade?: boolean;
  gap?: number;
  stripeColor?: string;
  stripeOpacity?: number;
  stripeWidth?: number;
};

const stripeAngles: Record<StripeDirection, number> = {
  "diagonal-down": 45,
  "diagonal-up": -45,
  horizontal: 0,
  vertical: 90,
};

export function StripedPattern({
  className,
  direction = "diagonal-down",
  fade = true,
  gap = 18,
  stripeColor = "currentColor",
  stripeOpacity = 0.12,
  stripeWidth = 1,
  style,
  ...props
}: StripedPatternProps) {
  const angle = stripeAngles[direction];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "text-foreground pointer-events-none absolute inset-0",
        fade && "mask-linear-from-50% mask-linear-to-95%",
        className,
      )}
      style={
        {
          backgroundImage: `repeating-linear-gradient(${angle}deg, ${stripeColor} 0 ${stripeWidth}px, transparent ${stripeWidth}px ${gap}px)`,
          opacity: stripeOpacity,
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  );
}
