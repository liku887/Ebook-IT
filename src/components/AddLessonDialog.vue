<script setup>
import { ref, computed, watch } from 'vue'
import { catalog, addLesson } from '../content'

const emit = defineEmits(['close', 'created'])

const props = defineProps({
  defaultStageId: { type: String, default: '' },
  defaultUnitId: { type: String, default: '' }
})

// 表单数据
const title = ref('')
const lessonId = ref('')
const mode = ref('existing') // existing = 加入已有单元，new = 在已有学段下新建单元
const stageId = ref(props.defaultStageId || catalog.stages?.[0]?.id || '')
const unitId = ref(props.defaultUnitId || '')
const newUnitTitle = ref('')
const newUnitId = ref('unit-' + Math.random().toString(36).slice(2, 8))
const error = ref('')

// 当前选中的学段
const currentStage = computed(() => catalog.stages?.find((s) => s.id === stageId.value))

// 自动生成 ID
watch(title, (val) => {
  if (val && !lessonId.value.startsWith('custom-')) {
    lessonId.value = 'custom-' + Date.now().toString(36)
  }
})

function submit() {
  error.value = ''
  if (!title.value.trim()) {
    error.value = '请输入课时标题'
    return
  }
  if (!stageId.value) {
    error.value = '请选择学段'
    return
  }

  let uid, unitTitle
  if (mode.value === 'existing') {
    if (!unitId.value) {
      error.value = '请选择单元'
      return
    }
    uid = unitId.value
  } else {
    if (!newUnitTitle.value.trim()) {
      error.value = '请填写单元名称'
      return
    }
    uid = newUnitId.value
    unitTitle = newUnitTitle.value.trim()
  }

  // 检查 ID 重复
  const id = lessonId.value.trim() || 'custom-' + Date.now().toString(36)
  const all = (catalog.stages || []).flatMap((s) => s.units.flatMap((u) => u.lessons))
  if (all.some((l) => l.id === id)) {
    error.value = '课时ID已存在，请更换'
    return
  }

  addLesson({
    id,
    title: title.value.trim(),
    stageId: stageId.value,
    unitId: uid,
    unitTitle
  })

  emit('created', id)
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="emit('close')">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-slate-800">添加新课时</h2>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
      </div>

      <div class="space-y-4">
        <!-- 课时标题 -->
        <label class="block">
          <span class="text-sm font-medium text-slate-700">课时标题 *</span>
          <input v-model="title" type="text" placeholder="如：第3课 数据的采集"
            class="w-full mt-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none" />
        </label>

        <!-- 课时ID -->
        <label class="block">
          <span class="text-sm font-medium text-slate-700">课时ID</span>
          <input v-model="lessonId" type="text" placeholder="自动生成，可自定义"
            class="w-full mt-1 text-sm border border-slate-300 rounded-lg px-3 py-2 font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none" />
        </label>

        <!-- 学段选择（不可新建学段） -->
        <label class="block">
          <span class="text-sm font-medium text-slate-700">学段 *</span>
          <select v-model="stageId"
            class="w-full mt-1 text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white">
            <option v-for="s in catalog.stages" :key="s.id" :value="s.id">{{ s.title }}</option>
          </select>
        </label>

        <!-- 选择：已有单元 or 新建单元 -->
        <div class="flex gap-2">
          <button @click="mode = 'existing'" type="button"
            :class="mode === 'existing' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'"
            class="flex-1 py-2 text-sm rounded-lg transition">加入已有单元</button>
          <button @click="mode = 'new'" type="button"
            :class="mode === 'new' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'"
            class="flex-1 py-2 text-sm rounded-lg transition">新建单元</button>
        </div>

        <!-- 已有单元选择 -->
        <label v-if="mode === 'existing'" class="block">
          <span class="text-sm font-medium text-slate-700">单元</span>
          <select v-model="unitId"
            class="w-full mt-1 text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white">
            <option value="">请选择单元</option>
            <option v-for="u in currentStage?.units" :key="u.id" :value="u.id">{{ u.title }}</option>
          </select>
        </label>

        <!-- 新建单元 -->
        <label v-else class="block">
          <span class="text-sm font-medium text-slate-700">单元名称</span>
          <input v-model="newUnitTitle" type="text" placeholder="如：八年级·算法与程序设计"
            class="w-full mt-1 text-sm border border-slate-300 rounded-lg px-3 py-2" />
        </label>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </div>

      <div class="flex gap-2 mt-6">
        <button @click="emit('close')"
          class="flex-1 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">取消</button>
        <button @click="submit"
          class="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">创建并编辑</button>
      </div>
    </div>
  </div>
</template>
