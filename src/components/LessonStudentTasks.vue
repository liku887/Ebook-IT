<script setup>
import { computed } from 'vue'
import SectionRenderer from './SectionRenderer.vue'

const props = defineProps({
  studentTasks: { type: Object, default: () => ({ preclass: { title: '课前任务', content: [] }, postclass: { title: '课后任务', content: [] } }) }
})

const preclass = computed(() => props.studentTasks?.preclass || { title: '课前任务', content: [] })
const postclass = computed(() => props.studentTasks?.postclass || { title: '课后任务', content: [] })
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <!-- 课前任务 -->
    <section class="mb-8">
      <div class="flex items-center gap-3 mb-4">
        <span class="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
        <div>
          <h2 class="text-lg font-bold text-slate-800">{{ preclass.title || '课前任务' }}</h2>
          <p class="text-xs text-slate-400">课前预习，提前了解本课内容</p>
        </div>
      </div>
      <div class="ml-13 bg-white border border-amber-200 rounded-xl p-5">
        <SectionRenderer v-if="preclass.content && preclass.content.length" :content="preclass.content" />
        <p v-else class="text-sm text-slate-400 text-center py-4">暂无课前任务</p>
      </div>
    </section>

    <!-- 课后任务 -->
    <section class="mb-8">
      <div class="flex items-center gap-3 mb-4">
        <span class="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </span>
        <div>
          <h2 class="text-lg font-bold text-slate-800">{{ postclass.title || '课后任务' }}</h2>
          <p class="text-xs text-slate-400">课后回顾，巩固所学知识与技能</p>
        </div>
      </div>
      <div class="ml-13 bg-white border border-violet-200 rounded-xl p-5">
        <SectionRenderer v-if="postclass.content && postclass.content.length" :content="postclass.content" />
        <p v-else class="text-sm text-slate-400 text-center py-4">暂无课后任务</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ml-13 {
  margin-left: 3.25rem;
}
</style>
