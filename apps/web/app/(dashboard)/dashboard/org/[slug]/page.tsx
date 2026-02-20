"use client";

import { useGetOrganizationBySlug } from "@/hooks/organization/use-get-organization-by-slug";
import { Spinner } from "@/components/ui/spinner";
import { use } from "react";

export default function OrgDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data, isLoading, isError } = useGetOrganizationBySlug(slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Organization not found.
      </div>
    );
  }

  return (
    <div className="py-8">
      <pre className="rounded-xl bg-muted p-6 text-sm overflow-auto">
        {JSON.stringify(data.data.organization, null, 2)}
      </pre>
    </div>
  );
}
