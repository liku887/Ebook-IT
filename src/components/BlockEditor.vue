<script setup>
import { computed } from 'vue'

const props = defineProps({
  block: { type: Object, required: true },
  index: { type: Number, required: true }
})
const emit = defineEmits(['remove', 'moveUp', 'moveDown', 'change'])

// 知识卡片内部内容块操作
function addInnerBlock() {
  if (!props.block.content) props.block.content = []
  props.block.content.push({ type: 'text', value: '' })
  emitChange()
}
function removeInnerBlock(i) {
  props.block.content.splice(i, 1)
  emitChange()
}
function moveInnerBlock(i, dir) {
  const j = i + dir
  if (j < 0 || j >= props.block.content.length) return
  const tmp = props.block.content[i]
  props.block.content[i] = props.block.content[j]
  props.block.content[j] = tmp
  emitChange()
}
// 内部块变更时通知父级（通过触发自定义事件，父级监听 @change）
function emitChange() {
  emit('change')
}

const blockTypes = [
  { value: 'text', label: '文本段落' },
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'animation', label: '动画' },
  { value: 'mindmap', label: '知识脉络图(Mermaid)' },
  { value: 'interactive', label: '交互习题' },
  { value: 'knowledge', label: '知识卡片' },
  { value: 'code', label: '代码块' },
  { value: 'tip', label: '提示框' },
  { value: 'link', label: '拓展链接' }
]

const tipKinds = [
  { value: 'think', label: '想一想' },
  { value: 'info', label: '提示' },
  { value: 'warn', label: '注意' }
]

const exerciseComponents = [
  { value: 'ChoiceExercise', label: '选择题' },
  { value: 'FillExercise', label: '填空题' }
]

// 当切换 block 类型时，补全该类型的默认字段
function onTypeChange(newType) {
  const defaults = {
    text: { value: '' },
    image: { src: '', caption: '' },
    video: { src: '', poster: '', caption: '' },
    animation: { src: '' },
    mindmap: { code: 'flowchart TD\n    A[开始] --> B[结束]' },
    interactive: { component: 'ChoiceExercise', data: { question: '', options: ['', '', '', ''], answer: 0, explanation: '' } },
    knowledge: { title: '知识要点', content: [{ type: 'text', value: '' }] },
    code: { title: '', language: 'python', content: '' },
    tip: { kind: 'think', value: '' },
    link: { title: '', url: '', desc: '' }
  }
  Object.keys(props.block).forEach((k) => delete props.block[k])
  Object.assign(props.block, { type: newType, ...defaults[newType] })
}

// 选择题选项编辑
function addOption() {
  props.block.data.options.push('')
}
function removeOption(i) {
  props.block.data.options.splice(i, 1)
  if (props.block.data.answer >= props.block.data.options.length) {
    props.block.data.answer = props.block.data.options.length - 1
  }
}

// 交互习题 data 的 JSON 文本（用于高级编辑）
const dataJson = computed({
  get() {
    try {
      return JSON.stringify(props.block.data, null, 2)
    } catch {
      return '{}'
    }
  },
  set(val) {
    try {
      const parsed = JSON.parse(val)
      Object.keys(props.block.data).forEach((k) => delete props.block.data[k])
      Object.assign(props.block.data, parsed)
    } catch {
      // 解析失败时忽略，用户正在输入
    }
  }
})
</script>

<template>
  <div class="border border-slate-200 rounded-lg p-3 bg-slate-50">
    <!-- 块头部：类型选择 + 操作按钮 -->
    <div class="flex items-center gap-2 mb-3">
      <span class="text-xs text-slate-400 w-6">#{{ index + 1 }}</span>
      <select
        :value="block.type"
        @change="onTypeChange($event.target.value)"
        class="text-sm border border-slate-300 rounded px-2 py-1 bg-white"
      >
        <option v-for="t in blockTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
      <div class="flex-1"></div>
      <button @click="emit('moveUp')" class="text-slate-400 hover:text-slate-600 p-1" title="上移">↑</button>
      <button @click="emit('moveDown')" class="text-slate-400 hover:text-slate-600 p-1" title="下移">↓</button>
      <button @click="emit('remove')" class="text-red-400 hover:text-red-600 p-1" title="删除">✕</button>
    </div>

    <!-- 文本 -->
    <div v-if="block.type === 'text'">
      <textarea v-model="block.value" rows="3" placeholder="输入段落文本..."
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white font-mono"></textarea>
    </div>

    <!-- 图片 -->
    <div v-else-if="block.type === 'image'" class="space-y-2">
      <input v-model="block.src" placeholder="图片路径，如 ./content/unit1/assets/pic.png"
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
      <input v-model="block.caption" placeholder="图注（可选）"
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
    </div>

    <!-- 视频 -->
    <div v-else-if="block.type === 'video'" class="space-y-2">
      <input v-model="block.src" placeholder="视频路径，如 ./content/unit1/assets/video.mp4"
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
      <input v-model="block.poster" placeholder="封面图路径（可选）"
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
      <input v-model="block.caption" placeholder="视频说明（可选）"
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
    </div>

    <!-- 动画 -->
    <div v-else-if="block.type === 'animation'">
      <input v-model="block.src" placeholder="动画资源路径"
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
    </div>

    <!-- Mermaid -->
    <div v-else-if="block.type === 'mindmap'">
      <textarea v-model="block.code" rows="6" placeholder="Mermaid 语法，如 flowchart TD..."
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white font-mono"></textarea>
      <p class="text-xs text-slate-400 mt-1">支持 flowchart、mindmap、sequenceDiagram 等 Mermaid 语法</p>
    </div>

    <!-- 交互习题 -->
    <div v-else-if="block.type === 'interactive'" class="space-y-2">
      <select v-model="block.component"
        class="text-sm border border-slate-300 rounded px-2 py-1 bg-white">
        <option v-for="c in exerciseComponents" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>

      <!-- 选择题表单 -->
      <div v-if="block.component === 'ChoiceExercise'" class="space-y-2 pl-2 border-l-2 border-blue-200">
        <input v-model="block.data.question" placeholder="题干"
          class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
        <div v-for="(opt, i) in block.data.options" :key="i" class="flex items-center gap-2">
          <input type="radio" :checked="block.data.answer === i" @change="block.data.answer = i" title="设为正确答案" />
          <input v-model="block.data.options[i]" :placeholder="'选项 ' + String.fromCharCode(65 + i)"
            class="flex-1 text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
          <button @click="removeOption(i)" class="text-red-400 hover:text-red-600 text-sm">删除</button>
        </div>
        <button @click="addOption" class="text-xs text-blue-600 hover:text-blue-800">+ 添加选项</button>
        <input v-model="block.data.explanation" placeholder="解析（可选）"
          class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
      </div>

      <!-- 填空题表单 -->
      <div v-else-if="block.component === 'FillExercise'" class="space-y-2 pl-2 border-l-2 border-purple-200">
        <textarea v-model="block.data.question" rows="2" placeholder="题干，用 ____ 表示空位"
          class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"></textarea>
        <div v-for="(ans, i) in block.data.answers" :key="i" class="flex items-center gap-2">
          <span class="text-xs text-slate-500 w-12">答案{{ i + 1 }}</span>
          <input v-model="block.data.answers[i]" placeholder="参考答案"
            class="flex-1 text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
          <button @click="block.data.answers.splice(i, 1)" class="text-red-400 hover:text-red-600 text-sm">删除</button>
        </div>
        <button @click="block.data.answers.push('')" class="text-xs text-purple-600 hover:text-purple-800">+ 添加答案</button>
        <input v-model="block.data.explanation" placeholder="解析（可选）"
          class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
      </div>

      <!-- 高级：原始 JSON -->
      <details class="mt-2">
        <summary class="text-xs text-slate-400 cursor-pointer hover:text-slate-600">高级：直接编辑 data JSON</summary>
        <textarea v-model="dataJson" rows="6"
          class="w-full mt-1 text-xs border border-slate-300 rounded px-2 py-1 bg-white font-mono"></textarea>
      </details>
    </div>

    <!-- 知识卡片 -->
    <div v-else-if="block.type === 'knowledge'" class="space-y-2">
      <input v-model="block.title" placeholder="知识卡片标题，如：知识要点、核心概念"
        class="w-full text-sm font-medium border border-indigo-300 rounded px-3 py-2 bg-indigo-50/50"
        @input="emitChange" />
      <div class="pl-2 border-l-2 border-indigo-200 space-y-2">
        <BlockEditor
          v-for="(inner, ii) in (block.content || [])"
          :key="ii"
          :block="inner"
          :index="ii"
          @remove="removeInnerBlock(ii)"
          @move-up="moveInnerBlock(ii, -1)"
          @move-down="moveInnerBlock(ii, 1)"
          @change="emitChange"
        />
      </div>
      <button @click="addInnerBlock"
        class="text-xs text-indigo-600 hover:text-indigo-800">+ 添加知识内容块</button>
    </div>

    <!-- 代码块 -->
    <div v-else-if="block.type === 'code'" class="space-y-2">
      <div class="flex gap-2">
        <input v-model="block.title" placeholder="标题（可选）"
          class="flex-1 text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
        <select v-model="block.language"
          class="text-sm border border-slate-300 rounded px-2 py-2 bg-white">
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="cpp">C/C++</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="sql">SQL</option>
          <option value="bash">Shell</option>
          <option value="text">纯文本</option>
        </select>
      </div>
      <textarea v-model="block.content" rows="6" placeholder="输入代码..."
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-slate-900 text-green-400 font-mono"></textarea>
    </div>

    <!-- 提示框 -->
    <div v-else-if="block.type === 'tip'" class="space-y-2">
      <select v-model="block.kind"
        class="text-sm border border-slate-300 rounded px-2 py-1 bg-white">
        <option v-for="k in tipKinds" :key="k.value" :value="k.value">{{ k.label }}</option>
      </select>
      <textarea v-model="block.value" rows="2" placeholder="提示内容（无需写想一想/提示等前缀，系统自动添加）"
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"></textarea>
    </div>

    <!-- 拓展链接 -->
    <div v-else-if="block.type === 'link'" class="space-y-2">
      <input v-model="block.title" placeholder="链接标题"
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
      <input v-model="block.url" placeholder="链接 URL"
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
      <input v-model="block.desc" placeholder="链接描述（可选）"
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white" />
    </div>
  </div>
</template>
