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

## 日志

当前模板默认启用了这套日志策略：

- 每个请求进入时，只打印一行：
  - `(requestId) METHOD URL`
- 不再打印低价值的自动 `request completed`
- 全局异常会打印错误堆栈和业务 details
- Prisma 会打印一行可读 SQL
- 日志同时输出到控制台和按日期切分的日志文件

示例：

```txt
[2026-03-18 20:06:46.515 +0800] INFO: (7b564183-eef0-4d3a-bd86-03e3f6dd18d9) GET /api/v1/apps/app_36688252
[2026-03-18 20:06:46.563 +0800] DEBUG: select * from apps WHERE (apps.id = 'app_36688252' AND 1=1) LIMIT 1 OFFSET 0
```

日志相关环境变量：

- `LOG_DIR`
  - 日志目录，默认 `./logs`
- `LOG_RETENTION_DAYS`
  - 日志保留天数，默认 `30`

日志文件命名规则：

- `backend-YYYY-MM-DD.log`

说明：

- SQL 日志默认不强行绑定 `requestId`
- 原因是 Prisma 原生 query event 不稳定保留请求上下文
- 模板采用“请求先打一行入口日志，再看后续 SQL”的方式定位问题

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

## 套用模板后建议优先修改

- 删除 `.git` 目录
  - 避免把模板仓库的 Git 历史一并带到新项目中。
- `package.json`
  - 修改 `name`、`version`、`description` 等基础项。
- `.env.example` 和实际环境变量文件
  - 修改 `DATABASE_URL`
  - 修改 JWT 密钥
  - 根据项目需要补充端口、日志、跨域等配置
  - 检查 `LOG_DIR`、`LOG_RETENTION_DAYS` 是否符合部署环境需求
- `prisma/schema.prisma`
  - 根据你的业务重新定义数据模型。
- `src/config`
  - 检查应用名、接口前缀、日志、鉴权相关默认配置是否符合新项目需求。

套用完成后，建议执行一次 `pnpm install && pnpm lint && pnpm type-check && pnpm test && pnpm build` 做自检。

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

### 部署踩坑清单

这几个点在真实项目里很容易出问题，建议新项目一开始就按这个清单规避：

- `PM2` 里的 `env.PORT` 会覆盖 `.env`
  - 如果端口要由 `.env` 决定，就不要再在 `ecosystem.config.cjs` 里写另一个值
- `PM2 restart` 可能沿用旧环境变量
  - 改了端口或关键环境变量后，必要时使用 `pm2 delete + pm2 start`
- 不要混用手工启动进程和 `PM2`
  - 否则很容易出现旧进程占端口，`PM2` 新进程启动失败
- `Prisma` 有平台差异
  - 如果本地是 Windows、服务器是 Linux，不能想当然地复用本地生成产物
  - 正式部署建议在线上执行 `prisma generate`
- 只做了本地 `db push`，没有正式 migration，会导致线上结构漂移
  - 正式项目必须维护 migration，并在线上执行 `prisma migrate deploy`
- 生产环境 SQL 日志看不到时，先查：
  - `LOG_LEVEL`
  - 控制台流和文件流的级别
  - SQL 是否只打到某一个输出通道
- 重复部署建议使用“单文件归档上传 + 服务器解包”
  - 通常比逐文件上传更稳、更快

### 后端部署建议

如果后端需要长期迭代部署，建议项目内补一套 `deploy/` 脚本，并遵循这条顺序：

1. 本地构建
2. 归档部署包
3. 上传单个包到服务器
4. 服务器解包替换
5. 服务器执行 `pnpm install`
6. 服务器执行 `pnpm exec prisma generate`
7. 服务器执行 `pnpm exec prisma migrate deploy`
8. 用 `PM2` 启动或重启

后端部署完成后，至少检查：

- 实际监听端口是否正确
- `.env` 是否保留
- migration 是否执行
- `Prisma Client` 是否已按目标平台生成
- 日志里是否能看到请求入口、错误和 SQL

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
- 失败时 `code` 与 HTTP 状态码保持一致
- 例如参数错误 `400`、未授权 `401`、无权限 `403`、未找到 `404`、服务错误 `500`

业务错误建议：

- 业务层统一抛 `AppError`
- 示例：`throw new AppError("用户不存在", 400)`
- 返回结果：

```json
{
  "code": 400,
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
- 每个请求会生成或透传 `X-Request-Id`，用于日志链路追踪
- Prisma 查询日志会格式化成单行可读 SQL
- 日志默认同时输出到控制台和本地按日切分文件
- PM2 配置文件：
  [ecosystem.config.cjs](/D:/git-projects/express-prisma-starter/ecosystem.config.cjs)
- Swagger 文档地址：`/api/v1/docs`
- OpenAPI JSON 地址：`/api/v1/openapi.json`
- 当前已有初始 migration：
  [migration.sql](/D:/git-projects/express-prisma-starter/prisma/migrations/20260311000000_init/migration.sql)
