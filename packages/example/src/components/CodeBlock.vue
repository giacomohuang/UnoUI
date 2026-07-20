<template>
  <div class="code-block group relative rounded-lg border border-medium bg-zinc-950/90 dark:bg-zinc-900">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
      <span class="text-xs font-medium text-zinc-400">{{ langLabel }}</span>
      <Button size="sm" variant="mono" @click="handleCopy">
        <span v-if="copied" class="i-lucide:check size-3.5 text-green-400"></span>
        <span v-else class="i-lucide:clipboard size-3.5"></span>
        {{ copied ? '已复制' : '复制' }}
      </Button>
    </div>
    <!-- 代码区域 -->
    <div class="overflow-x-auto">
      <pre class="px-4 py-3 text-sm/6"><code :class="langClass" class="hljs" v-html="highlightedCode"></code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import hljs from 'highlight.js'
import { computed, ref } from 'vue'

import { Button } from '@mcistudio/unoui-vue/button'

const props = withDefaults(
  defineProps<{
    /** code 是要高亮展示的源代码字符串。 */
    code: string
    /** lang 是 highlight.js 语言标识，可选，默认 html（兼容 XML/Vue SFC 模板）。 */
    lang?: string
  }>(),
  {
    lang: 'html'
  }
)

const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

/** langClass 是 highlight.js 需要的 language-* CSS 类名。 */
const langClass = computed(() => `language-${props.lang}`)

/** langLabel 显示用户友好的语言名称。 */
const langLabel = computed(() => {
  const labels: Record<string, string> = {
    html: 'HTML / Vue Template',
    xml: 'HTML / Vue Template',
    typescript: 'TypeScript',
    ts: 'TypeScript',
    javascript: 'JavaScript',
    js: 'JavaScript',
    bash: 'Bash',
    sh: 'Bash',
    shell: 'Bash',
    css: 'CSS'
  }
  return labels[props.lang] ?? props.lang.toUpperCase()
})

/** highlightedCode 是经过 highlight.js 语法高亮后生成的 HTML 字符串。 */
const highlightedCode = computed(() => {
  try {
    const result = hljs.highlight(props.code, { language: props.lang })
    return result.value
  } catch {
    // 高亮失败时回退到自动检测
    try {
      return hljs.highlightAuto(props.code).value
    } catch {
      // 最终回退：仅做 HTML 转义
      return props.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
  }
})

/** handleCopy 将代码内容写入剪贴板，并短暂显示 "已复制" 反馈。 */
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // 降级方案：使用传统的 execCommand
    const textarea = document.createElement('textarea')
    textarea.value = props.code
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<style>
@import 'highlight.js/styles/github-dark.css';
/* highlight.js 在 code-block 内的覆盖样式 */
.hljs {
  background: transparent;
  padding: 0;
  color: #e4e4e7;
}
</style>
