import type { PostgresInstance } from "@repo/shared";
import { CopyIcon, PlugZapIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PostgresConnectDialogProps = {
  instance: PostgresInstance;
};

export function PostgresConnectDialog({
  instance,
}: PostgresConnectDialogProps) {
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

function getSafeConnectionUri(instance: PostgresInstance) {
  return `postgresql://${instance.username}:<password>@${instance.host}:${instance.port}/${instance.databaseName}`;
}

function getPsqlCommand(instance: PostgresInstance) {
  return `PGPASSWORD=<password> psql -h ${instance.host} -p ${instance.port} -U ${instance.username} -d ${instance.databaseName}`;
}
