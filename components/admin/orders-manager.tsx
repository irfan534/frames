"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderBadge, PaymentBadge } from "@/components/admin/status-badges";
import type { OrderWithItems } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function OrdersManager({ orders }: { orders: OrderWithItems[] }) {
  const router = useRouter();
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      status === "all"
        ? orders
        : orders.filter((order) => order.payment_status === status),
    [orders, status]
  );

  async function action(orderId: string, type: "confirm" | "cancel") {
    setLoadingId(orderId);
    const response = await fetch(`/api/admin/orders/${orderId}/${type}`, {
      method: "POST"
    });
    const result = await response.json();
    setLoadingId(null);

    if (!response.ok) {
      toast.error(result.error || "Order action failed");
      return;
    }

    toast.success(type === "confirm" ? "Payment confirmed" : "Order cancelled");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All orders</SelectItem>
            <SelectItem value="pending">Pending payment</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((order) => (
              <Fragment key={order.id}>
                <TableRow key={order.id}>
                  <TableCell>
                    <button
                      className="flex items-center gap-2 text-left"
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    >
                      {expanded === order.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span>
                        <span className="block font-semibold">{order.customer_name}</span>
                        <span className="text-xs text-optical-muted">{order.phone}</span>
                      </span>
                    </button>
                  </TableCell>
                  <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell><PaymentBadge status={order.payment_status} /></TableCell>
                  <TableCell><OrderBadge status={order.order_status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        disabled={order.payment_status !== "pending" || loadingId === order.id}
                        onClick={() => action(order.id, "confirm")}
                      >
                        Confirm Payment
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={order.payment_status !== "pending" || loadingId === order.id}
                        onClick={() => action(order.id, "cancel")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expanded === order.id ? (
                  <TableRow key={`${order.id}-items`} className="bg-optical-fog/60 hover:bg-optical-fog/60">
                    <TableCell colSpan={5}>
                      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-optical-muted">
                            Delivery / Pickup Details
                          </p>
                          <p className="mt-1 text-sm">{order.address}</p>
                          {order.notes ? (
                            <p className="mt-2 text-sm text-optical-muted">{order.notes}</p>
                          ) : null}
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-optical-muted">
                            Items
                          </p>
                          <div className="mt-2 space-y-2">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>
                                  {item.frames?.name || item.frame_id} x {item.qty}
                                </span>
                                <span>{formatCurrency(Number(item.price) * item.qty)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
