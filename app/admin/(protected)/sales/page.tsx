import type { Metadata } from "next";
import { BadgeIndianRupee, Boxes } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminSales } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sales"
};

export default async function SalesPage() {
  const sales = await getAdminSales();
  const revenue = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const units = sales.reduce((sum, sale) => sum + sale.qty, 0);

  return (
    <div className="p-4 lg:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
          Sales
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">Confirmed sales</h1>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-optical-muted">Revenue</p>
              <p className="mt-2 text-2xl font-bold">{formatCurrency(revenue)}</p>
            </div>
            <BadgeIndianRupee className="h-8 w-8 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-optical-muted">Units Sold</p>
              <p className="mt-2 text-2xl font-bold">{units}</p>
            </div>
            <Boxes className="h-8 w-8 text-primary" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-7 rounded-lg border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Frame</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Sold At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.frames?.name || sale.frame_id}</TableCell>
                <TableCell>{sale.qty}</TableCell>
                <TableCell>{formatCurrency(sale.amount)}</TableCell>
                <TableCell className="uppercase">{sale.payment_method}</TableCell>
                <TableCell>{new Date(sale.sold_at).toLocaleString("en-IN")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
