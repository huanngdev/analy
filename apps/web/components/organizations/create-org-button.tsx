"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useCreateOrganization } from "@/hooks/organization/use-create-organization";
import { Ban, Building2Icon, PlusIcon } from "lucide-react";
import { Controller } from "react-hook-form";

export function CreateOrgButton() {
  const { form, onSubmit, isLoading, orgTypeItems, open, setOpen } =
    useCreateOrganization({
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        New Organization
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new organization.
          </DialogDescription>
        </DialogHeader>

        <form id="form-create-org" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              disabled={isLoading}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="org-name">Name</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="org-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="My Organization"
                      autoComplete="off"
                    />
                    <InputGroupAddon>
                      <Building2Icon />
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="type"
              control={form.control}
              disabled={isLoading}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Type</FieldLabel>
                  <Select
                    items={orgTypeItems}
                    defaultValue="PERSONAL"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {orgTypeItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline">
                <Ban />
                Cancel
              </Button>
            }
          />
          <Button type="submit" form="form-create-org" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner /> Creating...
              </>
            ) : (
              <>
                <PlusIcon /> Create Organization
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
