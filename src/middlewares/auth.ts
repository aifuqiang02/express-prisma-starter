import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/app-error";
import { prisma } from "../lib/prisma";
import { verifyAccessToken } from "../lib/tokens";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Unauthorized", 401);
    }

    const token = header.slice("Bearer ".length);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, status: true },
    });

    if (!user || user.status !== "ACTIVE") {
      throw new AppError("Unauthorized", 401);
    }

    req.auth = { userId: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: Array<"USER" | "ADMIN">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!roles.includes(req.auth.role)) {
      return next(new AppError("Forbidden", 403));
    }

    next();
  };
}
