import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { logger } from "../config/logger";
import type { ApiErrorResponse } from "../lib/api-response";
import { AppError } from "../lib/app-error";

export function notFoundHandler(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  next(new AppError("Route not found", 404));
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction,
) {
  void _next;

  if (error instanceof ZodError) {
    logger.error(
      {
        type: "validation_error",
        issues: error.issues,
        path: req.originalUrl,
        method: req.method,
        stack: error.stack,
      },
      "Validation failed",
    );

    return res.status(400).json({
      code: 400,
      data: null,
      msg: "Validation failed",
    });
  }

  const statusCode = error instanceof AppError ? error.statusCode : 500;

  logger.error(
    {
      type: error instanceof AppError ? "app_error" : "unhandled_error",
      statusCode,
      details: error instanceof AppError ? error.details : undefined,
      path: req.originalUrl,
      method: req.method,
      stack: error.stack,
    },
    error.message,
  );

  return res.status(statusCode).json({
    code: statusCode,
    data: null,
    msg: error instanceof AppError ? error.message : "Internal server error",
  });
}
