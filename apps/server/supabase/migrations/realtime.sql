-- Run this in the Supabase SQL editor after the base schema is applied.
-- It enables Postgres Changes for the live tables and scopes listeners with RLS.

alter table public.products replica identity full;
alter table public.sales replica identity full;
alter table public.sale_items replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'sales'
  ) then
    alter publication supabase_realtime add table public.sales;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'sale_items'
  ) then
    alter publication supabase_realtime add table public.sale_items;
  end if;
end $$;

create or replace function public.current_listener_shop_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'shop_id', '')::uuid
$$;

create or replace function public.current_listener_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'user_role', auth.jwt() ->> 'role', '')
$$;

alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

drop policy if exists "realtime_products_select_by_scope" on public.products;
create policy "realtime_products_select_by_scope"
on public.products
for select
to authenticated
using (
  public.current_listener_role() = 'SUPER_ADMIN'
  or shop_id = public.current_listener_shop_id()
);

drop policy if exists "realtime_sales_select_by_scope" on public.sales;
create policy "realtime_sales_select_by_scope"
on public.sales
for select
to authenticated
using (
  public.current_listener_role() = 'SUPER_ADMIN'
  or shop_id = public.current_listener_shop_id()
);

drop policy if exists "realtime_sale_items_select_by_scope" on public.sale_items;
create policy "realtime_sale_items_select_by_scope"
on public.sale_items
for select
to authenticated
using (
  public.current_listener_role() = 'SUPER_ADMIN'
  or exists (
    select 1
    from public.sales
    where sales.id = sale_items.sale_id
      and sales.shop_id = public.current_listener_shop_id()
  )
);
