import type { PostgresListItem } from "@repo/shared";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PostgresInstanceCardProps = {
  instance: PostgresListItem;
};

export function PostgresInstanceCard({ instance }: PostgresInstanceCardProps) {
  return (
    <Link
      className="group block h-full outline-none"
      to={`/dashboard/services/postgresql/${instance.id}`}
      aria-label={`Open ${instance.name} details`}
    >
      <Card
        hoverMotion
        className="group-focus-visible:ring-ring h-full rounded-lg group-focus-visible:ring-2"
      >
        <CardHeader className="gap-2">
          <CardTitle className="min-w-0 truncate">{instance.name}</CardTitle>
          <CardDescription className="truncate">
            {instance.project.name}
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">{instance.status}</Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4">
          {instance.description ? (
            <p className="text-muted-foreground line-clamp-2 text-sm leading-6">
              {instance.description}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              PostgreSQL {instance.postgresVersion}
            </Badge>
            <Badge variant="outline">{instance.healthStatus}</Badge>
          </div>
        </CardContent>

        <CardFooter className="justify-between">
          <span className="text-muted-foreground text-xs">
            Updated {new Date(instance.updatedAt).toLocaleDateString()}
          </span>
          <span className="text-primary inline-flex items-center gap-1 text-sm font-medium">
            Details
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
