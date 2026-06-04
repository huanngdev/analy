import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "@/components/ui/plus";
import { Spinner } from "@/components/ui/spinner";
import { useLogin } from "@/features/auth/hooks/use-login";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";

export function LoginForm() {
  const { form, isLoading, onSubmit } = useLogin();
  const emailError = form.formState.errors.email;
  const passwordError = form.formState.errors.password;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={!!emailError} data-disabled={isLoading}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!emailError}
            disabled={isLoading}
            placeholder="you@company.com"
            {...form.register("email")}
          />
          <FieldError errors={[emailError]} />
        </Field>
        <Field data-invalid={!!passwordError} data-disabled={isLoading}>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!passwordError}
            disabled={isLoading}
            placeholder="Enter your password"
            {...form.register("password")}
          />
          <FieldError errors={[passwordError]} />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <Spinner data-icon="inline-start" /> : <PlusIcon />}
        Sign in
      </Button>
      <OAuthButtons />
      <FieldDescription className="text-center">
        New to Analy? <Link to="/register">Create an account</Link>
      </FieldDescription>
    </form>
  );
}
