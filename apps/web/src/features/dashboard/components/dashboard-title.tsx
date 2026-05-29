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
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground mt-3 text-base leading-7">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
