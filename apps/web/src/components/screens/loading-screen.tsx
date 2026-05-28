import { Spinner } from "@/components/ui/spinner";

type LoadingScreenProps = {
  title?: string;
};

export function LoadingScreen({ title = "Loading" }: LoadingScreenProps) {
  return (
    <main className="bg-background text-foreground flex min-h-dvh items-center justify-center p-6">
      <div className="bg-card text-card-foreground flex flex-col items-center gap-3 rounded-2xl border p-6 shadow-sm">
        <Spinner />
        <p className="text-sm font-medium">{title}</p>
      </div>
    </main>
  );
}
