# Vision Thru Optics Commerce

Next.js storefront and admin dashboard for an optical shop. Customers browse frames, add items to cart, create an order, and continue the conversation in WhatsApp. Admin users manage inventory, orders, and sales through Supabase.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example` and fill in the Supabase, shop, site, and admin values.

3. Apply `supabase/schema.sql` in the Supabase SQL editor.

4. Create the admin user in Supabase Auth, then add that user's id to `public.admin_users`.

## Environment

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

`SUPABASE_SERVICE_ROLE_KEY` is used only on server API routes. Keep it out of client code and hosting previews that should not write orders.

## Development

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

## Security Notes

The public checkout API creates orders with the server-side Supabase service role. Supabase RLS keeps anonymous clients from writing directly to order tables.

`/api/orders` and `/api/contact` use in-memory rate limiting. This is useful for a single Node process, but production deployments with multiple instances should replace it with a shared store such as Redis, Upstash, or a platform-level WAF/CAPTCHA.

Order confirmation is protected by `public.confirm_order_payment`, which locks rows and checks stock before reducing inventory. Checkout also validates requested quantities against current server-side stock before creating pending orders.
