import { Hono } from "hono";
import { cors } from "hono/cors";

import { env } from "./env";
import { normalizeError } from "./lib/http";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import { dashboardRoutes } from "./routes/dashboard";
import { productRoutes } from "./routes/products";
import { salesRoutes } from "./routes/sales";
import type { AppBindings } from "./types/hono";

export function createApp() {
  const app = new Hono<AppBindings>();

  app.use(
    "*",
    cors({
      origin: env.CORS_ORIGIN,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.get("/health", (c) =>
    c.json({
      success: true,
      data: {
        status: "ok",
      },
    }),
  );

  app.get("/api/v1", (c) => {
    const endpoints: Record<string, string | string[]> = {
      health: "/health",
      auth: [
        "/api/v1/auth/register",
        "/api/v1/auth/login",
        "/api/v1/auth/realtime-token",
      ],
      products: [
        "/api/v1/products",
        "/api/v1/products/:id",
        "/api/v1/products/scan",
      ],
      sales: ["/api/v1/sales", "/api/v1/sales/:id"],
      dashboard: ["/api/v1/dashboard"],
      admin: [
        "/api/v1/admin/setup",
        "/api/v1/admin/users",
        "/api/v1/admin/shops",
        "/api/v1/admin/subscriptions",
      ],
    };

    return c.json({
      success: true,
      data: {
        name: "Inventra API",
        version: "v1",
        endpoints,
      },
    });
  });

  app.route("/api/v1/auth", authRoutes);
  app.route("/api/v1/products", productRoutes);
  app.route("/api/v1/sales", salesRoutes);
  app.route("/api/v1/dashboard", dashboardRoutes);
  app.route("/api/v1/admin", adminRoutes);

  app.notFound((c) =>
    c.json(
      {
        success: false,
        error: {
          message: "Route not found",
        },
      },
      404,
    ),
  );

  app.onError((error, c) => {
    const normalized = normalizeError(error);
    console.error(error);
    return c.json(normalized.body, normalized.statusCode);
  });

  return app;
}
