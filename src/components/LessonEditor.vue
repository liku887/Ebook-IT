<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BlockEditor from './BlockEditor.vue'
import { getLessonById, saveLesson, resetLesson, exportLesson, hasLocalEdit, catalog, saveCatalog } from '../content'

const props = defineProps({
  lessonId: { type: String, required: true }
})

const router = useRouter()
const route = useRoute()

// 深拷贝课时数据作为编辑草稿
const draft = ref(JSON.parse(JSON.stringify(getLessonById(props.lessonId))))
// 确保 knowledge 字段存在（兼容旧数据）
if (!draft.value.knowledge) {
  draft.value.knowledge = { sections: [], resources: [] }
}
if (!draft.value.knowledge.sections) draft.value.knowledge.sections = []
if (!draft.value.knowledge.resources) draft.value.knowledge.resources = []
// 确保 studentTasks 字段存在
if (!draft.value.studentTasks) {
  draft.value.studentTasks = {
    preclass: { title: '课前任务', content: [] },
    postclass: { title: '课后任务', content: [] }
  }
}
if (!draft.value.studentTasks.preclass) draft.value.studentTasks.preclass = { title: '课前任务', content: [] }
if (!draft.value.studentTasks.postclass) draft.value.studentTasks.postclass = { title: '课后任务', content: [] }
if (!draft.value.studentTasks.preclass.content) draft.value.studentTasks.preclass.content = []
if (!draft.value.studentTasks.postclass.content) draft.value.studentTasks.postclass.content = []

const saved = ref(false)
const isDirty = ref(false)
// 从路由 query 读取初始 tab（从资源页/任务网点编辑直接定位）
const validTabs = ['process', 'knowledge', 'tasks']
const initialTab = validTabs.includes(route.query.tab) ? route.query.tab : 'process'
const editorTab = ref(initialTab)

function markDirty() {
  isDirty.value = true
  saved.value = false
}

// 学习目标
function addObjective() {
  draft.value.objectives.push('')
  markDirty()
}
function removeObjective(i) {
  draft.value.objectives.splice(i, 1)
  markDirty()
}

// 内容块操作
function addBlock(sectionContent) {
  sectionContent.push({ type: 'text', value: '' })
  markDirty()
}
function removeBlock(sectionContent, i) {
  sectionContent.splice(i, 1)
  markDirty()
}
function moveBlock(sectionContent, i, dir) {
  const j = i + dir
  if (j < 0 || j >= sectionContent.length) return
  const tmp = sectionContent[i]
  sectionContent[i] = sectionContent[j]
  sectionContent[j] = tmp
  markDirty()
}

// 任务操作
function addTask() {
  const n = draft.value.sections.tasks.length + 1
  draft.value.sections.tasks.push({
    title: `学习任务${n} 新任务`,
    content: [{ type: 'text', value: '' }]
  })
  markDirty()
}
function removeTask(i) {
  draft.value.sections.tasks.splice(i, 1)
  markDirty()
}
function moveTask(i, dir) {
  const j = i + dir
  if (j < 0 || j >= draft.value.sections.tasks.length) return
  const tmp = draft.value.sections.tasks[i]
  draft.value.sections.tasks[i] = draft.value.sections.tasks[j]
  draft.value.sections.tasks[j] = tmp
  markDirty()
}

// 教学资源操作
const resourceTypes = [
  { value: 'link', label: '网页链接' },
  { value: 'doc', label: '文档' },
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'slide', label: '课件' },
  { value: 'snippet', label: '语句片段' },
  { value: 'code', label: '程序示例' }
]

const codeLanguages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C/C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Shell' },
  { value: 'text', label: '纯文本' }
]

function addResource() {
  draft.value.knowledge.resources.push({
    type: 'link',
    title: '',
    src: '',
    desc: ''
  })
  markDirty()
}

// 切换资源类型时重置字段
function onResourceTypeChange(res) {
  const type = res.type
  // 保留标题，清除其他字段
  const title = res.title || ''
  Object.keys(res).forEach((k) => delete res[k])
  res.type = type
  res.title = title
  if (type === 'snippet') {
    res.content = ''
    res.source = ''
  } else if (type === 'code') {
    res.language = 'python'
    res.content = ''
  } else {
    res.src = ''
    res.desc = ''
    if (type === 'video') res.poster = ''
  }
  markDirty()
}
function removeResource(i) {
  draft.value.knowledge.resources.splice(i, 1)
  markDirty()
}
function moveResource(i, dir) {
  const j = i + dir
  if (j < 0 || j >= draft.value.knowledge.resources.length) return
  const tmp = draft.value.knowledge.resources[i]
  draft.value.knowledge.resources[i] = draft.value.knowledge.resources[j]
  draft.value.knowledge.resources[j] = tmp
  markDirty()
}

// 保存
function handleSave() {
  saveLesson(props.lessonId, draft.value)
  // 同步更新目录中的课时标题（直接修改响应式 catalog）
  if (catalog.stages) {
    for (const stage of catalog.stages) {
      for (const unit of stage.units) {
        const lesson = unit.lessons.find((l) => l.id === props.lessonId)
        if (lesson) {
          lesson.title = draft.value.title
          saveCatalog(catalog)
          break
        }
      }
    }
  }
  saved.value = true
  isDirty.value = false
}

// 导出 JSON 文件
function handleExport() {
  exportLesson(props.lessonId, draft.value)
}

// 重置为原始内容
function handleReset() {
  if (!confirm('确定要重置本课吗？所有本地编辑将被删除，恢复为原始内容。')) return
  resetLesson(props.lessonId)
  draft.value = JSON.parse(JSON.stringify(getLessonById(props.lessonId)))
  if (!draft.value.knowledge) draft.value.knowledge = { sections: [], resources: [] }
  if (!draft.value.studentTasks) draft.value.studentTasks = { preclass: { title: '课前任务', content: [] }, postclass: { title: '课后任务', content: [] } }
  isDirty.value = false
  saved.value = false
}

// 返回预览
function handleBack() {
  if (isDirty.value && !confirm('有未保存的修改，确定离开吗？')) return
  router.push({ name: 'lesson', params: { id: props.lessonId } })
}

const edited = computed(() => hasLocalEdit(props.lessonId))
</script>

<template>
  <div v-if="draft" class="max-w-4xl mx-auto px-6 py-6">
    <!-- 顶部工具栏 -->
    <div class="sticky top-0 z-20 -mx-6 px-6 py-3 bg-white/95 backdrop-blur border-b border-slate-200 flex items-center gap-2 mb-6">
      <button @click="handleBack"
        class="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50">
        ← 返回预览
      </button>
      <span class="text-sm font-medium text-slate-700">编辑模式</span>
      <span v-if="edited" class="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">已本地保存过</span>
      <div class="flex-1"></div>
      <button @click="handleReset"
        class="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50">
        重置
      </button>
      <button @click="handleExport"
        class="px-3 py-1.5 text-sm text-slate-700 border border-slate-300 rounded hover:bg-slate-50">
        导出JSON
      </button>
      <button @click="handleSave"
        class="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
        {{ saved ? '✓ 已保存' : '保存' }}
      </button>
    </div>

    <!-- 编辑器 Tab 切换 -->
    <div class="flex bg-slate-100 rounded-lg p-0.5 mb-6 w-fit">
      <button @click="editorTab = 'process'"
        class="px-5 py-2 text-sm rounded-md transition"
        :class="editorTab === 'process' ? 'bg-white text-blue-700 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'">
        教学过程
      </button>
      <button @click="editorTab = 'knowledge'"
        class="px-5 py-2 text-sm rounded-md transition"
        :class="editorTab === 'knowledge' ? 'bg-white text-emerald-700 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'">
        教学资源
      </button>
      <button @click="editorTab = 'tasks'"
        class="px-5 py-2 text-sm rounded-md transition"
        :class="editorTab === 'tasks' ? 'bg-white text-violet-700 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'">
        学生任务
      </button>
    </div>

    <!-- ========== 教学过程编辑 ========== -->
    <div v-show="editorTab === 'process'">
      <!-- 基本信息 -->
      <section class="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <h2 class="text-sm font-bold text-slate-700 mb-3">课时基本信息</h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block">
            <span class="text-xs text-slate-500">课时标题</span>
            <input v-model="draft.title" @input="markDirty"
              class="w-full mt-1 text-sm border border-slate-300 rounded px-3 py-2" />
          </label>
          <label class="block">
            <span class="text-xs text-slate-500">所属单元</span>
            <input v-model="draft.unit" @input="markDirty"
              class="w-full mt-1 text-sm border border-slate-300 rounded px-3 py-2" />
          </label>
          <label class="block">
            <span class="text-xs text-slate-500">项目名称</span>
            <input v-model="draft.project" @input="markDirty"
              class="w-full mt-1 text-sm border border-slate-300 rounded px-3 py-2" />
          </label>
          <label class="block">
            <span class="text-xs text-slate-500">课时</span>
            <input v-model="draft.duration" @input="markDirty"
              class="w-full mt-1 text-sm border border-slate-300 rounded px-3 py-2" />
          </label>
        </div>

        <!-- 学习目标 -->
        <div class="mt-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-slate-500">学习目标</span>
            <button @click="addObjective" class="text-xs text-blue-600 hover:text-blue-800">+ 添加目标</button>
          </div>
          <div v-for="(obj, i) in draft.objectives" :key="i" class="flex items-center gap-2 mb-1">
            <input v-model="draft.objectives[i]" @input="markDirty"
              class="flex-1 text-sm border border-slate-300 rounded px-3 py-2" />
            <button @click="removeObjective(i)" class="text-red-400 hover:text-red-600 text-sm">✕</button>
          </div>
        </div>
      </section>

      <!-- 导入环节 -->
      <section class="bg-white border border-slate-200 rounded-lg p-4 mb-4">
        <div class="flex items-center gap-2 mb-3">
          <span class="w-1.5 h-5 rounded-full bg-blue-500"></span>
          <input v-model="draft.sections.intro.title" @input="markDirty"
            class="text-sm font-bold text-slate-700 border-b border-transparent hover:border-slate-300 focus:border-blue-400 outline-none px-1" />
        </div>
        <div class="space-y-2">
          <BlockEditor
            v-for="(block, i) in draft.sections.intro.content"
            :key="i"
            :block="block"
            :index="i"
            @remove="removeBlock(draft.sections.intro.content, i)"
            @move-up="moveBlock(draft.sections.intro.content, i, -1)"
            @move-down="moveBlock(draft.sections.intro.content, i, 1)"
          @change="markDirty"
          />
        </div>
        <button @click="addBlock(draft.sections.intro.content)"
          class="mt-2 w-full py-2 text-sm text-blue-600 border border-dashed border-blue-300 rounded hover:bg-blue-50">
          + 添加内容块
        </button>
      </section>

      <!-- 学习任务（可增删） -->
      <section
        v-for="(task, ti) in draft.sections.tasks"
        :key="ti"
        class="bg-white border border-slate-200 rounded-lg p-4 mb-4"
      >
        <div class="flex items-center gap-2 mb-3">
          <span class="w-1.5 h-5 rounded-full"
            :class="ti === 0 ? 'bg-cyan-500' : ti === 1 ? 'bg-amber-500' : 'bg-violet-500'"></span>
          <input v-model="task.title" @input="markDirty"
            class="flex-1 text-sm font-bold text-slate-700 border-b border-transparent hover:border-slate-300 focus:border-blue-400 outline-none px-1" />
          <button @click="moveTask(ti, -1)" class="text-slate-400 hover:text-slate-600 px-1" title="上移">↑</button>
          <button @click="moveTask(ti, 1)" class="text-slate-400 hover:text-slate-600 px-1" title="下移">↓</button>
          <button @click="removeTask(ti)" class="text-red-400 hover:text-red-600 px-1" title="删除任务">✕</button>
        </div>
        <div class="space-y-2">
          <BlockEditor
            v-for="(block, bi) in task.content"
            :key="bi"
            :block="block"
            :index="bi"
            @remove="removeBlock(task.content, bi)"
            @move-up="moveBlock(task.content, bi, -1)"
            @move-down="moveBlock(task.content, bi, 1)"
          @change="markDirty"
          />
        </div>
        <button @click="addBlock(task.content)"
          class="mt-2 w-full py-2 text-sm text-blue-600 border border-dashed border-blue-300 rounded hover:bg-blue-50">
          + 添加内容块
        </button>
      </section>

      <!-- 添加任务按钮 -->
      <button @click="addTask"
        class="w-full py-3 mb-4 text-sm text-slate-600 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50">
        + 添加学习任务
      </button>

      <!-- 总结环节 -->
      <section class="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div class="flex items-center gap-2 mb-3">
          <span class="w-1.5 h-5 rounded-full bg-green-500"></span>
          <input v-model="draft.sections.summary.title" @input="markDirty"
            class="text-sm font-bold text-slate-700 border-b border-transparent hover:border-slate-300 focus:border-blue-400 outline-none px-1" />
        </div>
        <div class="space-y-2">
          <BlockEditor
            v-for="(block, i) in draft.sections.summary.content"
            :key="i"
            :block="block"
            :index="i"
            @remove="removeBlock(draft.sections.summary.content, i)"
            @move-up="moveBlock(draft.sections.summary.content, i, -1)"
            @move-down="moveBlock(draft.sections.summary.content, i, 1)"
          @change="markDirty"
          />
        </div>
        <button @click="addBlock(draft.sections.summary.content)"
          class="mt-2 w-full py-2 text-sm text-blue-600 border border-dashed border-blue-300 rounded hover:bg-blue-50">
          + 添加内容块
        </button>
      </section>
    </div>

    <!-- ========== 教学资源编辑 ========== -->
    <div v-show="editorTab === 'knowledge'">
      <!-- 教学资源 -->
      <div class="flex items-center gap-2 mb-3">
        <span class="w-1 h-5 bg-emerald-500 rounded-full"></span>
        <h2 class="text-sm font-bold text-slate-700">教学资源</h2>
      </div>

      <div
        v-for="(res, ri) in draft.knowledge.resources"
        :key="ri"
        class="bg-white border border-slate-200 rounded-lg p-4 mb-3"
      >
        <div class="flex items-center gap-2 mb-3">
          <select v-model="res.type" @change="onResourceTypeChange(res)"
            class="text-sm border border-slate-300 rounded px-2 py-1 bg-white">
            <option v-for="t in resourceTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
          <input v-model="res.title" @input="markDirty" placeholder="资源标题"
            class="flex-1 text-sm border border-slate-300 rounded px-3 py-1.5" />
          <button @click="moveResource(ri, -1)" class="text-slate-400 hover:text-slate-600 px-1" title="上移">↑</button>
          <button @click="moveResource(ri, 1)" class="text-slate-400 hover:text-slate-600 px-1" title="下移">↓</button>
          <button @click="removeResource(ri)" class="text-red-400 hover:text-red-600 px-1" title="删除资源">✕</button>
        </div>
        <div class="space-y-2">
          <!-- 网页链接 / 文档 / 音频 / 课件 -->
          <template v-if="res.type === 'link' || res.type === 'doc' || res.type === 'audio' || res.type === 'slide'">
            <input v-model="res.src" @input="markDirty"
              :placeholder="res.type === 'link' ? '网页链接 URL（https://...）' : '资源路径或 URL'"
              class="w-full text-sm border border-slate-300 rounded px-3 py-1.5" />
            <input v-model="res.desc" @input="markDirty" placeholder="资源描述（可选）"
              class="w-full text-sm border border-slate-300 rounded px-3 py-1.5" />
          </template>
          <!-- 图片 -->
          <template v-else-if="res.type === 'image'">
            <input v-model="res.src" @input="markDirty" placeholder="图片路径或 URL"
              class="w-full text-sm border border-slate-300 rounded px-3 py-1.5" />
            <input v-model="res.desc" @input="markDirty" placeholder="图片说明（可选）"
              class="w-full text-sm border border-slate-300 rounded px-3 py-1.5" />
          </template>
          <!-- 视频 -->
          <template v-else-if="res.type === 'video'">
            <input v-model="res.src" @input="markDirty" placeholder="视频路径或 URL"
              class="w-full text-sm border border-slate-300 rounded px-3 py-1.5" />
            <input v-model="res.poster" @input="markDirty" placeholder="封面图路径（可选）"
              class="w-full text-sm border border-slate-300 rounded px-3 py-1.5" />
            <input v-model="res.desc" @input="markDirty" placeholder="视频说明（可选）"
              class="w-full text-sm border border-slate-300 rounded px-3 py-1.5" />
          </template>
          <!-- 语句片段 -->
          <template v-else-if="res.type === 'snippet'">
            <textarea v-model="res.content" @input="markDirty" rows="3" placeholder="输入语句片段内容..."
              class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-slate-50 italic"></textarea>
            <input v-model="res.source" @input="markDirty" placeholder="出处/来源（可选，如：教材P12、某名言作者）"
              class="w-full text-sm border border-slate-300 rounded px-3 py-1.5" />
          </template>
          <!-- 程序示例 -->
          <template v-else-if="res.type === 'code'">
            <select v-model="res.language" @change="markDirty"
              class="text-sm border border-slate-300 rounded px-2 py-1 bg-white">
              <option v-for="lang in codeLanguages" :key="lang.value" :value="lang.value">{{ lang.label }}</option>
            </select>
            <textarea v-model="res.content" @input="markDirty" rows="6" placeholder="输入程序代码..."
              class="w-full text-sm border border-slate-300 rounded px-3 py-2 font-mono bg-slate-900 text-green-400"></textarea>
          </template>
        </div>
      </div>

      <button @click="addResource"
        class="w-full py-3 mb-6 text-sm text-slate-600 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50">
        + 添加教学资源
      </button>
    </div>

    <!-- ========== 学生任务编辑 ========== -->
    <div v-show="editorTab === 'tasks'">
      <!-- 课前任务 -->
      <section class="bg-white border border-amber-200 rounded-lg p-4 mb-4">
        <div class="flex items-center gap-2 mb-3">
          <span class="w-1.5 h-5 rounded-full bg-amber-500"></span>
          <input v-model="draft.studentTasks.preclass.title" @input="markDirty"
            class="text-sm font-bold text-slate-700 border-b border-transparent hover:border-slate-300 focus:border-amber-400 outline-none px-1"
            placeholder="课前任务" />
          <span class="text-xs text-slate-400">课前预习</span>
        </div>
        <div class="space-y-2">
          <BlockEditor
            v-for="(block, i) in draft.studentTasks.preclass.content"
            :key="'pre-' + i"
            :block="block"
            :index="i"
            @remove="removeBlock(draft.studentTasks.preclass.content, i)"
            @move-up="moveBlock(draft.studentTasks.preclass.content, i, -1)"
            @move-down="moveBlock(draft.studentTasks.preclass.content, i, 1)"
            @change="markDirty"
          />
        </div>
        <button @click="addBlock(draft.studentTasks.preclass.content)"
          class="mt-2 w-full py-2 text-sm text-amber-600 border border-dashed border-amber-300 rounded hover:bg-amber-50">
          + 添加内容块
        </button>
      </section>

      <!-- 课后任务 -->
      <section class="bg-white border border-violet-200 rounded-lg p-4 mb-6">
        <div class="flex items-center gap-2 mb-3">
          <span class="w-1.5 h-5 rounded-full bg-violet-500"></span>
          <input v-model="draft.studentTasks.postclass.title" @input="markDirty"
            class="text-sm font-bold text-slate-700 border-b border-transparent hover:border-slate-300 focus:border-violet-400 outline-none px-1"
            placeholder="课后任务" />
          <span class="text-xs text-slate-400">课后回顾与习题</span>
        </div>
        <div class="space-y-2">
          <BlockEditor
            v-for="(block, i) in draft.studentTasks.postclass.content"
            :key="'post-' + i"
            :block="block"
            :index="i"
            @remove="removeBlock(draft.studentTasks.postclass.content, i)"
            @move-up="moveBlock(draft.studentTasks.postclass.content, i, -1)"
            @move-down="moveBlock(draft.studentTasks.postclass.content, i, 1)"
            @change="markDirty"
          />
        </div>
        <button @click="addBlock(draft.studentTasks.postclass.content)"
          class="mt-2 w-full py-2 text-sm text-violet-600 border border-dashed border-violet-300 rounded hover:bg-violet-50">
          + 添加内容块
        </button>
      </section>
    </div>

    <!-- 底部保存栏 -->
    <div class="sticky bottom-0 -mx-6 px-6 py-3 bg-white/95 backdrop-blur border-t border-slate-200 flex items-center gap-2">
      <span v-if="saved" class="text-sm text-green-600">✓ 已保存到本地</span>
      <span v-else-if="isDirty" class="text-sm text-amber-600">有未保存的修改</span>
      <span v-else class="text-sm text-slate-400">内容已保存于本地浏览器</span>
      <div class="flex-1"></div>
      <button @click="handleReset"
        class="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50">
        重置
      </button>
      <button @click="handleExport"
        class="px-3 py-1.5 text-sm text-slate-700 border border-slate-300 rounded hover:bg-slate-50">
        导出JSON
      </button>
      <button @click="handleSave"
        class="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
        保存
      </button>
    </div>
  </div>
</template>
