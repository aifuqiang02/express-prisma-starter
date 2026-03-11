import { AppError } from "../../lib/app-error";
import { hashPassword, verifyPassword } from "../../lib/hash";
import { prisma } from "../../lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../lib/tokens";

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
    },
  });

  return issueAuthTokens(user.id, {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid email or password", 401);
  }

  return issueAuthTokens(user.id, {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}

export async function refreshSession(refreshToken: string) {
  let payload: ReturnType<typeof verifyRefreshToken>;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  if (payload.type !== "refresh") {
    throw new AppError("Invalid refresh token", 401);
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: {
      user: true,
    },
  });

  if (
    !storedToken ||
    storedToken.userId !== payload.sub ||
    storedToken.revokedAt ||
    storedToken.expiresAt <= new Date() ||
    storedToken.user.status !== "ACTIVE"
  ) {
    throw new AppError("Invalid refresh token", 401);
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  return issueAuthTokens(storedToken.user.id, {
    id: storedToken.user.id,
    email: storedToken.user.email,
    name: storedToken.user.name,
    role: storedToken.user.role,
  });
}

export async function logoutSession(refreshToken: string) {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.revokedAt) {
    throw new AppError("Refresh token not found", 404);
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });
}

export async function cleanupRefreshTokens() {
  const now = new Date();

  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        {
          expiresAt: {
            lt: now,
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

  return result.count;
}

async function issueAuthTokens(
  userId: string,
  user: { id: string; email: string; name: string; role: string },
) {
  await cleanupUserRefreshTokens(userId);

  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  await prisma.refreshToken.create({
    data: {
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user,
    tokens: {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
    },
  };
}

async function cleanupUserRefreshTokens(userId: string) {
  const now = new Date();

  await prisma.refreshToken.deleteMany({
    where: {
      userId,
      OR: [
        {
          expiresAt: {
            lt: now,
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
}
