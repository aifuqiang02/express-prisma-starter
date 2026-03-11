import { Router } from "express";

import { requireAuth, requireRole } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";

import {
  getCurrentUser,
  getUser,
  getUsers,
  patchUser,
  removeUser,
} from "./users.controller";
import {
  listUsersSchema,
  updateUserSchema,
  userIdParamSchema,
} from "./users.schema";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, getCurrentUser);
usersRouter.get(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validate(listUsersSchema),
  getUsers,
);
usersRouter.get(
  "/:userId",
  requireAuth,
  requireRole("ADMIN"),
  validate(userIdParamSchema),
  getUser,
);
usersRouter.patch(
  "/:userId",
  requireAuth,
  requireRole("ADMIN"),
  validate(updateUserSchema),
  patchUser,
);
usersRouter.delete(
  "/:userId",
  requireAuth,
  requireRole("ADMIN"),
  validate(userIdParamSchema),
  removeUser,
);
