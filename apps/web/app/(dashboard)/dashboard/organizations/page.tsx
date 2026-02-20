"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useGetOrganizations } from "@/hooks/organization/use-get-organizations";
import { Search } from "lucide-react";
import { useState } from "react";
import { OrgList } from "../../../../components/organizations/org-list";
import { CreateOrgButton } from "@/components/organizations/create-org-button";

export default function OrganizationPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetOrganizations({
    search: search || undefined,
  });

  const organizations = data?.data.organizations ?? [];

  return (
    <div className="flex flex-col gap-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Your Organizations
      </h1>
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1">
          <InputGroup className="max-w-xs ">
            <InputGroupInput
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              {data?.data.total ?? 0} result{data?.data.total !== 1 ? "s" : ""}
            </InputGroupAddon>
          </InputGroup>
        </div>
        <CreateOrgButton />
      </div>
      <OrgList
        organizations={organizations}
        isLoading={isLoading}
        search={search}
      />
    </div>
  );
}
