import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  $transaction: vi.fn(),
  user: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("users service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists users with pagination metadata", async () => {
    const { listUsers } = await import("../src/modules/users/users.service");

    prismaMock.user.findMany.mockReturnValue("findMany-query");
    prismaMock.user.count.mockReturnValue("count-query");
    prismaMock.$transaction.mockResolvedValue([
      [
        {
          id: "user_1",
          email: "alice@example.com",
          name: "Alice",
          role: "USER",
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      11,
    ]);

    const result = await listUsers({
      page: 2,
      pageSize: 10,
      q: "alice",
    });

    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 11,
      totalPages: 2,
    });
    expect(result.items).toHaveLength(1);
  });
});
