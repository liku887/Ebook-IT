<script setup>
import { ref } from 'vue'

const props = defineProps({
  question: { type: String, required: true },
  options: { type: Array, required: true },
  answer: { type: Number, required: true },
  explanation: { type: String, default: '' }
})

const selected = ref(null)
const submitted = ref(false)

function choose(i) {
  if (submitted.value) return
  selected.value = i
}

function submit() {
  if (selected.value === null) return
  submitted.value = true
}

function reset() {
  selected.value = null
  submitted.value = false
}
</script>

<template>
  <div class="my-4 p-4 bg-white border border-slate-200 rounded-lg">
    <div class="flex items-start gap-2 mb-3">
      <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded flex-shrink-0">
        选择题
      </span>
      <p class="font-medium text-slate-800">{{ question }}</p>
    </div>

    <div class="space-y-2 ml-7">
      <button
        v-for="(opt, i) in options"
        :key="i"
        @click="choose(i)"
        :disabled="submitted"
        :class="[
          'w-full text-left px-3 py-2 rounded border transition text-sm',
          submitted
            ? i === props.answer
              ? 'border-green-400 bg-green-50 text-green-800'
              : i === selected
                ? 'border-red-400 bg-red-50 text-red-800'
                : 'border-slate-200 text-slate-400'
            : selected === i
              ? 'border-blue-400 bg-blue-50 text-blue-800'
              : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50'
        ]"
      >
        <span class="font-medium mr-2">{{ String.fromCharCode(65 + i) }}.</span>{{ opt }}
      </button>
    </div>

    <div v-if="submitted" class="mt-3 ml-7 p-3 rounded bg-slate-50 text-sm">
      <p :class="selected === props.answer ? 'text-green-700' : 'text-red-700'" class="font-medium mb-1">
        {{ selected === props.answer ? '回答正确！' : '回答不正确。' }}
      </p>
      <p v-if="explanation" class="text-slate-600">解析：{{ explanation }}</p>
    </div>

    <div class="mt-3 ml-7">
      <button
        v-if="!submitted"
        @click="submit"
        :disabled="selected === null"
        class="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        提交答案
      </button>
      <button
        v-else
        @click="reset"
        class="px-4 py-1.5 text-sm border border-slate-300 text-slate-600 rounded hover:bg-slate-50"
      >
        再做一次
      </button>
    </div>
  </div>
</template>
