-- ClearView Opticals schema for Supabase
-- Run in the Supabase SQL editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.frames (
  id uuid primary key default gen_random_uuid(),
  frame_code text unique not null,
  name text not null,
  brand text,
  category text,
  description text,
  price numeric not null check (price >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  image_url text,
  image_urls text[] not null default '{}',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.frames
add column if not exists image_urls text[] not null default '{}';

update public.frames
set image_urls = array[image_url]
where image_url is not null
  and coalesce(array_length(image_urls, 1), 0) = 0;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  address text not null,
  notes text,
  total_amount numeric not null check (total_amount >= 0),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'cancelled')),
  order_status text default 'pending' check (order_status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  frame_id uuid references public.frames(id) on delete set null,
  qty integer not null check (qty > 0),
  price numeric not null check (price >= 0)
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid references public.frames(id) on delete set null,
  qty integer not null check (qty > 0),
  amount numeric not null check (amount >= 0),
  payment_method text default 'upi',
  sold_at timestamptz default now()
);

create index if not exists frames_active_category_idx on public.frames(is_active, category);
create index if not exists frames_brand_idx on public.frames(brand);
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists sales_sold_at_idx on public.sales(sold_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists frames_set_updated_at on public.frames;
create trigger frames_set_updated_at
before update on public.frames
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

alter table public.admin_users enable row level security;
alter table public.frames enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.sales enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin() or user_id = auth.uid());

drop policy if exists "Public can read active frames" on public.frames;
create policy "Public can read active frames"
on public.frames
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admins can manage frames" on public.frames;
create policy "Admins can manage frames"
on public.frames
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage orders" on public.orders;
create policy "Admins can manage orders"
on public.orders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage order items" on public.order_items;
create policy "Admins can manage order items"
on public.order_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage sales" on public.sales;
create policy "Admins can manage sales"
on public.sales
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop function if exists public.confirm_order_payment(uuid);

create or replace function public.confirm_order_payment(target_order_id uuid, final_total_amount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.orders%rowtype;
  item record;
  current_stock integer;
  order_subtotal numeric;
  sale_amount numeric;
begin
  if not public.is_admin() and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Admin access required';
  end if;

  if final_total_amount is null or final_total_amount <= 0 then
    raise exception 'Enter a valid final price.';
  end if;

  select *
  into target_order
  from public.orders
  where id = target_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if target_order.payment_status = 'paid' then
    raise exception 'Order is already paid';
  end if;

  if target_order.payment_status = 'cancelled' or target_order.order_status = 'cancelled' then
    raise exception 'Cancelled orders cannot be confirmed';
  end if;

  select coalesce(sum(oi.price * oi.qty), 0)
  into order_subtotal
  from public.order_items oi
  where oi.order_id = target_order_id;

  for item in
    select oi.frame_id, oi.qty, oi.price, f.name
    from public.order_items oi
    join public.frames f on f.id = oi.frame_id
    where oi.order_id = target_order_id
    for update of f
  loop
    select quantity
    into current_stock
    from public.frames
    where id = item.frame_id
    for update;

    if current_stock < item.qty then
      raise exception 'Insufficient stock for %', item.name;
    end if;
  end loop;

  for item in
    select oi.frame_id, oi.qty, oi.price
    from public.order_items oi
    where oi.order_id = target_order_id
  loop
    sale_amount := case
      when order_subtotal > 0 then final_total_amount * (item.price * item.qty) / order_subtotal
      else 0
    end;

    update public.frames
    set
      quantity = quantity - item.qty,
      is_active = case when quantity - item.qty <= 0 then false else is_active end
    where id = item.frame_id;

    insert into public.sales (frame_id, qty, amount, payment_method)
    values (item.frame_id, item.qty, sale_amount, 'upi');
  end loop;

  update public.orders
  set payment_status = 'paid',
      order_status = 'confirmed',
      total_amount = final_total_amount
  where id = target_order_id;
end;
$$;

revoke all on function public.confirm_order_payment(uuid, numeric) from public;
grant execute on function public.confirm_order_payment(uuid, numeric) to authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'frame-images',
  'frame-images',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read frame images" on storage.objects;
create policy "Public can read frame images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'frame-images');

drop policy if exists "Admins can upload frame images" on storage.objects;
create policy "Admins can upload frame images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'frame-images' and public.is_admin());

drop policy if exists "Admins can update frame images" on storage.objects;
create policy "Admins can update frame images"
on storage.objects
for update
to authenticated
using (bucket_id = 'frame-images' and public.is_admin())
with check (bucket_id = 'frame-images' and public.is_admin());

drop policy if exists "Admins can delete frame images" on storage.objects;
create policy "Admins can delete frame images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'frame-images' and public.is_admin());

insert into public.frames (frame_code, name, brand, category, description, price, quantity, image_url, is_active)
values
  ('CV-EG-101', 'AeroFlex Rectangle', 'ClearView', 'Eyeglasses', 'Lightweight acetate frame with stainless steel hinges and a balanced everyday fit.', 1499, 18, 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=900&q=85', true),
  ('CV-SG-202', 'SunEdge Polarized', 'Vista', 'Sunglasses', 'UV-protected polarized sunglasses with a confident square profile.', 1999, 9, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85', true),
  ('CV-KD-303', 'Little Scholar Blue', 'Aura', 'Kids Frames', 'Durable kids frame with soft nose pads, flexible temples, and cheerful color.', 999, 4, 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=900&q=85', true),
  ('CV-CG-404', 'ScreenEase Round', 'Nova', 'Computer Glasses', 'Blue-light filtering frame designed for long screen hours and clear focus.', 1299, 2, 'https://images.unsplash.com/photo-1556306535-38febf6782e7?auto=format&fit=crop&w=900&q=85', true)
on conflict (frame_code) do nothing;

-- After creating the owner in Supabase Auth, add their user id:
-- insert into public.admin_users (user_id) values ('OWNER_AUTH_USER_ID');
