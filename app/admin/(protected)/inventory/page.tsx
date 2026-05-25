import type { Metadata } from "next";
import { InventoryManager } from "@/components/admin/inventory-manager";
import { getAdminFrames } from "@/lib/data";

export const metadata: Metadata = {
  title: "Inventory"
};

export default async function InventoryPage() {
  const frames = await getAdminFrames();

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
          Inventory
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">Manage stock</h1>
      </div>
      <InventoryManager frames={frames} />
    </div>
  );
}
