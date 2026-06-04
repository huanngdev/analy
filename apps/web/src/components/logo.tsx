import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center",
        className,
      )}
      aria-hidden="true"
    >
      <img src="/logo.svg" alt="" className="dark size-full object-contain" />
    </span>
  );
}

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-0", className)}>
      <LogoMark />
      <span className="text-foreground text-sm font-semibold tracking-[0.28em] uppercase">
        Analy
      </span>
    </span>
  );
}
