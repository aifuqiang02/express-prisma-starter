# AGENTS

## 项目定位

这是一个 `Express + Prisma + PostgreSQL + TypeScript` 的后端模板项目，用于快速启动中后台、API 服务和业务系统后端。

## 目录约定

- `src/config`
  - 环境变量、日志等基础配置
- `src/lib`
  - Prisma、公共工具、基础能力封装
- `src/middlewares`
  - 全局中间件，例如校验、异常处理
- `src/modules`
  - 按业务域拆分模块
- `src/routes`
  - 顶层路由汇总
- `tests`
  - 路由、service 等测试
- `prisma`
  - schema、migration、seed

## 日志约定

- 每个请求进入时打印一行：
  - `(requestId) METHOD URL`
- 不打印自动 `request completed`
- 异常统一走全局错误处理中间件
- Prisma 打印单行可读 SQL
- 日志同时输出到控制台和按日期切分的日志文件

日志相关环境变量：

- `LOG_DIR`
- `LOG_RETENTION_DAYS`
- `LOG_LEVEL`

默认要求：

- 没显式配置时，默认也应该能看到 SQL
- 生产环境不要因为默认级别过高而把 SQL 完全吞掉

## 开发约定

- 业务层优先抛 `AppError`
- 参数校验统一走 Zod
- 数据库访问统一走 `src/lib/prisma.ts`
- 不要在模块里随意创建额外 `PrismaClient` 实例
- 如果要调整日志策略，优先改：
  - `src/config/logger.ts`
  - `src/lib/prisma.ts`
  - `src/middlewares/error.ts`
  - `src/app.ts`

## 部署约定

- 不要同时保留“手工启动进程”和 `PM2` 进程
- `ecosystem.config.cjs` 中的端口来源要明确
  - 如果写死在 `env.PORT`，就不要再假设 `.env` 会覆盖它
- 如果修改了关键环境变量或端口，优先使用：
  - `pm2 delete <app>`
  - `pm2 start ecosystem.config.cjs`
- 如果本地和服务器不是同一平台，`Prisma Client` 优先在服务器重新生成
- 正式环境不要只依赖 `db push`
  - 必须维护 migration，并执行 `prisma migrate deploy`
- 重复部署建议使用“单文件归档上传 + 服务器解包”，不要长期依赖逐文件上传

## 初始化后建议检查

- 修改 `.env` / `.env.example`
- 修改 `package.json`
- 检查日志目录和保留天数
- 执行：
  - `pnpm install`
  - `pnpm lint`
  - `pnpm type-check`
  - `pnpm test`
  - `pnpm build`
