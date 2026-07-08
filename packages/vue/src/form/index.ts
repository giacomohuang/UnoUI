import Schema from "async-validator";
import type { RuleItem, ValidateError, ValidateFieldsError, ValidateMessages, ValidateOption, Values } from "async-validator";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { InjectionKey, Ref } from "vue";

export { default as Form } from "./Form.vue";
export { default as FormItem } from "./FormItem.vue";

export type FormLabelPosition = "left" | "right" | "top";
export type FormSize = "sm" | "md" | "lg";
export type FormValidateStatus = "" | "validating" | "success" | "error";
export type FormValidateTrigger = "blur" | "change" | (string & {});
export type FormProp = string | string[];
export type FormRulePreset = keyof typeof formValidatorPatterns;

export interface FormRule extends RuleItem {
  trigger?: FormValidateTrigger | FormValidateTrigger[];
  preset?: FormRulePreset;
}

export type FormItemRule = FormRule | FormRule[];
export type FormRules<T extends Values = Values> = Partial<Record<keyof T | string, FormItemRule>>;
export type FormValidateCallback = (valid: boolean, invalidFields?: ValidateFieldsError) => void | Promise<void>;

export interface FormItemValidateResult {
  valid: boolean;
  errors?: ValidateError[];
}

export interface FormItemContext {
  prop?: FormProp;
  validateState: Ref<FormValidateStatus>;
  validateMessage: Ref<string>;
  validate: (trigger?: FormValidateTrigger, options?: ValidateOption) => Promise<FormItemValidateResult>;
  resetField: () => void;
  clearValidate: () => void;
  isRequired: Ref<boolean>;
}

export interface FormContext {
  model?: Values;
  rules?: FormRules;
  size: Ref<FormSize>;
  disabled: Ref<boolean>;
  inline: Ref<boolean>;
  labelPosition: Ref<FormLabelPosition>;
  labelWidth: Ref<string | number>;
  reserveLabelSpace: Ref<boolean>;
  itemGap: Ref<string | number>;
  showMessage: Ref<boolean>;
  requireAsteriskPosition: Ref<"left" | "right">;
  hideRequiredAsterisk: Ref<boolean>;
  validateOnRuleChange: Ref<boolean>;
  registerField: (field: FormItemContext) => void;
  unregisterField: (field: FormItemContext) => void;
  getFieldRules: (prop?: FormProp, localRules?: FormItemRule) => FormRule[];
  getFieldValue: (prop?: FormProp) => unknown;
  setFieldValue: (prop: FormProp | undefined, value: unknown) => void;
  validateField: (props?: FormProp | FormProp[], callback?: FormValidateCallback) => Promise<boolean>;
  clearValidate: (props?: FormProp | FormProp[]) => void;
  resetFields: (props?: FormProp | FormProp[]) => void;
  emitValidate: (prop: FormProp | undefined, valid: boolean, message: string) => void;
}

export interface FormValidationPreset {
  pattern: RegExp;
  message: string;
}

export const formContextKey: InjectionKey<FormContext> = Symbol("ui-form-context");

/** formValidatorPatterns 提供管理端表单常用正则，业务规则可通过 preset 直接复用。 */
export const formValidatorPatterns = {
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "请输入正确的邮箱地址" },
  phoneCN: { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" },
  url: { pattern: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w./?%&=+#:-]*)?$/i, message: "请输入正确的 URL" },
  ipv4: { pattern: /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/, message: "请输入正确的 IPv4 地址" },
  idCardCN: { pattern: /(^\d{15}$)|(^\d{17}[\dXx]$)/, message: "请输入正确的身份证号码" },
  postalCodeCN: { pattern: /^\d{6}$/, message: "请输入正确的邮政编码" },
  integer: { pattern: /^-?\d+$/, message: "请输入整数" },
  positiveInteger: { pattern: /^[1-9]\d*$/, message: "请输入正整数" },
  number: { pattern: /^-?(\d+|\d+\.\d+|\.\d+)$/, message: "请输入数字" },
  decimal2: { pattern: /^-?\d+(\.\d{1,2})?$/, message: "最多保留两位小数" },
  alpha: { pattern: /^[A-Za-z]+$/, message: "只能输入英文字母" },
  alphaNum: { pattern: /^[A-Za-z0-9]+$/, message: "只能输入英文字母和数字" },
  projectId: { pattern: /^[A-Za-z0-9_-]+$/, message: "只能输入字母、数字、下划线和短横线" },
  slug: { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "请输入小写字母、数字和短横线组成的标识" },
  hexColor: { pattern: /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/, message: "请输入正确的十六进制颜色" },
  chinese: { pattern: /^[\u4e00-\u9fa5]+$/, message: "只能输入中文" },
  password: { pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,32}$/, message: "密码需包含字母和数字，长度 8-32 位" },
} satisfies Record<string, FormValidationPreset>;

/** createFormRule 让调用方用内置 preset 快速构造 async-validator 规则。 */
export function createFormRule(preset: FormRulePreset, rule: Omit<FormRule, "preset" | "pattern"> = {}): FormRule {
  const validator = formValidatorPatterns[preset];
  return {
    pattern: validator.pattern,
    message: validator.message,
    ...rule,
  };
}

export function normalizeFormProp(prop?: FormProp) {
  if (Array.isArray(prop)) return prop.join(".");
  return prop;
}

export function getValueByPath(source: Values | undefined, prop?: FormProp) {
  if (!source || !prop) return undefined;
  const paths = Array.isArray(prop) ? prop : String(prop).split(".");
  return paths.reduce<unknown>((value, path) => (value !== null && typeof value === "object" ? (value as Values)[path] : undefined), source);
}

export function setValueByPath(source: Values | undefined, prop: FormProp | undefined, value: unknown) {
  if (!source || !prop) return;
  const paths = Array.isArray(prop) ? prop : String(prop).split(".");
  const lastPath = paths.at(-1);
  if (!lastPath) return;

  let target: Values = source;
  for (const path of paths.slice(0, -1)) {
    const nextValue = target[path];
    if (nextValue === null || typeof nextValue !== "object") target[path] = {};
    target = target[path] as Values;
  }
  target[lastPath] = value;
}

export function normalizeRules(rules?: FormItemRule): FormRule[] {
  if (!rules) return [];
  return (Array.isArray(rules) ? rules : [rules]).map((rule) => {
    if (!rule.preset) return { ...rule };
    const preset = formValidatorPatterns[rule.preset];
    return {
      pattern: preset.pattern,
      message: preset.message,
      ...rule,
      preset: undefined,
    };
  });
}

export async function validateFormValue(prop: FormProp | undefined, value: unknown, rules: FormRule[], options: ValidateOption = {}) {
  const field = normalizeFormProp(prop);
  if (!field || rules.length === 0) return { valid: true } satisfies FormItemValidateResult;

  const descriptor = { [field]: rules.map(({ trigger: _trigger, preset: _preset, ...rule }) => rule) };
  const validator = new Schema(descriptor);
  try {
    await validator.validate({ [field]: value }, options);
    return { valid: true } satisfies FormItemValidateResult;
  } catch (error) {
    const validationError = error as { errors?: ValidateError[]; fields?: ValidateFieldsError };
    const errors = validationError.errors ?? validationError.fields?.[field] ?? [];
    return { valid: false, errors } satisfies FormItemValidateResult;
  }
}

export const defaultFormValidateMessages: ValidateMessages = {
  default: "字段验证错误",
  required: "%s 为必填项",
  types: {
    email: "%s 不是有效的邮箱地址",
    url: "%s 不是有效的 URL",
    number: "%s 不是有效的数字",
  },
  string: {
    min: "%s 至少 %s 个字符",
    max: "%s 最多 %s 个字符",
    range: "%s 长度需在 %s 到 %s 个字符之间",
  },
  number: {
    min: "%s 不能小于 %s",
    max: "%s 不能大于 %s",
    range: "%s 需在 %s 到 %s 之间",
  },
};

/** formRoot 定义 Form 根布局，支持标准、inline 两种模式。 */
export const formRoot = cva("ui-form text-primary", {
  variants: {
    inline: {
      true: "flex flex-wrap items-start gap-x-4",
      false: "",
    },
    size: {
      sm: "text-sm",
      md: "text-sm",
      lg: "text-base",
    },
    disabled: {
      true: "opacity-70",
      false: "",
    },
  },
  defaultVariants: {
    inline: false,
    size: "md",
    disabled: false,
  },
});

/** formItem 定义 FormItem 的整体排版和字段间距，确保嵌套网格内也有稳定行距。 */
export const formItem = cva("ui-form-item mb-[var(--ui-form-item-gap,16px)] min-w-0 self-start content-start last:mb-0", {
  variants: {
    inline: {
      true: "inline-flex w-auto items-start",
      false: "grid w-full",
    },
    labelPosition: {
      left: "grid-cols-[var(--ui-form-label-width)_minmax(0,1fr)] items-start gap-x-3",
      right: "grid-cols-[var(--ui-form-label-width)_minmax(0,1fr)] items-start gap-x-3",
      top: "gap-1",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
    },
    error: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    { inline: true, labelPosition: "top", class: "flex-col" },
  ],
  defaultVariants: {
    inline: false,
    labelPosition: "right",
    size: "md",
    error: false,
  },
});

/** formItemLabel 定义 FormItem 标签对齐、尺寸和必填标识样式。 */
export const formItemLabel = cva("flex min-w-0 whitespace-normal break-words text-primary", {
  variants: {
    labelPosition: {
      left: "justify-start",
      right: "justify-end",
      top: "justify-start",
    },
    size: {
      sm: "text-xs/5",
      md: "text-sm/5",
      lg: "text-base/6",
    },
    required: {
      true: "",
      false: "",
    },
    requiredPosition: {
      left: "",
      right: "",
    },
  },
  compoundVariants: [
    { required: true, requiredPosition: "left", class: "before:mr-1 before:text-red-500 before:content-['*']" },
    { required: true, requiredPosition: "right", class: "after:ml-1 after:text-red-500 after:content-['*']" },
    { labelPosition: ["left", "right"], size: "sm", class: "min-h-[calc(1.75rem+7px)] items-center" },
    { labelPosition: ["left", "right"], size: "md", class: "min-h-[calc(2rem+3px)] items-center" },
    { labelPosition: ["left", "right"], size: "lg", class: "min-h-[calc(2.25rem)] items-center" },
  ],
  defaultVariants: {
    labelPosition: "right",
    size: "md",
    required: false,
    requiredPosition: "right",
  },
});

/** formItemContent 定义控件区与错误提示布局。 */
export const formItemContent = cva("flex min-w-0 flex-col justify-center", {
  variants: {
    size: {
      sm: "min-h-[calc(1.75rem+7px)] text-sm",
      md: "min-h-[calc(2rem+3px)] text-sm",
      lg: "min-h-[calc(2.25rem)] text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

/** formItemMessage 定义 FormItem 校验提示视觉。 */
export const formItemMessage = cva("mt-1.5 min-h-4 text-xs/4", {
  variants: {
    status: {
      "": "text-tertiary",
      validating: "text-brand-500",
      success: "text-green-600 dark:text-green-400",
      error: "text-red-600 dark:text-red-400",
    },
  },
  defaultVariants: {
    status: "",
  },
});

export type FormProps = VariantProps<typeof formRoot>;
