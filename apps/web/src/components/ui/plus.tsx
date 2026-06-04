import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type PlusIconProps = HTMLAttributes<HTMLSpanElement> & {
  size?: number;
};

export function PlusIcon({
  className,
  size = 16,
  style,
  ...props
}: PlusIconProps) {
  return (
    <span
      data-icon="inline-start"
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition-transform duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/button:rotate-180 group-active/button:rotate-0",
        className,
      )}
      style={{ height: size, width: size, ...style }}
      {...props}
    >
      <svg
        className="size-full"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    </span>
  );
}
