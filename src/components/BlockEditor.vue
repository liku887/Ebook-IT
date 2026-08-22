<script setup>
import { computed, ref } from 'vue'
import { isAiReady } from '../composables/useAi'
import AiGenerateModal from './AiGenerateModal.vue'

const props = defineProps({
  block: { type: Object, required: true },
  index: { type: Number, required: true },
  context: { type: String, default: '' }
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

// ===== AI 生成 =====
const aiModal = ref({ show: false, mode: 'text' })

function openAi(mode) {
  aiModal.value = { show: true, mode }
}

function onAiApply(result) {
  if (aiModal.value.mode === 'text') {
    props.block.value = result
  } else if (aiModal.value.mode === 'code') {
    props.block.content = result
  } else if (aiModal.value.mode === 'choice' || aiModal.value.mode === 'fill') {
    // 用生成的习题数据替换
    if (result.question) props.block.data.question = result.question
    if (result.options) {
      props.block.data.options = result.options
      props.block.data.answer = result.answer ?? 0
    }
    if (result.answers) props.block.data.answers = result.answers
    if (result.explanation !== undefined) props.block.data.explanation = result.explanation
  }
  emitChange()
}
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
    <div v-if="block.type === 'text'" class="relative">
      <textarea v-model="block.value" rows="3" placeholder="输入段落文本..."
        class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white font-mono pr-10"></textarea>
      <button v-if="isAiReady()" @click="openAi('text')"
        class="absolute top-2 right-2 w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-sm"
        title="AI 生成文本">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      </button>
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
        <div class="relative">
          <input v-model="block.data.question" placeholder="题干"
            class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white pr-10" />
          <button v-if="isAiReady()" @click="openAi('choice')"
            class="absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-sm"
            title="AI 生成选择题">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </button>
        </div>
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
        <div class="relative">
          <textarea v-model="block.data.question" rows="2" placeholder="题干，用 ____ 表示空位"
            class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white pr-10"></textarea>
          <button v-if="isAiReady()" @click="openAi('fill')"
            class="absolute top-2 right-2 w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-sm"
            title="AI 生成填空题">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </button>
        </div>
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
          :context="context"
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
      <div class="relative">
        <textarea v-model="block.content" rows="6" placeholder="输入代码..."
          class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-slate-900 text-green-400 font-mono pr-10"></textarea>
        <button v-if="isAiReady()" @click="openAi('code')"
          class="absolute top-2 right-2 w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-sm"
          title="AI 生成代码">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </button>
      </div>
    </div>

    <!-- 提示框 -->
    <div v-else-if="block.type === 'tip'" class="space-y-2">
      <select v-model="block.kind"
        class="text-sm border border-slate-300 rounded px-2 py-1 bg-white">
        <option v-for="k in tipKinds" :key="k.value" :value="k.value">{{ k.label }}</option>
      </select>
      <div class="relative">
        <textarea v-model="block.value" rows="2" placeholder="提示内容（无需写想一想/提示等前缀，系统自动添加）"
          class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white pr-10"></textarea>
        <button v-if="isAiReady()" @click="openAi('text')"
          class="absolute top-2 right-2 w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-sm"
          title="AI 生成提示内容">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </button>
      </div>
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

    <!-- AI 生成弹窗 -->
    <AiGenerateModal
      :show="aiModal.show"
      :mode="aiModal.mode"
      :context="context"
      @close="aiModal.show = false"
      @apply="onAiApply"
    />
  </div>
</template>
