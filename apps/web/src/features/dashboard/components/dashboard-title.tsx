import type { ReactNode } from "react";

type DashboardTitleProps = {
  children: ReactNode;
  description?: string;
  title: string;
};

export function DashboardTitle({
  children,
  description,
  title,
}: DashboardTitleProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="max-w-3xl">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground text-sm leading-7 italic">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
