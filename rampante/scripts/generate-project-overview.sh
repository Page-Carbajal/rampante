
#!/bin/bash
# Generate or overwrite specs/PROJECT-OVERVIEW.md with a summary.
# Usage: ./scripts/generate-project-overview.sh --stack "NAME" --stack-file "/abs/path" --technologies "A,B,C" --docs-timestamp "ISO8601"

set -euo pipefail

STACK=""
STACK_FILE=""
TECHS_CSV=""
DOCS_TS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --stack) STACK="$2"; shift 2 ;;
    --stack-file) STACK_FILE="$2"; shift 2 ;;
    --technologies) TECHS_CSV="$2"; shift 2 ;;
    --docs-timestamp) DOCS_TS="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [ -z "$STACK" ] || [ -z "$STACK_FILE" ] || [ -z "$TECHS_CSV" ] || [ -z "$DOCS_TS" ]; then
  echo "Usage: $0 --stack NAME --stack-file /abs/path --technologies CSV --docs-timestamp ISO8601" >&2
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)

# Source common helpers to locate feature paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"
eval $(get_feature_paths)

FEATURE_NAME=""
if [ -f "$FEATURE_SPEC" ]; then
  # Expect line like: "# Feature Specification: XYZ"
  line=$(grep -m1 '^# Feature Specification:' "$FEATURE_SPEC" || true)
  if [ -n "$line" ]; then
    FEATURE_NAME=$(echo "$line" | sed 's/^# Feature Specification:\s*//')
  fi
fi
[ -z "$FEATURE_NAME" ] && FEATURE_NAME="${CURRENT_BRANCH:-Unnamed Feature}"

abs_spec="$FEATURE_SPEC"
abs_plan="$IMPL_PLAN"
abs_tasks="$TASKS"
abs_stack="$STACK_FILE"

# Extract helpful snippets
extract_section() {
  local file="$1"; shift
  local header="$1"; shift
  [ -f "$file" ] || { echo ""; return; }
  # Print text under header until next header of same level
  awk -v h="^## \\*?"$(echo "$header" | sed 's/[].[^$\*/]/\\&/g')"\\*?$" '
    BEGIN{p=0}
    $0 ~ h {p=1; next}
    /^## / && p==1 {exit}
    p==1 {print}
  ' "$file" | sed '/^\s*$/d' | sed -e 's/^\s\+//'
}

PRIORITIES=$(extract_section "$abs_plan" "Execution Priorities")
[ -z "$PRIORITIES" ] && PRIORITIES="(Not explicitly listed in plan.md)"

AI_INSTR=$(extract_section "$abs_plan" "AI Agent Instructions")
[ -z "$AI_INSTR" ] && AI_INSTR="(Not specified in plan.md)"

PARALLEL=$(extract_section "$abs_tasks" "Parallel")
[ -z "$PARALLEL" ] && PARALLEL="(See tasks.md for [P] markers and examples)"

TECHS_STR=$(echo "$TECHS_CSV" | sed 's/,/, /g')
NOW_TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

OVERVIEW_PATH="$REPO_ROOT/specs/PROJECT-OVERVIEW.md"
mkdir -p "$REPO_ROOT/specs"

cat > "$OVERVIEW_PATH" <<EOF
# Project Overview – $FEATURE_NAME

## Purpose

- Brief AI-facing guide to this project with links to specs and tasks
- Optimized for quick ingestion and high-signal execution context

## Project Snapshot

- Feature: $FEATURE_NAME
- Selected Stack: $STACK
- Technologies: $TECHS_STR
- Documentation Updated: $DOCS_TS

## Key Artifacts (absolute paths)

- Spec: $abs_spec
- Plan: $abs_plan
- Tasks: $abs_tasks
- Stack Definition: $abs_stack

---

## Execution Priorities (from plan)

$PRIORITIES

### AI Agent Instructions

$AI_INSTR

### Parallelization

$PARALLEL

---

## Environment & Assumptions

$(extract_section "$abs_plan" "Technical Context")

### Contact Points

- Feature Owner: $(grep -m1 '^\*\*Feature Owner\*\*' "$abs_spec" | sed 's/.*: \s*//' || echo 'Unspecified')
- Scope: $(grep -m1 '^\*\*Scope\*\*' "$abs_spec" | sed 's/.*: \s*//' || echo 'Unspecified')

### Change Log Notes

- Keep commits small, one task per commit where possible
EOF

echo "$OVERVIEW_PATH"
