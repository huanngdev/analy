"use client";

import { AuthDropdown } from "@/components/shared/auth-dropdown";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function DashboardHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 py-2 bg-background/50 backdrop-blur-sm border-b">
      <nav className="mx-auto px-4 flex items-center h-8">
        <div className="flex items-center gap-10 flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link href="/" className="flex items-center gap-2">
                  <Logo className="size-4 invert dark:invert-0" />
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/components">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthDropdown />
        </div>
      </nav>
    </header>
  );
}
