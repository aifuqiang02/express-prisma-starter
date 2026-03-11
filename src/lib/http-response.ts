import type { Response } from "express";

type SuccessPayload = {
  data?: unknown;
  msg?: string;
};

export function sendSuccess(res: Response, payload: SuccessPayload = {}) {
  const { data = null, msg = "ok" } = payload;

  return res.status(200).json({
    code: 200,
    data,
    msg,
  });
}

export function sendNoContent(res: Response) {
  return sendSuccess(res, {
    data: null,
    msg: "ok",
  });
}
