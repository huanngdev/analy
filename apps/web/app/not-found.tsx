import { ErrorPage } from "@/components/shared/error-page";
import { Header } from "@/components/shared/header";

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <ErrorPage
        code={404}
        message="The page you're looking for might have been moved or doesn't exist."
      />
    </>
  );
}
