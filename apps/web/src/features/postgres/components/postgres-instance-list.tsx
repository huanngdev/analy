import type { PostgresListItem } from "@repo/shared";
import { motion } from "framer-motion";
import { DatabaseIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PlusIcon } from "@/components/ui/plus";
import { Skeleton } from "@/components/ui/skeleton";
import { PostgresInstanceCard } from "@/features/postgres/components/postgres-instance-card";

type PostgresInstanceListProps = {
  instances: PostgresListItem[];
  isLoading: boolean;
  search: string;
};

export function PostgresInstanceList({
  instances,
  isLoading,
  search,
}: PostgresInstanceListProps) {
  if (isLoading) {
    return <PostgresListSkeleton />;
  }

  if (instances.length) {
    return (
      <motion.div
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {instances.map((instance) => (
          <PostgresInstanceCard key={instance.id} instance={instance} />
        ))}
      </motion.div>
    );
  }

  return (
    <Empty className="min-h-72 rounded-3xl border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DatabaseIcon />
        </EmptyMedia>
        <EmptyTitle>
          {search
            ? "No PostgreSQL instances found"
            : "Create your first PostgreSQL database"}
        </EmptyTitle>
        <EmptyDescription>
          {search
            ? "Try a different search term or create a new PostgreSQL database."
            : "Analy will create the metadata, assign a local endpoint, and take you straight to the instance overview."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to="/dashboard/services/postgresql/new">
            <PlusIcon />
            Create PostgreSQL
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function PostgresListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-28 rounded-lg" />
    </div>
  );
}
