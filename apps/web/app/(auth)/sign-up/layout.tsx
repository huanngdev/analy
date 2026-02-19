import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Sign Up to your account",
};
export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
