import type { ComponentProps } from "react";

import { FieldLabel } from "@/components/ui/field";

type PostgresRequiredFieldLabelProps = ComponentProps<typeof FieldLabel>;

export function PostgresRequiredFieldLabel({
  children,
  ...props
}: PostgresRequiredFieldLabelProps) {
  return (
    <FieldLabel {...props}>
      {children}
      <span aria-hidden="true" className="text-destructive">
        *
      </span>
    </FieldLabel>
  );
}
