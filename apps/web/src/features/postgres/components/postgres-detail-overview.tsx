import type { PostgresInstance } from "@repo/shared";
import { motion } from "framer-motion";
import {
  ActivityIcon,
  DatabaseIcon,
  HardDriveIcon,
  MemoryStickIcon,
  PowerIcon,
  ServerIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { DashboardTitle } from "@/features/dashboard/components/dashboard-title";
import { PostgresConnectDialog } from "@/features/postgres/components/postgres-connect-dialog";

type PostgresDetailOverviewProps = {
  instance: PostgresInstance;
  isStopping: boolean;
  onStop: () => void;
};

export function PostgresDetailOverview({
  instance,
  isStopping,
  onStop,
}: PostgresDetailOverviewProps) {
  const usageData = getUsageChartData(instance);

  return (
    <motion.div
      className="relative z-10 flex flex-1 flex-col"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-8 px-4 py-4 md:py-6 lg:px-6">
          <DashboardTitle
            title={instance.name}
            description={`${instance.project.name} · PostgreSQL ${instance.postgresVersion} · ${instance.host}:${instance.port}`}
            actions={
              <div className="grid gap-2 sm:grid-cols-2 lg:min-w-80">
                <PostgresConnectDialog instance={instance} />
                <Button
                  size="lg"
                  variant="destructive"
                  disabled={instance.status === "stopped" || isStopping}
                  onClick={onStop}
                >
                  <PowerIcon data-icon="inline-start" />
                  {getStopLabel(instance.status, isStopping)}
                </Button>
              </div>
            }
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{instance.status}</Badge>
              <Badge variant="outline">{instance.health.status}</Badge>
            </div>
          </DashboardTitle>

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
    </motion.div>
  );
}

const usageChartConfig = {
  value: {
    label: "Used",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function getStopLabel(status: PostgresInstance["status"], isStopping: boolean) {
  if (status === "stopped") {
    return "Stopped";
  }

  return isStopping ? "Stopping" : "Stop";
}

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
