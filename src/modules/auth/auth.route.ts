import { Router } from "express";

import { refreshTokenCleanup } from "../../middlewares/refresh-token-cleanup";
import { validate } from "../../middlewares/validate";

import { login, logout, refresh, register } from "./auth.controller";
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
} from "./auth.schema";

export const authRouter = Router();

authRouter.use(refreshTokenCleanup);
authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/refresh", validate(refreshSchema), refresh);
authRouter.post("/logout", validate(logoutSchema), logout);
