import type { NextFunction, Request, Response } from "express";

import { cleanupRefreshTokens } from "../modules/auth/auth.service";

let lastCleanupAt = 0;
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

export async function refreshTokenCleanup(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  const now = Date.now();
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) {
    return next();
  }

  lastCleanupAt = now;

  try {
    await cleanupRefreshTokens();
  } catch {
    // Cleanup is best-effort and should never block auth traffic.
  }

  next();
}
