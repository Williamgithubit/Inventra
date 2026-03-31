create extension if not exists pgcrypto;
create extension if not exists citext;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('SUPER_ADMIN', 'SHOP_OWNER');
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type subscription_status as enum ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED');
  end if;
end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email citext not null unique,
  password text not null,
  role user_role not null default 'SHOP_OWNER',
  created_at timestamptz not null default now()
);

create table if not exists shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null unique references shops(id) on delete cascade,
  status subscription_status not null default 'TRIAL',
  current_period_ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12, 2) not null check (price >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  qr_code text not null default '',
  shop_id uuid not null references shops(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price numeric(12, 2) not null check (price >= 0)
);

create index if not exists idx_shops_owner_id on shops(owner_id);
create index if not exists idx_products_shop_id on products(shop_id);
create index if not exists idx_sales_shop_id on sales(shop_id);
create index if not exists idx_sales_created_at on sales(created_at desc);
create index if not exists idx_sale_items_sale_id on sale_items(sale_id);
create index if not exists idx_subscriptions_shop_id on subscriptions(shop_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_set_updated_at on products;

create trigger trg_products_set_updated_at
before update on products
for each row
execute function set_updated_at();

create or replace function checkout_sale(p_shop_id uuid, p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_item jsonb;
  v_product products%rowtype;
  v_quantity integer;
  v_item_price numeric(12, 2);
  v_total numeric(12, 2) := 0;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one sale item is required';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := coalesce((v_item ->> 'quantity')::integer, 0);

    if v_quantity <= 0 then
      raise exception 'Sale item quantity must be positive';
    end if;

    select *
    into v_product
    from products
    where id = (v_item ->> 'productId')::uuid
      and shop_id = p_shop_id
    for update;

    if not found then
      raise exception 'Product % was not found in this shop', v_item ->> 'productId';
    end if;

    if v_product.quantity < v_quantity then
      raise exception 'Insufficient stock for %', v_product.name;
    end if;

    v_item_price := coalesce((v_item ->> 'price')::numeric, v_product.price);
    v_total := v_total + (v_item_price * v_quantity);
  end loop;

  insert into sales (shop_id, total_amount)
  values (p_shop_id, v_total)
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;

    select *
    into v_product
    from products
    where id = (v_item ->> 'productId')::uuid
      and shop_id = p_shop_id
    for update;

    v_item_price := coalesce((v_item ->> 'price')::numeric, v_product.price);

    insert into sale_items (sale_id, product_id, quantity, price)
    values (v_sale_id, v_product.id, v_quantity, v_item_price);

    update products
    set quantity = quantity - v_quantity
    where id = v_product.id;
  end loop;

  return v_sale_id;
end;
$$;
