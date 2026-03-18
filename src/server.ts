import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectPrisma, disconnectPrisma } from "./lib/prisma";

const app = createApp();

async function bootstrap() {
  await connectPrisma();

  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });

  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    logger.info({ signal }, "Shutting down server");

    server.close(async (error) => {
      if (error) {
        logger.error({ err: error }, "Error while closing HTTP server");
        process.exitCode = 1;
      }

      try {
        await disconnectPrisma();
      } catch (disconnectError) {
        logger.error({ err: disconnectError }, "Error while disconnecting Prisma");
        process.exitCode = 1;
      } finally {
        process.exit();
      }
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "Failed to start server");
  process.exit(1);
});
