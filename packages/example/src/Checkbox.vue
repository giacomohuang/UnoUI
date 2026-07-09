<template>
  <section id="showcase-checkbox" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Checkbox</h2>
      <p class="mt-1 text-xs text-tertiary">CheckboxGroup 负责数组 v-model，Checkbox 表达单个选项。</p>
    </div>
    <div class="grid gap-5 p-4 text-sm text-secondary">
      <div class="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)] md:items-center">
        <span class="text-xs font-medium text-tertiary">尺寸</span>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Checkbox v-for="size in checkboxSizes" :key="size" checked :size="size">
            <span class="font-mono text-xs">{{ size }}</span>
          </Checkbox>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)] md:items-start">
        <span class="pt-2 text-xs font-medium text-tertiary">状态</span>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Checkbox :checked="checkboxEnabled" @change="setCheckboxEnabled">受控：{{ checkboxEnabled ? "true" : "false" }}</Checkbox>
          <Checkbox checked>默认选中</Checkbox>
          <Checkbox disabled>禁用未选</Checkbox>
          <Checkbox checked disabled>禁用选中</Checkbox>
          <Checkbox indeterminate>部分选中</Checkbox>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)] md:items-start">
        <span class="pt-1.5 text-xs font-medium text-tertiary">组</span>
        <div class="grid gap-3">
          <Checkbox :checked="checkboxGroupAllChecked" :indeterminate="checkboxGroupIndeterminate" @change="toggleCheckboxGroupAll">含禁用项全选</Checkbox>
          <CheckboxGroup v-model="checkboxGroupValue">
            <Checkbox v-for="option in checkboxGroupOptions" :key="option.value" :value="option.value" :disabled="option.disabled">
              {{ option.label }}
            </Checkbox>
          </CheckboxGroup>
          <div class="flex flex-wrap items-center gap-2 text-xs text-tertiary">
            <span>已选</span>
            <span class="rounded border border-medium bg-secondary px-2 py-1 text-secondary">{{ checkboxGroupValue.join("、") || "无" }}</span>
          </div>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)] md:items-start">
        <span class="pt-1.5 text-xs font-medium text-tertiary">全选</span>
        <div class="grid gap-3">
          <Checkbox :checked="checkboxPlainAllChecked" :indeterminate="checkboxPlainIndeterminate" @change="toggleCheckboxPlainAll">全选</Checkbox>
          <CheckboxGroup v-model="checkboxPlainValue">
            <Checkbox v-for="option in checkboxPlainOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </Checkbox>
          </CheckboxGroup>
          <div class="flex flex-wrap items-center gap-2 text-xs text-tertiary">
            <span>已选</span>
            <span class="rounded border border-medium bg-secondary px-2 py-1 text-secondary">{{ checkboxPlainValue.join("、") || "无" }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — Checkbox</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="checkboxApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="checkboxProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="checkboxEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="checkboxSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — CheckboxGroup</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="checkboxGroupApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="checkboxGroupProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="checkboxGroupEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="checkboxGroupSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <!-- 示例代码 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="checkboxCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { Checkbox, CheckboxGroup } from "@unoui/vue/checkbox";
import { Tabs, TabPane } from "@unoui/vue/tab";
import { propsColumns, emitsColumns, slotsColumns } from "@/data/shared";
import { checkboxProps, checkboxGroupProps, checkboxEmits, checkboxGroupEmits, checkboxSlots, checkboxGroupSlots, checkboxCodeExample } from "@/data/checkbox";
import ParamTable from "@/components/ParamTable.vue";
import CodeBlock from "@/components/CodeBlock.vue";

type CheckboxSize = "sm" | "md" | "lg";

const checkboxApiTab = ref("props");
const checkboxGroupApiTab = ref("props");
const checkboxEnabled = ref(true);
const checkboxSizes: CheckboxSize[] = ["sm", "md", "lg"];
const checkboxGroupValue = ref<string[]>(["地图编辑", "路径规划"]);
const checkboxGroupOptions = [
  { label: "地图编辑", value: "地图编辑" },
  { label: "路径规划", value: "路径规划" },
  { label: "资源管理", value: "资源管理" },
  { label: "禁用项", value: "禁用项", disabled: true },
];
const checkboxGroupAllValues = computed(() => checkboxGroupOptions.map((option) => option.value));
const checkboxGroupEnabledValues = computed(() => checkboxGroupOptions.filter((option) => !option.disabled).map((option) => option.value));
const checkboxGroupDisabledValues = computed(() => checkboxGroupOptions.filter((option) => option.disabled).map((option) => option.value));
const checkboxGroupAllChecked = computed(() => checkboxGroupAllValues.value.length > 0 && checkboxGroupAllValues.value.every((value) => checkboxGroupValue.value.includes(value)));
const checkboxGroupIndeterminate = computed(() => checkboxGroupValue.value.length > 0 && !checkboxGroupAllChecked.value);
const checkboxPlainValue = ref<string[]>(["查看"]);
const checkboxPlainOptions = [
  { label: "查看", value: "查看" },
  { label: "新增", value: "新增" },
  { label: "编辑", value: "编辑" },
  { label: "删除", value: "删除" },
];
const checkboxPlainAllValues = computed(() => checkboxPlainOptions.map((option) => option.value));
const checkboxPlainAllChecked = computed(() => checkboxPlainAllValues.value.length > 0 && checkboxPlainAllValues.value.every((value) => checkboxPlainValue.value.includes(value)));
const checkboxPlainIndeterminate = computed(() => checkboxPlainValue.value.length > 0 && !checkboxPlainAllChecked.value);

function setCheckboxEnabled(checked: boolean) {
  checkboxEnabled.value = checked;
}

function toggleCheckboxGroupAll(checked: boolean) {
  const disabledSelectedValues = checkboxGroupValue.value.filter((value) => checkboxGroupDisabledValues.value.includes(value));
  checkboxGroupValue.value = checked ? [...disabledSelectedValues, ...checkboxGroupEnabledValues.value] : disabledSelectedValues;
}

function toggleCheckboxPlainAll(checked: boolean) {
  checkboxPlainValue.value = checked ? [...checkboxPlainAllValues.value] : [];
}
</script>
