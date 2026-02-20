"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SelectOrganization } from "@repo/shared";
import Link from "next/link";

export const ORG_TYPE_LABELS: Record<string, string> = {
  PERSONAL: "Personal",
  COMPANY: "Company",
  TEAM: "Team",
  EDUCATION: "Education",
  OTHER: "Other",
};

export function OrgCard({ org }: { org: SelectOrganization }) {
  return (
    <Link href={`/dashboard/org/${org.slug}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{org.name}</CardTitle>
            <Badge variant="secondary">
              {ORG_TYPE_LABELS[org.type] ?? org.type}
            </Badge>
          </div>
          <CardDescription className="font-mono text-xs">
            {org.slug}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground flex-1">
              Created{" "}
              {new Date(org.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="text-xs text-muted-foreground">{org.tier}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function OrgCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  );
}
