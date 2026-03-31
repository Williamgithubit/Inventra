# Inventra

Inventra is a production-oriented SaaS MVP for inventory management and point-of-sale workflows in local shops. It combines inventory control, QR-powered checkout, receipts, RBAC, and real-time stock updates in a Turborepo monorepo.

## Stack

- `apps/client`: Next.js App Router, TypeScript, Tailwind CSS, Redux Toolkit, React Hook Form, Zod
- `apps/server`: Hono, Node.js, Supabase PostgreSQL, JWT auth, Resend, Cloudinary
- `packages/types`: shared contracts and validation schemas
- `packages/utils`: shared helpers
- `packages/ui`: shared React UI primitives

## Monorepo Structure

```text
inventra/
├── apps/
│   ├── server/
│   │   ├── src/
│   │   └── supabase/
│   └── client/
│       └── src/
├── packages/
│   ├── types/
│   ├── ui/
│   └── utils/
├── turbo.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Core Capabilities

- Shop owner registration and JWT login
- RBAC for `SUPER_ADMIN` and `SHOP_OWNER`
- Product CRUD with auto-generated QR codes
- POS checkout with QR/manual scan support
- Sales history and printable receipts
- Shop dashboard with low-stock visibility
- Super admin dashboard with users, shops, and placeholder subscription controls
- Real-time stock and low-stock notifications over Supabase Realtime

## API Surface

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/realtime-token`

### Products

- `GET /products`
- `GET /products/:id`
- `POST /products`
- `POST /products/scan`
- `PUT /products/:id`
- `DELETE /products/:id`

### Sales

- `GET /sales`
- `GET /sales/:id`
- `POST /sales`

### Dashboard

- `GET /dashboard`

### Admin

- `POST /admin/setup`
- `GET /admin/users`
- `GET /admin/shops`
- `PUT /admin/subscriptions`

## Database

Supabase SQL lives in [apps/server/supabase/schema.sql](/home/william-t-johnson-jr/Desktop/Inventra/apps/server/supabase/schema.sql), realtime publication and RLS setup lives in [apps/server/supabase/migrations/realtime.sql](/home/william-t-johnson-jr/Desktop/Inventra/apps/server/supabase/migrations/realtime.sql), and demo seed data lives in [apps/server/supabase/seed.sql](/home/william-t-johnson-jr/Desktop/Inventra/apps/server/supabase/seed.sql).

The schema includes:

- `users`
- `shops`
- `subscriptions`
- `products`
- `sales`
- `sale_items`
- `checkout_sale(...)` transactional checkout function

## Local Setup

1. Copy [`.env.example`](/home/william-t-johnson-jr/Desktop/Inventra/.env.example) into the appropriate app env files:
   `apps/server/.env` and `apps/client/.env.local`
2. Create a Supabase project and run the schema SQL plus the realtime setup SQL.
3. Optionally run the seed SQL to create demo accounts:
   `admin@inventra.app / Admin1234`
   `owner@inventra.app / Owner1234`
4. Install dependencies with `pnpm install`
5. Start the apps with `pnpm dev`
6. For secure Supabase Realtime auth, set `SUPABASE_JWT_SECRET` in `apps/server/.env`.

When the API boots successfully it now prints the Inventra startup banner, database status, realtime inspector status, docs URL, health URL, and environment.

## Postman

Import the collection at [apps/server/postman/Inventra.postman_collection.json](/home/william-t-johnson-jr/Desktop/Inventra/apps/server/postman/Inventra.postman_collection.json) and the local environment at [apps/server/postman/Inventra.local.postman_environment.json](/home/william-t-johnson-jr/Desktop/Inventra/apps/server/postman/Inventra.local.postman_environment.json).

The collection includes:

- `GET /health`
- `POST /admin/setup`
- `POST /admin/setup` with a Cloudinary avatar payload
- `POST /auth/login`
- `GET /admin/users`

## Notes

- The backend enforces RBAC and shop scoping with JWT middleware.
- Checkout is backed by a PostgreSQL function to keep stock updates and sale inserts atomic.
- The frontend persists session state locally and mirrors the access token into a cookie for route continuity.
- The frontend subscribes to `products` and `sales` through Supabase Realtime and updates Redux state live.
