# UI 设计规范

## 设计原则

**跳脱创意 × 克制约束**

- 交互可以有惊喜（微动效、过渡、粒子），但信息架构必须清晰
- 视觉可以有风格（纹理、字体），但排版必须舒适可读
- 功能可以丰富，但界面不能拥挤
- 移动端不降级核心写作体验

## 色彩系统

### 主题方案

所有颜色通过 CSS 变量定义，切换主题 = 替换变量值。

#### 「墨」— 深色护眼（默认）
```css
--bg-primary: #1a1a1a;
--bg-secondary: #242424;
--bg-editor: #1e1e1e;
--text-primary: #d4c5a9;        /* 暖米色文字 */
--text-secondary: #8a8078;
--accent: #c8966c;              /* 暖铜色强调 */
--accent-hover: #d4a87c;
--border: #333333;
--surface: #2a2a2a;
```

#### 「纸」— 浅色清爽
```css
--bg-primary: #f5f0e8;
--bg-secondary: #ede6d8;
--bg-editor: #fafaf7;
--text-primary: #2c2416;
--text-secondary: #7a7265;
--accent: #8b6f47;
--accent-hover: #a0845c;
--border: #d4cbc0;
--surface: #ffffff;
```

#### 「夜」— OLED 纯黑
```css
--bg-primary: #000000;
--bg-secondary: #0a0a0a;
--bg-editor: #000000;
--text-primary: #b8b8b8;
--text-secondary: #666666;
--accent: #6a8caf;
--accent-hover: #7da3c7;
--border: #1a1a1a;
--surface: #0d0d0d;
```

#### 「森」— 自然绿
```css
--bg-primary: #1b2d1e;
--bg-secondary: #223628;
--bg-editor: #1a2a1c;
--text-primary: #c8d6c0;
--text-secondary: #8a9a82;
--accent: #7ba870;
--accent-hover: #92c085;
--border: #2a3d2c;
--surface: #25382a;
```

### 自定义主题
用户可调整以上任意变量，存储为 JSON 到 UserPreference 表。

### 语义色
```css
--color-success: #5c9a6f;
--color-warning: #c9a44b;
--color-error: #c1554b;
--color-info: #5c8abf;
```

---

## 字体系统

### 字号阶梯

| Token | 大小 | 用途 |
|-------|------|------|
| `text-xs` | 12px | 标签、辅助信息 |
| `text-sm` | 14px | 次要文本、侧边栏 |
| `text-base` | 16px | 正文 |
| `text-lg` | 18px | 强调段落 |
| `text-xl` | 20px | 小标题 H4 |
| `text-2xl` | 24px | 标题 H3 |
| `text-3xl` | 30px | 标题 H2 |
| `text-4xl` | 36px | 标题 H1 |
| `text-5xl` | 48px | 页面大标题 |

### 编辑器字号

编辑器默认16px，用户可在14px-24px之间调整。

### 默认字体栈

```css
--font-ui: "Inter", "思源黑体", "Source Han Sans SC", -apple-system, sans-serif;
--font-editor: "思源宋体", "Source Han Serif SC", "Georgia", serif;
--font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
```

### 行高

- UI 文本：`--line-height-ui: 1.5`
- 编辑器正文：`--line-height-editor: 1.8`（适合中文长文阅读）
- 标题：`--line-height-heading: 1.3`

---

## 间距系统

采用 4px 基准栅格：

| Token | 值 | 用途 |
|-------|-----|------|
| `space-1` | 4px | 极小间距 |
| `space-2` | 8px | 元素内部 |
| `space-3` | 12px | 紧凑间距 |
| `space-4` | 16px | 默认间距 |
| `space-5` | 20px | 宽松间距 |
| `space-6` | 24px | 区块内间距 |
| `space-8` | 32px | 区块间间距 |
| `space-10` | 40px | 大区块间距 |
| `space-12` | 48px | 页面级间距 |

---

## 响应式断点

| 断点 | 宽度 | 布局 |
|------|------|------|
| `mobile` | < 768px | 单栏，侧边栏折叠，编辑器全屏 |
| `tablet` | 768-1023px | 单栏 + 可唤出侧边栏 |
| `desktop` | 1024-1439px | 双栏：侧边栏(280px) + 主内容区 |
| `wide` | >= 1440px | 三栏：侧边栏(280px) + 编辑器(自适应) + 参考面板(320px) |

### 移动端适配要点
- 编辑器工具栏折叠为悬浮快捷按钮
- 侧边栏变为底部 TabBar（5个核心入口）
- 对话框/面板改为全屏 Sheet
- 触摸目标最小 44x44px
- 长按 = 右键菜单
- 下拉刷新章节列表

---

## 组件设计规范

### 圆角
- 小元素（按钮/输入框/标签）：6px
- 卡片/面板：10px
- 模态框/对话框：14px
- 编辑器：0px（沉浸感）

### 阴影

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 25px rgba(0,0,0,0.15);
--shadow-xl: 0 20px 50px rgba(0,0,0,0.2);
```

深色主题下阴影改为亮色：
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
```

### 玻璃效果（弹窗/浮层）

```css
.glass {
  background: rgba(var(--bg-secondary-rgb), 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(var(--border-rgb), 0.5);
}
```

---

## 动效规范

### 持续时间

| 类型 | 时长 | 用途 |
|------|------|------|
| 微交互 | 150ms | 按钮悬停、hover 反馈 |
| 标准过渡 | 250ms | 页面切换、面板打开 |
| 展示动画 | 400ms | 弹窗出现、卡片展开 |
| 氛围动画 | 2000ms+ | 背景渐变、粒子 |

### 缓动函数

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
```

### 具体动效

- **页面切换**：淡入淡出 + 轻微Y轴偏移(fade + translateY 4px)
- **侧边栏**：滑入滑出
- **卡片悬停**：轻微上浮(translateY -2px) + 阴影增强
- **按钮点击**：弹跳缩放(scale 0.97 → 1.0 spring)
- **保存指示器**：绿色圆点脉冲 → 对勾
- **字数达标**：编辑器底部进度条彩色脉冲
- **加载骨架屏**：shimmer 动画
- **专注模式进入**：UI 逐层淡出(500ms)

---

## 编辑器背景系统

### 预设纹理（8种）

1. 纯色 — 跟随主题 bg-editor
2. 米色纸张 — 暖黄底+细微纤维纹理
3. 象牙纸 — 略白底+横向纹理
4. 羊皮纸 — 深米色+斑驳纹理
5. 帆布 — 粗布纹理
6. 木纹 — 浅色原木纹理
7. 石板 — 深灰石面纹理
8. 无 — 纯透明/跟随全局背景

### 渐变背景（4种预设）

1. 暖日落 — 橙→粉渐变
2. 深海 — 深蓝→墨绿渐变
3. 银河 — 深紫→深蓝渐变
4. 晨雾 — 灰白→浅蓝渐变

### 自定义上传
- 支持 JPG/PNG/WebP
- 最大 10MB
- 自动压缩到 1920px 宽
- 存储到本地/S3

---

## 环境音系统

### 内置音效

| 音效 | 子变体 | 文件 |
|------|--------|------|
| 雨声 | 小雨/大雨/雷雨 | rain-light.mp3, rain-heavy.mp3, rain-thunder.mp3 |
| 咖啡馆 | - | cafe.mp3 |
| 森林 | 昼/夜 | forest-day.mp3, forest-night.mp3 |
| 篝火 | - | campfire.mp3 |
| 白噪音 | 纯白噪声/粉红噪声 | white-noise.mp3, pink-noise.mp3 |
| 海浪 | 轻浪/大浪 | waves-gentle.mp3, waves-strong.mp3 |
| 键盘 | 机械键盘/薄膜键盘 | keyboard-mech.mp3, keyboard-membrane.mp3 |
| 钟表 | 滴答/心跳 | clock-tick.mp3, heartbeat.mp3 |

### 播放器UI
- 底部固定播放条
- 当前混音配置名称
- 多音源音量滑块（水平排列）
- 总音量控制
- 静音切换
- 预设场景选择下拉
- 展开高级面板（新增/移除音源、上传自定义音频）

### 自定义音频上传
- 支持 MP3/WAV/OGG
- 最大 30MB
- 无缝循环（自动检测或手动标记循环点）

### 场景预设
用户保存混音配置，例如：
```json
{
  "name": "雨天咖啡馆",
  "tracks": [
    { "id": "rain-light", "volume": 0.7 },
    { "id": "cafe", "volume": 0.3 }
  ]
}
```

### 番茄钟联动
- 专注时段：自动播放选定的专注场景
- 休息时段：切换为休息场景或静音
- 可配置每个阶段对应的预设
