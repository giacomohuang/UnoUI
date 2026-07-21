#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

MODE="install"
REQUESTED_TOOLS=""
SELECT_ALL="false"

TOOL_IDS=(codex claude cursor gemini copilot opencode)
SELECTED_TOOLS=()
SELECTED_TOOL_COUNT=0

usage() {
  cat <<'USAGE'
Usage: scripts/install-skills.sh [options]

Install repo-local skills into one or more supported AI coding tools.

When no tool is specified in an interactive terminal, the script presents a
selection menu. In a non-interactive terminal it defaults to Codex.

Options:
  --tool <name>       Add one tool; can be repeated.
  --tools <list>      Comma-separated tools, for example codex,claude,cursor.
  --all               Install or check all supported tools.
  --check             Only verify installed skills match repo sources.
  --dry-run           Show rsync changes without writing files.
  -h, --help          Show this help message.

Supported tools:
  codex               Codex
  claude              Claude Code
  cursor              Cursor
  gemini              Gemini CLI
  copilot             GitHub Copilot
  opencode            OpenCode

Environment overrides:
  CODEX_SKILLS_DIR, CLAUDE_SKILLS_DIR, CURSOR_SKILLS_DIR,
  GEMINI_SKILLS_DIR, COPILOT_SKILLS_DIR, OPENCODE_SKILLS_DIR
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tool)
      if [[ $# -lt 2 ]]; then
        echo "--tool 需要一个工具名称" >&2
        exit 2
      fi
      REQUESTED_TOOLS="${REQUESTED_TOOLS:+${REQUESTED_TOOLS},}${2}"
      shift 2
      ;;
    --tools)
      if [[ $# -lt 2 ]]; then
        echo "--tools 需要一个逗号分隔的工具列表" >&2
        exit 2
      fi
      REQUESTED_TOOLS="${REQUESTED_TOOLS:+${REQUESTED_TOOLS},}${2}"
      shift 2
      ;;
    --all)
      SELECT_ALL="true"
      shift
      ;;
    --check)
      MODE="check"
      shift
      ;;
    --dry-run)
      MODE="dry-run"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "未知参数: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ "${SELECT_ALL}" == "true" && -n "${REQUESTED_TOOLS}" ]]; then
  echo "--all 不能和 --tool/--tools 同时使用" >&2
  exit 2
fi

require_command() {
  local command_name="$1"

  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "缺少必要命令: ${command_name}" >&2
    exit 1
  fi
}

tool_label() {
  case "$1" in
    codex) echo "Codex" ;;
    claude) echo "Claude Code" ;;
    cursor) echo "Cursor" ;;
    gemini) echo "Gemini CLI" ;;
    copilot) echo "GitHub Copilot" ;;
    opencode) echo "OpenCode" ;;
    *) return 1 ;;
  esac
}

tool_skills_dir() {
  case "$1" in
    codex) echo "${CODEX_SKILLS_DIR:-${CODEX_HOME:-${HOME}/.codex}/skills}" ;;
    claude) echo "${CLAUDE_SKILLS_DIR:-${CLAUDE_HOME:-${HOME}/.claude}/skills}" ;;
    cursor) echo "${CURSOR_SKILLS_DIR:-${CURSOR_HOME:-${HOME}/.cursor}/skills}" ;;
    gemini) echo "${GEMINI_SKILLS_DIR:-${GEMINI_HOME:-${HOME}/.gemini}/skills}" ;;
    copilot) echo "${COPILOT_SKILLS_DIR:-${COPILOT_HOME:-${HOME}/.copilot}/skills}" ;;
    opencode) echo "${OPENCODE_SKILLS_DIR:-${OPENCODE_HOME:-${XDG_CONFIG_HOME:-${HOME}/.config}/opencode}/skills}" ;;
    *) return 1 ;;
  esac
}

normalize_tool() {
  local value
  value="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | tr '_' '-' | tr -d '[:space:]')"

  case "${value}" in
    codex) echo "codex" ;;
    claude|claude-code) echo "claude" ;;
    cursor) echo "cursor" ;;
    gemini|gemini-cli) echo "gemini" ;;
    copilot|github-copilot) echo "copilot" ;;
    opencode|open-code) echo "opencode" ;;
    *)
      echo "不支持的工具: $1" >&2
      echo "可选工具: ${TOOL_IDS[*]}" >&2
      return 1
      ;;
  esac
}

add_tool() {
  local tool="$1"
  local existing
  local index=0

  while [[ "${index}" -lt "${SELECTED_TOOL_COUNT}" ]]; do
    existing="${SELECTED_TOOLS[index]}"
    if [[ "${existing}" == "${tool}" ]]; then
      return
    fi
    index=$((index + 1))
  done
  SELECTED_TOOLS[SELECTED_TOOL_COUNT]="${tool}"
  SELECTED_TOOL_COUNT=$((SELECTED_TOOL_COUNT + 1))
}

select_tools_from_list() {
  local raw_list="$1"
  local item
  local tool
  local old_ifs="${IFS}"
  local requested_items=()

  IFS=','
  read -r -a requested_items <<< "${raw_list}"
  IFS="${old_ifs}"

  for item in "${requested_items[@]}"; do
    if [[ -z "${item}" ]]; then
      continue
    fi
    tool="$(normalize_tool "${item}")"
    add_tool "${tool}"
  done
}

select_tools_interactively() {
  local index=1
  local choice
  local normalized_choice
  local old_ifs="${IFS}"
  local item
  local tool
  local requested_items=()

  echo "请选择目标工具（可输入多个编号并用逗号分隔，输入 all 全选）："
  for tool in "${TOOL_IDS[@]}"; do
    printf '  %s) %s\n' "${index}" "$(tool_label "${tool}")"
    index=$((index + 1))
  done
  printf '选择 [1]: '
  IFS= read -r choice
  choice="${choice:-1}"
  normalized_choice="$(printf '%s' "${choice}" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"

  if [[ "${normalized_choice}" == "all" || "${normalized_choice}" == "a" ]]; then
    SELECT_ALL="true"
    return
  fi

  IFS=','
  read -r -a requested_items <<< "${normalized_choice}"
  IFS="${old_ifs}"

  for item in "${requested_items[@]}"; do
    if [[ "${item}" =~ ^[1-6]$ ]]; then
      add_tool "${TOOL_IDS[$((item - 1))]}"
    else
      echo "无效选择: ${item}" >&2
      exit 2
    fi
  done
}

verify_source() {
  local source_dir="$1"

  if [[ ! -d "${source_dir}" ]]; then
    echo "技能源目录不存在: ${source_dir}" >&2
    exit 1
  fi

  if [[ ! -f "${source_dir}/SKILL.md" ]]; then
    echo "技能源目录缺少 SKILL.md: ${source_dir}" >&2
    exit 1
  fi
}

sync_skill() {
  local source_dir="$1"
  local target_dir="$2"

  mkdir -p "${target_dir}"

  if [[ "${MODE}" == "dry-run" ]]; then
    rsync -ain --delete --exclude='.DS_Store' "${source_dir}/" "${target_dir}/"
    return
  fi

  rsync -a --delete --exclude='.DS_Store' "${source_dir}/" "${target_dir}/"
}

check_skill() {
  local source_dir="$1"
  local target_dir="$2"

  if [[ ! -d "${target_dir}" ]]; then
    echo "已安装技能目录不存在: ${target_dir}" >&2
    return 1
  fi

  diff -qr --exclude='.DS_Store' "${source_dir}" "${target_dir}"
}

install_skill() {
  local tool="$1"
  local source_dir="${REPO_ROOT}/packages/skills/UnoUI"
  local target_root
  local target_dir
  target_root="$(tool_skills_dir "${tool}")"
  target_dir="${target_root}/use-unoui-vue"

  verify_source "${source_dir}"

  echo "==> $(tool_label "${tool}"): ${source_dir} -> ${target_dir}"

  if [[ "${MODE}" != "check" ]]; then
    sync_skill "${source_dir}" "${target_dir}"
  fi

  if [[ "${MODE}" == "dry-run" ]]; then
    return
  fi

  check_skill "${source_dir}" "${target_dir}"
}

require_command rsync
require_command diff

if [[ "${SELECT_ALL}" == "true" ]]; then
  SELECTED_TOOLS=("${TOOL_IDS[@]}")
  SELECTED_TOOL_COUNT="${#TOOL_IDS[@]}"
elif [[ -n "${REQUESTED_TOOLS}" ]]; then
  select_tools_from_list "${REQUESTED_TOOLS}"
elif [[ -t 0 && -t 1 ]]; then
  select_tools_interactively
  if [[ "${SELECT_ALL}" == "true" ]]; then
    SELECTED_TOOLS=("${TOOL_IDS[@]}")
    SELECTED_TOOL_COUNT="${#TOOL_IDS[@]}"
  fi
else
  SELECTED_TOOLS=(codex)
  SELECTED_TOOL_COUNT=1
  echo "非交互环境未指定工具，默认使用 Codex。可通过 --all 或 --tools 指定目标。"
fi

if [[ "${SELECTED_TOOL_COUNT}" -eq 0 ]]; then
  echo "至少选择一个工具" >&2
  exit 2
fi

for tool in "${SELECTED_TOOLS[@]}"; do
  install_skill "${tool}"
done

selected_labels=""
for tool in "${SELECTED_TOOLS[@]}"; do
  selected_labels="${selected_labels:+${selected_labels}、}$(tool_label "${tool}")"
done

case "${MODE}" in
  check)
    echo "技能检查通过: ${selected_labels}"
    ;;
  dry-run)
    echo "技能 dry-run 完成: ${selected_labels}"
    ;;
  *)
    echo "技能安装并校验完成: ${selected_labels}"
    ;;
esac
