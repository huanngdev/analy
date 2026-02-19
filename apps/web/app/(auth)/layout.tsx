import { Header } from "@/components/shared/header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="container mx-auto py-10 min-h-screen flex items-center justify-center">
        {children}
      </main>
    </>
  );
}
