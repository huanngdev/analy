"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useSignUp } from "@/hooks/auth/use-sign-up";
import { KeyRoundIcon, MailIcon, UserIcon, UserPlusIcon } from "lucide-react";
import Link from "next/link";
import { Controller } from "react-hook-form";

export default function SignUpPage() {
  const { form, onSubmit, isLoading } = useSignUp();
  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create an account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-sign-up" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              disabled={isLoading}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-sign-up-email">Email</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="form-sign-up-email"
                      aria-invalid={fieldState.invalid}
                      placeholder="email@example.com"
                      autoComplete="off"
                    />
                    <InputGroupAddon>
                      <MailIcon />
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="name"
              control={form.control}
              disabled={isLoading}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-sign-up-name">Name</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="form-sign-up-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Your name"
                      autoComplete="off"
                    />
                    <InputGroupAddon>
                      <UserIcon />
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              disabled={isLoading}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-sign-up-password">
                    Password
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="form-sign-up-password"
                      aria-invalid={fieldState.invalid}
                      placeholder="Min. 8 characters"
                      type="password"
                      autoComplete="off"
                    />
                    <InputGroupAddon>
                      <KeyRoundIcon />
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              disabled={isLoading}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-sign-up-confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="form-sign-up-confirm-password"
                      aria-invalid={fieldState.invalid}
                      placeholder="Repeat your password"
                      type="password"
                      autoComplete="off"
                    />
                    <InputGroupAddon>
                      <KeyRoundIcon />
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <div className="flex flex-col gap-2 px-4">
        <Field orientation="horizontal">
          <Button
            type="submit"
            form="form-sign-up"
            className={"w-full"}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner /> Creating account...
              </>
            ) : (
              <>
                <UserPlusIcon /> Sign Up
              </>
            )}
          </Button>
        </Field>
        <div className="text-xs text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </Card>
  );
}
