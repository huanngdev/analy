import { PageTitle } from "@/components/typography/page-title";
import { Separator } from "@/components/ui/separator";
import type { ReactNode } from "react";

type DashboardTitleProps = {
  actions?: ReactNode;
  children?: ReactNode;
  description?: string;
  title: string;
};

export function DashboardTitle({
  actions,
  children,
  description,
  title,
}: DashboardTitleProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-3xl items-center gap-3">
          <div>
            <PageTitle as="h2" size="compact">
              {title}
            </PageTitle>
            {description ? (
              <p className="text-muted-foreground text-sm leading-7 italic">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      <Separator className="w-[calc(100%+2rem)] -translate-x-4 lg:w-[calc(100%+3rem)] lg:-translate-x-6" />
      {children}
    </section>
  );
}
