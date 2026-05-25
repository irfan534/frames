import { StoreShell } from "@/components/public/store-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProducts() {
  return (
    <StoreShell>
      <main className="container-page py-10">
        <Skeleton className="h-14 w-80" />
        <div className="mt-8 grid gap-7 lg:grid-cols-[270px_1fr]">
          <Skeleton className="hidden h-[520px] lg:block" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-80" />
            ))}
          </div>
        </div>
      </main>
    </StoreShell>
  );
}
