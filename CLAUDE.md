# 希陆Flow - AI 助手指引

## 项目概述

希陆Flow 是一款面向小说家的全功能写作辅助平台。Web 应用 + PWA 架构，支持 Windows 桌面端和 Android 移动端。内置 AI 辅助写作能力（Anthropic API）。

**技术栈**：React 18 + TypeScript + Vite（前端）/ Node.js + Express + TypeScript（后端）/ PostgreSQL + Prisma（数据库）/ Tailwind CSS + shadcn/ui（UI）

## 标准文件索引

所有开发相关的标准文件位于 `docs/` 目录。在执行任何开发任务前，参考对应的标准文件。

| 文件 | 用途 | 何时查阅 |
|------|------|---------|
| [docs/01-requirements.md](docs/01-requirements.md) | 功能需求规格 — 完整功能树、字段定义、优先级 | 了解某个功能模块的详细需求 |
| [docs/02-tech-stack.md](docs/02-tech-stack.md) | 技术栈与架构 — 选型、版本、部署方案 | 做技术决策、添加依赖时 |
| [docs/03-design-system.md](docs/03-design-system.md) | UI 设计规范 — 色彩、字体、间距、动画、主题 | 编写任何前端 UI 代码时 |
| [docs/04-data-model.md](docs/04-data-model.md) | 数据模型设计 — 实体关系、Prisma schema、索引策略 | 修改数据库结构、添加新实体时 |
| [docs/05-api-design.md](docs/05-api-design.md) | API 设计规范 — 命名约定、格式标准、端点定义 | 添加或修改 API 端点时 |
| [docs/06-development-plan.md](docs/06-development-plan.md) | 分阶段执行计划 — Phase、Step、里程碑、验收标准 | 了解当前开发阶段和下一步任务 |
| [docs/07-code-standards.md](docs/07-code-standards.md) | 代码规范 — 命名、文件结构、Git 提交、测试 | 编写任何代码时 |

## 工作流程

### 每次对话开始时
1. 阅读 `dev-logs/` 中最新的日志文件，了解当前开发进度和待办事项
2. 阅读 `docs/06-development-plan.md` 确认当前 Phase 和 Step
3. 根据用户需求，对照 `docs/01-requirements.md` 确认功能范围

### 执行开发任务时
1. 先对照标准文件确认规范，再开始写代码
2. 前端 UI 代码 → 先查 `docs/03-design-system.md`
3. 数据库修改 → 先查 `docs/04-data-model.md`
4. API 修改 → 先查 `docs/05-api-design.md`
5. 保持每次改动范围小且聚焦，一个 Step 完成后再进入下一个

### 每次对话结束时
1. 更新 `dev-logs/YYYY-MM-DD.md`，记录完成的事项
2. 如果完成了某个 Step，在 `docs/06-development-plan.md` 中标记进度
3. 如果有新的技术决策，更新对应的 docs 文件

## 关键原则

- **稳步推进**：一次只做一件事，不贪多。每个 Step 完成后验证，再进入下一步
- **规范先行**：写代码之前先确认规范文件。宁可多花时间对齐标准，不要快速写出需要返工的代码
- **安全第一**：所有用户输入需验证，API 端点需认证，敏感操作需二次确认
- **跨平台思维**：所有 UI 组件需考虑桌面（宽屏）和移动端（窄屏）两种布局
- **离线友好**：核心写作功能在无网络时仍可工作（PWA Service Worker）

## 项目根目录结构

```
xilu-flow/
├── CLAUDE.md                    # 本文件
├── docs/                        # 工程标准文件
├── dev-logs/                    # 每日开发日志
├── client/                      # React 前端（待创建）
└── server/                      # Express 后端（待创建）
```
