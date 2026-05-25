import { Badge } from "@/components/ui/badge";
import { stockLabel } from "@/lib/utils";

export function StockBadge({ quantity }: { quantity: number }) {
  const label = stockLabel(quantity);
  return (
    <Badge
      variant={
        quantity <= 0 ? "destructive" : quantity <= 5 ? "warning" : "success"
      }
    >
      {label}
    </Badge>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={
        status === "paid"
          ? "success"
          : status === "cancelled"
            ? "destructive"
            : "warning"
      }
    >
      {status}
    </Badge>
  );
}

export function OrderBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={
        status === "completed" || status === "confirmed"
          ? "blue"
          : status === "cancelled"
            ? "destructive"
            : "secondary"
      }
    >
      {status}
    </Badge>
  );
}
