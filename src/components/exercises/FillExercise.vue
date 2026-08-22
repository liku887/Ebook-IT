<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  question: { type: String, required: true },
  answers: { type: Array, required: true },
  explanation: { type: String, default: '' }
})

// 按连续下划线（2个及以上）拆分题目，生成文本片段和输入框
const parts = computed(() => props.question.split(/_{2,}/))
const inputs = ref(props.answers.map(() => ''))
const submitted = ref(false)

function submit() {
  submitted.value = true
}

function reset() {
  inputs.value = props.answers.map(() => '')
  submitted.value = false
}

function isCorrect(i) {
  return inputs.value[i].trim() === props.answers[i]
}
</script>

<template>
  <div class="my-4 p-4 bg-white border border-slate-200 rounded-lg">
    <div class="flex items-start gap-2 mb-3">
      <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded flex-shrink-0">
        填空题
      </span>
    </div>

    <p class="text-slate-800 leading-8 ml-7">
      <template v-for="(part, i) in parts" :key="i">
        {{ part }}
        <input
          v-if="i < answers.length"
          v-model="inputs[i]"
          :disabled="submitted"
          :class="[
            'inline-block mx-1 px-2 py-0.5 border-b-2 text-center text-sm w-24 outline-none bg-transparent',
            submitted
              ? isCorrect(i)
                ? 'border-green-400 text-green-700 bg-green-50'
                : 'border-red-400 text-red-700 bg-red-50'
              : 'border-blue-400 focus:border-blue-600'
          ]"
        />
      </template>
    </p>

    <div v-if="submitted" class="mt-3 ml-7 p-3 rounded bg-slate-50 text-sm">
      <p class="text-slate-700 mb-1">参考答案：{{ answers.join('；') }}</p>
      <p v-if="explanation" class="text-slate-600">解析：{{ explanation }}</p>
    </div>

    <div class="mt-3 ml-7">
      <button
        v-if="!submitted"
        @click="submit"
        class="px-4 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
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
