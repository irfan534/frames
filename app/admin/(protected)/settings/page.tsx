import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getShopConfig } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Settings"
};

export default function SettingsPage() {
  const shop = getShopConfig();

  return (
    <div className="p-4 lg:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
          Settings
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">Shop setup</h1>
      </div>

      <div className="mt-7 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Shop Name" value={shop.name} />
            <Row label="Phone" value={shop.phone} />
            <Row label="WhatsApp" value={shop.whatsappNumber} />
            <Row label="Address" value={shop.address} />
            <Row label="QR Image" value={shop.qrImage} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-0">
      <span className="text-optical-muted">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}
