import { Header } from "@/components/shared/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="container mx-auto pt-16 pb-10 min-h-screen">
        {children}
      </main>
    </>
  );
}
