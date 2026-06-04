import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type UserRoundPlusIconProps = HTMLAttributes<HTMLSpanElement> & {
  size?: number;
};

export function UserRoundPlusIcon({
  className,
  size = 16,
  style,
  ...props
}: UserRoundPlusIconProps) {
  return (
    <span
      data-icon="inline-start"
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
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
        <g>
          <path d="M2 21a8 8 0 0 1 13.292-6" />
          <circle cx="10" cy="8" r="5" />
        </g>
        <g className="origin-center transition-transform duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transform-box:fill-box] group-hover/button:rotate-90 group-active/button:rotate-0">
          <path d="M19 16v6" />
          <path d="M22 19h-6" />
        </g>
      </svg>
    </span>
  );
}
