import { Button } from "@/components/ui/button";

type ErrorScreenProps = {
  actionHref?: string;
  actionLabel?: string;
  description?: string;
  onAction?: () => void;
  title?: string;
};

export function ErrorScreen({
  actionHref = "/login",
  actionLabel = "Go to login",
  description = "The page you are looking for does not exist or something went wrong.",
  onAction,
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
        {onAction ? (
          <Button type="button" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : (
          <Button asChild>
            <a href={actionHref}>{actionLabel}</a>
          </Button>
        )}
      </section>
    </main>
  );
}
