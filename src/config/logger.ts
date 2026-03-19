import path from "node:path";
import pino from "pino";
import pretty from "pino-pretty";

import { env } from "./env";
import { DailyLogStream } from "../lib/daily-log-stream";

const prettyStream =
  env.NODE_ENV === "development"
    ? pretty({
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname,requestId,req,res,responseTime",
      })
    : undefined;

const fileStream = new DailyLogStream({
  dir: path.resolve(process.cwd(), env.LOG_DIR),
  prefix: "backend",
  retentionDays: env.LOG_RETENTION_DAYS,
});

export const logger = pino(
  {
    base: undefined,
    level: env.LOG_LEVEL,
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream(
    [
      ...(prettyStream ? [{ level: "debug", stream: prettyStream }] : []),
      { level: "debug", stream: fileStream },
    ],
    { dedupe: true },
  ),
);
