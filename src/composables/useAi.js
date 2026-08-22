// 大模型 API 配置与调用
import { reactive } from 'vue'

const STORAGE_KEY = 'ebook-ai-config'

// 预设服务商
export const AI_PROVIDERS = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-reasoner']
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4-flash', 'glm-4-plus', 'glm-4-air']
  },
  {
    id: 'moonshot',
    name: 'Kimi（月之暗面）',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k']
  },
  {
    id: 'qwen',
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max']
  },
  {
    id: 'custom',
    name: '自定义（OpenAI 兼容）',
    baseUrl: '',
    models: []
  }
]

function defaultConfig() {
  return {
    provider: 'deepseek',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    tested: false
  }
}

function loadConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...defaultConfig(), ...parsed }
    }
  } catch (e) {
    console.warn('读取AI配置失败', e)
  }
  return defaultConfig()
}

// 响应式配置状态
export const aiConfig = reactive(loadConfig())

export function saveAiConfig() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(aiConfig))
}

// 切换服务商时自动填充
export function onProviderChange(providerId) {
  const p = AI_PROVIDERS.find((x) => x.id === providerId)
  if (p && p.id !== 'custom') {
    aiConfig.baseUrl = p.baseUrl
    if (p.models.length > 0 && !p.models.includes(aiConfig.model)) {
      aiConfig.model = p.models[0]
    }
  }
  aiConfig.tested = false
}

// 配置是否完整
export function isAiConfigValid() {
  return !!(aiConfig.apiKey && aiConfig.baseUrl && aiConfig.model)
}

// AI 是否已就绪（配置完整且连通测试通过）
export function isAiReady() {
  return isAiConfigValid() && aiConfig.tested
}

// 调用大模型 API（OpenAI 兼容格式）
async function callChatApi(messages, { temperature = 0.7, jsonMode = false } = {}) {
  if (!isAiConfigValid()) {
    throw new Error('请先完成 API 配置')
  }
  const body = {
    model: aiConfig.model,
    messages,
    temperature
  }
  if (jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  const resp = await fetch(`${aiConfig.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aiConfig.apiKey}`
    },
    body: JSON.stringify(body)
  })

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '')
    throw new Error(`API 请求失败 (${resp.status}): ${errText.substring(0, 200)}`)
  }

  const data = await resp.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('API 返回内容为空')
  return content
}

// 连通性测试
export async function testAiConnection() {
  if (!isAiConfigValid()) {
    return { ok: false, message: '请填写 API Key、接口地址和模型名称' }
  }
  try {
    const content = await callChatApi(
      [{ role: 'user', content: '请回复"连接成功"四个字。' }],
      { temperature: 0, jsonMode: false }
    )
    aiConfig.tested = true
    saveAiConfig()
    return { ok: true, message: `连接成功，模型回复：${content.substring(0, 50)}` }
  } catch (e) {
    aiConfig.tested = false
    return { ok: false, message: e.message }
  }
}

// 从 AI 返回文本中提取 JSON
function extractJson(text) {
  // 去除可能的 markdown 代码块包裹
  let cleaned = text.trim()
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) cleaned = fenceMatch[1].trim()
  return JSON.parse(cleaned)
}

// ===== 系统提示词：数据结构规范 =====

const SCHEMA_TEXT = `你是信息科技数字教材的内容生成助手。请严格按照以下数据结构输出。

内容块类型：
- text: { "type": "text", "value": "文本内容" }
- tip: { "type": "tip", "kind": "think|info|warn", "value": "提示内容" }
- link: { "type": "link", "title": "标题", "url": "https://...", "desc": "描述" }
- code: { "type": "code", "title": "标题", "language": "python|javascript|java|cpp|html|css|sql|bash|text", "content": "代码" }
- mindmap: { "type": "mindmap", "code": "flowchart TD\\n    A[开始] --> B[结束]" }
- interactive 选择题: { "type": "interactive", "component": "ChoiceExercise", "data": { "question": "题干", "options": ["A选项","B选项","C选项","D选项"], "answer": 0, "explanation": "解析" } }
- interactive 填空题: { "type": "interactive", "component": "FillExercise", "data": { "question": "题干，用____表示空位", "answers": ["答案1"], "explanation": "解析" } }
- knowledge 知识卡片: { "type": "knowledge", "title": "知识标题", "content": [内容块数组] }`

/**
 * 生成文本（用于文本段落、提示框等）
 * @returns {Promise<string>}
 */
export async function generateText(userPrompt, context = '') {
  const sysPrompt = `${SCHEMA_TEXT}

当前任务：生成一段教学文本内容。只返回文本本身，不要加任何解释或 JSON 包裹。
${context ? `上下文：${context}` : ''}`
  return callChatApi([
    { role: 'system', content: sysPrompt },
    { role: 'user', content: userPrompt }
  ], { temperature: 0.7 })
}

/**
 * 生成一道选择题
 */
export async function generateChoiceExercise(userPrompt, context = '') {
  const sysPrompt = `${SCHEMA_TEXT}

当前任务：生成一道选择题。必须返回 JSON 对象，格式为：
{"question":"题干","options":["选项A","选项B","选项C","选项D"],"answer":0,"explanation":"解析"}
answer 是正确选项的索引（从0开始）。只返回 JSON，不要其他内容。
${context ? `上下文：${context}` : ''}`
  const raw = await callChatApi(
    [{ role: 'system', content: sysPrompt }, { role: 'user', content: userPrompt }],
    { temperature: 0.7, jsonMode: true }
  )
  return extractJson(raw)
}

/**
 * 生成一道填空题
 */
export async function generateFillExercise(userPrompt, context = '') {
  const sysPrompt = `${SCHEMA_TEXT}

当前任务：生成一道填空题。必须返回 JSON 对象，格式为：
{"question":"题干，用____表示空位","answers":["答案1","答案2"],"explanation":"解析"}
answers 数组中每个元素对应一个空位的答案。只返回 JSON，不要其他内容。
${context ? `上下文：${context}` : ''}`
  const raw = await callChatApi(
    [{ role: 'system', content: sysPrompt }, { role: 'user', content: userPrompt }],
    { temperature: 0.7, jsonMode: true }
  )
  return extractJson(raw)
}

/**
 * 批量生成内容块（追加到任务/环节中）
 * @returns {Promise<Array>} 内容块数组
 */
export async function generateBlocks(userPrompt, context = '') {
  const sysPrompt = `${SCHEMA_TEXT}

当前任务：批量生成教学内容块。必须返回 JSON 对象，格式为：
{"blocks": [内容块1, 内容块2, ...]}
blocks 数组中的每个元素必须是上述内容块类型之一。可以生成多个。只返回 JSON，不要其他内容。
${context ? `上下文：${context}` : ''}`
  const raw = await callChatApi(
    [{ role: 'system', content: sysPrompt }, { role: 'user', content: userPrompt }],
    { temperature: 0.7, jsonMode: true }
  )
  const parsed = extractJson(raw)
  if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
    throw new Error('返回格式不正确：缺少 blocks 数组')
  }
  return parsed.blocks
}
