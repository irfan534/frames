import type { Metadata } from "next";
import { OrdersManager } from "@/components/admin/orders-manager";
import { getAdminOrders } from "@/lib/data";

export const metadata: Metadata = {
  title: "Orders"
};

export default async function OrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
          Orders
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">Manual payment queue</h1>
      </div>
      <OrdersManager orders={orders} />
    </div>
  );
}
