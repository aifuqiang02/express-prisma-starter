import { logger } from "../config/logger";
import { PrismaClient } from "../generated/prisma/index";

function normalizeSqlParams(params: string): unknown[] | string {
  try {
    const parsed = JSON.parse(params) as unknown;
    return Array.isArray(parsed) ? parsed : params;
  } catch {
    return params;
  }
}

function stringifySqlValue(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return `'${value.replace(/'/g, "''")}'`;
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (Array.isArray(value)) {
    return `(${value.map(stringifySqlValue).join(", ")})`;
  }

  return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
}

function inlineSqlParams(query: string, params: unknown[] | string) {
  if (!Array.isArray(params)) {
    return query;
  }

  let nextSql = query;

  params.forEach((value, index) => {
    const placeholder = new RegExp(`\\$${index + 1}(?!\\d)`, "g");
    nextSql = nextSql.replace(placeholder, stringifySqlValue(value));
  });

  return nextSql;
}

function collapseSelectFields(query: string) {
  return query.replace(/\bselect\b[\s\S]*?\bfrom\b/i, "select * from");
}

function formatSqlQuery(query: string, params: unknown[] | string) {
  return collapseSelectFields(
    inlineSqlParams(
      query
        .replace(/"public"\./g, "")
        .replace(/"([^"]+)"/g, "$1")
        .replace(/\s+/g, " ")
        .trim(),
      params,
    ),
  );
}

export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "warn" },
    { emit: "event", level: "error" },
  ],
});

prisma.$on("query", (event) => {
  const params = normalizeSqlParams(event.params);
  const sql = formatSqlQuery(event.query, params);

  logger.debug(sql);
});

prisma.$on("warn", (event) => {
  logger.warn(
    {
      type: "sql_warn",
      message: event.message,
      target: event.target,
    },
    "Prisma warning",
  );
});

prisma.$on("error", (event) => {
  logger.error(
    {
      type: "sql_error",
      message: event.message,
      target: event.target,
    },
    "Prisma error",
  );
});

export async function connectPrisma() {
  await prisma.$connect();
  logger.info("Prisma connected");
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
  logger.info("Prisma disconnected");
}
