"use client";

import { OrgCard, OrgCardSkeleton } from "@/components/organizations/org-card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { SelectOrganization } from "@repo/shared";
import { Building2Icon } from "lucide-react";

interface OrgListProps {
  organizations: SelectOrganization[];
  isLoading: boolean;
  search: string;
}

export function OrgList({ organizations, isLoading, search }: OrgListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <OrgCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2Icon />
          </EmptyMedia>
          <EmptyTitle>No organizations found</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            {search
              ? `No results for "${search}"`
              : "Create your first organization to get started."}
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {organizations.map((org) => (
        <OrgCard key={org.id} org={org} />
      ))}
    </div>
  );
}
