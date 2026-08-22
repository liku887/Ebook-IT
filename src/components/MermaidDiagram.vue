<script setup>
import { ref, onMounted, watch } from 'vue'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose'
})

const props = defineProps({
  code: { type: String, required: true }
})

const container = ref(null)
const svg = ref('')
const error = ref('')

async function render() {
  if (!container.value) return
  try {
    const id = 'mmd-' + Math.random().toString(36).slice(2, 10)
    const result = await mermaid.render(id, props.code)
    svg.value = result.svg
    error.value = ''
  } catch (e) {
    error.value = '图表语法有误，无法渲染。'
  }
}

onMounted(render)
watch(() => props.code, render)
</script>

<template>
  <div class="my-4">
    <div
      v-if="error"
      class="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg"
    >
      {{ error }}
    </div>
    <div
      v-else
      ref="container"
      class="flex justify-center overflow-x-auto p-4 bg-white border border-slate-200 rounded-lg"
      v-html="svg"
    ></div>
  </div>
</template>
