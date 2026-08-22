<script setup>
import { ref, computed } from 'vue'
import { aiConfig, AI_PROVIDERS, saveAiConfig, onProviderChange, isAiConfigValid, testAiConnection } from '../composables/useAi'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const testing = ref(false)
const testResult = ref(null) // { ok, message }

const currentProvider = computed(() => AI_PROVIDERS.find((p) => p.id === aiConfig.provider))
const modelOptions = computed(() => currentProvider.value?.models || [])

function handleProviderChange(e) {
  onProviderChange(e.target.value)
  testResult.value = null
}

async function handleTest() {
  testing.value = true
  testResult.value = null
  const result = await testAiConnection()
  testResult.value = result
  testing.value = false
}

function handleSave() {
  if (!isAiConfigValid()) {
    testResult.value = { ok: false, message: '请填写 API Key、接口地址和模型名称' }
    return
  }
  saveAiConfig()
  emit('close')
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          大模型 API 配置
        </h3>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <!-- 服务商 -->
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">服务商</label>
          <select :value="aiConfig.provider" @change="handleProviderChange"
            class="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white">
            <option v-for="p in AI_PROVIDERS" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>

        <!-- API Key -->
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">API Key</label>
          <input v-model="aiConfig.apiKey" type="password" placeholder="sk-..."
            class="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
            @input="aiConfig.tested = false; testResult = null" />
        </div>

        <!-- 接口地址 -->
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">接口地址</label>
          <input v-model="aiConfig.baseUrl" placeholder="https://api.deepseek.com/v1"
            class="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
            @input="aiConfig.tested = false; testResult = null" />
        </div>

        <!-- 模型名称 -->
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">模型名称</label>
          <input v-if="modelOptions.length === 0" v-model="aiConfig.model" placeholder="模型名称"
            class="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
            @input="aiConfig.tested = false; testResult = null" />
          <select v-else v-model="aiConfig.model"
            class="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
            @change="aiConfig.tested = false; testResult = null">
            <option v-for="m in modelOptions" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>

        <!-- 测试结果 -->
        <div v-if="testResult"
          class="text-xs p-2.5 rounded-lg"
          :class="testResult.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'">
          {{ testResult.message }}
        </div>

        <!-- 状态提示 -->
        <div v-if="aiConfig.tested" class="text-xs text-green-600 flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          已通过连通性测试
        </div>
      </div>

      <div class="flex items-center gap-2 mt-6">
        <button @click="handleTest" :disabled="testing"
          class="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          {{ testing ? '测试中...' : '连通性测试' }}
        </button>
        <div class="flex-1"></div>
        <button @click="emit('close')"
          class="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">取消</button>
        <button @click="handleSave"
          class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存</button>
      </div>
    </div>
  </div>
</template>
