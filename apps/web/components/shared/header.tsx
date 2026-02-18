"use client";

import { AuthDropdown } from "@/components/shared/auth-dropdown";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = {
  label: string;
  href: string;
  active: boolean;
};

export function Header() {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      label: "Home",
      href: "/",
      active: pathname === "/",
    },
    {
      label: "About",
      href: "/about",
      active: pathname === "/about",
    },
    {
      label: "Contact",
      href: "/contact",
      active: pathname === "/contact",
    },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-10 py-2">
      <nav className="container mx-auto flex items-center h-8">
        <div className="flex items-center gap-10 flex-1">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-4 invert dark:invert-0" />
            <span className="text-lg font-bold select-none">Analy</span>
          </Link>
          <ul className="flex items-center gap-0">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button variant={item.active ? "secondary" : "ghost"}>
                    {item.label}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthDropdown />
        </div>
      </nav>
    </header>
  );
}
