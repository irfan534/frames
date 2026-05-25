import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/public/product-card";
import { QuantityAdd } from "@/components/public/quantity-add";
import { StoreShell } from "@/components/public/store-shell";
import { getProduct, getProducts } from "@/lib/data";
import { formatCurrency, imageFallback, stockLabel } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return {
    title: product?.name || "Product",
    description: product?.description || "Premium optical product details."
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const related = await getProducts({ category: product.category || undefined, limit: 4 });
  const image = product.image_url || imageFallback(product.frame_code);

  return (
    <StoreShell>
      <main className="container-page py-10">
        <section className="grid gap-10 lg:grid-cols-[1fr_470px]">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-optical-fog">
              <Image
                src={image}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((thumb) => (
                <div key={thumb} className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-optical-fog">
                  <Image
                    src={image}
                    alt={`${product.name} thumbnail ${thumb + 1}`}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
              {product.brand || "ClearView"}
            </p>
            <h1 className="mt-3 font-display text-5xl font-bold leading-tight">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-bold">{formatCurrency(product.price)}</p>
            <div className="mt-4 flex items-center gap-3">
              <Badge
                variant={
                  product.quantity <= 0
                    ? "destructive"
                    : product.quantity <= 5
                      ? "warning"
                      : "success"
                }
              >
                {stockLabel(product.quantity)}
              </Badge>
              <span className="text-sm text-optical-muted">
                {product.quantity} available
              </span>
            </div>

            <div className="mt-7">
              <p className="text-sm font-semibold">Color</p>
              <div className="mt-2 flex gap-2">
                {["#111111", "#0D6E6E", "#B08968", "#F5A623"].map((color) => (
                  <span
                    key={color}
                    className="h-8 w-8 rounded-full border-2 border-white shadow ring-1 ring-black/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-7">
              <QuantityAdd frame={product} />
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-lg border border-border bg-white p-6">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description">
              <p className="max-w-3xl leading-8 text-optical-muted">
                {product.description ||
                  "A refined frame selected for comfort, durability, and daily style."}
              </p>
            </TabsContent>
            <TabsContent value="specifications">
              <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <Spec label="Frame Code" value={product.frame_code} />
                <Spec label="Brand" value={product.brand || "ClearView"} />
                <Spec label="Category" value={product.category || "Frames"} />
                <Spec label="Warranty" value="1 Year" />
              </div>
            </TabsContent>
            <TabsContent value="reviews">
              <p className="text-optical-muted">
                ★★★★★ Customers love the comfort, fit, and clean finish.
              </p>
            </TabsContent>
          </Tabs>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl font-bold">You may also like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.products
              .filter((item) => item.id !== product.id)
              .slice(0, 4)
              .map((frame) => (
                <ProductCard key={frame.id} frame={frame} />
              ))}
          </div>
        </section>
      </main>
    </StoreShell>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-optical-fog p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-optical-muted">
        {label}
      </p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
