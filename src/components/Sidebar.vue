<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { catalog, saveCatalog, hasLocalEdit, deleteLesson } from '../content'
import AddLessonDialog from './AddLessonDialog.vue'

const router = useRouter()

// 展开状态
const expandedStages = ref({})
const expandedUnits = ref({})
if (catalog.stages && catalog.stages.length) {
  expandedStages.value[catalog.stages[0].id] = true
  if (catalog.stages[0].units && catalog.stages[0].units.length) {
    expandedUnits.value[catalog.stages[0].units[0].id] = true
  }
}

// 添加课时对话框
const showAddDialog = ref(false)
const addTarget = ref({ stageId: '', unitId: '' })

function openAddDialog(stageId = '', unitId = '') {
  addTarget.value = { stageId, unitId }
  showAddDialog.value = true
}

function onLessonCreated(id) {
  showAddDialog.value = false
  // 自动展开新课时所在的学段和单元
  for (const stage of catalog.stages) {
    for (const unit of stage.units) {
      if (unit.lessons.some((l) => l.id === id)) {
        expandedStages.value[stage.id] = true
        expandedUnits.value[unit.id] = true
      }
    }
  }
  router.push({ name: 'lesson-edit', params: { id } })
}

function toggleStage(id) {
  expandedStages.value[id] = !expandedStages.value[id]
}
function toggleUnit(id) {
  expandedUnits.value[id] = !expandedUnits.value[id]
}

// 编辑单元名称（学段名称不可更改）
function editUnit(unit) {
  const name = prompt('单元名称', unit.title)
  if (name !== null && name.trim()) {
    unit.title = name.trim()
    saveCatalog(catalog)
  }
}

// 删除课时
function removeLesson(lesson) {
  if (!confirm(`确定删除课时「${lesson.title}」吗？${hasLocalEdit(lesson.id) ? '\n（该课时有本地编辑内容，删除后不可恢复）' : ''}`)) return
  deleteLesson(lesson.id)
  if (router.currentRoute.value.params.id === lesson.id) {
    router.push({ name: 'home' })
  }
}

</script>

<template>
  <aside class="w-64 flex-shrink-0 h-full bg-white border-r border-slate-200 flex flex-col">
    <!-- 教材标题 -->
    <div class="p-4 border-b border-slate-200">
      <router-link to="/" class="block">
        <h1 class="text-base font-bold text-slate-800">{{ catalog.title }}</h1>
        <p class="text-xs text-slate-500 mt-0.5">{{ catalog.subtitle }}</p>
      </router-link>
    </div>

    <!-- 目录导航 -->
    <nav class="flex-1 overflow-y-auto p-2">
      <div v-for="stage in catalog.stages" :key="stage.id" class="mb-1">
        <!-- 学段（名称不可修改） -->
        <div class="flex items-center group">
          <button
            @click="toggleStage(stage.id)"
            class="flex-1 flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-800 rounded hover:bg-slate-100"
          >
            <svg
              class="w-3 h-3 transition-transform flex-shrink-0"
              :class="{ 'rotate-90': expandedStages[stage.id] }"
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
            {{ stage.title }}
          </button>
          <button @click="openAddDialog(stage.id)" class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-green-600 text-sm" title="在此学段添加课时">+</button>
        </div>

        <!-- 单元与课时 -->
        <div v-if="expandedStages[stage.id]" class="ml-2">
          <div v-for="unit in stage.units" :key="unit.id" class="mb-0.5">
            <div class="flex items-center group">
              <button
                @click="toggleUnit(unit.id)"
                class="flex-1 flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 rounded hover:bg-slate-100"
              >
                <svg
                  class="w-2.5 h-2.5 transition-transform flex-shrink-0"
                  :class="{ 'rotate-90': expandedUnits[unit.id] }"
                  viewBox="0 0 20 20" fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
                <span class="text-left">{{ unit.title }}</span>
              </button>
              <button @click="editUnit(unit)" class="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-600" title="重命名单元">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="openAddDialog(stage.id, unit.id)" class="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-green-600 text-xs leading-none" title="在此单元添加课时">+</button>
            </div>
            <div v-if="expandedUnits[unit.id]" class="ml-3 space-y-0.5">
              <div v-for="lesson in unit.lessons" :key="lesson.id" class="group flex items-center">
                <router-link
                  :to="{ name: 'lesson', params: { id: lesson.id } }"
                  class="flex-1 flex items-center px-3 py-1.5 text-sm text-slate-600 rounded hover:bg-blue-50 hover:text-blue-700"
                  active-class="!bg-blue-100 !text-blue-700 font-medium"
                >
                  <span class="truncate">{{ lesson.title }}</span>
                </router-link>
                <button
                  @click="removeLesson(lesson)"
                  class="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 flex-shrink-0"
                  title="删除课时"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加课时按钮 -->
      <button
        @click="openAddDialog()"
        class="w-full mt-2 py-2 text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"
      >
        + 添加课时
      </button>
    </nav>

    <!-- 底部 -->
    <div class="p-3 border-t border-slate-200">
      <span class="text-xs text-slate-400">版本 v{{ catalog.version }}</span>
    </div>

    <!-- 添加课时对话框 -->
    <AddLessonDialog
      v-if="showAddDialog"
      :default-stage-id="addTarget.stageId"
      :default-unit-id="addTarget.unitId"
      @close="showAddDialog = false"
      @created="onLessonCreated"
    />
  </aside>
</template>
