import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
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
};

const hashPasswordMock = vi.fn();
const verifyPasswordMock = vi.fn();
const signAccessTokenMock = vi.fn();
const signRefreshTokenMock = vi.fn();
const verifyRefreshTokenMock = vi.fn();

vi.mock("../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../src/lib/hash", () => ({
  hashPassword: hashPasswordMock,
  verifyPassword: verifyPasswordMock,
}));

vi.mock("../src/lib/tokens", () => ({
  signAccessToken: signAccessTokenMock,
  signRefreshToken: signRefreshTokenMock,
  verifyRefreshToken: verifyRefreshTokenMock,
}));

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a user and persists a refresh token", async () => {
    const { registerUser } = await import("../src/modules/auth/auth.service");

    prismaMock.user.findUnique.mockResolvedValue(null);
    hashPasswordMock.mockResolvedValue("hashed-password");
    prismaMock.user.create.mockResolvedValue({
      id: "user_1",
      email: "alice@example.com",
      name: "Alice",
      role: "USER",
    });
    signAccessTokenMock.mockReturnValue("access-token");
    signRefreshTokenMock.mockReturnValue("refresh-token");
    prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.refreshToken.create.mockResolvedValue({});

    const result = await registerUser({
      email: "alice@example.com",
      password: "password123",
      name: "Alice",
    });

    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(prismaMock.refreshToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user_1",
          token: "refresh-token",
        }),
      }),
    );
    expect(result.tokens).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      tokenType: "Bearer",
    });
  });

  it("refreshes tokens only when the stored refresh token is active", async () => {
    const { refreshSession } = await import("../src/modules/auth/auth.service");

    verifyRefreshTokenMock.mockReturnValue({
      sub: "user_1",
      type: "refresh",
    });
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: "rt_1",
      userId: "user_1",
      token: "refresh-token",
      revokedAt: null,
      user: {
        id: "user_1",
        email: "alice@example.com",
        name: "Alice",
        role: "USER",
        status: "ACTIVE",
      },
    });
    prismaMock.refreshToken.update.mockResolvedValue({});
    prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
    signAccessTokenMock.mockReturnValue("next-access");
    signRefreshTokenMock.mockReturnValue("next-refresh");
    prismaMock.refreshToken.create.mockResolvedValue({});

    const result = await refreshSession("refresh-token");

    expect(prismaMock.refreshToken.update).toHaveBeenCalledWith({
      where: { id: "rt_1" },
      data: { revokedAt: expect.any(Date) },
    });
    expect(result.tokens).toEqual({
      accessToken: "next-access",
      refreshToken: "next-refresh",
      tokenType: "Bearer",
    });
  });

  it("revokes a refresh token on logout", async () => {
    const { logoutSession } = await import("../src/modules/auth/auth.service");

    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: "rt_1",
      revokedAt: null,
    });
    prismaMock.refreshToken.update.mockResolvedValue({});

    await logoutSession("refresh-token");

    expect(prismaMock.refreshToken.update).toHaveBeenCalledWith({
      where: { id: "rt_1" },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it("cleans up expired or revoked refresh tokens", async () => {
    const { cleanupRefreshTokens } =
      await import("../src/modules/auth/auth.service");

    prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 3 });

    const count = await cleanupRefreshTokens();

    expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            expiresAt: {
              lt: expect.any(Date),
            },
          },
          {
            revokedAt: {
              not: null,
            },
          },
        ],
      },
    });
    expect(count).toBe(3);
  });
});
