# 信息科技数字教材系统

可本地部署、可在网页中直接编辑的信息科技学科数字教材。基于 Vue 3 + Vite + Tailwind CSS 构建，覆盖小学、初中、高中三个学段共 6 课时，每课时包含**教学过程、教学资源、学生任务**三大模块，全部支持网页内可视化编辑与本地持久化保存。

## 功能概览

### 三大模块（每课时）

| 模块 | 说明 |
|------|------|
| **教学过程** | 导入 → 学习任务1/2/3 → 总结，五个固定环节；知识以醒目卡片形式嵌入对应任务中 |
| **教学资源** | 8 种资源类型：网页链接、文档、图片、视频、音频、课件、语句片段、程序示例 |
| **学生任务** | 课前任务（预习）+ 课后任务（回顾/习题），支持任意内容块和交互习题 |

三个模块通过顶部 Tab 横向滑动切换，点击「编辑」按钮时自动定位到当前所在模块的编辑页。

### 网页内可视化编辑

- **课时基本信息**：标题、项目名称、课时、学习目标
- **教学过程**：增删改学习任务和内容块，支持上下排序；知识卡片可嵌套任意内容块
- **教学资源**：增删改 8 种资源，支持上下排序；切换资源类型自动切换表单
- **学生任务**：课前/课后任务标题可改，内容块增删改排序
- **目录管理**：侧边栏单元重命名、课时删除、添加新课时（可选已有单元或新建单元）
- **教材信息**：首页标题/副标题点击可编辑
- 所有编辑保存到浏览器 localStorage，刷新不丢失；支持导出 JSON、重置为原始内容

### 内容块类型（教学过程 / 学生任务通用）

| type | 说明 | 关键字段 |
|------|------|----------|
| `text` | 文本段落 | `value` |
| `image` | 图片 | `src`, `caption` |
| `video` | 视频 | `src`, `poster`, `caption` |
| `animation` | 动画 | `src` |
| `mindmap` | Mermaid 图表 | `code` |
| `interactive` | 交互习题（选择/填空） | `component`, `data` |
| `knowledge` | 知识卡片（可嵌套内容块） | `title`, `content` |
| `code` | 代码块 | `title`, `language`, `content` |
| `tip` | 提示框 | `kind`（think/info/warn）, `value` |
| `link` | 拓展链接 | `title`, `url`, `desc` |

### 教学资源类型

| type | 说明 | 展示样式 |
|------|------|----------|
| `link` | 网页链接 | 图标卡片 + 打开链接 |
| `doc` | 文档 | 图标卡片 + 打开链接 |
| `image` | 图片 | 直接内嵌预览 |
| `video` | 视频 | 直接内嵌播放器 |
| `audio` | 音频 | 图标卡片 + 打开链接 |
| `slide` | 课件 | 图标卡片 + 打开链接 |
| `snippet` | 语句片段 | 引用样式（斜体 + 出处） |
| `code` | 程序示例 | 深色代码块 + 语言标签 |

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 18 及以上版本

### 开发预览

双击 `dev.bat`，浏览器自动打开，修改源码后实时刷新。

或命令行：

```bash
npm install
npm run dev
```

### 构建发布

双击 `build.bat`，完成后将 `dist` 文件夹整个拷贝到目标电脑，双击 `dist/index.html` 即可使用，无需联网。

或命令行：

```bash
npm run build
```

## 内置课时

| 学段 | 单元 | 课时 | ID |
|------|------|------|-----|
| 小学 | 四年级·编码的奥秘 | 第1课 生活中的编码 | `p-code-1` |
| 小学 | 四年级·编码的奥秘 | 第2课 编码的规则与应用 | `p-code-2` |
| 初中 | 六年级·过程与控制 | 第5课 从连续量到开关量 | `j-control-1` |
| 初中 | 七年级·互联网 | 第1课 认识互联网 | `j-internet-1` |
| 高中 | 高一上·Python程序设计 | 循环结构 | `s-python-loop` |
| 高中 | 高一下·人工智能 | 第1课 认识人工智能 | `s-ai-1` |

## 项目结构

```
Ebook-IT/
├── dev.bat / build.bat          # 一键脚本
├── index.html
├── package.json
├── vite.config.js                # base: './' 支持离线双击打开
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.js                   # 入口，含全局错误恢复面板
    ├── App.vue                   # 布局（侧边栏 + 主内容区）
    ├── style.css
    ├── router/index.js           # hash 模式路由
    ├── content/                  # ★ 课时内容与数据层
    │   ├── index.js              # 响应式 catalog、localStorage 持久化、CRUD
    │   ├── index.json            # 教材目录（学段→单元→课时）
    │   ├── primary/              # 小学课时 JSON
    │   ├── junior/               # 初中课时 JSON
    │   └── senior/               # 高中课时 JSON
    ├── components/
    │   ├── Sidebar.vue           # 左侧目录（学段不可改名、单元重命名、课时增删）
    │   ├── LessonPage.vue        # 教学过程展示页
    │   ├── LessonKnowledge.vue   # 教学资源展示页
    │   ├── LessonStudentTasks.vue# 学生任务展示页
    │   ├── LessonEditor.vue      # ★ 课时编辑器（三 Tab 对应三大模块）
    │   ├── BlockEditor.vue       # ★ 内容块编辑器（递归支持知识卡片嵌套）
    │   ├── SectionRenderer.vue   # 内容块渲染器
    │   ├── ResourcePlayer.vue    # 图片/视频播放器
    │   ├── MermaidDiagram.vue    # Mermaid 图表
    │   ├── AddLessonDialog.vue   # 添加课时对话框
    │   └── exercises/
    │       ├── ChoiceExercise.vue
    │       └── FillExercise.vue
    └── views/
        ├── HomeView.vue          # 首页（课时卡片列表）
        └── LessonView.vue        # 课时视图（三 Tab 滑动切换 + 编辑入口）
```

## 数据结构

### 目录（index.json）

```jsonc
{
  "title": "信息科技数字教材",
  "subtitle": "小学·初中·高中 一体化数字教材",
  "version": "0.3.1",
  "stages": [
    {
      "id": "primary",
      "title": "小学",
      "units": [
        {
          "id": "p-u1",
          "title": "四年级·编码的奥秘",
          "lessons": [
            { "id": "p-code-1", "title": "第1课 生活中的编码", "file": "primary/grade4-coding1.json" }
          ]
        }
      ]
    }
  ]
}
```

### 课时 JSON

```jsonc
{
  "id": "唯一标识",
  "unit": "所属单元",
  "title": "课时标题",
  "project": "项目名称",
  "duration": "1课时",
  "objectives": ["目标1", "目标2"],
  "sections": {
    "intro":  { "title": "导入", "content": [ /* 内容块 */ ] },
    "tasks": [
      { "title": "学习任务1", "content": [ /* 内容块，可含 knowledge 知识卡片 */ ] },
      { "title": "学习任务2", "content": [ /* 内容块 */ ] },
      { "title": "学习任务3", "content": [ /* 内容块 */ ] }
    ],
    "summary": { "title": "总结", "content": [ /* 内容块 */ ] }
  },
  "knowledge": {
    "sections": [],
    "resources": [
      { "type": "link", "title": "...", "src": "...", "desc": "..." },
      { "type": "code", "title": "...", "language": "python", "content": "..." },
      { "type": "snippet", "title": "...", "content": "...", "source": "..." }
    ]
  },
  "studentTasks": {
    "preclass":  { "title": "课前任务", "content": [ /* 内容块 */ ] },
    "postclass": { "title": "课后任务", "content": [ /* 内容块，可含交互习题 */ ] }
  }
}
```

## 持久化与数据安全

- **课时内容**：`localStorage` key 为 `ebook-lesson-{id}`
- **教材目录**：`localStorage` key 为 `ebook-catalog`
- 启动时自动校验目录数据结构，损坏数据自动清除并回退到原始版本
- 全局错误捕获：页面崩溃时显示恢复面板，可一键清除本地数据并重新加载

## 技术栈

- Vue 3（`<script setup>` 组合式 API）
- Vite 5（`base: './'`，支持离线双击 `index.html`）
- Vue Router 4（hash 模式，兼容 file:// 协议）
- Tailwind CSS 3
- Mermaid 10（流程图/思维导图）
- 纯静态站点，无后端，无网络依赖
