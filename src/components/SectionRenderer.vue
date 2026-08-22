<script setup>
import ResourcePlayer from './ResourcePlayer.vue'
import MermaidDiagram from './MermaidDiagram.vue'
import ChoiceExercise from './exercises/ChoiceExercise.vue'
import FillExercise from './exercises/FillExercise.vue'

defineProps({
  content: { type: Array, required: true }
})

// 交互活动组件映射
const componentMap = {
  ChoiceExercise,
  FillExercise
}
</script>

<template>
  <div class="textbook-content">
    <template v-for="(block, i) in content" :key="i">
      <!-- 文本段落 -->
      <p v-if="block.type === 'text'">{{ block.value }}</p>

      <!-- 图片 / 视频 / 动画 -->
      <ResourcePlayer
        v-else-if="['image', 'video', 'animation'].includes(block.type)"
        :type="block.type"
        :src="block.src"
        :poster="block.poster"
        :caption="block.caption"
      />

      <!-- Mermaid 知识脉络图 -->
      <MermaidDiagram v-else-if="block.type === 'mindmap'" :code="block.code" />

      <!-- 学生交互活动（习题等） -->
      <component
        v-else-if="block.type === 'interactive'"
        :is="componentMap[block.component]"
        v-bind="block.data"
      />

      <!-- 知识卡片（醒目区分的知识内容） -->
      <div
        v-else-if="block.type === 'knowledge'"
        class="my-5 rounded-xl overflow-hidden border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50"
      >
        <div class="flex items-center gap-2 px-4 py-2 bg-indigo-100/80 border-b border-indigo-200">
          <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span class="text-xs font-bold text-indigo-700 tracking-wide">知识</span>
          <span v-if="block.title" class="text-sm font-bold text-indigo-900">{{ block.title }}</span>
        </div>
        <div class="p-4">
          <SectionRenderer :content="block.content || []" />
        </div>
      </div>

      <!-- 代码块 -->
      <div
        v-else-if="block.type === 'code'"
        class="my-4 rounded-lg overflow-hidden"
      >
        <div v-if="block.title" class="flex items-center gap-2 px-4 py-1.5 bg-slate-700 text-slate-300 text-xs">
          <span>{{ block.title }}</span>
          <span v-if="block.language" class="px-1.5 py-0.5 bg-slate-600 rounded font-mono">{{ block.language }}</span>
        </div>
        <pre class="bg-slate-900 text-slate-100 p-4 overflow-x-auto text-sm leading-relaxed"><code>{{ block.content }}</code></pre>
      </div>

      <!-- 提示框（想一想 / 提示 / 注意） -->
      <div
        v-else-if="block.type === 'tip'"
        :class="[
          'my-4 p-3 rounded-lg border-l-4 text-sm',
          block.kind === 'think'
            ? 'bg-amber-50 border-amber-400 text-amber-800'
            : block.kind === 'warn'
              ? 'bg-red-50 border-red-400 text-red-800'
              : 'bg-blue-50 border-blue-400 text-blue-800'
        ]"
      >
        <span class="font-medium mr-1">
          {{ block.kind === 'think' ? '想一想' : block.kind === 'warn' ? '注意' : '提示' }}：
        </span>
        {{ block.value }}
      </div>

      <!-- 拓展链接 -->
      <a
        v-else-if="block.type === 'link'"
        :href="block.url"
        target="_blank"
        rel="noopener"
        class="my-4 flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition group"
      >
        <svg class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span>
          <span class="block font-medium text-emerald-800 group-hover:underline">{{ block.title }}</span>
          <span v-if="block.desc" class="block text-sm text-emerald-700 mt-0.5">{{ block.desc }}</span>
        </span>
      </a>
    </template>
  </div>
</template>
