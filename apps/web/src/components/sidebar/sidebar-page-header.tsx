import { Fragment } from "react";
import { Link } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

export type SidebarBreadcrumbItem = {
  label: string;
  to?: string;
};

type SidebarPageHeaderProps = {
  breadcrumbs?: SidebarBreadcrumbItem[];
  title?: string;
};

export function SidebarPageHeader({
  breadcrumbs = [],
  title,
}: SidebarPageHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-4">
        <SidebarTrigger />

        {breadcrumbs.length ? (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => {
                const isCurrent = index === breadcrumbs.length - 1 || !item.to;

                return (
                  <Fragment key={`${item.label}-${index}`}>
                    {index > 0 ? <BreadcrumbSeparator /> : null}
                    <BreadcrumbItem>
                      {!isCurrent && item.to ? (
                        <BreadcrumbLink asChild>
                          <Link to={item.to}>{item.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : title ? (
          <h1 className="text-base font-medium">{title}</h1>
        ) : null}
      </div>
    </header>
  );
}
