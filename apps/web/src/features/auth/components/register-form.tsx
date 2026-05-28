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
import { Spinner } from "@/components/ui/spinner";
import { useRegister } from "@/features/auth/hooks/use-register";

export function RegisterForm() {
  const { form, isLoading, onSubmit } = useRegister();
  const emailError = form.formState.errors.email;
  const passwordError = form.formState.errors.password;
  const confirmPasswordError = form.formState.errors.confirmPassword;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={!!emailError} data-disabled={isLoading}>
          <FieldLabel htmlFor="register-email">Email</FieldLabel>
          <Input
            id="register-email"
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
          <FieldLabel htmlFor="register-password">Password</FieldLabel>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!passwordError}
            disabled={isLoading}
            placeholder="At least 8 characters"
            {...form.register("password")}
          />
          <FieldError errors={[passwordError]} />
        </Field>
        <Field data-invalid={!!confirmPasswordError} data-disabled={isLoading}>
          <FieldLabel htmlFor="register-confirm-password">
            Confirm password
          </FieldLabel>
          <Input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!confirmPasswordError}
            disabled={isLoading}
            placeholder="Repeat your password"
            {...form.register("confirmPassword")}
          />
          <FieldError errors={[confirmPasswordError]} />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Spinner data-icon="inline-start" />}
        Create account
      </Button>
      <FieldDescription className="text-center">
        Already have an account? <Link to="/login">Sign in</Link>
      </FieldDescription>
    </form>
  );
}
