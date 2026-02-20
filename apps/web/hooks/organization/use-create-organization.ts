import { organizationApi } from "@/api";
import { organizationKeys } from "./use-get-organizations";
import {
  type CreateOrganizationSchema,
  type ErrorResponse,
  createOrganizationSchema,
  OrganizationType,
  organizationType,
} from "@repo/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function useCreateOrganization({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const orgTypeItems = Object.entries(organizationType.enumValues).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );

  const form = useForm<CreateOrganizationSchema>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      type: "PERSONAL" as OrganizationType,
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldFocusError: true,
  });

  const mutation = useMutation({
    mutationFn: organizationApi.createOrganization,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
      toast.success("Organization created");
      onSuccess?.();
      router.push(`/dashboard/org/${response.data.organization.slug}`);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(
        error.response?.data.message || "Failed to create organization",
      );
    },
  });

  const onSubmit = useCallback(() => {
    mutation.mutate(form.getValues());
  }, [form, mutation]);

  useEffect(() => {
    form.reset();
  }, [open, form]);

  return {
    form,
    onSubmit,
    isLoading: mutation.isPending,
    orgTypeItems,
    open,
    setOpen,
  };
}
