import type { Request, Response } from "express";

import { sendNoContent, sendSuccess } from "../../lib/http-response";

import {
  loginUser,
  logoutSession,
  refreshSession,
  registerUser,
} from "./auth.service";

export async function register(req: Request, res: Response) {
  const result = await registerUser(req.body);
  return sendSuccess(res, {
    data: result,
  });
}

export async function login(req: Request, res: Response) {
  const result = await loginUser(req.body);
  return sendSuccess(res, {
    data: result,
  });
}

export async function refresh(req: Request, res: Response) {
  const result = await refreshSession(req.body.refreshToken);
  return sendSuccess(res, {
    data: result,
  });
}

export async function logout(req: Request, res: Response) {
  await logoutSession(req.body.refreshToken);
  return sendNoContent(res);
}
