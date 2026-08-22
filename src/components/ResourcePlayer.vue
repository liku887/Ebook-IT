<script setup>
// 多媒体资源播放器：支持图片、视频、动画（Lottie 预留）
defineProps({
  type: { type: String, required: true },
  src: { type: String, default: '' },
  poster: { type: String, default: '' },
  caption: { type: String, default: '' }
})
</script>

<template>
  <figure class="my-4">
    <!-- 图片 -->
    <img
      v-if="type === 'image'"
      :src="src"
      :alt="caption"
      class="w-full max-w-3xl mx-auto rounded-lg border border-slate-200"
    />
    <!-- 视频 -->
    <video
      v-else-if="type === 'video'"
      :src="src"
      :poster="poster"
      controls
      preload="metadata"
      class="w-full max-w-3xl mx-auto rounded-lg border border-slate-200 bg-black"
    ></video>
    <!-- 动画（Lottie 预留） -->
    <div
      v-else-if="type === 'animation'"
      class="w-full max-w-3xl mx-auto p-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-sm text-slate-500"
    >
      动画资源：{{ src }}
    </div>

    <figcaption v-if="caption" class="mt-2 text-center text-sm text-slate-500">
      {{ caption }}
    </figcaption>
  </figure>
</template>
