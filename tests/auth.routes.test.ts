import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  prismaMock,
  verifyRefreshTokenMock,
  signAccessTokenMock,
  signRefreshTokenMock,
} = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
  verifyRefreshTokenMock: vi.fn(),
  signAccessTokenMock: vi.fn(),
  signRefreshTokenMock: vi.fn(),
}));

vi.mock("../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../src/lib/tokens", () => ({
  signAccessToken: signAccessTokenMock,
  signRefreshToken: signRefreshTokenMock,
  verifyRefreshToken: verifyRefreshTokenMock,
  verifyAccessToken: vi.fn(),
}));

import { createApp } from "../src/app";

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 0 });
  });

  it("refreshes tokens through POST /api/v1/auth/refresh", async () => {
    const app = createApp();

    verifyRefreshTokenMock.mockReturnValue({
      sub: "user_1",
      type: "refresh",
    });
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: "rt_1",
      userId: "user_1",
      token: "refresh-token",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: "user_1",
        email: "admin@example.com",
        name: "Admin",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    prismaMock.refreshToken.update.mockResolvedValue({});
    prismaMock.refreshToken.create.mockResolvedValue({});
    signAccessTokenMock.mockReturnValue("next-access-token");
    signRefreshTokenMock.mockReturnValue("next-refresh-token");

    const response = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: "refresh-token" })
      .expect(200);

    expect(response.body).toEqual({
      code: 200,
      data: {
        user: {
          id: "user_1",
          email: "admin@example.com",
          name: "Admin",
          role: "ADMIN",
        },
        tokens: {
          accessToken: "next-access-token",
          refreshToken: "next-refresh-token",
          tokenType: "Bearer",
        },
      },
      msg: "ok",
    });
  });

  it("returns 401 when refresh token is invalid", async () => {
    const app = createApp();

    verifyRefreshTokenMock.mockImplementation(() => {
      const error = new Error("bad token");
      throw error;
    });

    const response = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: "bad-token" })
      .expect(401);

    expect(response.body).toEqual({
      code: 401,
      data: null,
      msg: "Invalid refresh token",
    });
  });

  it("returns 200 on logout", async () => {
    const app = createApp();

    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: "rt_1",
      revokedAt: null,
    });
    prismaMock.refreshToken.update.mockResolvedValue({});

    await request(app)
      .post("/api/v1/auth/logout")
      .send({ refreshToken: "refresh-token" })
      .expect(200)
      .expect({
        code: 200,
        data: null,
        msg: "ok",
      });

    expect(prismaMock.refreshToken.update).toHaveBeenCalledWith({
      where: { id: "rt_1" },
      data: { revokedAt: expect.any(Date) },
    });
  });
});
