<script setup>
import { computed } from 'vue'
import SectionRenderer from './SectionRenderer.vue'
import { getAdjacentLessons } from '../content'

const props = defineProps({
  lesson: { type: Object, required: true },
  lessonId: { type: String, default: '' },
  unitTitle: { type: String, default: '' },
  hideEdit: { type: Boolean, default: false }
})

// 环节配色（静态类名，避免 Tailwind purge 丢失）
const colorMap = {
  blue: {
    badge: 'bg-blue-100 text-blue-700',
    bar: 'bg-blue-500',
    dot: 'bg-blue-500',
    active: 'text-blue-600 border-blue-500'
  },
  cyan: {
    badge: 'bg-cyan-100 text-cyan-700',
    bar: 'bg-cyan-500',
    dot: 'bg-cyan-500',
    active: 'text-cyan-600 border-cyan-500'
  },
  amber: {
    badge: 'bg-amber-100 text-amber-700',
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
    active: 'text-amber-600 border-amber-500'
  },
  violet: {
    badge: 'bg-violet-100 text-violet-700',
    bar: 'bg-violet-500',
    dot: 'bg-violet-500',
    active: 'text-violet-600 border-violet-500'
  },
  green: {
    badge: 'bg-green-100 text-green-700',
    bar: 'bg-green-500',
    dot: 'bg-green-500',
    active: 'text-green-600 border-green-500'
  }
}

// 将所有环节展平为数组，便于导航和渲染
const sections = computed(() => {
  const s = props.lesson.sections
  const arr = []
  arr.push({
    key: 'intro',
    label: s.intro.title || '导入',
    data: s.intro,
    color: colorMap.blue
  })
  const taskColors = [colorMap.cyan, colorMap.amber, colorMap.violet]
  s.tasks.forEach((t, i) => {
    arr.push({
      key: 'task-' + i,
      label: t.title || `学习任务${i + 1}`,
      data: t,
      color: taskColors[i] || colorMap.cyan
    })
  })
  arr.push({
    key: 'summary',
    label: s.summary.title || '总结',
    data: s.summary,
    color: colorMap.green
  })
  return arr
})

// 上一课 / 下一课
const adjacent = computed(() => getAdjacentLessons(props.lesson.id))

// 点击环节导航，平滑滚动到对应位置
function scrollTo(key) {
  const el = document.getElementById('section-' + key)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <!-- 课时头部 -->
    <header class="mb-6">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="text-sm text-slate-500 mb-1">{{ unitTitle || lesson.unit }}</p>
          <h1 class="text-2xl font-bold text-slate-800 mb-3">{{ lesson.title }}</h1>
        </div>
        <router-link
          v-if="lessonId && !hideEdit"
          :to="{ name: 'lesson-edit', params: { id: lessonId } }"
          class="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition"
          title="编辑本课内容"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          编辑
        </router-link>
      </div>
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <span class="inline-flex items-center px-3 py-1 text-sm bg-brand-100 text-brand-700 rounded-full">
          {{ lesson.project }}
        </span>
        <span class="inline-flex items-center px-3 py-1 text-sm bg-slate-100 text-slate-600 rounded-full">
          {{ lesson.duration }}
        </span>
      </div>
      <!-- 教学目标 -->
      <div v-if="lesson.objectives && lesson.objectives.length" class="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p class="text-sm font-semibold text-slate-700 mb-2">学习目标</p>
        <ul class="list-disc list-inside space-y-1 text-sm text-slate-600">
          <li v-for="(obj, i) in lesson.objectives" :key="i">{{ obj }}</li>
        </ul>
      </div>
    </header>

    <!-- 环节快速导航 -->
    <nav class="sticky top-0 z-10 -mx-6 px-6 py-2 bg-slate-50/95 backdrop-blur border-b border-slate-200 mb-6 flex flex-wrap gap-1">
      <button
        v-for="sec in sections"
        :key="sec.key"
        @click="scrollTo(sec.key)"
        class="px-3 py-1.5 text-sm rounded-full border border-transparent text-slate-600 hover:bg-white hover:border-slate-200 transition"
      >
        <span class="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" :class="sec.color.dot"></span>
        {{ sec.label }}
      </button>
    </nav>

    <!-- 各环节内容 -->
    <article v-for="sec in sections" :key="sec.key" :id="'section-' + sec.key" class="mb-8 scroll-mt-16">
      <div class="flex items-center gap-3 mb-4">
        <span class="w-1.5 h-7 rounded-full" :class="sec.color.bar"></span>
        <h2 class="text-lg font-bold text-slate-800">{{ sec.label }}</h2>
      </div>
      <div class="pl-4 border-l-2 border-slate-100">
        <SectionRenderer :content="sec.data.content" />
      </div>
    </article>

    <!-- 上一课 / 下一课 -->
    <nav class="flex justify-between items-center mt-10 pt-6 border-t border-slate-200">
      <router-link
        v-if="adjacent.prev"
        :to="{ name: 'lesson', params: { id: adjacent.prev.id } }"
        class="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-600"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        {{ adjacent.prev.title }}
      </router-link>
      <span v-else></span>
      <router-link
        v-if="adjacent.next"
        :to="{ name: 'lesson', params: { id: adjacent.next.id } }"
        class="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        {{ adjacent.next.title }}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </router-link>
    </nav>
  </div>
</template>
