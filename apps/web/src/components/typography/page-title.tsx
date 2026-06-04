import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type PageTitleProps = ComponentPropsWithoutRef<"h1"> & {
  as?: "h1" | "h2" | "h3";
  size?: "default" | "compact";
};

export function PageTitle({
  as: Heading = "h1",
  className,
  size = "default",
  ...props
}: PageTitleProps) {
  return (
    <Heading
      className={cn(
        "font-display text-foreground font-semibold tracking-normal",
        size === "default" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl",
        className,
      )}
      {...props}
    />
  );
}
