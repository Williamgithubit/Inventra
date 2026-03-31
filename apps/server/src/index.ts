import { createAdaptorServer } from "@hono/node-server";

import { createApp } from "./app";
import { env } from "./env";
import { inspectRealtimeConfiguration, printStartupBanner, verifyDatabaseConnection } from "./lib/startup";

async function startServer() {
  printStartupBanner();
  await verifyDatabaseConnection();
  inspectRealtimeConfiguration();

  const app = createApp();
  const server = createAdaptorServer({
    fetch: app.fetch
  });

  server.on("error", (error) => {
    console.error("[startup] Unable to bind Inventra API");
    console.error(error);
    process.exit(1);
  });

  server.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`API Docs: http://localhost:${env.PORT}/api/v1`);
    console.log(`Health: http://localhost:${env.PORT}/health`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

startServer().catch((error) => {
  console.error("[startup] Unable to start Inventra API");
  console.error(error);
  process.exit(1);
});
