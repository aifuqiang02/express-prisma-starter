export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Express Prisma Starter API",
    version: "0.1.0",
    description:
      "Starter backend with Express, Prisma, PostgreSQL, and JWT auth.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      AuthBody: {
        type: "object",
        required: ["email", "password", "name"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          name: { type: "string" },
        },
      },
      LoginBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      RefreshBody: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" },
        },
      },
      UpdateUserBody: {
        type: "object",
        properties: {
          name: { type: "string" },
          role: { type: "string", enum: ["USER", "ADMIN"] },
          status: { type: "string", enum: ["ACTIVE", "DISABLED"] },
        },
      },
    },
  },
  paths: {
    "/api/v1/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "Service status with { code, data, msg }",
          },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthBody" },
            },
          },
        },
        responses: {
          "200": { description: "Registered with { code, data, msg }" },
          "409": { description: "Email is already registered" },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginBody" },
            },
          },
        },
        responses: {
          "200": { description: "Logged in with { code, data, msg }" },
          "401": { description: "Invalid email or password" },
        },
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        summary: "Refresh access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshBody" },
            },
          },
        },
        responses: {
          "200": { description: "Tokens refreshed with { code, data, msg }" },
          "401": { description: "Invalid refresh token" },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        summary: "Logout",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshBody" },
            },
          },
        },
        responses: {
          "200": { description: "Logged out with { code, data, msg }" },
          "404": { description: "Refresh token not found" },
        },
      },
    },
    "/api/v1/users/me": {
      get: {
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Current user with { code, data, msg }" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/users": {
      get: {
        summary: "List users",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "pageSize", schema: { type: "integer" } },
          { in: "query", name: "q", schema: { type: "string" } },
          {
            in: "query",
            name: "role",
            schema: { type: "string", enum: ["USER", "ADMIN"] },
          },
          {
            in: "query",
            name: "status",
            schema: { type: "string", enum: ["ACTIVE", "DISABLED"] },
          },
        ],
        responses: {
          "200": {
            description: "Paginated users with { code, data: { items, pagination }, msg }",
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/v1/users/{userId}": {
      get: {
        summary: "Get user by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "userId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "User detail with { code, data, msg }" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "User not found" },
        },
      },
      patch: {
        summary: "Update user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "userId",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserBody" },
            },
          },
        },
        responses: {
          "200": { description: "User updated with { code, data, msg }" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "User not found" },
        },
      },
      delete: {
        summary: "Delete user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "userId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "User deleted with { code, data, msg }" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "User not found" },
        },
      },
    },
  },
} as const;
