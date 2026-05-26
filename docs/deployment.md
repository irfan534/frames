# Deployment

## Supabase

1. Create a Supabase project.
2. In Authentication → Settings, disable public signups.
3. Create one owner user manually in Supabase Auth (Dashboard → Authentication → Users → Invite).
4. Run `supabase/schema.sql` in the Supabase SQL editor.
5. Insert the owner's user id into `public.admin_users`:
   ```sql
   insert into public.admin_users (user_id) values ('<paste-user-id-here>');
   ```
6. Keep the `frame-images` storage bucket set to **public** so product images load without auth.

## Environment variables

Create `.env.local` for local development and add the same variables in Vercel → Settings → Environment Variables.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | Service role key — server-only, never expose to client |
| `NEXT_PUBLIC_UPI_QR_IMAGE_URL` | ✓ | URL or path to your UPI QR image (e.g. `/images/upi-qr.png`) |
| `NEXT_PUBLIC_SITE_URL` | ✓ | Your deployment URL (e.g. `https://frames.vercel.app`) — used for CSRF validation |
| `ADMIN_EMAIL` | ✓ | Email of the admin account (must match the Supabase Auth user) |
| `SENTRY_DSN` | optional | From sentry.io — free tier is sufficient. Enables error monitoring. |

> `SUPABASE_SERVICE_ROLE_KEY` is used only by server-side API routes. It bypasses RLS and must never appear in any client component or be prefixed with `NEXT_PUBLIC_`.

## Vercel deployment

1. Push the repo to GitHub.
2. Import it in Vercel as a Next.js project.
3. Add all environment variables above.
4. Deploy.

## How checkout works

Customers browse → add frames to cart → fill checkout form → order saved to DB as `pending` → UPI QR page shown → customer scans QR and pays via GPay/PhonePe/any UPI app → customer clicks "I have paid" → order status becomes `payment_claimed`.

The shop owner opens `/admin/orders`, sees the "Payment Claimed" badge, manually verifies the payment in their UPI app, enters the final amount, and clicks Confirm. Stock is reduced only at this point.

## Admin

- Login: `/admin/login`
- Orders: `/admin/orders` — confirm or cancel customer orders
- Inventory: `/admin/inventory` — add, edit, or deactivate frames
- Contact messages: `/admin/contact-messages` — view messages from the contact form
- Sales: `/admin/sales` — revenue history

## Rate limiting

The checkout and contact endpoints use in-memory rate limiting. This works correctly on a single Vercel instance (Hobby plan). If you upgrade to Vercel Pro/Team (which can spawn multiple instances), replace `createRateLimiter` in `lib/rate-limit.ts` with an Upstash Redis-backed limiter. The API is the same — only the backing store changes.
