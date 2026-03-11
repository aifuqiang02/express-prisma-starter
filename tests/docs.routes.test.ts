import request from "supertest";
import { describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma", () => ({
  prisma: {},
}));

import { createApp } from "../src/app";

describe("docs routes", () => {
  it("returns the OpenAPI document", async () => {
    const app = createApp();

    const response = await request(app).get("/api/v1/openapi.json").expect(200);

    expect(response.body).toMatchObject({
      openapi: "3.0.3",
      info: {
        title: "Express Prisma Starter API",
      },
    });
  });
});
