# Production Deployment

适用方案：

- Node.js 20+
- pnpm
- PM2
- Nginx
- PostgreSQL

## 部署步骤

1. 安装基础环境

- Node.js 20
- pnpm
- PM2
- Nginx
- PostgreSQL

2. 上传项目

- 将项目上传到服务器目录，例如 `/var/www/express-prisma-starter`

3. 安装依赖

```bash
pnpm install --frozen-lockfile
```

4. 配置生产环境变量

```bash
cp .env.example .env
```

至少修改以下配置：

- `NODE_ENV=production`
- `PORT=3000`
- `DATABASE_URL=...`
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...`

5. 构建项目

```bash
pnpm build
```

6. 执行生产迁移

```bash
pnpm db:migrate:deploy
```

7. 使用 PM2 启动服务

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

8. 配置 Nginx

- 将请求反向代理到 `http://127.0.0.1:3000`
- 可参考 [nginx.conf.example](/D:/git-projects/express-prisma-starter/deploy/nginx.conf.example)

## 生产注意事项

- 生产环境只使用 `pnpm db:migrate:deploy`
- 不要在生产环境执行 `pnpm db:migrate`
- Node 服务建议只监听本机，由 Nginx 对外暴露
- Swagger 默认不要对公网开放
- JWT 密钥必须使用高强度随机字符串
- PostgreSQL 需要做定期备份

## 项目内相关文件

- PM2 配置：[ecosystem.config.cjs](/D:/git-projects/express-prisma-starter/ecosystem.config.cjs)
- Nginx 示例：[nginx.conf.example](/D:/git-projects/express-prisma-starter/deploy/nginx.conf.example)
- 环境变量示例：[.env.example](/D:/git-projects/express-prisma-starter/.env.example)
