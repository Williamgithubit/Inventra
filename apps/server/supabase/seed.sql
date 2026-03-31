insert into users (name, email, password, role)
values (
  'Platform Admin',
  'admin@inventra.app',
  crypt('Admin1234', gen_salt('bf')),
  'SUPER_ADMIN'
)
on conflict (email) do nothing;

do $$
declare
  v_owner_id uuid;
  v_shop_id uuid;
begin
  insert into users (name, email, password, role)
  values (
    'Demo Shop Owner',
    'owner@inventra.app',
    crypt('Owner1234', gen_salt('bf')),
    'SHOP_OWNER'
  )
  on conflict (email) do nothing
  returning id into v_owner_id;

  if v_owner_id is null then
    select id into v_owner_id from users where email = 'owner@inventra.app';
  end if;

  insert into shops (name, owner_id)
  values ('Demo Corner Store', v_owner_id)
  on conflict do nothing
  returning id into v_shop_id;

  if v_shop_id is null then
    select id into v_shop_id from shops where owner_id = v_owner_id limit 1;
  end if;

  insert into subscriptions (shop_id, status)
  values (v_shop_id, 'ACTIVE')
  on conflict (shop_id) do nothing;

  insert into products (name, price, quantity, qr_code, shop_id)
  select 'Basmati Rice 5kg', 22.50, 14, 'pending', v_shop_id
  where not exists (
    select 1 from products where shop_id = v_shop_id and name = 'Basmati Rice 5kg'
  );

  insert into products (name, price, quantity, qr_code, shop_id)
  select 'Ground Coffee 250g', 9.75, 8, 'pending', v_shop_id
  where not exists (
    select 1 from products where shop_id = v_shop_id and name = 'Ground Coffee 250g'
  );

  insert into products (name, price, quantity, qr_code, shop_id)
  select 'Sparkling Water 500ml', 2.10, 28, 'pending', v_shop_id
  where not exists (
    select 1 from products where shop_id = v_shop_id and name = 'Sparkling Water 500ml'
  );
end $$;
