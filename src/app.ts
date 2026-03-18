import "express-async-errors";
import { randomUUID } from "crypto";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { logger } from "./config/logger";
import { errorHandler, notFoundHandler } from "./middlewares/error";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(
    pinoHttp({
      logger,
      autoLogging: false,
      genReqId(req, res) {
        const existingId = req.headers["x-request-id"];
        const requestId =
          typeof existingId === "string" && existingId.length > 0
            ? existingId
            : randomUUID();

        res.setHeader("X-Request-Id", requestId);
        return requestId;
      },
    }),
  );
  app.use((req, _res, next) => {
    logger.info(`(${String(req.id)}) ${req.method} ${req.originalUrl}`);
    next();
  });

  app.use("/api/v1", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
