<template>
  <section id="showcase-form" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">Form</h2>
      <p class="mt-1 text-xs text-tertiary">基于 async-validator 的表单校验，支持表单级规则、字段级规则、内置正则 preset、inline 布局和公开校验方法。</p>
    </div>
    <div class="grid min-w-0 gap-5 p-4 text-sm text-secondary">
      <div class="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
        <div class="min-w-0 rounded-md border border-medium bg-secondary/40">
          <div class="flex items-center justify-between gap-3 border-b border-medium px-4 py-3">
            <div>
              <h3 class="text-sm font-bold text-secondary">项目配置</h3>
              <p class="mt-1 text-xs text-tertiary">覆盖必填、内置 preset、字段级规则和提交校验。</p>
            </div>
            <Tag :color="formSubmitPassed ? 'green' : 'gray'" radius="sm">{{ formSubmitPassed ? "valid" : "pending" }}</Tag>
          </div>
          <div class="p-4">
            <Form ref="showcaseFormRef" :model="formDemoModel" :rules="formDemoRules" label-width="112px" item-gap="18px" @validate="handleFormValidate" @submit.prevent="submitShowcaseForm">
              <div class="mb-3 flex items-center gap-2 border-b border-dashed border-medium pb-2 text-xs font-bold uppercase text-tertiary">
                <span class="i-lucide:file-sliders size-3.5"></span>
                <span>基础信息</span>
              </div>
              <div class="grid min-w-0 items-start gap-x-5 xl:grid-cols-2">
                <FormItem prop="name" label="名称">
                  <Input v-model="formDemoModel.name" placeholder="请输入项目名称" clearable prefix-icon="i-lucide:building-2" />
                </FormItem>
                <FormItem prop="projectId" label="项目 ID" info="用于接口调用的唯一标识，仅支持字母、数字、下划线和短横线。">
                  <Input v-model="formDemoModel.projectId" placeholder="letters_numbers-01" clearable />
                </FormItem>
                <FormItem prop="email" label="邮箱">
                  <Input v-model="formDemoModel.email" placeholder="user@example.com" clearable prefix-icon="i-lucide:mail" />
                </FormItem>
                <FormItem prop="phone" label="手机号">
                  <Input v-model="formDemoModel.phone" placeholder="13800138000" clearable prefix-icon="i-lucide:phone" />
                </FormItem>
                <FormItem prop="domain" label="官网">
                  <Input v-model="formDemoModel.domain" placeholder="https://vmap.local" clearable prefix-icon="i-lucide:globe-2" />
                </FormItem>
                <FormItem
                  prop="color"
                  label="主题色"
                  :rules="[
                    { required: true, message: '请输入主题色' },
                    { preset: 'hexColor', trigger: 'change' },
                  ]"
                >
                  <div class="flex min-w-0 items-center gap-2">
                    <ColorPicker v-model="formDemoModel.themeColor" :allow-gradient="false" :allow-alpha="false" />
                    <Input v-model="formDemoModel.color" placeholder="#2563eb" clearable class="min-w-0 flex-1" />
                  </div>
                </FormItem>
                <FormItem prop="mode" label="展示模式">
                  <Select v-model="formDemoModel.mode" :options="formModeOptions" />
                </FormItem>
                <FormItem prop="status" label="状态">
                  <Select v-model="formDemoModel.status" :options="formStatusOptions" />
                </FormItem>
              </div>

              <div class="mb-3 mt-1 flex items-center gap-2 border-b border-dashed border-medium pb-2 text-xs font-bold uppercase text-tertiary">
                <span class="i-lucide:settings-2 size-3.5"></span>
                <span>发布设置</span>
              </div>
              <div class="grid min-w-0 items-start gap-x-5 xl:grid-cols-2">
                <FormItem prop="modules" label="启用模块">
                  <Select v-model="formDemoModel.modules" multiple collapse-tags clearable :options="formModuleOptions" placeholder="选择模块" />
                </FormItem>
                <FormItem prop="owner" label="负责人">
                  <Autocomplete v-model="formDemoModel.owner" :data-source="formOwnerOptions" clearable prefix-icon="i-lucide:user-search" placeholder="搜索负责人" />
                </FormItem>
                <FormItem prop="publishDate" label="发布日期">
                  <DatePicker v-model="formDemoModel.publishDate" clearable />
                </FormItem>
                <FormItem prop="maintainRange" label="维护窗口">
                  <RangePicker v-model="formDemoModel.maintainRange" clearable :placeholder="['开始日期', '结束日期']" />
                </FormItem>
                <FormItem prop="visibility" label="访问范围">
                  <RadioGroup v-model="formDemoModel.visibility" name="form-visibility" class="min-h-9">
                    <Radio value="public">公开</Radio>
                    <Radio value="internal">内部</Radio>
                    <Radio value="private">私有</Radio>
                  </RadioGroup>
                </FormItem>
                <FormItem prop="publishEnabled" label="自动发布">
                  <template #info>
                    <div class="grid gap-1">
                      <strong>自动发布规则</strong>
                      <span>配置通过校验后，将在发布日期自动生效。</span>
                    </div>
                  </template>
                  <div class="flex min-h-9 items-center">
                    <Switch v-model="formDemoModel.publishEnabled" active-text="开" inactive-text="关" />
                  </div>
                </FormItem>
              </div>

              <div class="mb-3 mt-1 flex items-center gap-2 border-b border-dashed border-medium pb-2 text-xs font-bold uppercase text-tertiary">
                <span class="i-lucide:shield-check size-3.5"></span>
                <span>安全与校验</span>
              </div>
              <div class="grid min-w-0 items-start gap-x-5 xl:grid-cols-2">
                <FormItem prop="accessCode" label="验证码">
                  <InputOtp v-model="formDemoModel.accessCode" :digits="4" size="sm" gap="sm" aria-label="访问验证码" />
                </FormItem>
                <FormItem prop="score" label="质量评分">
                  <div class="flex min-h-9 items-center gap-3">
                    <Rate v-model="formDemoModel.score" allow-half size="sm" :tooltips="formScoreTips" />
                    <span class="font-mono text-xs text-tertiary">{{ formDemoModel.score.toFixed(1) }}</span>
                  </div>
                </FormItem>
              </div>

              <div class="mb-3 mt-1 flex items-center gap-2 border-b border-dashed border-medium pb-2 text-xs font-bold uppercase text-tertiary">
                <span class="i-lucide:badge-info size-3.5"></span>
                <span>补充信息</span>
              </div>
              <FormItem prop="tags" label="标签">
                <InputTag v-model="formDemoModel.tags" clearable :max="5" placeholder="输入标签后回车" input-placeholder="继续添加" tag-color="blue" tag-variant="plain" />
              </FormItem>
              <FormItem prop="description" label="说明">
                <Input v-model="formDemoModel.description" multiline :rows="3" :maxlength="120" show-word-limit placeholder="填写配置说明" />
              </FormItem>
              <FormItem>
                <div class="flex items-center gap-2">
                  <Button type="submit" icon="i-lucide:send">提交</Button>
                  <Button variant="outline" icon="i-lucide:check" @click="validateShowcaseForm">校验</Button>
                  <Button variant="outline" icon="i-lucide:rotate-ccw" @click="resetShowcaseForm">重置</Button>
                  <Button variant="mono" icon="i-lucide:eraser" @click="clearShowcaseFormValidate">清除提示</Button>
                </div>
              </FormItem>
            </Form>
          </div>
        </div>

        <div class="grid min-w-0 content-start gap-3">
          <div class="min-w-0 rounded-md border border-medium bg-secondary/40 p-3">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-sm font-bold text-secondary">校验状态</h3>
              <span class="rounded border border-medium bg-primary px-2 py-1 font-mono text-xs text-tertiary">{{ formLastField }}</span>
            </div>
            <div class="mt-3 rounded border border-medium bg-primary px-3 py-2 font-mono text-xs text-tertiary">{{ formValidateLog }}</div>
          </div>

          <div class="min-w-0 rounded-md border border-medium bg-secondary/40 p-3">
            <h3 class="text-sm font-bold text-secondary">当前数据</h3>
            <pre class="mt-3 max-h-56 min-w-0 overflow-auto whitespace-pre-wrap break-words rounded border border-medium bg-primary p-3 text-xs leading-5 text-tertiary">{{ formModelPreview }}</pre>
          </div>

          <div class="min-w-0 rounded-md border border-medium bg-secondary/40 p-3">
            <h3 class="text-sm font-bold text-secondary">内置正则</h3>
            <div class="mt-2 flex flex-wrap gap-2">
              <Tag v-for="preset in formPresetNames" :key="preset" :color="formHighlightedPresets.includes(preset) ? 'brand' : 'blue'" variant="plain" radius="sm">{{ preset }}</Tag>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-md border border-medium bg-secondary/40 p-3">
        <h3 class="text-sm font-bold text-secondary">Inline 检索</h3>
        <Form :model="formInlineModel" inline label-position="top" size="sm" item-gap="10px" class="mt-3">
          <FormItem prop="keyword" label="关键词">
            <Input v-model="formInlineModel.keyword" size="sm" placeholder="搜索关键词" />
          </FormItem>
          <FormItem prop="status" label="状态">
            <Select v-model="formInlineModel.status" size="sm" :options="formStatusOptions" />
          </FormItem>
          <FormItem prop="owner" label="负责人">
            <Input v-model="formInlineModel.owner" size="sm" placeholder="owner" />
          </FormItem>
          <FormItem>
            <Button size="sm" icon="i-lucide:search">查询</Button>
          </FormItem>
        </Form>
      </div>
    </div>

    <!-- API 参数 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — Form</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="formApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="formProps" />
          </TabPane>
          <TabPane name="emits" label="Emits">
            <ParamTable :columns="emitsColumns" :rows="formEmits" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="formSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 参数 — FormItem</h3>
      </div>
      <div class="p-4">
        <Tabs v-model="formItemApiTab" size="sm">
          <TabPane name="props" label="Props">
            <ParamTable :columns="propsColumns" :rows="formItemProps" />
          </TabPane>
          <TabPane name="slots" label="Slots">
            <ParamTable :columns="slotsColumns" :rows="formItemSlots" />
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">API 类型说明</h3>
      </div>
      <div class="grid min-w-0 gap-6 p-4">
        <div class="min-w-0">
          <h4 class="text-sm font-bold text-secondary">FormRule</h4>
          <p class="mt-1 text-xs text-tertiary">继承 async-validator 的 RuleItem，并增加 trigger 和 preset 字段。</p>
          <div class="mt-3">
            <ParamTable :columns="formRuleColumns" :rows="formRuleFields" min-table-width="960px" />
          </div>
        </div>
        <div class="min-w-0">
          <h4 class="text-sm font-bold text-secondary">关联类型</h4>
          <p class="mt-1 text-xs text-tertiary">Props 表中出现的 Form 专用类型均在此展开。</p>
          <div class="mt-3">
            <ParamTable :columns="formTypeColumns" :rows="formTypes" min-table-width="960px" />
          </div>
        </div>
      </div>
    </div>

    <!-- 示例代码 -->
    <div class="border-t border-medium">
      <div class="border-b border-medium px-4 py-3">
        <h3 class="text-sm font-bold text-secondary">示例代码</h3>
      </div>
      <div class="p-4">
        <CodeBlock :code="formCodeExample" lang="html" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { Button } from "@mcistudio/unoui-vue/button";
import { ColorPicker, type ColorPickerValue } from "@mcistudio/unoui-vue/colorpicker";
import { DatePicker, RangePicker } from "@mcistudio/unoui-vue/datepicker";
import { Form, FormItem, formValidatorPatterns, type FormRules } from "@mcistudio/unoui-vue/form";
import { Autocomplete, Input, InputTag } from "@mcistudio/unoui-vue/input";
import { InputOtp } from "@mcistudio/unoui-vue/inputOtp";
import { Radio, RadioGroup } from "@mcistudio/unoui-vue/radio";
import { Rate } from "@mcistudio/unoui-vue/rate";
import { Select, type SelectOption } from "@mcistudio/unoui-vue/select";
import { Switch } from "@mcistudio/unoui-vue/switch";
import { Tabs, TabPane } from "@mcistudio/unoui-vue/tab";
import { Tag } from "@mcistudio/unoui-vue/tag";
import CodeBlock from "@/components/CodeBlock.vue";
import ParamTable from "@/components/ParamTable.vue";
import {
  formProps,
  formEmits,
  formSlots,
  formItemProps,
  formItemSlots,
  formRuleColumns,
  formRuleFields,
  formTypeColumns,
  formTypes,
  formCodeExample,
} from "@/data/form";
import { propsColumns, emitsColumns, slotsColumns } from "@/data/shared";

const formApiTab = ref("props");
const formItemApiTab = ref("props");
const showcaseFormRef = ref<InstanceType<typeof Form>>();
const formDemoModel = ref({
  name: "华东旗舰项目",
  email: "admin@vmap.local",
  phone: "13800138000",
  projectId: "demo_project-01",
  domain: "https://vmap.local",
  color: "#2563eb",
  themeColor: {
    mode: "solid",
    color: "#2563eb",
    hex: "#2563eb",
    css: "background-color:rgba(37,99,235,1)",
  } as ColorPickerValue,
  mode: "viewer",
  status: "enabled",
  modules: ["viewer", "editor"],
  owner: "Giacomo Huang",
  publishDate: "2026-07-01",
  maintainRange: ["2026-07-06", "2026-07-12"] as [string, string],
  visibility: "internal",
  publishEnabled: true,
  accessCode: "2468",
  score: 4.5,
  tags: ["旗舰店", "多楼层", "导航"],
  description: "用于展示地图查看、编辑器和数据看板的项目配置。",
});
const formDemoRules: FormRules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { preset: "email", trigger: ["blur", "change"] },
  ],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { preset: "phoneCN", trigger: ["blur", "change"] },
  ],
  projectId: [
    { required: true, message: "请输入项目 ID", trigger: "blur" },
    { preset: "projectId", trigger: "change" },
  ],
  domain: [{ preset: "url", trigger: "blur" }],
  mode: [{ required: true, message: "请选择展示模式", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
  modules: [{ required: true, type: "array", min: 1, message: "至少选择一个模块", trigger: "change" }],
  owner: [{ required: true, message: "请选择负责人", trigger: "change" }],
  publishDate: [{ required: true, message: "请选择发布日期", trigger: "change" }],
  maintainRange: [{ required: true, type: "array", min: 2, message: "请选择维护窗口", trigger: "change" }],
  visibility: [{ required: true, message: "请选择访问范围", trigger: "change" }],
  accessCode: [
    { required: true, message: "请输入验证码", trigger: "change" },
    { len: 4, message: "验证码需要 4 位数字", trigger: "change" },
  ],
  score: [{ type: "number", min: 3, message: "评分不能低于 3 分", trigger: "change" }],
  tags: [{ required: true, type: "array", min: 1, message: "至少添加一个标签", trigger: "change" }],
  description: [{ max: 120, message: "说明最多 120 个字符", trigger: "change" }],
};
const formModeOptions: SelectOption[] = [
  { label: "地图查看", value: "viewer" },
  { label: "编辑器", value: "editor" },
  { label: "数据看板", value: "dashboard" },
];
const formModuleOptions: SelectOption[] = [
  { label: "地图查看", value: "viewer" },
  { label: "地图编辑器", value: "editor" },
  { label: "数据看板", value: "dashboard" },
  { label: "资源管理", value: "resource" },
  { label: "权限审计", value: "audit" },
];
const formOwnerOptions = [
  { value: "Giacomo Huang", type: "产品" },
  { value: "Map Admin", type: "运营" },
  { value: "Design Ops", type: "设计" },
  { value: "Navigation Team", type: "研发" },
];
const formScoreTips = ["不可用", "待补充", "可试用", "可发布", "高质量"];
const formInlineModel = ref({
  keyword: "入口",
  status: "enabled",
  owner: "Giacomo",
});
const formStatusOptions: SelectOption[] = [
  { label: "启用", value: "enabled" },
  { label: "停用", value: "disabled" },
];
const formPresetNames = Object.keys(formValidatorPatterns);
const formHighlightedPresets = ["email", "phoneCN", "url", "projectId", "hexColor"];
const formValidateLog = ref("等待校验");
const formLastField = ref("none");
const formSubmitPassed = ref(false);
const formModelPreview = computed(() => JSON.stringify(formDemoModel.value, null, 2));
const handleFormValidate = (prop: string | string[] | undefined, valid: boolean, messageText: string) => {
  const field = Array.isArray(prop) ? prop.join(".") : prop;
  formLastField.value = field ?? "form";
  formValidateLog.value = `${field ?? "form"}: ${valid ? "valid" : messageText}`;
  if (!valid) formSubmitPassed.value = false;
};
const validateShowcaseForm = async () => {
  const valid = await showcaseFormRef.value?.validate();
  formSubmitPassed.value = !!valid;
  formValidateLog.value = valid ? "表单校验通过" : "表单校验未通过";
};
const submitShowcaseForm = async () => {
  const valid = await showcaseFormRef.value?.validate();
  formSubmitPassed.value = !!valid;
  formValidateLog.value = valid ? `提交成功：${formDemoModel.value.projectId}` : "提交前请修正表单";
};
const resetShowcaseForm = () => {
  showcaseFormRef.value?.resetFields();
  formSubmitPassed.value = false;
  formLastField.value = "none";
  formValidateLog.value = "已重置";
};
const clearShowcaseFormValidate = () => {
  showcaseFormRef.value?.clearValidate();
  formLastField.value = "none";
  formSubmitPassed.value = false;
  formValidateLog.value = "已清除提示";
};
</script>
