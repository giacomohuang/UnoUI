<template>
  <section id="showcase-input-otp" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">InputOtp</h2>
      <p class="mt-1 text-xs text-tertiary">分格验证码输入，支持自动提交、异步校验、错误抖动、只读和禁用状态。</p>
    </div>

    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-3 xl:grid-cols-3">
        <div class="grid gap-3 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">尺寸</h3>
          <div class="grid gap-2">
            <InputOtp v-model="otpSizeValues.sm" size="sm" gap="sm" :digits="4" aria-label="小号验证码" @finish="handleSizeFinish('sm', $event)" />
            <InputOtp v-model="otpSizeValues.md" size="md" gap="md" :digits="6" aria-label="中号验证码" @finish="handleSizeFinish('md', $event)" />
            <InputOtp v-model="otpSizeValues.lg" size="lg" gap="lg" :digits="6" aria-label="大号验证码" @finish="handleSizeFinish('lg', $event)" />
          </div>
          <div class="text-xs text-tertiary">填满后自动清空：{{ otpSizeStatus }}</div>
        </div>

        <div class="grid gap-3 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">校验态</h3>
          <InputOtp v-model="otpVerifyValue" :digits="6" autocomplete="one-time-code" @finish="handleVerifyFinish" />
          <div class="grid gap-1 text-xs text-tertiary">
            <span>输入 123456 模拟通过，其它值模拟错误。</span>
            <span class="rounded border border-medium bg-secondary px-2 py-1 text-secondary">{{ otpVerifyStatus }}</span>
          </div>
        </div>

        <div class="grid gap-3 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">状态</h3>
          <InputOtp model-value="2026" :digits="4" readonly aria-label="只读验证码" />
          <InputOtp model-value="8800" :digits="4" disabled aria-label="禁用验证码" />
          <div class="text-xs text-tertiary">只读用于展示已有验证码，禁用态用于提交中或不可编辑场景。</div>
        </div>
      </div>

      <div class="grid gap-3 xl:grid-cols-2">
        <div class="grid gap-3 rounded-md border border-medium bg-secondary/40 p-3">
          <h3 class="text-sm font-bold text-secondary">隐藏字段</h3>
          <InputOtp v-model="otpNamedValue" name="otp_code" :digits="6" @finish="handleNamedFinish" />
          <div class="text-xs text-tertiary">name=otp_code，适合保留原生表单提交值。</div>
        </div>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="inputOtpApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="inputOtpProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="inputOtpEmits" />
          </TabPane>
          <TabPane name="exposes" label="Expose">
            <ParamTable :columns="exposedColumns" :rows="inputOtpExposes" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="inputOtpCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { InputOtp } from '@unoui/vue/inputOtp'
import { Tabs, TabPane } from '@unoui/vue/tab'
import { propsColumns, emitsColumns, exposedColumns } from '@/data/shared'
import { inputOtpCodeExample, inputOtpEmits, inputOtpExposes, inputOtpProps } from '@/data/inputOtp'
import CodeBlock from '@/components/CodeBlock.vue'
import ParamTable from '@/components/ParamTable.vue'

const inputOtpApiTab = ref('props')
const otpSizeValues = ref({
  sm: '',
  md: '',
  lg: ''
})
const otpSizeStatus = ref('等待输入')
const otpVerifyValue = ref('')
const otpVerifyStatus = ref('等待输入')
const otpNamedValue = ref('')

function handleSizeFinish(size: 'sm' | 'md' | 'lg', callback: (success: boolean) => void) {
  otpSizeStatus.value = `${size} 已提交`
  callback(true)
}

function handleVerifyFinish(callback: (success: boolean) => void) {
  const success = otpVerifyValue.value === '123456'
  otpVerifyStatus.value = success ? '验证通过' : '验证码错误，组件会清空并抖动'
  callback(success)
}

function handleNamedFinish(callback: (success: boolean) => void) {
  callback(true)
}
</script>
