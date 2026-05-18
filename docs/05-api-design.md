# API 设计规范

## 通用约定

### 基础路径
```
/api/v1
```

### 请求格式
- Content-Type: `application/json`
- 认证：`Authorization: Bearer <token>`
- 语言偏好：`Accept-Language: zh-CN`

### 响应格式

#### 成功
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### 错误
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数无效",
    "details": [
      { "field": "title", "message": "标题不能为空" }
    ]
  }
}
```

### HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 204 | 删除成功（无响应体） |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 冲突（重复资源） |
| 422 | 校验失败 |
| 429 | 限流 |
| 500 | 服务器内部错误 |

### 错误码

| Code | 说明 |
|------|------|
| `VALIDATION_ERROR` | Zod 校验失败 |
| `AUTH_REQUIRED` | 需要登录 |
| `AUTH_EXPIRED` | Token 过期 |
| `FORBIDDEN` | 无权访问该资源 |
| `NOT_FOUND` | 资源不存在 |
| `DUPLICATE_ENTRY` | 唯一约束冲突 |
| `RATE_LIMITED` | 请求过于频繁 |
| `INTERNAL_ERROR` | 服务器错误 |

---

## 分页/排序/筛选规范

### 分页
```
GET /api/v1/projects/:projectId/characters?page=1&pageSize=20
```

Query 参数：
- `page`: 页码（从1开始，默认1）
- `pageSize`: 每页数量（默认20，最大100）

### 排序
```
GET /api/v1/projects/:projectId/characters?sortBy=name&sortOrder=asc
```

### 筛选
```
GET /api/v1/projects/:projectId/characters?status=ALIVE&tags=fantasy,protagonist
```

多值筛选用逗号分隔（OR逻辑），多字段筛选用 AND 逻辑。

---

## 认证 API

### POST /api/v1/auth/register
```json
// Request
{ "email": "writer@example.com", "password": "securepass123", "displayName": "作家" }

// Response 201
{ "success": true, "data": { "user": { "id", "email", "displayName" }, "token": "jwt..." } }
```

### POST /api/v1/auth/login
```json
// Request
{ "email": "writer@example.com", "password": "securepass123" }

// Response 200
{ "success": true, "data": { "user": { "id", "email", "displayName" }, "token": "jwt..." } }
```

### GET /api/v1/auth/me
```
// Response 200 — 获取当前用户信息
```

### PUT /api/v1/auth/password
```json
// Request
{ "currentPassword": "...", "newPassword": "..." }
```

---

## 作品 API

### POST /api/v1/projects
创建作品

### GET /api/v1/projects
用户的所有作品列表（支持分页/归档筛选）

### GET /api/v1/projects/:projectId
作品详情 + 仪表盘数据

### PUT /api/v1/projects/:projectId
更新作品信息

### DELETE /api/v1/projects/:projectId
软删除（归档）

---

## 卷/章节 API

### POST /api/v1/projects/:projectId/volumes

### GET /api/v1/projects/:projectId/volumes
返回层级树：volumes > chapters（简要信息）

### PUT /api/v1/projects/:projectId/volumes/:volumeId

### DELETE /api/v1/projects/:projectId/volumes/:volumeId

### PUT /api/v1/projects/:projectId/volumes/reorder
```json
{ "volumeIds": ["id1", "id3", "id2"] }
```

### POST /api/v1/projects/:projectId/volumes/:volumeId/chapters

### GET /api/v1/projects/:projectId/volumes/:volumeId/chapters/:chapterId
返回章节完整数据（内容、场景、注释、关联大纲等）

### PUT /api/v1/projects/:projectId/volumes/:volumeId/chapters/:chapterId
更新章节元数据

### PUT /api/v1/projects/:projectId/volumes/:volumeId/chapters/:chapterId/content
更新章节正文内容（主更新入口）

### PUT /api/v1/projects/:projectId/volumes/:volumeId/chapters/reorder

### DELETE /api/v1/projects/:projectId/volumes/:volumeId/chapters/:chapterId

### GET /api/v1/projects/:projectId/volumes/:volumeId/chapters/:chapterId/drafts
获取章节快照列表

### POST /api/v1/projects/:projectId/volumes/:volumeId/chapters/:chapterId/drafts
手动创建快照

### GET /api/v1/projects/:projectId/volumes/:volumeId/chapters/:chapterId/drafts/:draftId/diff
对比两个版本（query: ?compareWith=draftId）

---

## 场景 API

### POST /api/v1/projects/:projectId/chapters/:chapterId/scenes

### PUT /api/v1/projects/:projectId/chapters/:chapterId/scenes/:sceneId

### DELETE /api/v1/projects/:projectId/chapters/:chapterId/scenes/:sceneId

### PUT /api/v1/projects/:projectId/chapters/:chapterId/scenes/reorder

### POST /api/v1/projects/:projectId/chapters/:chapterId/scenes/:sceneId/participants
```json
{ "characterId": "...", "role": "MAJOR" }
```

---

## 人物 API

### POST /api/v1/projects/:projectId/characters

### GET /api/v1/projects/:projectId/characters
列表（分页/排序/筛选）

### GET /api/v1/projects/:projectId/characters/:characterId
完整人物详情（含技能、目标、关系摘要）

### PUT /api/v1/projects/:projectId/characters/:characterId

### DELETE /api/v1/projects/:projectId/characters/:characterId

### GET /api/v1/projects/:projectId/characters/:characterId/appearances
角色出场记录（场景列表）

### GET /api/v1/projects/:projectId/characters/:characterId/relationships
角色所有关系

### POST /api/v1/projects/:projectId/characters/:characterId/relationships
创建关系

### PUT /api/v1/projects/:projectId/characters/relationships/:relId

---

## 人物关系 API

### POST /api/v1/projects/:projectId/relationships
```json
{ "characterAId": "...", "characterBId": "...", "type": "FRIEND", "intensity": 7 }
```

### GET /api/v1/projects/:projectId/relationships/graph
返回关系图数据（节点+边）

### GET /api/v1/projects/:projectId/relationships/graph/export
导出图片（query: ?format=png|svg）

---

## 世界观 API

### 地点

```
POST   /api/v1/projects/:projectId/locations
GET    /api/v1/projects/:projectId/locations          # 列表/树
GET    /api/v1/projects/:projectId/locations/:locId   # 详情
PUT    /api/v1/projects/:projectId/locations/:locId
DELETE /api/v1/projects/:projectId/locations/:locId
```

### 势力组织
```
POST   /api/v1/projects/:projectId/factions
GET    /api/v1/projects/:projectId/factions
GET    /api/v1/projects/:projectId/factions/:factionId
PUT    /api/v1/projects/:projectId/factions/:factionId
DELETE /api/v1/projects/:projectId/factions/:factionId
POST   /api/v1/projects/:projectId/factions/:factionId/members   # 添加成员
DELETE /api/v1/projects/:projectId/factions/:factionId/members/:charId
PUT    /api/v1/projects/:projectId/factions/:factionId/members/:charId
```

### 物品
```
POST   /api/v1/projects/:projectId/items
GET    /api/v1/projects/:projectId/items
GET    /api/v1/projects/:projectId/items/:itemId
PUT    /api/v1/projects/:projectId/items/:itemId
DELETE /api/v1/projects/:projectId/items/:itemId
PUT    /api/v1/projects/:projectId/items/:itemId/owner   # 更改归属
```

---

## 时间线 API

### POST /api/v1/projects/:projectId/timelines
### GET /api/v1/projects/:projectId/timelines
### GET /api/v1/projects/:projectId/timelines/:timelineId
### PUT /api/v1/projects/:projectId/timelines/:timelineId
### DELETE /api/v1/projects/:projectId/timelines/:timelineId

### POST /api/v1/projects/:projectId/timelines/:timelineId/events
### GET /api/v1/projects/:projectId/timelines/:timelineId/events
返回排序后的事件列表（解析绝对/相对/模糊日期）
### PUT /api/v1/projects/:projectId/timelines/:timelineId/events/:eventId
### DELETE /api/v1/projects/:projectId/timelines/:timelineId/events/:eventId

### GET /api/v1/projects/:projectId/timelines/events/ages?characterId=xxx
计算角色在各事件点的年龄

---

## 伏笔 API

### POST /api/v1/projects/:projectId/foreshadowings
### GET /api/v1/projects/:projectId/foreshadowings
### GET /api/v1/projects/:projectId/foreshadowings/:fid
### PUT /api/v1/projects/:projectId/foreshadowings/:fid
### DELETE /api/v1/projects/:projectId/foreshadowings/:fid

### GET /api/v1/projects/:projectId/foreshadowings/checklist
返回所有未回收的伏笔，按重要性和范围排序

### GET /api/v1/projects/:projectId/foreshadowings/graph
伏笔网络图数据

---

## 灵感 API

### POST /api/v1/projects/:projectId/inspirations
### GET /api/v1/projects/:projectId/inspirations
### GET /api/v1/projects/:projectId/inspirations/:iid
### PUT /api/v1/projects/:projectId/inspirations/:iid
### DELETE /api/v1/projects/:projectId/inspirations/:iid

### POST /api/v1/projects/:projectId/inspirations/:iid/promote
```json
{ "targetType": "character", "prefill": { "name": "名字" } }
```
返回新创建实体

### GET /api/v1/projects/:projectId/inspirations/generate
随机灵感（可选 query: ?module=plot&count=3）

---

## 大纲 API

### POST /api/v1/projects/:projectId/outline-beats
### GET /api/v1/projects/:projectId/outline-beats
返回层级树
### PUT /api/v1/projects/:projectId/outline-beats/:beatId
### DELETE /api/v1/projects/:projectId/outline-beats/:beatId
### PUT /api/v1/projects/:projectId/outline-beats/reorder

### GET /api/v1/projects/:projectId/outline-beats/templates
可用的故事结构模板列表

---

## 每日数据 API

### GET /api/v1/projects/:projectId/stats/daily?from=2026-01-01&to=2026-12-31
每日统计数据

### GET /api/v1/projects/:projectId/stats/summary
摘要：总字数、总时长、当前连续天数、总章节数

### POST /api/v1/projects/:projectId/stats/sessions
开始写作会话
### PUT /api/v1/projects/:projectId/stats/sessions/:sessionId
结束会话（记录结束时间和字数）

### GET /api/v1/projects/:projectId/stats/goals
当前目标列表
### POST /api/v1/projects/:projectId/stats/goals
### PUT /api/v1/projects/:projectId/stats/goals/:goalId
### DELETE /api/v1/projects/:projectId/stats/goals/:goalId

### GET /api/v1/projects/:projectId/stats/report?type=weekly
生成报告

---

## AI API

### POST /api/v1/projects/:projectId/ai/brainstorm
```json
{ "context": "主角被困在密室中", "type": "what-next", "constraints": ["不使用魔法"] }
```
返回建议列表（流式或非流式）

### POST /api/v1/projects/:projectId/ai/continuity-check
```json
{ "scope": "chapter", "entityId": "chapter-uuid" }
```
返回不一致项列表

### POST /api/v1/projects/:projectId/ai/style-assist
```json
{ "content": "他很生气地走进房间。", "instruction": "Show don't tell" }
```
返回改写结果

### POST /api/v1/projects/:projectId/ai/summarize
```json
{ "target": "chapter", "entityId": "chapter-uuid", "style": "brief" }
```

---

## 搜索 API

### GET /api/v1/projects/:projectId/search?q=关键词&types=character,chapter,location&page=1
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "entityType": "character",
        "entityId": "...",
        "title": "张三",
        "excerpt": "张三是一名...",
        "highlight": "张三是一名来自<mark>北方</mark>的剑客",
        "score": 0.95
      }
    ]
  },
  "meta": { "total": 5 }
}
```

---

## 文件上传 API

### POST /api/v1/upload/image
- multipart/form-data
- 格式限制：JPG/PNG/WebP
- 最大 10MB
- 返回 URL

### POST /api/v1/upload/audio
- multipart/form-data
- 格式限制：MP3/WAV/OGG
- 最大 30MB
- 返回 URL + 时长

---

## 用户偏好 API

### GET /api/v1/preferences
返回所有用户偏好（主题、编辑器设置、音频预设等）

### PUT /api/v1/preferences/:key
```json
{ "value": { ... } }
```
更新单个偏好设置

---

## 认证与鉴权

### JWT 结构
```json
{
  "sub": "user-uuid",
  "email": "writer@example.com",
  "iat": 1700000000,
  "exp": 1700086400
}
```

- Token 有效期：24小时
- 刷新策略：每次验证通过自动延长（如剩余时间 < 12小时则签发新token，在响应头 `X-New-Token` 中返回）
- 所有 API 端点（除 `/auth/*` 外）需要 JWT 鉴权
- 资源归属检查：所有带 `:projectId` 的端点需验证该 project 属于当前用户

### 中间件链路
```
Request
  → cors()
  → rateLimiter()
  → authenticate()      // JWT 验证
  → authorizeProject()   // 项目归属检查（如涉及）
  → validate(schema)     // Zod 校验
  → controller
```

### 限流策略
- 全局：100 请求/分钟
- `/auth/*`：10 请求/分钟（防暴力破解）
- `/ai/*`：20 请求/分钟（API 成本控制）
- 文件上传：30 请求/小时
