# 技术栈与架构

## 技术选型

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 5.x | 构建工具 |
| React Router | 6.x | 客户端路由 |
| Tailwind CSS | 3.x | 原子化 CSS |
| shadcn/ui | latest | UI 组件库（Radix UI 基础） |
| Zustand | 4.x | 轻量状态管理 |
| TipTap | 2.x | 富文本编辑器（ProseMirror 基础） |
| React Flow | 12.x | 关系图/流程图可视化 |
| Recharts | 2.x | 图表可视化 |
| vite-plugin-pwa | latest | PWA 支持 |
| TanStack Query | 5.x | 服务端状态/缓存 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 20 LTS | 运行时 |
| Express | 4.x | HTTP 框架 |
| TypeScript | 5.x | 类型安全 |
| Prisma | 5.x | ORM |
| PostgreSQL | 16 | 数据库 |
| JWT (jsonwebtoken) | 9.x | 认证令牌 |
| bcrypt | 5.x | 密码哈希 |
| Multer | latest | 文件上传 |
| Zod | 3.x | 请求校验 |
| Anthropic SDK | latest | AI 功能 |

### 开发工具

| 技术 | 用途 |
|------|------|
| pnpm | 包管理 + monorepo |
| ESLint | 代码检查 |
| Prettier | 代码格式化 |
| Vitest | 前端单元测试 |
| Jest | 后端单元测试 |
| Supertest | API 集成测试 |
| Playwright | E2E 测试 |
| Husky | Git hooks |
| lint-staged | 暂存区检查 |

---

## 架构模式

### 前端分层

```
UI 组件层 (components/)
    ↓ 使用
状态管理层 (stores/ + TanStack Query)
    ↓ 调用
API 客户端层 (api/)
    ↓ HTTP
后端 REST API
```

- **组件层**：纯展示 + 交互，通过 hooks 获取数据和方法
- **状态层**：Zustand 管理 UI 状态（主题、侧边栏、编辑器设置），TanStack Query 管理服务端数据缓存
- **API 层**：axios 实例，统一错误处理、JWT 注入、请求/响应拦截

### 后端分层

```
路由层 (routes.ts)
    ↓ 调用
控制器层 (controller.ts) — 请求解析、响应格式化
    ↓ 调用
服务层 (service.ts) — 业务逻辑
    ↓ 调用
数据访问层 (Prisma)
    ↓ 查询
PostgreSQL
```

每个模块（auth, project, chapter, character 等）独立包含以上三层文件。

### 模块结构标准

```
server/src/modules/{moduleName}/
├── {moduleName}.controller.ts
├── {moduleName}.service.ts
├── {moduleName}.routes.ts
├── {moduleName}.schema.ts    # Zod 校验
└── {moduleName}.types.ts     # 模块类型
```

---

## 数据库选型理由

选择 PostgreSQL 而非 MongoDB：

1. **强关系型数据**：人物↔章节↔事件↔地点↔势力↔物品之间关系复杂，关系型数据库天然适合
2. **全文搜索**：PostgreSQL FTS 内置支持中文分词（zhparser 扩展），MVP 阶段不需要 Elasticsearch
3. **JSON 字段**：PostgreSQL JSONB 类型兼顾了文档型存储的灵活性（如人物性格的自由格式字段）
4. **Prisma 支持**：Prisma 对 PostgreSQL 的支持最成熟

---

## PWA 配置

### Service Worker 缓存策略

```
核心编辑器 JS/CSS    → Cache First (预缓存)
用户生成内容         → Network First (始终获取最新)
静态资源/字体/纹理   → Stale While Revalidate
上传的图片/音频      → Network First
API 响应             → Network First (离线时使用缓存兜底)
```

### Manifest 关键配置

- `display`: standalone
- `theme_color`: 跟随当前主题色
- `background_color`: #1a1a1a
- `icons`: 192x192 + 512x512
- `shortcuts`: 快速新建章节、打开今日灵感

---

## 部署架构

### 开发环境
```
localhost:5173 (Vite dev server) → proxy /api → localhost:3000 (Express)
                                                         ↓
                                              localhost:5432 (PostgreSQL)
```

### 生产环境（后续规划）
```
Nginx (静态资源 + 反向代理)
  ├─ /api/*  → Node.js 服务 (PM2 cluster)
  ├─ /assets → CDN
  └─ /*      → SPA index.html
```

---

## 第三方服务

| 服务 | 用途 | 集成方式 |
|------|------|---------|
| Anthropic API | AI 写作助手 | SDK 客户端调用 |
| 思源字体 | 默认字体 | 本地托管 / CDN |

---

## 浏览器支持

| 浏览器 | 最低版本 |
|--------|---------|
| Chrome | 90+ |
| Edge | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Chrome Android | 90+ |
