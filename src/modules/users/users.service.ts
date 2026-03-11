import type {
  Prisma,
  UserRole,
  UserStatus,
} from "../../generated/prisma/index";
import { AppError } from "../../lib/app-error";
import { prisma } from "../../lib/prisma";
import { userPublicSelect } from "./user.select";

type ListUsersInput = {
  page: number;
  pageSize: number;
  role?: UserRole;
  status?: UserStatus;
  q?: string;
};

function buildUserWhere(input: ListUsersInput): Prisma.UserWhereInput {
  return {
    role: input.role,
    status: input.status,
    ...(input.q
      ? {
          OR: [
            {
              email: {
                contains: input.q,
                mode: "insensitive",
              },
            },
            {
              name: {
                contains: input.q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };
}

export async function listUsers(input: ListUsersInput) {
  const where = buildUserWhere(input);
  const skip = (input.page - 1) * input.pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: input.pageSize,
      orderBy: {
        createdAt: "desc",
      },
      select: userPublicSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublicSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function updateUser(
  userId: string,
  input: {
    name?: string;
    role?: UserRole;
    status?: UserStatus;
  },
) {
  await getUserById(userId);

  return prisma.user.update({
    where: { id: userId },
    data: input,
    select: userPublicSelect,
  });
}

export async function deleteUser(userId: string) {
  await getUserById(userId);

  await prisma.user.delete({
    where: { id: userId },
  });
}
