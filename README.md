# Express Prisma Starter

`Node.js + TypeScript + Express + Prisma + PostgreSQL` 后端基础项目。

适合作为前后端分离项目、管理后台或业务系统的后端起点。

## 技术栈

- Node.js 20+
- TypeScript
- Express
- Prisma
- PostgreSQL
- Zod
- JWT
- Pino
- Vitest + Supertest

## 已有能力

- JWT 登录态
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- 用户管理与分页查询
- `GET /api/v1/docs`
- `GET /api/v1/openapi.json`
- `GET /api/v1/users/me`
- `GET /api/v1/users`
- `GET /api/v1/users/:userId`
- `PATCH /api/v1/users/:userId`
- `DELETE /api/v1/users/:userId`
- `GET /api/v1/health`

## 目录

```txt
prisma/
src/
  config/
  generated/
  lib/
  middlewares/
  modules/
    auth/
    users/
  routes/
tests/
tools/
```

## 快速开始

1. 安装依赖

```bash
pnpm install
```

2. 配置环境变量

```bash
copy .env.example .env
```

3. 准备 PostgreSQL

可选方式一：使用本地已安装的 PostgreSQL，并把 `DATABASE_URL` 配到 `.env`

可选方式二：使用项目自带的 Docker Compose

```bash
docker compose up -d
```

4. 执行迁移

```bash
pnpm db:migrate
```

5. 初始化种子数据

```bash
pnpm db:seed
```

默认管理员：

- email: `admin@example.com`
- password: `admin123456`

6. 启动开发服务

```bash
pnpm dev
```

本地入口：

```txt
GET http://localhost:3000/api/v1/health
GET http://localhost:3000/api/v1/docs
GET http://localhost:3000/api/v1/openapi.json
```

## 常用命令

```bash
pnpm dev
pnpm build
pnpm start

pnpm lint
pnpm format
pnpm type-check
pnpm test

pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:seed
```

## 正式部署

推荐方案：

- Node.js 20+
- PM2
- Nginx
- PostgreSQL

部署步骤：

1. 安装 Node.js 20、pnpm、PM2、Nginx、PostgreSQL
2. 上传代码到服务器目录，例如 `/var/www/express-prisma-starter`
3. 安装依赖

```bash
pnpm install --frozen-lockfile
```

4. 配置生产环境变量

- 复制 `.env.example` 为 `.env`
- 设置 `NODE_ENV=production`
- 设置正式数据库 `DATABASE_URL`
- 设置正式环境 JWT 密钥

5. 构建项目

```bash
pnpm build
```

6. 执行生产迁移

```bash
pnpm db:migrate:deploy
```

7. 使用 PM2 启动

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

8. 配置 Nginx 反向代理

- 示例文件：
  [nginx.conf.example](/D:/git-projects/express-prisma-starter/deploy/nginx.conf.example)
- 默认代理到 `http://127.0.0.1:3000`
- 默认禁止公网访问 Swagger 和 OpenAPI 路由

生产环境建议：

- Node 服务只监听本机，由 Nginx 对外暴露
- 使用 `pnpm db:migrate:deploy`，不要在生产环境执行 `pnpm db:migrate`
- JWT 密钥使用高强度随机字符串
- Swagger 文档默认不要暴露到公网
- PostgreSQL 做定期备份

## 接口说明

统一响应格式：

```json
{
  "code": 200,
  "data": {},
  "msg": "ok"
}
```

说明：

- 成功时 `code = 200`，HTTP 状态码为 `200`
- 未授权时 `code = 401`，HTTP 状态码为 `401`
- 其他错误时 `code = 500`，HTTP 状态码为 `200`

业务错误建议：

- 业务层统一抛 `AppError`
- 示例：`throw new AppError("用户不存在", 400)`
- 返回结果：

```json
{
  "code": 500,
  "data": null,
  "msg": "用户不存在"
}
```

- 如果抛的是 `throw new AppError("Unauthorized", 401)`，则 HTTP 状态码为 `401`，Body 中 `code = 401`
- 如果直接抛普通 `Error`，默认按系统错误处理，返回 `"Internal server error"`

事务约定：

- 当前项目不做注解式事务封装
- 业务层需要事务时，直接使用 Prisma 原生写法

```ts
await prisma.$transaction(async (tx) => {
  // 使用 tx 完成一组原子操作
});
```

- 简单查询可以直接使用 `prisma`
- 涉及多表写入、需要整体回滚的业务，统一使用 `tx`

分页列表示例：

```json
{
  "code": 200,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "msg": "ok"
}
```

Auth:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

Users:

- `GET /api/v1/users/me` 需要登录
- `GET /api/v1/users?page=1&pageSize=20&q=alice&role=USER&status=ACTIVE` 需要管理员权限
- `GET /api/v1/users/:userId` 需要管理员权限
- `PATCH /api/v1/users/:userId` 需要管理员权限
- `DELETE /api/v1/users/:userId` 需要管理员权限

Docs:

- `GET /api/v1/docs`
- `GET /api/v1/openapi.json`

## 测试覆盖

- auth service
- users service
- auth routes
- users routes
- health route
- docs routes

当前命令已验证通过：

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

## 备注

- Prisma Client 生成到 `src/generated/prisma`
- 构建时会复制到 `dist/src/generated`
- 代码层字段保持驼峰命名，数据库表名和列名统一使用 `snake_case`
- 查询用户等敏感模型时，默认不直接查全字段，统一使用共享 `select` 常量控制返回字段
- PM2 配置文件：
  [ecosystem.config.cjs](/D:/git-projects/express-prisma-starter/ecosystem.config.cjs)
- Swagger 文档地址：`/api/v1/docs`
- OpenAPI JSON 地址：`/api/v1/openapi.json`
- 当前已有初始 migration：
  [migration.sql](/D:/git-projects/express-prisma-starter/prisma/migrations/20260311000000_init/migration.sql)
