import { Link } from "react-router-dom";

import { PageTitle } from "@/components/typography/page-title";
import { Button } from "@/components/ui/button";

export function PostgresNotFound() {
  return (
    <div className="relative z-10 flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
      <div>
        <PageTitle size="compact">Instance not found</PageTitle>
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
