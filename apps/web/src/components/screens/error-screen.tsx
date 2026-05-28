import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

type ErrorScreenProps = {
  description?: string;
  title?: string;
};

export function ErrorScreen({
  description = "The page you are looking for does not exist or something went wrong.",
  title = "Something went wrong",
}: ErrorScreenProps) {
  return (
    <main className="bg-background text-foreground flex min-h-dvh items-center justify-center p-6">
      <section className="bg-card text-card-foreground flex max-w-md flex-col items-center gap-4 rounded-3xl border p-8 text-center shadow-sm">
        <p className="text-muted-foreground text-sm font-medium tracking-[0.25em] uppercase">
          Analy
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        <Button asChild>
          <Link to="/login">Go to login</Link>
        </Button>
      </section>
    </main>
  );
}
