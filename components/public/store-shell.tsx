import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";

export function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-optical-shell">
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}
