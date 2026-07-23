# geshu-hono-shadcn-template

格数科技的 Hono + Rsbuild + React SPA 项目模板，由 `geshu-next-shadcn-template` 迁移而来。

## 技术栈

- Hono + `@hono/node-server`：API、Better Auth 和生产静态资源服务
- Rsbuild + React 19：SPA 开发与生产构建
- sdrr + React Router：按 `app` 目录生成路由
- TanStack Query / Form / Table
- Prisma + SQLite
- Tailwind CSS v4 + shadcn/ui

## 创建项目

```bash
git clone https://github.com/1adybug/geshu-hono-shadcn-template.git my-new-project
cd my-new-project
git remote rename origin template
git remote set-url --push template no_push://template
pnpm install
```

当前迁移仓库仍以 Next.js 模板作为上游：

```text
template  https://github.com/1adybug/geshu-next-shadcn-template.git (fetch)
template  no_push://template (push)
```

## 本地开发

复制 `.env.example` 为 `.env`，至少修改 `BETTER_AUTH_SECRET`，然后执行：

```bash
pnpm install
pnpm run db:dev
pnpm run dev
```

`pnpm run dev` 会同时启动：

- Rsbuild SPA：`http://localhost:5173`
- Hono API：`http://localhost:3000`

开发服务器会把 `/api` 代理到 Hono。

## 路由

页面继续放在 `app` 目录。sdrr 根据 `page.tsx`、`layout.tsx`、`error.tsx` 和 `not-found.tsx` 生成 `components/Router.tsx`。

新增或移动页面后执行：

```bash
pnpm exec sdrr build
```

`components/Router.tsx` 是生成文件，不要手工编辑。

## 服务端调用

业务能力使用严格同名的三层结构：

1. `shared/<name>.ts`：普通异步业务函数；
2. `routes/<name>.ts`：Hono 方法、Zod 校验、权限、限流和响应；
3. `apis/<name>.ts`：基于 Hono RPC 的同名浏览器函数；
4. 需要时在 `hooks` 中通过 TanStack Query 使用 API 函数。

三层文件名必须严格 1:1，使用 `pnpm run check:layers` 检查。Better Auth、健康检查和生产静态资源服务属于基础设施，保留在 `server/app.ts`。

普通 JSON 动作使用显式 `/api/action/<name>` 路由；文件流和表单同样保留对应的三层文件，并在各自 `routes` 文件内声明特殊 HTTP 语义。

## 常用命令

```bash
pnpm run dev          # 同时启动 Hono 与 Rsbuild
pnpm run typecheck    # TypeScript 检查
pnpm run check:layers # 检查 shared/routes/apis 文件对应关系
pnpm run check:hono   # 验证 Hono 状态码、CSRF、RPC 下载与生产静态能力
pnpm run lint         # ESLint
pnpm run format       # Prettier
pnpm run build        # 构建 SPA 与 Hono 服务
pnpm run start        # 启动生产构建
pnpm run migrate      # 创建开发迁移
pnpm run db:dev       # 应用开发数据库迁移
pnpm run db:prod      # 应用生产数据库迁移
```

生产构建产物：

- `dist/client`：SPA 静态资源
- `dist/server/index.mjs`：Hono Node 服务入口

## 环境变量

完整示例见 `.env.example`。其中：

- `BETTER_AUTH_SECRET`：生产环境必填；
- `BETTER_AUTH_URL`：Hono/Better Auth 的公开服务地址；
- `PUBLIC_BETTER_AUTH_URL`：可暴露给浏览器的认证地址，留空时使用当前站点；
- `PUBLIC_TIME_ZONE`：浏览器展示时区，默认 `Asia/Shanghai`；
- `DEFAULT_EMAIL_DOMAIN`：手机号账号生成临时邮箱时使用的域名；
- `PORT` / `HOSTNAME`：Hono 监听端口和地址，默认 `3000` / `0.0.0.0`。
- `TRUSTED_CLIENT_IP_HEADER`：可信反向代理提供客户端 IP 的请求头；留空时使用连接远端地址。

只有 `PUBLIC_` 前缀变量可以进入浏览器构建产物，敏感配置不得使用该前缀。

## Docker

```bash
docker build -t geshu-hono-shadcn-template .
docker run --rm -p 3000:3000 --env-file .env geshu-hono-shadcn-template
```

容器启动时会先执行 `prisma migrate deploy`，再以非 root 用户启动 Hono。
