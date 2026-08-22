<script setup>
import { computed } from 'vue'
import ResourcePlayer from './ResourcePlayer.vue'

const props = defineProps({
  knowledge: { type: Object, default: () => ({ resources: [] }) }
})

const resources = computed(() => props.knowledge.resources || [])

const typeMeta = {
  image: { label: '图片', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', cls: 'text-emerald-600 bg-emerald-50' },
  video: { label: '视频', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', cls: 'text-red-600 bg-red-50' },
  link: { label: '链接', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', cls: 'text-blue-600 bg-blue-50' },
  doc: { label: '文档', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', cls: 'text-amber-600 bg-amber-50' },
  audio: { label: '音频', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z', cls: 'text-purple-600 bg-purple-50' },
  slide: { label: '课件', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', cls: 'text-indigo-600 bg-indigo-50' },
  snippet: { label: '语句片段', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', cls: 'text-teal-600 bg-teal-50' },
  code: { label: '程序示例', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', cls: 'text-slate-700 bg-slate-200' }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <!-- 教学资源区 -->
    <section v-if="resources.length">
      <div class="flex items-center gap-2 mb-5">
        <span class="w-1 h-6 bg-emerald-500 rounded-full"></span>
        <h2 class="text-xl font-bold text-slate-800">教学资源</h2>
        <span class="text-xs text-slate-400 ml-2">共 {{ resources.length }} 项</span>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="(res, i) in resources"
          :key="i"
          class="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition"
          :class="(res.type === 'snippet' || res.type === 'code') ? 'sm:col-span-2' : ''"
        >
          <!-- 图片/视频直接预览 -->
          <div v-if="res.type === 'image' || res.type === 'video'" class="border-b border-slate-100">
            <ResourcePlayer
              :type="res.type"
              :src="res.src"
              :poster="res.poster"
              :caption="''"
            />
          </div>

          <!-- 语句片段 -->
          <div v-else-if="res.type === 'snippet'" class="p-5">
            <div class="flex items-start gap-3">
              <svg class="w-8 h-8 text-teal-200 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs px-1.5 py-0.5 rounded text-teal-600 bg-teal-50">语句片段</span>
                  <h4 v-if="res.title" class="text-sm font-medium text-slate-700">{{ res.title }}</h4>
                </div>
                <blockquote class="text-slate-700 italic leading-relaxed border-l-4 border-teal-300 pl-4">{{ res.content }}</blockquote>
                <p v-if="res.source" class="text-xs text-slate-400 mt-2 text-right">—— {{ res.source }}</p>
              </div>
            </div>
          </div>

          <!-- 程序示例 -->
          <div v-else-if="res.type === 'code'" class="p-5">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs px-1.5 py-0.5 rounded text-slate-600 bg-slate-200">程序示例</span>
              <h4 v-if="res.title" class="text-sm font-medium text-slate-700">{{ res.title }}</h4>
              <span v-if="res.language" class="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">{{ res.language }}</span>
            </div>
            <pre class="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed"><code>{{ res.content }}</code></pre>
          </div>

          <!-- 其他类型（链接/文档/音频/课件） -->
          <div v-else class="p-4">
            <div class="flex items-start gap-3">
              <span
                class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                :class="(typeMeta[res.type] || typeMeta.link).cls"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    :d="(typeMeta[res.type] || typeMeta.link).icon" />
                </svg>
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-xs px-1.5 py-0.5 rounded"
                    :class="(typeMeta[res.type] || typeMeta.link).cls">
                    {{ (typeMeta[res.type] || typeMeta.link).label }}
                  </span>
                </div>
                <h4 class="font-medium text-slate-800 text-sm leading-snug">{{ res.title }}</h4>
                <p v-if="res.desc" class="text-xs text-slate-500 mt-1 leading-relaxed">{{ res.desc }}</p>
                <a
                  v-if="res.type === 'link' || res.type === 'doc' || res.type === 'audio' || res.type === 'slide'"
                  :href="res.src"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  打开资源
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 空状态 -->
    <div v-else class="text-center py-20 text-slate-400">
      <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <p class="text-sm">本课暂无教学资源</p>
      <p class="text-xs mt-1">点击右上角「编辑」按钮添加</p>
    </div>
  </div>
</template>
