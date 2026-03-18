import request from "supertest";
import { describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma", () => ({
  prisma: {},
}));

import { createApp } from "../src/app";

describe("health route", () => {
  it("returns service health metadata", async () => {
    const app = createApp();

    const response = await request(app).get("/api/v1/health").expect(200);

    expect(response.body).toMatchObject({
      code: 200,
      data: {
        status: "ok",
        service: "express-prisma-starter",
      },
      msg: "ok",
    });
    expect(typeof response.headers["x-request-id"]).toBe("string");
    expect(typeof response.body.data.timestamp).toBe("string");
  });
});
