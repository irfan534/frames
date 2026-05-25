import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/public/product-card";
import { ProductFilters } from "@/components/public/product-filters";
import { SortProducts } from "@/components/public/sort-products";
import { StoreShell } from "@/components/public/store-shell";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse eyeglasses, sunglasses, contact lenses, and computer glasses."
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Number(getValue(params.page) || 1);
  const result = await getProducts({
    page,
    category: getValue(params.category),
    brand: getValue(params.brand),
    search: getValue(params.search),
    sort: getValue(params.sort),
    min: getValue(params.min) ? Number(getValue(params.min)) : undefined,
    max: getValue(params.max) ? Number(getValue(params.max)) : undefined
  });

  return (
    <StoreShell>
      <main className="container-page py-10">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
              Shop Collection
            </p>
            <h1 className="mt-2 font-display text-5xl font-bold">Find Your Frame</h1>
            <p className="mt-3 text-optical-muted">
              {result.count} products available
            </p>
          </div>
          <Suspense>
            <SortProducts />
          </Suspense>
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[270px_1fr]">
          <Suspense>
            <ProductFilters />
          </Suspense>

          <section>
            {result.unavailable ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-10 text-center">
                <h2 className="font-display text-3xl font-bold">Products temporarily unavailable</h2>
                <p className="mt-2 text-optical-muted">
                  We could not load the catalogue right now. Please try again shortly.
                </p>
              </div>
            ) : result.products.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.products.map((frame) => (
                  <ProductCard key={frame.id} frame={frame} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-white p-10 text-center">
                <h2 className="font-display text-3xl font-bold">No products found</h2>
                <p className="mt-2 text-optical-muted">Try a different filter or search.</p>
              </div>
            )}

            <div className="mt-9 flex items-center justify-center gap-2">
              {Array.from({ length: result.pageCount }).map((_, index) => {
                const nextPage = index + 1;
                const href = buildPageHref(params, nextPage);
                return (
                  <Button
                    key={nextPage}
                    asChild
                    variant={nextPage === result.page ? "default" : "outline"}
                    size="sm"
                  >
                    <Link href={href}>{nextPage}</Link>
                  </Button>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </StoreShell>
  );
}

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildPageHref(
  params: Record<string, string | string[] | undefined>,
  page: number
) {
  const next = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    const clean = getValue(value);
    if (clean) next.set(key, clean);
  });
  next.set("page", String(page));
  return `/products?${next.toString()}`;
}
