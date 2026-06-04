import {
  postgresCreateRequestSchema,
  type PostgresCreateRequest,
} from "@repo/shared";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";

type PostgresCreateFormOptions = {
  isDisabled: boolean;
  onSubmit: (input: PostgresCreateRequest) => void;
};

type PostgresCreateFieldErrors = Partial<
  Record<keyof PostgresCreateRequest, string[] | undefined>
>;

export const postgresPasswordChecks = [
  {
    label: "16-128 characters",
    test: (value: string) => value.length >= 16 && value.length <= 128,
  },
  { label: "Lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "Uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Number", test: (value: string) => /[0-9]/.test(value) },
  { label: "Symbol", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export function usePostgresCreateForm({
  isDisabled,
  onSubmit,
}: PostgresCreateFormOptions) {
  const [hardwareProfile, setHardwareProfileValue] = useState<
    PostgresCreateRequest["hardwareProfile"] | ""
  >("");
  const [postgresVersion, setPostgresVersionValue] = useState<
    PostgresCreateRequest["postgresVersion"] | ""
  >("");
  const [errors, setErrors] = useState<PostgresCreateFieldErrors>({});
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const passwordStrength = postgresPasswordChecks.filter((check) =>
    check.test(password),
  ).length;
  const passwordStrengthValue =
    (passwordStrength / postgresPasswordChecks.length) * 100;
  const isPasswordFeedbackOpen =
    isPasswordFocused || !!password || !!errors.password;

  function getFieldError(name: keyof PostgresCreateRequest) {
    return errors[name]?.map((message) => ({ message }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDisabled) {
      return;
    }

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
      const fieldErrors = result.error.flatten()
        .fieldErrors as PostgresCreateFieldErrors;

      if (!hardwareProfile) {
        fieldErrors.hardwareProfile = ["Choose a hardware profile."];
      }

      if (!postgresVersion) {
        fieldErrors.postgresVersion = ["Choose a PostgreSQL version."];
      }

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  function setHardwareProfile(value: string) {
    setHardwareProfileValue(value as PostgresCreateRequest["hardwareProfile"]);
  }

  function setPostgresVersion(value: string) {
    setPostgresVersionValue(value as PostgresCreateRequest["postgresVersion"]);
  }

  function showPasswordFeedback() {
    setIsPasswordFocused(true);
  }

  function hidePasswordFeedback() {
    setIsPasswordFocused(false);
  }

  function togglePasswordVisibility() {
    setIsPasswordVisible((value) => !value);
  }

  function copyPassword() {
    if (!password || isDisabled) {
      return;
    }

    void navigator.clipboard.writeText(password);
    toast.success("Password copied");
  }

  function generateSecurePassword() {
    if (isDisabled) {
      return;
    }

    setPassword(generatePassword());
  }

  return {
    copyPassword,
    errors,
    generateSecurePassword,
    getFieldError,
    handlePasswordChange,
    handleSubmit,
    hardwareProfile,
    hidePasswordFeedback,
    isPasswordFeedbackOpen,
    isPasswordVisible,
    password,
    passwordStrength,
    passwordStrengthValue,
    postgresVersion,
    setHardwareProfile,
    setPostgresVersion,
    showPasswordFeedback,
    togglePasswordVisibility,
  };
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
