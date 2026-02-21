"use client";

import { Sidebar } from "@/components/ui/sidebar";
import * as React from "react";

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      side="left"
      {...props}
    ></Sidebar>
  );
}
