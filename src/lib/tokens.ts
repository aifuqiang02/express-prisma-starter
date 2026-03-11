import jwt from "jsonwebtoken";

import { env } from "../config/env";

type TokenPayload = {
  sub: string;
  type: "access" | "refresh";
};

export function signAccessToken(userId: string) {
  return jwt.sign(
    { sub: userId, type: "access" } satisfies TokenPayload,
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );
}

export function signRefreshToken(userId: string) {
  return jwt.sign(
    { sub: userId, type: "refresh" } satisfies TokenPayload,
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}
