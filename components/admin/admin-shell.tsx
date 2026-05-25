"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, Home, LogOut, PackageCheck, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, getShopConfig } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const nav = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: PackageCheck },
  { href: "/admin/sales", label: "Sales", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const shop = getShopConfig();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-optical-fog text-optical-text">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-border bg-white p-5 lg:flex lg:flex-col">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/images/vision-thru-optics-logo.webp"
            alt={`${shop.name} logo`}
            width={52}
            height={52}
            className="h-[52px] w-[52px] rounded-md object-cover shadow-sm"
          />
          <div>
            <p className="font-display text-lg font-bold">{shop.name}</p>
            <p className="text-xs text-optical-muted">Owner Panel</p>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-optical-muted transition hover:bg-optical-fog hover:text-optical-text",
                pathname === href && "bg-primary text-white hover:bg-primary hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
        <Button variant="outline" className="mt-auto justify-start" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </aside>

      <main className="pb-20 lg:ml-72 lg:pb-0">
        <div className="border-b border-border bg-white px-4 py-4 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="font-display text-xl font-bold">
              {shop.name} Admin
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-border bg-white lg:hidden">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-semibold text-optical-muted",
              pathname === href && "text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
