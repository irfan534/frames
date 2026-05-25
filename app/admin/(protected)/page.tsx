import type { Metadata } from "next";
import { AlertTriangle, BadgeIndianRupee, Boxes, PackageCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminFrames, getAdminOrders, getAdminSales } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { PaymentBadge, StockBadge } from "@/components/admin/status-badges";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Admin Dashboard"
};

export default async function AdminDashboardPage() {
  const [frames, orders, sales] = await Promise.all([
    getAdminFrames(),
    getAdminOrders(),
    getAdminSales()
  ]);

  const totalStock = frames.reduce((sum, frame) => sum + frame.quantity, 0);
  const lowStock = frames.filter((frame) => frame.quantity <= 5).length;
  const pendingOrders = orders.filter((order) => order.payment_status === "pending").length;
  const revenue = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);

  return (
    <div className="p-4 lg:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
          Dashboard
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">Today at the shop</h1>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Total Stock" value={String(totalStock)} icon={Boxes} tone="teal" />
        <Metric title="Low Stock Alert" value={String(lowStock)} icon={AlertTriangle} tone="amber" />
        <Metric title="Pending Orders" value={String(pendingOrders)} icon={PackageCheck} tone="coral" />
        <Metric title="Total Revenue" value={formatCurrency(revenue)} icon={BadgeIndianRupee} tone="blue" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell><PaymentBadge status={order.payment_status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Frame</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frames
                  .filter((frame) => frame.quantity <= 5)
                  .slice(0, 6)
                  .map((frame) => (
                    <TableRow key={frame.id}>
                      <TableCell>{frame.name}</TableCell>
                      <TableCell>{frame.quantity}</TableCell>
                      <TableCell><StockBadge quantity={frame.quantity} /></TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  title,
  value,
  icon: Icon,
  tone
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "teal" | "amber" | "coral" | "blue";
}) {
  const tones = {
    teal: "bg-primary/10 text-primary",
    amber: "bg-amber-100 text-amber-700",
    coral: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700"
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-optical-muted">{title}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <span className={`grid h-12 w-12 place-items-center rounded-md ${tones[tone]}`}>
          <Icon className="h-6 w-6" />
        </span>
      </CardContent>
    </Card>
  );
}
