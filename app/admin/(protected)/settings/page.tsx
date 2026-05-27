import type { Metadata } from "next";
import { ShopPhotoManager } from "@/components/admin/shop-photo-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminShopPhotos } from "@/lib/data";
import { getShopConfig } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Settings"
};

export default async function SettingsPage() {
  const shop = getShopConfig();
  const shopPhotos = await getAdminShopPhotos();

  return (
    <div className="p-4 lg:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
          Settings
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">Shop setup</h1>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(520px,1.4fr)]">
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

        <Card>
          <CardHeader>
            <CardTitle>Shop Photos</CardTitle>
            <CardDescription>Upload 1 to 10 photos for the public gallery.</CardDescription>
          </CardHeader>
          <CardContent>
            <ShopPhotoManager photos={shopPhotos} />
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
