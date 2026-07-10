#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CODEX_HOME="${CODEX_HOME:-${HOME}/.codex}"
CODEX_SKILLS_DIR="${CODEX_SKILLS_DIR:-${CODEX_HOME}/skills}"

MODE="install"

usage() {
  cat <<'USAGE'
Usage: scripts/install-codex-skills.sh [--check] [--dry-run]

Install repo-local Codex skills into the local Codex skills directory.

Options:
  --check      Only verify installed skills match repo sources.
  --dry-run    Show rsync changes without writing files.
  -h, --help   Show this help message.

Environment:
  CODEX_HOME        Override Codex home directory. Default: ~/.codex
  CODEX_SKILLS_DIR  Override Codex skills directory. Default: $CODEX_HOME/skills
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --check)
      MODE="check"
      ;;
    --dry-run)
      MODE="dry-run"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

require_command() {
  local command_name="$1"

  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Missing required command: ${command_name}" >&2
    exit 1
  fi
}

verify_source() {
  local source_dir="$1"

  if [[ ! -d "${source_dir}" ]]; then
    echo "Skill source does not exist: ${source_dir}" >&2
    exit 1
  fi

  if [[ ! -f "${source_dir}/SKILL.md" ]]; then
    echo "Skill source is missing SKILL.md: ${source_dir}" >&2
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
    echo "Installed skill does not exist: ${target_dir}" >&2
    return 1
  fi

  diff -qr --exclude='.DS_Store' "${source_dir}" "${target_dir}"
}

install_skill() {
  local source_relative="$1"
  local installed_name="$2"
  local source_dir="${REPO_ROOT}/${source_relative}"
  local target_dir="${CODEX_SKILLS_DIR}/${installed_name}"

  verify_source "${source_dir}"

  echo "==> ${source_relative} -> ${target_dir}"

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

# Keep this mapping explicit because the repo source directory and installed
# Codex skill name intentionally differ.
SKILL_SPECS=(
  "packages/skills/UnoUI:use-unoui-vue"
)

for spec in "${SKILL_SPECS[@]}"; do
  source_relative="${spec%%:*}"
  installed_name="${spec#*:}"
  install_skill "${source_relative}" "${installed_name}"
done

case "${MODE}" in
  check)
    echo "Codex skill check passed."
    ;;
  dry-run)
    echo "Codex skill dry run completed."
    ;;
  *)
    echo "Codex skills installed and verified."
    ;;
esac
