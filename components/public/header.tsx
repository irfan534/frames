"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";
import { getShopConfig } from "@/lib/utils";

const navItems = [
  { label: "Eyeglasses", href: "/products?category=Eyeglasses" },
  { label: "Sunglasses", href: "/products?category=Sunglasses" },
  { label: "Contact Lenses", href: "/products?category=Contact%20Lenses" },
  { label: "Frames", href: "/products" }
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const count = useCartStore((state) => state.count());
  const shop = getShopConfig();

  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  function searchProducts(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    setOpen(false);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-optical-shell/92 backdrop-blur-xl">
      <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/shoplogo.png"
            alt={`${shop.name} logo`}
            width={48}
            height={48}
            className="h-12 w-12 rounded-md object-cover shadow-sm"
          />
          <span className="max-w-[190px] font-display text-sm font-bold leading-tight sm:max-w-none sm:text-lg xl:text-xl">
            {shop.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-optical-muted lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search products"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Cart" className="relative">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-bold text-white">
                  {count}
                </span>
              ) : null}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Book Eye Test</Link>
          </Button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-md border border-border bg-white md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {searchOpen ? (
        <div className="hidden border-t border-border bg-white md:block">
          <form
            onSubmit={searchProducts}
            className="container-page flex max-w-xl items-center gap-2 py-4"
          >
            <Input
              autoFocus
              type="search"
              placeholder="Search product name"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              aria-label="Search products"
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
        </div>
      ) : null}

      {open ? (
        <div className="border-t border-border bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            <form onSubmit={searchProducts} className="mb-3 flex items-center gap-2">
              <Input
                type="search"
                placeholder="Search products"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                aria-label="Search products"
              />
              <Button type="submit" size="icon" aria-label="Submit search">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-3 text-sm font-semibold text-optical-text hover:bg-optical-fog"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button asChild variant="outline">
                <Link href="/cart" onClick={() => setOpen(false)}>
                  Cart {count ? `(${count})` : ""}
                </Link>
              </Button>
              <Button asChild>
                <Link href="/contact" onClick={() => setOpen(false)}>
                  Book Eye Test
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
