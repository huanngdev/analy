import type { PostgresCreateRequest } from "@repo/shared";
import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PlusIcon } from "@/components/ui/plus";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { PostgresRequiredFieldLabel } from "@/features/postgres/components/postgres-required-field-label";
import {
  postgresPasswordChecks,
  usePostgresCreateForm,
} from "@/features/postgres/hooks/use-postgres-create-form";

type PostgresCreateFormProps = {
  hardwareProfiles: {
    cpuLimit: string;
    id: "dev-light" | "dev-standard" | "dev-power";
    memoryMb: number;
    name: string;
    storageMb: number;
  }[];
  isPending: boolean;
  onSubmit: (input: PostgresCreateRequest) => void;
  versions: ("17" | "16" | "15")[];
};

export function PostgresCreateForm({
  hardwareProfiles,
  isPending,
  onSubmit,
  versions,
}: PostgresCreateFormProps) {
  const form = usePostgresCreateForm({
    isDisabled: isPending,
    onSubmit,
  });

  return (
    <form
      className="flex flex-col gap-4"
      aria-busy={isPending}
      onSubmit={form.handleSubmit}
    >
      <FieldSet className="rounded-xl border p-4 md:p-5">
        <FieldLegend className="font-display text-xl font-semibold tracking-normal md:text-2xl">
          Instance basics
        </FieldLegend>
        <FieldDescription>
          Name the service and add context for where this database is used.
        </FieldDescription>
        <FieldGroup>
          <Field data-invalid={!!form.errors.name} data-disabled={isPending}>
            <PostgresRequiredFieldLabel htmlFor="name">
              Instance name
            </PostgresRequiredFieldLabel>
            <Input
              aria-invalid={!!form.errors.name}
              aria-required="true"
              disabled={isPending}
              id="name"
              name="name"
              placeholder="app-postgres-main"
              required
            />
            <FieldDescription>
              Lowercase letters, numbers, and hyphens. This is unique inside the
              project.
            </FieldDescription>
            <FieldError errors={form.getFieldError("name")} />
          </Field>

          <Field
            data-invalid={!!form.errors.description}
            data-disabled={isPending}
          >
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              aria-invalid={!!form.errors.description}
              disabled={isPending}
              id="description"
              name="description"
              placeholder="Primary database for the application API."
            />
            <FieldError errors={form.getFieldError("description")} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet className="rounded-xl border p-4 md:p-5">
        <FieldLegend className="font-display text-xl font-semibold tracking-normal md:text-2xl">
          Runtime profile
        </FieldLegend>
        <FieldDescription>
          Choose the PostgreSQL version and development hardware allocation.
        </FieldDescription>
        <FieldGroup>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              data-invalid={!!form.errors.postgresVersion}
              data-disabled={isPending}
            >
              <PostgresRequiredFieldLabel>
                PostgreSQL version
              </PostgresRequiredFieldLabel>
              <Select
                disabled={isPending}
                onValueChange={form.setPostgresVersion}
                value={form.postgresVersion}
              >
                <SelectTrigger
                  aria-required="true"
                  className="w-full"
                  disabled={isPending}
                >
                  <SelectValue placeholder="Choose version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {versions.map((version) => (
                      <SelectItem key={version} value={version}>
                        PostgreSQL {version}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={form.getFieldError("postgresVersion")} />
            </Field>

            <Field
              data-invalid={!!form.errors.hardwareProfile}
              data-disabled={isPending}
            >
              <PostgresRequiredFieldLabel>
                Hardware profile
              </PostgresRequiredFieldLabel>
              <Select
                disabled={isPending}
                onValueChange={form.setHardwareProfile}
                value={form.hardwareProfile}
              >
                <SelectTrigger
                  aria-required="true"
                  className="w-full"
                  disabled={isPending}
                >
                  <SelectValue placeholder="Choose profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {hardwareProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name} · {profile.cpuLimit} CPU ·{" "}
                        {profile.memoryMb} MB
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={form.getFieldError("hardwareProfile")} />
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSet className="rounded-xl border p-4 md:p-5">
        <FieldLegend className="font-display text-xl font-semibold tracking-normal md:text-2xl">
          Database credentials
        </FieldLegend>
        <FieldDescription>
          Set the initial database, username, and password for the service.
        </FieldDescription>
        <FieldGroup>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              data-invalid={!!form.errors.databaseName}
              data-disabled={isPending}
            >
              <PostgresRequiredFieldLabel htmlFor="databaseName">
                Database name
              </PostgresRequiredFieldLabel>
              <Input
                aria-invalid={!!form.errors.databaseName}
                aria-required="true"
                disabled={isPending}
                id="databaseName"
                name="databaseName"
                placeholder="app"
                required
              />
              <FieldError errors={form.getFieldError("databaseName")} />
            </Field>

            <Field
              data-invalid={!!form.errors.username}
              data-disabled={isPending}
            >
              <PostgresRequiredFieldLabel htmlFor="username">
                Username
              </PostgresRequiredFieldLabel>
              <Input
                aria-invalid={!!form.errors.username}
                aria-required="true"
                disabled={isPending}
                id="username"
                name="username"
                placeholder="app_user"
                required
              />
              <FieldError errors={form.getFieldError("username")} />
            </Field>
          </div>

          <Field
            data-invalid={!!form.errors.password}
            data-disabled={isPending}
          >
            <PostgresRequiredFieldLabel htmlFor="password">
              Password
            </PostgresRequiredFieldLabel>
            <InputGroup>
              <InputGroupInput
                aria-invalid={!!form.errors.password}
                aria-required="true"
                autoComplete="new-password"
                disabled={isPending}
                id="password"
                name="password"
                onBlur={form.hidePasswordFeedback}
                onChange={form.handlePasswordChange}
                onFocus={form.showPasswordFeedback}
                placeholder="At least 16 chars with upper, lower, number, symbol"
                required
                type={form.isPasswordVisible ? "text" : "password"}
                value={form.password}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  disabled={isPending}
                  onClick={form.togglePasswordVisibility}
                  size="icon-xs"
                  title={
                    form.isPasswordVisible ? "Hide password" : "Show password"
                  }
                >
                  {form.isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                  <span className="sr-only">
                    {form.isPasswordVisible ? "Hide password" : "Show password"}
                  </span>
                </InputGroupButton>
                <InputGroupButton
                  disabled={isPending || !form.password}
                  onClick={form.copyPassword}
                  size="icon-xs"
                  title="Copy password"
                >
                  <CopyIcon />
                  <span className="sr-only">Copy password</span>
                </InputGroupButton>
                <InputGroupButton
                  disabled={isPending}
                  onClick={form.generateSecurePassword}
                  title="Generate password"
                >
                  <KeyRoundIcon data-icon="inline-start" />
                  Generate
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <Progress
              className="h-1.5 data-[complete=true]:[&_[data-slot=progress-indicator]]:bg-emerald-500"
              data-complete={
                form.passwordStrength === postgresPasswordChecks.length
              }
              value={form.passwordStrengthValue}
            />
            <div
              className="grid transition-all duration-200 ease-out data-[open=false]:grid-rows-[0fr] data-[open=false]:opacity-0 data-[open=true]:grid-rows-[1fr] data-[open=true]:opacity-100"
              data-open={form.isPasswordFeedbackOpen}
            >
              <div className="overflow-hidden">
                <div className="text-muted-foreground flex flex-col gap-1.5 pt-1 text-sm">
                  {postgresPasswordChecks.map((check) => {
                    const isValid = check.test(form.password);

                    return (
                      <div
                        className="data-[valid=true]:text-foreground flex items-center gap-2 transition-colors duration-200"
                        data-valid={isValid}
                        key={check.label}
                      >
                        {isValid ? <CheckIcon /> : <XIcon />}
                        <span>{check.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <FieldError errors={form.getFieldError("password")} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <Button
        className="w-full sm:w-auto"
        disabled={isPending}
        size="lg"
        type="submit"
      >
        {isPending ? <Spinner data-icon="inline-start" /> : <PlusIcon />}
        {isPending ? "Creating PostgreSQL" : "Create PostgreSQL Instance"}
      </Button>
    </form>
  );
}
