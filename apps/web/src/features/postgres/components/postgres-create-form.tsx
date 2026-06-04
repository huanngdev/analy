import {
  DEFAULT_POSTGRES_HARDWARE_PROFILE,
  DEFAULT_POSTGRES_VERSION,
  postgresCreateRequestSchema,
  type PostgresCreateRequest,
} from "@repo/shared";
import { useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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

const passwordChecks = [
  {
    label: "16-128 characters",
    test: (value: string) => value.length >= 16 && value.length <= 128,
  },
  { label: "Lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "Uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Number", test: (value: string) => /[0-9]/.test(value) },
  { label: "Symbol", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export function PostgresCreateForm({
  hardwareProfiles,
  isPending,
  onSubmit,
  versions,
}: PostgresCreateFormProps) {
  const [hardwareProfile, setHardwareProfile] = useState<
    "dev-light" | "dev-standard" | "dev-power"
  >(DEFAULT_POSTGRES_HARDWARE_PROFILE);
  const [postgresVersion, setPostgresVersion] = useState<"17" | "16" | "15">(
    DEFAULT_POSTGRES_VERSION,
  );
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const passwordStrength = passwordChecks.filter((check) =>
    check.test(password),
  ).length;
  const passwordStrengthValue =
    (passwordStrength / passwordChecks.length) * 100;

  const getFieldError = (name: keyof PostgresCreateRequest) =>
    errors[name]?.map((message) => ({ message }));

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();

        const form = new FormData(event.currentTarget);
        const description = String(form.get("description") ?? "").trim();

        const result = postgresCreateRequestSchema.safeParse({
          databaseName: String(form.get("databaseName") ?? "app"),
          description: description || undefined,
          hardwareProfile,
          name: String(form.get("name") ?? ""),
          password: String(form.get("password") ?? ""),
          postgresVersion,
          username: String(form.get("username") ?? ""),
        });

        if (!result.success) {
          setErrors(result.error.flatten().fieldErrors);
          return;
        }

        setErrors({});
        onSubmit(result.data);
      }}
    >
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Instance name</FieldLabel>
          <Input
            aria-invalid={!!errors.name}
            id="name"
            name="name"
            placeholder="app-postgres-main"
            required
          />
          <FieldDescription>
            Lowercase letters, numbers, and hyphens. This is unique inside the
            project.
          </FieldDescription>
          <FieldError errors={getFieldError("name")} />
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            aria-invalid={!!errors.description}
            id="description"
            name="description"
            placeholder="Primary database for the application API."
          />
          <FieldError errors={getFieldError("description")} />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!errors.postgresVersion}>
            <FieldLabel>PostgreSQL version</FieldLabel>
            <Select
              onValueChange={(value) =>
                setPostgresVersion(value as "17" | "16" | "15")
              }
              value={postgresVersion}
            >
              <SelectTrigger className="w-full">
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
            <FieldError errors={getFieldError("postgresVersion")} />
          </Field>

          <Field data-invalid={!!errors.hardwareProfile}>
            <FieldLabel>Hardware profile</FieldLabel>
            <Select
              onValueChange={(value) =>
                setHardwareProfile(
                  value as "dev-light" | "dev-standard" | "dev-power",
                )
              }
              value={hardwareProfile}
            >
              <SelectTrigger className="w-full">
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
            <FieldError errors={getFieldError("hardwareProfile")} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!errors.databaseName}>
            <FieldLabel htmlFor="databaseName">Database name</FieldLabel>
            <Input
              aria-invalid={!!errors.databaseName}
              id="databaseName"
              name="databaseName"
              defaultValue="app"
              required
            />
            <FieldError errors={getFieldError("databaseName")} />
          </Field>

          <Field data-invalid={!!errors.username}>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              aria-invalid={!!errors.username}
              id="username"
              name="username"
              defaultValue="app_user"
              required
            />
            <FieldError errors={getFieldError("username")} />
          </Field>
        </div>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              aria-invalid={!!errors.password}
              autoComplete="new-password"
              id="password"
              name="password"
              onBlur={() => setIsPasswordFocused(false)}
              onChange={(event) => setPassword(event.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              placeholder="At least 16 chars with upper, lower, number, symbol"
              required
              type={isPasswordVisible ? "text" : "password"}
              value={password}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                onClick={() => setIsPasswordVisible((value) => !value)}
                size="icon-xs"
                title={isPasswordVisible ? "Hide password" : "Show password"}
              >
                {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                <span className="sr-only">
                  {isPasswordVisible ? "Hide password" : "Show password"}
                </span>
              </InputGroupButton>
              <InputGroupButton
                onClick={() => {
                  if (!password) {
                    return;
                  }

                  void navigator.clipboard.writeText(password);
                  toast.success("Password copied");
                }}
                size="icon-xs"
                title="Copy password"
              >
                <CopyIcon />
                <span className="sr-only">Copy password</span>
              </InputGroupButton>
              <InputGroupButton
                onClick={() => setPassword(generatePassword())}
                title="Generate password"
              >
                <KeyRoundIcon data-icon="inline-start" />
                Generate
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <Progress
            className="h-1.5 data-[complete=true]:[&_[data-slot=progress-indicator]]:bg-emerald-500"
            data-complete={passwordStrength === passwordChecks.length}
            value={passwordStrengthValue}
          />
          <div
            className="grid transition-all duration-200 ease-out data-[open=false]:grid-rows-[0fr] data-[open=false]:opacity-0 data-[open=true]:grid-rows-[1fr] data-[open=true]:opacity-100"
            data-open={isPasswordFocused || !!password || !!errors.password}
          >
            <div className="overflow-hidden">
              <div className="text-muted-foreground flex flex-col gap-1.5 pt-1 text-sm">
                {passwordChecks.map((check) => {
                  const isValid = check.test(password);

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
          <FieldError errors={getFieldError("password")} />
        </Field>
      </FieldGroup>

      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        {isPending ? <Spinner data-icon="inline-start" /> : null}
        Create PostgreSQL Instance
      </Button>
    </form>
  );
}

function generatePassword() {
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const symbols = "!@#$%^&*_-+=";
  const all = lowercase + uppercase + numbers + symbols;
  const required = [lowercase, uppercase, numbers, symbols].map(randomChar);

  while (required.length < 24) {
    required.push(randomChar(all));
  }

  for (let index = required.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [required[index], required[swapIndex]] = [
      required[swapIndex] ?? "",
      required[index] ?? "",
    ];
  }

  return required.join("");
}

function randomChar(chars: string) {
  return chars.charAt(randomInt(chars.length));
}

function randomInt(max: number) {
  const [value = 0] = crypto.getRandomValues(new Uint32Array(1));

  return value % max;
}
