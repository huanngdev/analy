import { useDocumentTitle } from "@/hooks/use-document-title";

type DashboardPlaceholderPageProps = {
  title: string;
};

export function DashboardPlaceholderPage({
  title,
}: DashboardPlaceholderPageProps) {
  useDocumentTitle(`${title} | Analy`);

  return <div className="relative z-10 flex flex-1 flex-col" />;
}
