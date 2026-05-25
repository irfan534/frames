import { StoreShell } from "@/components/public/store-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProduct() {
  return (
    <StoreShell>
      <main className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_470px]">
        <Skeleton className="aspect-[4/3]" />
        <Skeleton className="h-[520px]" />
      </main>
    </StoreShell>
  );
}
