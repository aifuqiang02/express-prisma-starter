import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { AppError } from "../src/lib/app-error";
import { errorHandler, notFoundHandler } from "../src/middlewares/error";

vi.mock("../src/lib/prisma", () => ({
  prisma: {},
}));

describe("error handler", () => {
  it("returns business error message for AppError", async () => {
    const app = express();

    app.get("/business-error", (_req, _res, next) => {
      next(new AppError("用户不存在", 400));
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    const response = await request(app).get("/business-error").expect(400);

    expect(response.body).toEqual({
      code: 400,
      data: null,
      msg: "用户不存在",
    });
  });
});
