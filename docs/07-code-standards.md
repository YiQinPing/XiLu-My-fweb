# 代码规范

## TypeScript 规范

### 基本规则
- 严格模式 (`strict: true`)
- 类型优先于 interface（new 声明用 interface）
- 禁止 `any`，不可避免时加注释说明原因
- 导出的函数/组件必须有显式返回类型
- 枚举用 `const enum` 或 string union type

### 类型定义
```typescript
// ✅ 推荐：type 用于数据结构
type CharacterStatus = 'ALIVE' | 'DEAD' | 'UNDEAD';

// ✅ 推荐：interface 用于可扩展的 API
interface CharacterCreateInput {
  name: string;
  aliases?: string[];
  projectId: string;
}

// ❌ 避免
type CharacterCreateInput = any;
```

### 命名
| 类型 | 风格 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | `getCharacters`, `wordCount` |
| 组件 | PascalCase | `CharacterEditor`, `OutlineTree` |
| 类型/接口 | PascalCase | `CharacterCreateInput` |
| 常量 | UPPER_SNAKE | `MAX_CHAPTER_COUNT` |
| 文件名 | kebab-case | `character-editor.tsx` |
| 目录名 | kebab-case | `world-building/` |
| 数据库列 | camelCase | `createdAt`, `projectId` |
| Prisma 模型 | PascalCase | `Character`, `TimelineEvent` |

---

## React 组件规范

### 组件结构
```typescript
// 1. 导入
import { useState } from 'react';
import { useCharacters } from '@/hooks/use-characters';

// 2. 类型定义
type CharacterListProps = {
  projectId: string;
  onSelect: (id: string) => void;
};

// 3. 组件
export function CharacterList({ projectId, onSelect }: CharacterListProps) {
  // hooks
  const { data, isLoading } = useCharacters(projectId);

  // early return
  if (isLoading) return <CharacterListSkeleton />;

  // render
  return (
    <div className="space-y-2">
      {data?.map(char => (
        <CharacterCard key={char.id} character={char} onClick={onSelect} />
      ))}
    </div>
  );
}
```

### 组件拆分规则
- 一个组件不超过 200 行
- 超过 3 个 useState → 考虑 useReducer 或 Zustand
- 超过 3 个 props 的函数 → 考虑提取为组件或 hook
- 复用的逻辑 → 提取到 hooks/
- 复用的 UI 片段 → 提取到 components/shared/

### 状态管理分工
| 状态类型 | 工具 | 示例 |
|---------|------|------|
| 服务端数据 | TanStack Query | 人物列表、章节内容 |
| 全局 UI 状态 | Zustand | 主题、侧边栏折叠 |
| 表单状态 | React Hook Form | 人物创建表单 |
| 局部 UI 状态 | useState | 弹窗开合、选项卡切换 |
| URL 状态 | React Router searchParams | 搜索关键词、当前页码 |

---

## 文件/目录规范

### 前端
```
src/features/{module}/
├── components/           # 模块专用组件
│   ├── {Feature}List.tsx
│   ├── {Feature}Detail.tsx
│   ├── {Feature}Form.tsx
│   └── {Feature}Card.tsx
├── hooks/                # 模块专用 hooks
│   └── use{Feature}.ts
├── {module}.routes.tsx   # 路由定义
└── {module}.types.ts     # 仅模块内部使用的类型
```

### 后端
```
server/src/modules/{module}/
├── {module}.controller.ts
├── {module}.service.ts
├── {module}.routes.ts
├── {module}.schema.ts    # Zod 校验
└── {module}.types.ts
```

### 禁止事项
- 禁止循环导入
- 禁止深层嵌套（>4 层目录）
- 禁止 `../../../` 深层相对路径 → 用路径别名 `@/`
- 组件文件禁止在同一个文件内定义多个导出组件

---

## CSS / Tailwind 规范

### 优先级
1. Tailwind 原子类（首选）
2. CSS Module（组件特有复杂样式）
3. 全局 CSS（主题变量、基础重置、动画定义）

### 类名顺序
```
布局 (flex, grid, position) → 尺寸 (w, h) → 间距 (p, m, gap) → 
外观 (bg, border, rounded) → 文字 (text, font) → 效果 (shadow, opacity)
```

### 编辑器样式
编辑器内部样式通过 TipTap 的 `editorProps.attributes.class` 注入，不依赖全局 CSS。

---

## Git 提交规范

### Conventional Commits
```
<type>(<scope>): <description>

[optional body]
```

### Type 定义
| Type | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 重构（不改变功能） |
| `style` | 样式/CSS 修改 |
| `docs` | 文档修改 |
| `chore` | 杂务（依赖更新、配置修改） |
| `test` | 测试相关 |
| `perf` | 性能优化 |

### Scope
- `client` — 前端
- `server` — 后端
- `shared` — 共享类型/工具
- 或具体模块名：`editor`, `character`, `timeline`, `ai`, `auth`

### 示例
```
feat(editor): add typewriter scroll mode
fix(character): resolve age calculation for custom calendars
docs(client): add component structure guidelines
```

### 分支命名
```
feat/editor-typewriter-scroll
fix/character-age-calculation
refactor/api-error-handling
```

---

## 测试规范

### 测试策略
```
单元测试 (Vitest/Jest)     — 工具函数、hooks、service 业务逻辑
组件测试 (React Testing Library) — 关键组件交互
API 集成测试 (Supertest)   — 端点行为
E2E 测试 (Playwright)      — 关键用户流程
```

### 命名
```typescript
describe('CharacterService', () => {
  describe('createCharacter', () => {
    it('should create a character with valid input', async () => {});
    it('should throw ValidationError when name is empty', async () => {});
    it('should throw ForbiddenError when project does not belong to user', async () => {});
  });
});
```

### 覆盖率目标
- Phase 1: 后端核心 service 层 > 80%
- Phase 2+: 逐步增加组件测试
- E2E: 每个 Phase 完成后的关键流程覆盖

---

## Code Review 清单

- [ ] 是否符合 docs/ 中的设计规范和 API 规范
- [ ] 是否有 TypeScript `any`
- [ ] 是否有未处理的错误状态（loading/empty/error）
- [ ] API 端点是否有认证和归属检查
- [ ] 数据库查询是否使用 Prisma 参数化（防 SQL 注入）
- [ ] 用户输入是否经过 Zod 校验
- [ ] 前端是否有适当的加载骨架屏和空状态提示
- [ ] 移动端布局是否正常
- [ ] 是否有不必要的依赖引入
- [ ] 提交信息是否符合 Conventional Commits
