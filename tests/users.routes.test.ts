import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, verifyAccessTokenMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  verifyAccessTokenMock: vi.fn(),
}));

vi.mock("../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../src/lib/tokens", () => ({
  verifyAccessToken: verifyAccessTokenMock,
  verifyRefreshToken: vi.fn(),
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
}));

import { createApp } from "../src/app";

describe("users routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns current user on GET /api/v1/users/me", async () => {
    const app = createApp();

    verifyAccessTokenMock.mockReturnValue({ sub: "user_1", type: "access" });
    prismaMock.user.findUnique
      .mockResolvedValueOnce({
        id: "user_1",
        role: "USER",
        status: "ACTIVE",
      })
      .mockResolvedValueOnce({
        id: "user_1",
        email: "user@example.com",
        name: "User One",
        role: "USER",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const response = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", "Bearer access-token")
      .expect(200);

    expect(response.body.code).toBe(200);
    expect(response.body.msg).toBe("ok");
    expect(response.body.data.user).toMatchObject({
      id: "user_1",
      email: "user@example.com",
      role: "USER",
    });
  });

  it("returns paginated users for admins on GET /api/v1/users", async () => {
    const app = createApp();

    verifyAccessTokenMock.mockReturnValue({ sub: "admin_1", type: "access" });
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "admin_1",
      role: "ADMIN",
      status: "ACTIVE",
    });
    prismaMock.user.findMany.mockReturnValue("findMany-query");
    prismaMock.user.count.mockReturnValue("count-query");
    prismaMock.$transaction.mockResolvedValue([
      [
        {
          id: "user_1",
          email: "user@example.com",
          name: "User One",
          role: "USER",
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      1,
    ]);

    const response = await request(app)
      .get("/api/v1/users?page=1&pageSize=10&q=user")
      .set("Authorization", "Bearer admin-token")
      .expect(200);

    expect(response.body.code).toBe(200);
    expect(response.body.data.pagination).toEqual({
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });
    expect(response.body.data.items).toHaveLength(1);
  });

  it("returns 403 for non-admin users on GET /api/v1/users", async () => {
    const app = createApp();

    verifyAccessTokenMock.mockReturnValue({ sub: "user_1", type: "access" });
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "user_1",
      role: "USER",
      status: "ACTIVE",
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", "Bearer user-token")
      .expect(403);

    expect(response.body).toEqual({
      code: 403,
      data: null,
      msg: "Forbidden",
    });
  });

  it("updates a user on PATCH /api/v1/users/:userId", async () => {
    const app = createApp();

    verifyAccessTokenMock.mockReturnValue({ sub: "admin_1", type: "access" });
    prismaMock.user.findUnique
      .mockResolvedValueOnce({
        id: "admin_1",
        role: "ADMIN",
        status: "ACTIVE",
      })
      .mockResolvedValueOnce({
        id: "user_1",
        email: "user@example.com",
        name: "User One",
        role: "USER",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    prismaMock.user.update.mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      name: "Updated Name",
      role: "ADMIN",
      status: "DISABLED",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .patch("/api/v1/users/user_1")
      .set("Authorization", "Bearer admin-token")
      .send({ name: "Updated Name", role: "ADMIN", status: "DISABLED" })
      .expect(200);

    expect(response.body.code).toBe(200);
    expect(response.body.data.user).toMatchObject({
      id: "user_1",
      name: "Updated Name",
      role: "ADMIN",
      status: "DISABLED",
    });
  });

  it("deletes a user on DELETE /api/v1/users/:userId", async () => {
    const app = createApp();

    verifyAccessTokenMock.mockReturnValue({ sub: "admin_1", type: "access" });
    prismaMock.user.findUnique
      .mockResolvedValueOnce({
        id: "admin_1",
        role: "ADMIN",
        status: "ACTIVE",
      })
      .mockResolvedValueOnce({
        id: "user_1",
        email: "user@example.com",
        name: "User One",
        role: "USER",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    prismaMock.user.delete.mockResolvedValue({});

    await request(app)
      .delete("/api/v1/users/user_1")
      .set("Authorization", "Bearer admin-token")
      .expect(200)
      .expect({
        code: 200,
        data: null,
        msg: "ok",
      });

    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: "user_1" },
    });
  });
});
