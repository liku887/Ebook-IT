<script setup>
import { ref } from 'vue'
import { catalog, saveCatalog } from '../content'
import AddLessonDialog from '../components/AddLessonDialog.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showAddDialog = ref(false)

const stageColors = {
  primary: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  junior: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  senior: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' }
}

// 编辑教材标题
function editTitle() {
  const t = prompt('教材标题', catalog.title)
  if (t !== null && t.trim()) {
    catalog.title = t.trim()
    saveCatalog(catalog)
  }
}
function editSubtitle() {
  const s = prompt('教材副标题', catalog.subtitle)
  if (s !== null) {
    catalog.subtitle = s.trim()
    saveCatalog(catalog)
  }
}

function onLessonCreated(id) {
  showAddDialog.value = false
  router.push({ name: 'lesson-edit', params: { id } })
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-12">
    <!-- 欢迎区 -->
    <div class="text-center mb-12 group">
      <div class="flex items-center justify-center gap-2">
        <h1
          @click="editTitle"
          class="text-3xl font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition"
          title="点击修改教材标题"
        >{{ catalog.title }}</h1>
        <svg class="w-4 h-4 text-slate-300 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
      <p
        @click="editSubtitle"
        class="text-slate-500 mt-3 cursor-pointer hover:text-blue-600 transition inline-flex items-center gap-1"
        title="点击修改副标题"
      >
        {{ catalog.subtitle }}
        <svg class="w-3 h-3 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </p>
    </div>

    <!-- 学段与课时列表 -->
    <div v-for="stage in (catalog.stages || [])" :key="stage.id" class="mb-10">
      <div class="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
        <span class="w-2.5 h-2.5 rounded-full" :class="stageColors[stage.id]?.dot || 'bg-slate-400'"></span>
        <h2 class="text-lg font-semibold text-slate-700">{{ stage.title }}</h2>
      </div>

      <div v-for="unit in stage.units" :key="unit.id" class="mb-5">
        <p class="text-sm text-slate-500 mb-2 ml-1">{{ unit.title }}</p>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <router-link
            v-for="lesson in unit.lessons"
            :key="lesson.id"
            :to="{ name: 'lesson', params: { id: lesson.id } }"
            class="block p-4 bg-white border rounded-lg hover:shadow-md transition group"
            :class="stageColors[stage.id]?.border || 'border-slate-200'"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium text-slate-800 group-hover:text-blue-600">{{ lesson.title }}</span>
              <svg class="w-5 h-5 text-slate-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 添加课时按钮 -->
    <div class="text-center">
      <button
        @click="showAddDialog = true"
        class="px-6 py-2.5 text-sm text-slate-600 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"
      >
        + 添加新课时
      </button>
    </div>

    <AddLessonDialog
      v-if="showAddDialog"
      @close="showAddDialog = false"
      @created="onLessonCreated"
    />
  </div>
</template>
