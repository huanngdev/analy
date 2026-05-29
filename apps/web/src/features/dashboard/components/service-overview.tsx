import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dashboardOverviewData } from "@/features/dashboard/constants/dashboard-overview-data";

function getStatusVariant(status: string) {
  if (status === "Healthy") {
    return "secondary";
  }

  if (status === "Attention") {
    return "destructive";
  }

  return "outline";
}

export function ServiceOverview() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardOverviewData.summary.map((item) => (
          <Card key={item.label} className="bg-card/95 shadow-none">
            <CardHeader className="gap-1 pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl">{item.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="bg-card/95 shadow-none">
          <CardHeader>
            <CardTitle>Service overview</CardTitle>
            <CardDescription>
              Quick health, capacity, credentials, and backup status for every
              service.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {dashboardOverviewData.services.map((service) => (
              <div key={service.id} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{service.name}</p>
                      <Badge variant={getStatusVariant(service.status)}>
                        {service.status}
                      </Badge>
                      <Badge variant="outline">{service.type}</Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {service.plan} · {service.region} · {service.version}
                    </p>
                  </div>
                  <div className="text-muted-foreground text-sm lg:text-right">
                    <p>{service.connection}</p>
                    <p>{service.lastUpdated}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <MetricBar label="CPU" value={service.cpuUsage} />
                  <MetricBar label="Memory" value={service.memoryUsage} />
                  <MetricBar label="Storage" value={service.storageUsage} />
                </div>

                <p className="text-muted-foreground mt-3 text-sm">
                  {service.backups}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/95 shadow-none">
          <CardHeader>
            <CardTitle>Next actions</CardTitle>
            <CardDescription>
              Useful operations surfaced from service health and platform goals.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {dashboardOverviewData.nextActions.map((action) => (
              <div key={action} className="rounded-2xl border p-3 text-sm">
                {action}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
