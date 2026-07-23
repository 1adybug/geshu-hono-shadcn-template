# Agent Rules

## 通用规则

- 默认使用中文回复；用户明确指定其他语言时遵循用户要求。
- 优先遵守用户当前指令、项目现有代码风格和本规则。
- 不要修改 `node_modules`。
- 未经允许，不要启动开发服务器、构建或推送 Docker 镜像、提交或推送 Git。
- 破坏性变更前先确认；保留与当前任务无关的工作区改动。
- 修改后运行与风险相称的类型检查、静态检查和构建。

## 当前技术栈

- 服务端：Hono、`@hono/node-server`、Better Auth、Prisma、Zod。
- 客户端：Rsbuild、React 19、React Router、sdrr、TanStack Query、Tailwind CSS、shadcn/ui。
- 不得重新引入 Next.js、Server Action、Next.js API Route、`next/navigation` 或 `next/headers`。
- Hono 应用入口位于 `@/server/app.ts`，Node 监听入口位于 `@/server/index.ts`。

## Hono 业务分层

每个内部业务能力都必须建立严格同名的三层文件：

| 目录        | 职责                                           |
| :---------- | :--------------------------------------------- |
| `@/shared`  | 普通异步业务函数，不处理 Hono Context/Response |
| `@/routes`  | HTTP 方法、路径、Zod 验证、权限、限流和日志    |
| `@/apis`    | 使用 Hono RPC 导出同名浏览器客户端函数         |

- 三层 TypeScript 文件 basename 必须严格 1:1，完成修改后运行 `pnpm run check:layers`。
- Better Auth、健康检查、全局错误处理和 SPA 静态托管属于基础设施，不创建虚假的三层文件。
- 不得创建聚合动作注册表、动态动作分发或 `actions` 目录。
- `shared` 不得导入 Hono Context，也不得创建 HTTP Response。
- `routes` 使用 `honoFactory`、`zValidator`、`context.req.valid()` 与 `@/server/routeMiddleware`。
- 自定义业务路由的固定顺序为：动作元数据、Zod 验证、参数记录、限流、会话/角色过滤、操作日志、业务函数。
- 普通 JSON 动作挂载到 `/api/action/<函数名>`；文件和特殊响应使用明确的固定 URL。
- `apis` 使用 `@/utils/rpcClient` 中的 `rpcClient`、`parseApiResponse` 或 `parseBlobResponse`，不得重复封装 `fetch`。
- 浏览器代码不得运行时导入 `@/server`、Prisma或其他仅服务端模块；为保持返回类型而使用 `import type` 导入同名 `shared` 函数是允许的。

## Hono 原生能力

- 中间件使用 `createFactory<AppEnv>()`、`factory.createApp()` 和 `factory.createMiddleware()`。
- 请求上下文使用 `contextStorage()`、`getContext<AppEnv>()` 或 `tryGetContext<AppEnv>()`。
- 参数验证使用 `@hono/zod-validator`；业务参数错误使用 400。
- HTTP 错误使用 `HTTPException` 及 `@/server/httpError` 辅助函数：
  - 参数错误 400；
  - 未登录 401；
  - 无权限或 CSRF 拒绝 403；
  - 限流 429；
  - 未知异常 500。
- 原始异常放入 `HTTPException.cause`，由顶层 `app.onError` 递归记录。
- JSON 响应保留 `{ success, data?, message?, code? }` 包装，同时返回真实 HTTP 状态码。
- Excel 等二进制路由直接使用 `context.header()` 和 `context.body()`。
- IP 默认使用 `getConnInfo()` 的套接字地址；仅当配置 `TRUSTED_CLIENT_IP_HEADER` 时信任该请求头。
- 内存/Redis 限流存储保留自定义实现，Hono Core 没有等价的持久化限流实现。
- 服务端仍可使用 Hono 没有替代能力的 `deepsea-tools/getPagination`。

## 顶层中间件边界

- 生产环境启用 `compress()`。
- `etag()` 仅应用于生产 SPA 静态响应，不给动态 API 增加缓存语义。
- `csrf()` 仅应用于自定义业务路由；Better Auth、健康检查和静态资源必须排除。
- 未有明确现有行为时，不新增 CORS、访问日志、Request ID、Cache、Timeout、Body Limit 或 `secureHeaders`。

## Schema 与 RPC

- 所有外部输入必须先经过 Zod Schema 验证。
- 对象参数命名为 `params`，类型命名为函数名大驼峰加 `Params`。
- 查询日期 Schema 同时接受 `Date` 和 RPC JSON 日期字符串，并统一转换为 `Date`。
- 文件上传使用 `{ file: File }` Schema，Hono RPC 客户端使用 `form` 输入。
- 顶层应用通过连续 `.route()` 聚合子路由并导出完整 `AppType`，避免 RPC 类型退化。
- 全局错误响应使用 `ApplyGlobalResponse` 合入 `AppType`。
- 客户端统一通过公共错误适配器提示错误；401 跳转到登录页并保留来源 URL。
- JSON 返回的数据库日期由 RPC 适配器恢复为 `Date`，保持现有前端契约。

## Rsbuild SPA

- 路由由 sdrr 根据 `app` 目录生成；不要手工创建或编辑生成的 `@/components/Router.tsx`。
- `@/components/Router.tsx` 必须保持在 `.gitignore` 中。
- 保持 `app` 路由分组、鉴权边界、Providers、Toaster 与现有视觉结构。
- 全局样式放在根目录 `index.css`；字体从 CSS 引入。
- 图片和 favicon 放在 `assets` 并通过模块导入或 Rsbuild 配置引用。
- Tailwind 使用 `@rsbuild/plugin-tailwindcss`，SVG 使用 `@rsbuild/plugin-svgr`。
- 保持 `output.polyfill: "usage"`、开发 `/api` 代理、Hono Node 服务端构建和生产 SPA fallback。
- 自定义组件和页面不保留无意义的 `"use client"`。
- `shadcn/ui` 原始组件位于 `@/components/ui/**/*.tsx`；需要修改时先向用户说明原因和影响并获得确认。

## React 与样式

- 使用 React 19 函数组件和项目现有 Hooks，不引入 RSC 或 Server Actions。
- 优先复用现有组件、设计令牌和 Tailwind 工具类，避免无关视觉变化。
- 条件类名使用项目已有的 `clsx`。
- 不使用模板字符串拼接动态 Tailwind 类名；运行时动态值使用 `style` 或 CSS 变量。
- 页面只负责路由级组合；跨页面复用组件放入 `@/components`，公共工具放入 `@/utils`。
- 弹窗内容溢出时保持原有 header 和 footer 固定，只允许 body 使用 `min-h-0 overflow-y-auto` 纵向滚动。

## 验证门禁

依赖或生成配置变更后，按需执行：

1. `pnpm install`
2. `pnpm exec prisma generate`
3. sdrr 路由生成
4. `pnpm run format`
5. `pnpm run check:layers`
6. `pnpm run check:hono`
7. `pnpm run typecheck`
8. `pnpm lint --max-warnings=0`
9. `pnpm run build:client`
10. `pnpm run build:server`

不得手工修改生成文件来绕过类型检查或构建错误。
