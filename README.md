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

复制 `.env.example` 为 `.env`，至少修改 `BETTER_AUTH_SECRET`，然后执行。Rsbuild 与 Hono 开发进程都会读取该文件：

```bash
pnpm install
pnpm run db:dev
pnpm run dev
```

`pnpm run dev` 会同时启动：

- Rsbuild SPA：`http://localhost:<CLIENT_PORT>`，默认 `http://localhost:5173`
- Hono API：`http://localhost:<SERVER_PORT>`，默认 `http://localhost:3000`

开发环境由 Rsbuild 监听并构建 Hono 服务端代码，Node.js 24 通过 `--watch` 运行构建产物；源文件变化后会自动重新构建并重启服务端。

Rsbuild 会把 `/api` 代理到当前 `SERVER_PORT`。两个端口都会去除首尾空白并校验为 `1` 到 `65535` 之间的整数；端口无效时会直接给出配置错误，`CLIENT_PORT` 被占用时也不会自动漂移到其他端口。

PowerShell 中可这样指定开发端口：

```powershell
$env:SERVER_PORT = "3100"
$env:CLIENT_PORT = "5200"
pnpm run dev
```

开发环境的 Better Auth 服务端地址和 OAuth discovery 兜底地址自动使用 `http://localhost:<SERVER_PORT>`。浏览器仍从 Rsbuild 当前站点访问 `/api`，OAuth 完成后返回当前客户端地址；生产环境继续使用显式域名配置。

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

三层文件名必须严格 1:1，使用 `pnpm run check:layers` 检查。该命令也会检查客户端代码边界：允许通过 `import type` 复用服务端类型，但禁止运行时导入 `server`、`shared`、`routes` 或 `prisma`，并禁止读取非 `PUBLIC_` 私有环境变量。Better Auth、健康检查和生产静态资源服务属于基础设施，保留在 `server/app.ts`。

JSON 接口通过统一编解码契约传输 `Date` 与 `BigInt`：服务端分别编码为带 `$geshu: "date"` 或 `$geshu: "bigint"` 标记的对象，浏览器 API 层再还原为原始类型。业务响应对象不得占用 `$geshu` 字段，也不得包含无效日期、非有限数字、循环引用或其他类实例。

项目自定义接口统一使用 `/api/<kebab-case>` 路由，路径名称由同名能力转换而来，例如 `createFirstUser` 对应
`/api/create-first-user`。文件流和表单同样保留对应的三层文件，并在各自 `routes` 文件内声明特殊 HTTP 语义。Better Auth
继续使用其协议约定的 `/api/auth/*` 路由。

## 常用命令

```bash
pnpm run dev          # 同时启动 Hono 与 Rsbuild
pnpm run typecheck    # TypeScript 检查
pnpm run check:layers # 检查三层文件对应关系和客户端代码边界
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
- `BETTER_AUTH_URL`：生产环境 Hono/Better Auth 的公开服务地址；
- `PUBLIC_BETTER_AUTH_URL`：生产环境可暴露给浏览器的认证地址，留空时使用当前站点；
- `PUBLIC_TIME_ZONE`：浏览器展示时区，默认 `Asia/Shanghai`；
- `DEFAULT_EMAIL_DOMAIN`：手机号账号生成临时邮箱时使用的域名；
- `SERVER_PORT`：本地开发 Hono 监听端口，默认 `3000`；
- `CLIENT_PORT`：本地开发 Rsbuild 监听端口，默认 `5173`；
- `PORT` / `HOSTNAME`：生产 Hono 监听端口和地址，默认 `3000` / `0.0.0.0`；
- `TRUSTED_CLIENT_IP_HEADER`：可信反向代理提供客户端 IP 的请求头；留空时使用连接远端地址。

只有 `PUBLIC_` 前缀变量可以进入浏览器构建产物，敏感配置不得使用该前缀。服务端环境变量统一从 `server/env.ts` 导出，不要放入客户端可导入的 `constants` 或 `utils`。

## Docker

```bash
docker build -t geshu-hono-shadcn-template .
docker run --rm -p 3000:3000 --env-file .env geshu-hono-shadcn-template
```

容器启动时会先执行 `prisma migrate deploy`，再以非 root 用户启动 Hono。
