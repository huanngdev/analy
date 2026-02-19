import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign In to your account",
};
export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
