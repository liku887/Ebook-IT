# 信息科技数字教材系统

可本地部署、可在网页中直接编辑课时内容的信息科技学科数字教材。基于 Vue 3 + Vite + Tailwind CSS 构建，覆盖小学、初中、高中三个学段，按课时组织，每课时包含**导入、学习任务1/2/3、总结**五个固定环节，支持图片、视频、动画、交互习题、知识脉络图和拓展链接。

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 18 及以上版本

### 开发预览（编辑时使用）

双击 `dev.bat`，浏览器自动打开，修改源码后实时刷新。

### 构建发布

双击 `build.bat`，完成后将 `dist` 文件夹整个拷贝到目标电脑，双击 `dist/index.html` 即可使用，无需联网。

## 两种编辑方式

### 方式一：网页内可视化编辑（推荐）

1. 打开任意课时页面，点击右上角的 **「编辑」** 按钮
2. 在编辑页面中可以：
   - 修改课时标题、项目、课时、学习目标
   - 编辑每个环节的标题和内容
   - **添加/删除/移动**学习任务和内容块
   - 支持8种内容块：文本、图片、视频、动画、Mermaid图、选择题、填空题、提示框、拓展链接
   - 选择题/填空题可通过表单可视化编辑（增删选项、设置正确答案、填写解析）
3. 点击 **「保存」** ——内容持久化保存到浏览器本地（localStorage），刷新不丢失
4. 点击 **「导出JSON」** ——下载修改后的 JSON 文件，可替换源码中的课时文件后重新 build
5. 点击 **「重置」** ——恢复为原始内容

> 侧边栏中已编辑过的课时会显示橙色圆点标记。

### 方式二：直接编辑 JSON 文件

适合批量修改或版本管理，详见下文。

## 项目结构

```
Ebook-IT/
├── dev.bat / build.bat        # 教师一键脚本
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── public/content/            # 静态资源（图片、视频等）
└── src/
    ├── main.js / App.vue
    ├── router/index.js
    ├── content/               # ★ 课时内容
    │   ├── index.json         # 教材目录（学段→单元→课时）
    │   ├── primary/           # 小学课时
    │   ├── junior/            # 初中课时
    │   └── senior/            # 高中课时
    ├── components/
    │   ├── Sidebar.vue        # 左侧目录（学段/单元折叠）
    │   ├── LessonPage.vue     # 课时页面（含编辑按钮）
    │   ├── LessonEditor.vue   # ★ 可视化编辑器
    │   ├── BlockEditor.vue    # ★ 内容块编辑器
    │   ├── SectionRenderer.vue
    │   ├── ResourcePlayer.vue
    │   ├── MermaidDiagram.vue
    │   └── exercises/
    │       ├── ChoiceExercise.vue
    │       └── FillExercise.vue
    └── views/
        ├── HomeView.vue
        └── LessonView.vue
```

## 目录结构（index.json）

```jsonc
{
  "title": "信息科技数字教材",
  "stages": [
    {
      "id": "primary",           // 学段ID
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

## 课时 JSON 结构

```jsonc
{
  "id": "唯一标识",
  "unit": "所属单元",
  "title": "课时标题",
  "project": "项目名称",
  "duration": "1课时",
  "objectives": ["目标1", "目标2"],
  "sections": {
    "intro":  { "title": "导入", "content": [ ... ] },
    "tasks": [
      { "title": "学习任务1 ...", "content": [ ... ] },
      { "title": "学习任务2 ...", "content": [ ... ] },
      { "title": "学习任务3 ...", "content": [ ... ] }
    ],
    "summary": { "title": "总结", "content": [ ... ] }
  }
}
```

### content 支持的内容块类型

| type | 说明 | 字段 |
|------|------|------|
| `text` | 文本段落 | `value` |
| `image` | 图片 | `src`, `caption` |
| `video` | 视频 | `src`, `poster`, `caption` |
| `animation` | 动画（Lottie预留） | `src` |
| `mindmap` | 知识脉络图（Mermaid） | `code` |
| `interactive` | 交互习题 | `component`, `data` |
| `tip` | 提示框 | `kind`（think/info/warn）, `value` |
| `link` | 拓展链接 | `title`, `url`, `desc` |

> 提示框的 value 中无需写「想一想：」「提示：」等前缀，系统自动添加。

## 示例课时

| 学段 | 单元 | 课时 |
|------|------|------|
| 小学 | 四年级·编码的奥秘 | 第1课 生活中的编码 |
| 小学 | 四年级·编码的奥秘 | 第2课 编码的规则与应用 |
| 初中 | 六年级·过程与控制 | 第5课 从连续量到开关量 |
| 初中 | 七年级·互联网 | 第1课 认识互联网 |
| 高中 | 高一上·Python程序设计 | 第6课 循环结构 |
| 高中 | 高一下·人工智能 | 第1课 认识人工智能 |

## 添加新课时

1. 在 `src/content/` 对应学段目录下新建 JSON 文件
2. 在 `src/content/index.json` 对应单元的 `lessons` 数组中添加条目
3. 图片/视频放入 `public/content/` 对应目录，JSON 中路径写 `./content/...`
4. 重新构建（`build.bat`）

## 技术栈

- Vue 3（`<script setup>`）、Vite 5、Vue Router 4（hash 模式）
- Tailwind CSS 3、Mermaid 10
- 纯静态站点，无后端；编辑内容通过 localStorage 持久化
