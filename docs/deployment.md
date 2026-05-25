# Deployment

## Supabase

1. Create a Supabase project.
2. In Authentication settings, disable public signups for v1.
3. Create one owner user manually in Supabase Auth.
4. Run `supabase/schema.sql` in the SQL editor.
5. Insert the owner user id into `public.admin_users`.
6. Keep the `frame-images` bucket public for product images.

## Environment

Create `.env.local` locally and matching Vercel environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="server-only-service-role-key"
NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER="919876543210"
NEXT_PUBLIC_UPI_QR_IMAGE_URL="/images/upi-qr-placeholder.svg"
```

The service role key is used only by server routes for checkout creation, inventory mutations, uploads, and payment confirmation. Never expose it in client code.

## Vercel

1. Push this project to GitHub.
2. Import it in Vercel as a Next.js app.
3. Add the environment variables above.
4. Deploy.

Admin login lives at `/admin/login`. Public checkout creates a pending order, opens WhatsApp with an encoded summary, and stock is reduced only when the owner confirms payment in `/admin/orders`.
