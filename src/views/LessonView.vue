<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getLessonById, catalog } from '../content'
import LessonPage from '../components/LessonPage.vue'
import LessonKnowledge from '../components/LessonKnowledge.vue'
import LessonStudentTasks from '../components/LessonStudentTasks.vue'
import LessonEditor from '../components/LessonEditor.vue'

const route = useRoute()
const isEdit = computed(() => route.name === 'lesson-edit')
const lesson = computed(() => getLessonById(route.params.id))
const activeTab = ref('process') // process | knowledge | tasks

// 切换课时时重置 tab
watch(() => route.params.id, () => { activeTab.value = 'process' })

// 从 catalog 中查找当前课时的学段/单元显示名称
const catalogInfo = computed(() => {
  if (!catalog.stages) return null
  for (const stage of catalog.stages) {
    for (const unit of stage.units) {
      if (unit.lessons.some((l) => l.id === route.params.id)) {
        return { stageTitle: stage.title, unitTitle: unit.title }
      }
    }
  }
  return null
})

const knowledge = computed(() => lesson.value?.knowledge || { sections: [], resources: [] })
const studentTasks = computed(() => lesson.value?.studentTasks || {})

const tabList = [
  { key: 'process', label: '教学过程', activeCls: 'bg-white text-blue-700 shadow-sm font-medium' },
  { key: 'knowledge', label: '教学资源', activeCls: 'bg-white text-emerald-700 shadow-sm font-medium' },
  { key: 'tasks', label: '学生任务', activeCls: 'bg-white text-violet-700 shadow-sm font-medium' }
]

const tabOffset = computed(() => {
  const idx = tabList.findIndex(t => t.key === activeTab.value)
  return idx * (100 / 3)
})
</script>

<template>
  <!-- 编辑模式 -->
  <LessonEditor v-if="isEdit && lesson" :lesson-id="route.params.id" />

  <!-- 展示模式 -->
  <template v-else-if="lesson">
    <!-- 顶部 Tab 切换栏 -->
    <div class="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200">
      <div class="max-w-4xl mx-auto px-6 py-2.5 flex items-center gap-3">
        <div class="flex bg-slate-100 rounded-lg p-0.5">
          <button
            v-for="tab in tabList"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="px-4 py-1.5 text-sm rounded-md transition"
            :class="activeTab === tab.key
              ? tab.activeCls
              : 'text-slate-500 hover:text-slate-700'"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="flex-1"></div>
        <router-link
          :to="{ name: 'lesson-edit', params: { id: route.params.id }, query: { tab: activeTab } }"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition"
          title="编辑本课内容"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          编辑
        </router-link>
      </div>
    </div>

    <!-- 滑动内容区 -->
    <div class="overflow-hidden">
      <div
        class="flex transition-transform duration-300 ease-in-out"
        :style="{ transform: `translateX(-${tabOffset}%)`, width: '300%' }"
      >
        <div class="w-1/3 flex-shrink-0">
          <LessonPage
            :lesson="lesson"
            :lesson-id="route.params.id"
            :unit-title="catalogInfo?.unitTitle"
            :hide-edit="true"
          />
        </div>
        <div class="w-1/3 flex-shrink-0">
          <LessonKnowledge :knowledge="knowledge" />
        </div>
        <div class="w-1/3 flex-shrink-0">
          <LessonStudentTasks :student-tasks="studentTasks" />
        </div>
      </div>
    </div>
  </template>

  <!-- 未找到 -->
  <div v-else class="p-12 text-center text-slate-500">
    <p class="text-lg mb-2">未找到该课时</p>
    <router-link to="/" class="text-blue-600 hover:underline">返回首页</router-link>
  </div>
</template>
