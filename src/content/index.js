// 内容加载工具
// 课时内容与目录均支持 localStorage 持久化（教师在网页中编辑后保存）
import { reactive } from 'vue'

const modules = import.meta.glob('./*/**/*.json', { eager: true })
const rootModules = import.meta.glob('./*.json', { eager: true })

const STORAGE_LESSON = 'ebook-lesson-'
const STORAGE_CATALOG = 'ebook-catalog'

// 原始打包目录
const rawCatalog = rootModules['./index.json'].default

/**
 * 深拷贝
 */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 校验目录数据结构是否完整
 */
function isValidCatalog(obj) {
  return obj && Array.isArray(obj.stages) && obj.stages.length > 0 &&
    obj.stages.every(s => Array.isArray(s.units) &&
      s.units.every(u => Array.isArray(u.lessons)))
}

/**
 * 获取教材目录（优先读取 localStorage 中教师编辑过的版本）
 */
export function getCatalog() {
  try {
    const saved = localStorage.getItem(STORAGE_CATALOG)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (isValidCatalog(parsed)) return parsed
      // 数据损坏，清除并回退
      console.warn('本地目录数据损坏，已回退到原始目录')
      localStorage.removeItem(STORAGE_CATALOG)
    }
  } catch (e) {
    console.warn('读取本地目录失败，使用原始目录', e)
  }
  return clone(rawCatalog)
}

// 响应式目录状态，所有组件共享，修改后自动同步更新
export const catalog = reactive(getCatalog())

/**
 * 将最新数据同步到响应式 catalog
 */
function syncCatalog(data) {
  // 先深拷贝，避免 data 与 catalog 是同一引用时删除 key 把源数据也清空
  const fresh = data ? clone(data) : getCatalog()
  Object.keys(catalog).forEach((k) => delete catalog[k])
  Object.assign(catalog, fresh)
}

/**
 * 保存目录到 localStorage 并同步响应式状态
 */
export function saveCatalog(data) {
  localStorage.setItem(STORAGE_CATALOG, JSON.stringify(data))
  // 如果传入的就是响应式 catalog 本身，它已经是响应式的，无需再同步
  if (data !== catalog) {
    syncCatalog(data)
  }
}

/**
 * 重置目录为原始版本
 */
export function resetCatalog() {
  localStorage.removeItem(STORAGE_CATALOG)
  syncCatalog()
}

/**
 * 目录是否有本地编辑
 */
export function hasCatalogEdit() {
  return localStorage.getItem(STORAGE_CATALOG) !== null
}

/**
 * 遍历所有课时（扁平化）
 */
export function getAllLessons() {
  const cat = getCatalog()
  const all = []
  for (const stage of cat.stages) {
    for (const unit of stage.units) {
      for (const lesson of unit.lessons) {
        all.push({ ...lesson, stageId: stage.id, stageTitle: stage.title, unitId: unit.id, unitTitle: unit.title })
      }
    }
  }
  return all
}

/**
 * 根据课时 ID 获取课时原始数据（打包版本）
 */
function getRawLesson(id) {
  for (const stage of rawCatalog.stages) {
    for (const unit of stage.units) {
      for (const lesson of unit.lessons) {
        if (lesson.id === id) {
          const key = `./${lesson.file}`
          return modules[key] ? modules[key].default : null
        }
      }
    }
  }
  return null
}

/**
 * 根据课时 ID 获取课时数据（优先读取 localStorage）
 */
export function getLessonById(id) {
  // 1. 优先读 localStorage（包含编辑过的原始课时和纯新建课时）
  try {
    const saved = localStorage.getItem(STORAGE_LESSON + id)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('读取本地课时失败', e)
  }
  // 2. 回退到打包版本
  return getRawLesson(id)
}

/**
 * 保存课时内容到 localStorage
 */
export function saveLesson(id, data) {
  localStorage.setItem(STORAGE_LESSON + id, JSON.stringify(data))
}

/**
 * 课时是否有本地编辑版本
 */
export function hasLocalEdit(id) {
  return localStorage.getItem(STORAGE_LESSON + id) !== null
}

/**
 * 重置课时：删除 localStorage 中的编辑版本
 */
export function resetLesson(id) {
  localStorage.removeItem(STORAGE_LESSON + id)
}

/**
 * 删除课时（同时删除内容和目录中的注册）
 */
export function deleteLesson(id) {
  localStorage.removeItem(STORAGE_LESSON + id)
  const cat = getCatalog()
  for (const stage of cat.stages) {
    for (const unit of stage.units) {
      const idx = unit.lessons.findIndex((l) => l.id === id)
      if (idx >= 0) {
        unit.lessons.splice(idx, 1)
        saveCatalog(cat)
        return true
      }
    }
  }
  return false
}

/**
 * 创建空白课时模板
 */
export function createBlankLesson(id, title, unitTitle) {
  return {
    id,
    unit: unitTitle || '新建单元',
    title: title || '新建课时',
    project: '',
    duration: '1课时',
    objectives: [],
    sections: {
      intro: { title: '导入', content: [{ type: 'text', value: '' }] },
      tasks: [
        { title: '学习任务1', content: [{ type: 'text', value: '' }] },
        { title: '学习任务2', content: [{ type: 'text', value: '' }] },
        { title: '学习任务3', content: [{ type: 'text', value: '' }] }
      ],
      summary: { title: '总结', content: [{ type: 'text', value: '' }] }
    },
    knowledge: {
      sections: [
        { title: '知识要点', content: [{ type: 'text', value: '' }] }
      ],
      resources: []
    },
    studentTasks: {
      preclass: { title: '课前任务', content: [] },
      postclass: { title: '课后任务', content: [] }
    }
  }
}

/**
 * 添加新课时
 * @param {object} opts - { id, title, stageId, unitId, stageTitle?, unitTitle?, createNewUnit? }
 */
export function addLesson(opts) {
  const cat = getCatalog()
  let stage = cat.stages.find((s) => s.id === opts.stageId)

  // 新建学段
  if (!stage) {
    stage = { id: opts.stageId, title: opts.stageTitle || '新学段', units: [] }
    cat.stages.push(stage)
  }

  let unit = stage.units.find((u) => u.id === opts.unitId)

  // 新建单元
  if (!unit) {
    unit = { id: opts.unitId, title: opts.unitTitle || '新单元', lessons: [] }
    stage.units.push(unit)
  }

  // 注册课时（file 为空表示纯本地课时）
  unit.lessons.push({ id: opts.id, title: opts.title, file: '' })

  // 创建空白课时内容
  const lesson = createBlankLesson(opts.id, opts.title, unit.title)
  saveLesson(opts.id, lesson)
  saveCatalog(cat)
  return lesson
}

/**
 * 导出课时 JSON 文件
 */
export function exportLesson(id, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${id}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 获取上一课/下一课信息
 */
export function getAdjacentLessons(id) {
  const all = getAllLessons()
  const idx = all.findIndex((l) => l.id === id)
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null
  }
}
