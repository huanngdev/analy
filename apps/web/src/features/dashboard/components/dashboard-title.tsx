import type { ReactNode } from "react";

type DashboardTitleProps = {
  children?: ReactNode;
  description?: string;
  logo?: ReactNode;
  title: string;
};

export function DashboardTitle({
  children,
  description,
  logo,
  title,
}: DashboardTitleProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex max-w-3xl items-center gap-3">
        <div>
          <div className="flex items-center gap-1">
            <h2 className="text-xl font-bold tracking-tight md:text-2xl">
              {title}
            </h2>
            {logo ? (
              <div className="text-primary flex size-6 shrink-0 items-center justify-center [&_svg]:size-full">
                {logo}
              </div>
            ) : null}
          </div>
          {description ? (
            <p className="text-muted-foreground text-sm leading-7 italic">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
