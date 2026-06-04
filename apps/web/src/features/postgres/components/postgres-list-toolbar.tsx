import { SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PlusIcon } from "@/components/ui/plus";

type PostgresListToolbarProps = {
  onSearchChange: (value: string) => void;
  resultCount: number;
  searchInput: string;
};

export function PostgresListToolbar({
  onSearchChange,
  resultCount,
  searchInput,
}: PostgresListToolbarProps) {
  const resultLabel = `${resultCount} ${resultCount === 1 ? "result" : "results"}`;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <InputGroup className="w-full sm:w-80">
        <InputGroupInput
          value={searchInput}
          aria-label="Search PostgreSQL instances"
          placeholder="Search..."
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">{resultLabel}</InputGroupAddon>
      </InputGroup>

      <Button asChild className="w-full sm:w-auto">
        <Link to="/dashboard/services/postgresql/new">
          <PlusIcon />
          Create PostgreSQL
        </Link>
      </Button>
    </div>
  );
}
