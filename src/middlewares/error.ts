import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

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
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  void _next;

  if (error instanceof ZodError) {
    return res.status(200).json({
      code: 500,
      data: null,
      msg: "Validation failed",
    });
  }

  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const isUnauthorized = statusCode === 401;

  return res.status(isUnauthorized ? 401 : 200).json({
    code: isUnauthorized ? 401 : 500,
    data: null,
    msg: error instanceof AppError ? error.message : "Internal server error",
  });
}
