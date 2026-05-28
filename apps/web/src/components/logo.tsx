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
      <img
        src="/logo-dark.svg"
        alt=""
        className="block size-full object-contain dark:hidden"
      />
      <img
        src="/logo-white.svg"
        alt=""
        className="hidden size-full object-contain dark:block"
      />
    </span>
  );
}

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-foreground text-sm font-semibold tracking-[0.28em] uppercase">
        Analy
      </span>
    </span>
  );
}
