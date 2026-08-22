<script setup>
import { ref, watch } from 'vue'
import { generateText, generateChoiceExercise, generateFillExercise, generateBlocks } from '../composables/useAi'

const props = defineProps({
  show: Boolean,
  mode: { type: String, default: 'text' }, // text | choice | fill | blocks
  context: { type: String, default: '' }
})
const emit = defineEmits(['close', 'apply'])

const prompt = ref('')
const loading = ref(false)
const error = ref('')

// 不同模式的提示词占位符与标题
const modeConfig = {
  text: {
    title: 'AI 生成文本',
    placeholder: '描述你想生成的文本内容，如：用通俗的语言解释什么是阈值，举一个生活中的例子，100字左右。',
    button: '生成文本'
  },
  choice: {
    title: 'AI 生成选择题',
    placeholder: '描述题目要求，如：生成一道关于连续量与开关量区别的选择题，4个选项，难度适中。',
    button: '生成选择题'
  },
  fill: {
    title: 'AI 生成填空题',
    placeholder: '描述题目要求，如：生成一道关于Python for循环语法的填空题，包含2个空。',
    button: '生成填空题'
  },
  blocks: {
    title: 'AI 批量生成内容',
    placeholder: '描述要生成的教学内容，如：生成一段关于"阈值判断"的教学内容，包含一个知识点讲解、一个想一想提示和一道选择题。',
    button: '批量生成'
  }
}

const cfg = () => modeConfig[props.mode] || modeConfig.text

// 每次打开时重置
watch(() => props.show, (v) => {
  if (v) {
    prompt.value = ''
    error.value = ''
    loading.value = false
  }
})

async function handleGenerate() {
  if (!prompt.value.trim()) {
    error.value = '请输入提示词'
    return
  }
  loading.value = true
  error.value = ''
  try {
    let result
    switch (props.mode) {
      case 'choice':
        result = await generateChoiceExercise(prompt.value, props.context)
        break
      case 'fill':
        result = await generateFillExercise(prompt.value, props.context)
        break
      case 'blocks':
        result = await generateBlocks(prompt.value, props.context)
        break
      default:
        result = await generateText(prompt.value, props.context)
    }
    emit('apply', result)
    emit('close')
  } catch (e) {
    error.value = e.message || '生成失败，请检查 API 配置和网络'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="!loading && emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {{ cfg().title }}
        </h3>
        <button @click="!loading && emit('close')" class="text-slate-400 hover:text-slate-600 p-1" :disabled="loading">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-3">
        <textarea
          v-model="prompt"
          :placeholder="cfg().placeholder"
          rows="5"
          class="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white resize-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
        ></textarea>

        <div v-if="context" class="text-xs text-slate-400 bg-slate-50 rounded px-2 py-1.5 truncate" :title="context">
          上下文：{{ context }}
        </div>

        <div v-if="error" class="text-xs p-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {{ error }}
        </div>
      </div>

      <div class="flex items-center gap-2 mt-5">
        <div class="flex-1"></div>
        <button @click="emit('close')" :disabled="loading"
          class="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50">取消</button>
        <button @click="handleGenerate" :disabled="loading"
          class="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ loading ? '生成中...' : cfg().button }}
        </button>
      </div>
    </div>
  </div>
</template>
