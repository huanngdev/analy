import { SiPostgresql } from "@icons-pack/react-simple-icons";
import type { PostgresInstance } from "@repo/shared";
import {
  ActivityIcon,
  ArrowRightIcon,
  CopyIcon,
  DatabaseIcon,
  HardDriveIcon,
  MemoryStickIcon,
  PowerIcon,
  PlugZapIcon,
  PlusIcon,
  ServerIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebarLayout } from "@/components/sidebar/sidebar-layout";
import { PostgresCreateForm } from "@/features/postgres/components/postgres-create-form";
import {
  postgresKeys,
  useCreatePostgresInstance,
  usePostgresInstance,
  usePostgresInstances,
  usePostgresMeta,
  useStopPostgresInstance,
} from "@/features/postgres/hooks/use-postgres";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { queryClient } from "@/lib/query-client";

export function PostgresPage() {
  useDocumentTitle("PostgreSQL | Analy");
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const metaQuery = usePostgresMeta();
  const instancesQuery = usePostgresInstances();
  const createMutation = useCreatePostgresInstance();

  return (
    <div className="relative z-10 flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col gap-4 px-4 lg:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">Your instances</h3>
                  <Badge variant="secondary">
                    {instancesQuery.data?.instances.length ?? 0} total
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  User-owned PostgreSQL services with connection, capacity, and
                  runtime status.
                </p>
              </div>

              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon data-icon="inline-start" />
                    Create PostgreSQL
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create PostgreSQL</DialogTitle>
                    <DialogDescription>
                      Pick safe defaults now. You can tune lifecycle controls
                      later.
                    </DialogDescription>
                  </DialogHeader>
                  {metaQuery.data ? (
                    <PostgresCreateForm
                      hardwareProfiles={metaQuery.data.hardwareProfiles}
                      isPending={createMutation.isPending}
                      versions={metaQuery.data.versions}
                      onSubmit={(input) => {
                        createMutation.mutate(input, {
                          onError: (error) => {
                            toast.error(getApiErrorMessage(error));
                          },
                          onSuccess: async (response) => {
                            await queryClient.invalidateQueries({
                              queryKey: postgresKeys.list(),
                            });
                            queryClient.setQueryData(
                              postgresKeys.detail(response.instance.id),
                              { instance: response.instance, ok: true },
                            );
                            setIsCreateOpen(false);
                            toast.success("PostgreSQL instance is ready");
                            navigate(
                              `/dashboard/services/postgresql/${response.instance.id}`,
                            );
                          },
                        });
                      }}
                    />
                  ) : (
                    <PostgresCreateSkeleton />
                  )}
                </DialogContent>
              </Dialog>
            </div>

            {instancesQuery.isLoading ? <PostgresListSkeleton /> : null}

            {instancesQuery.data?.instances.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {instancesQuery.data.instances.map((instance) => (
                  <PostgresInstanceCard key={instance.id} instance={instance} />
                ))}
              </div>
            ) : !instancesQuery.isLoading ? (
              <Empty className="min-h-72 rounded-3xl border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <DatabaseIcon />
                  </EmptyMedia>
                  <EmptyTitle>Create your first PostgreSQL database</EmptyTitle>
                  <EmptyDescription>
                    Analy will create the metadata, assign a local endpoint, and
                    take you straight to the instance overview.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <PlusIcon data-icon="inline-start" />
                    Create PostgreSQL
                  </Button>
                </EmptyContent>
              </Empty>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostgresDetailPage() {
  const { serviceId } = useParams();
  const { setBreadcrumbs } = useSidebarLayout();
  const instanceQuery = usePostgresInstance(serviceId);
  const stopMutation = useStopPostgresInstance();
  const instance = instanceQuery.data?.instance;

  useDocumentTitle(`${instance?.name ?? "PostgreSQL"} | Analy`);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", to: "/dashboard" },
      { label: "PostgreSQL", to: "/dashboard/services/postgresql" },
      {
        label:
          instance?.name ?? (instanceQuery.isLoading ? "Loading" : "Not found"),
      },
    ]);

    return () => setBreadcrumbs(null);
  }, [instance?.name, instanceQuery.isLoading, setBreadcrumbs]);

  if (instanceQuery.isLoading) {
    return (
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex flex-col gap-6 px-4 py-4 md:py-6 lg:px-6">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-4 w-full max-w-xl rounded-lg" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="relative z-10 flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
        <div>
          <h1 className="text-xl font-semibold">Instance not found</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            The instance may have been deleted or it does not belong to your
            account.
          </p>
        </div>
        <Button asChild className="w-fit">
          <Link to="/dashboard/services/postgresql">Back to PostgreSQL</Link>
        </Button>
      </div>
    );
  }

  const usageData = getUsageChartData(instance);

  return (
    <div className="relative z-10 flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-8 px-4 py-4 md:py-6 lg:px-6">
          <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
                <SiPostgresql />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-bold tracking-tight md:text-3xl">
                    {instance.name}
                  </h1>
                  <Badge variant="secondary">{instance.status}</Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  {instance.project.name} · PostgreSQL{" "}
                  {instance.postgresVersion} · {instance.host}:{instance.port}
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:min-w-80">
              <ConnectDialog instance={instance} />
              <Button
                size="lg"
                variant="destructive"
                disabled={
                  instance.status === "stopped" || stopMutation.isPending
                }
                onClick={() => {
                  stopMutation.mutate(instance.id, {
                    onError: (error) => {
                      toast.error(getApiErrorMessage(error));
                    },
                    onSuccess: async (response) => {
                      queryClient.setQueryData(
                        postgresKeys.detail(instance.id),
                        response,
                      );
                      await queryClient.invalidateQueries({
                        queryKey: postgresKeys.list(),
                      });
                      toast.success("PostgreSQL stopped");
                    },
                  });
                }}
              >
                <PowerIcon data-icon="inline-start" />
                {instance.status === "stopped"
                  ? "Stopped"
                  : stopMutation.isPending
                    ? "Stopping"
                    : "Stop"}
              </Button>
            </div>
          </section>

          <section className="grid border-y md:grid-cols-3 md:divide-x">
            <SummaryMetric
              icon={<ServerIcon />}
              label="Endpoint"
              value={`${instance.host}:${instance.port}`}
            />
            <SummaryMetric
              icon={<DatabaseIcon />}
              label="Database"
              value={instance.databaseName}
            />
            <SummaryMetric
              icon={<ActivityIcon />}
              label="Health"
              value={instance.health.status}
            />
          </section>

          <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold">Quick overview</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Current resource usage against the selected profile limits.
                </p>
              </div>

              <ChartContainer
                config={usageChartConfig}
                className="aspect-auto h-72 w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={usageData}
                  layout="vertical"
                  margin={{ left: 0, right: 16 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis
                    type="number"
                    dataKey="value"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={72}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                </BarChart>
              </ChartContainer>

              <div className="grid gap-4 md:grid-cols-3">
                <UsageMeter
                  icon={<ActivityIcon />}
                  label="CPU"
                  limit={`${instance.hardware.cpuLimit} vCPU`}
                  value={instance.usage.cpu}
                />
                <UsageMeter
                  icon={<MemoryStickIcon />}
                  label="Memory"
                  limit={`${instance.hardware.memoryMb} MB`}
                  value={instance.usage.memory}
                />
                <UsageMeter
                  icon={<HardDriveIcon />}
                  label="Storage"
                  limit={`${Math.round(instance.hardware.storageMb / 1024)} GB`}
                  value={instance.usage.storage}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold">Details</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Ownership and runtime metadata for this service.
                </p>
              </div>
              <div className="text-sm">
                <DetailRow label="Project" value={instance.project.name} />
                <DetailRow label="Profile" value={instance.hardwareProfile} />
                <DetailRow label="Image" value={instance.imageTag} />
                <DetailRow label="Username" value={instance.username} />
                <DetailRow
                  label="Updated"
                  value={new Date(instance.updatedAt).toLocaleString()}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PostgresInstanceCard({ instance }: { instance: PostgresInstance }) {
  return (
    <div className="flex flex-col gap-3 border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{instance.name}</h3>
          <p className="text-muted-foreground truncate text-sm">
            {instance.project.name}
          </p>
        </div>
        <Badge variant="secondary">{instance.status}</Badge>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Badge variant="outline">PostgreSQL {instance.postgresVersion}</Badge>
          <Badge variant="outline">{instance.health.status}</Badge>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to={`/dashboard/services/postgresql/${instance.id}`}>
            Open
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

const usageChartConfig = {
  value: {
    label: "Used",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function getUsageChartData(instance: PostgresInstance) {
  return [
    { name: "CPU", value: instance.usage.cpu },
    { name: "Memory", value: instance.usage.memory },
    { name: "Storage", value: instance.usage.storage },
  ];
}

function SummaryMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 py-4 md:px-5">
      <div className="text-primary bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground truncate text-sm">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}

function ConnectDialog({ instance }: { instance: PostgresInstance }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <PlugZapIcon data-icon="inline-start" />
          Connect
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connect to {instance.name}</DialogTitle>
          <DialogDescription>
            Use the connection URI in app config or run the terminal command
            with the password placeholder replaced.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <ConnectionValue
            label="Connection URI"
            value={getSafeConnectionUri(instance)}
          />
          <ConnectionValue
            label="Terminal command"
            value={getPsqlCommand(instance)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConnectionValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            void navigator.clipboard.writeText(value);
            toast.success("Copied to clipboard");
          }}
        >
          <CopyIcon data-icon="inline-start" />
          Copy
        </Button>
      </div>
      <div className="bg-muted rounded-lg p-3 font-mono text-sm break-all">
        {value}
      </div>
    </div>
  );
}

function UsageMeter({
  icon,
  label,
  limit,
  value,
}: {
  icon: ReactNode;
  label: string;
  limit: string;
  value: number;
}) {
  return (
    <div className="flex flex-col gap-3 border-t py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="text-primary bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{label}</p>
            <p className="text-muted-foreground truncate text-sm">
              Limit {limit}
            </p>
          </div>
        </div>
        <p className="text-2xl font-bold">{value}%</p>
      </div>
      <Progress value={value} />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium sm:text-right">{value}</span>
    </div>
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

function PostgresCreateSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-10 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-10 rounded-xl" />
      <Skeleton className="h-10 rounded-xl" />
    </div>
  );
}

function getSafeConnectionUri(instance: PostgresInstance) {
  return `postgresql://${instance.username}:<password>@${instance.host}:${instance.port}/${instance.databaseName}`;
}

function getPsqlCommand(instance: PostgresInstance) {
  return `PGPASSWORD=<password> psql -h ${instance.host} -p ${instance.port} -U ${instance.username} -d ${instance.databaseName}`;
}
