import type { Response } from "express";

import type { ApiSuccessResponse } from "./api-response";

type SuccessPayload = {
  data?: unknown;
  msg?: string;
};

export function sendSuccess<T>(
  res: Response<ApiSuccessResponse<T>>,
  payload: SuccessPayload = {},
) {
  const { data = null, msg = "ok" } = payload;

  return res.status(200).json({
    code: 200,
    data: data as T,
    msg,
  });
}

export function sendNoContent(res: Response<ApiSuccessResponse<null>>) {
  return sendSuccess(res, {
    data: null,
    msg: "ok",
  });
}
