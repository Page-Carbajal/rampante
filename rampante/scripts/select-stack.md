# Select Stack Bash Script

## Workflow Execution

1. If exists `./scripts/select-stack.sh` exists -> NOTIFY "select-stack.sh file already exists! Moving on"
2. Else create the file  `./scripts/select-stack.sh` from the markdown below

```bash
#!/bin/bash
# Select a technology stack using YOLO strategy based on the main prompt.
# Outputs JSON with selected_stack, stack_file, priority, technologies[], fallback, match_reason.
# Usage: ./scripts/select-stack.sh [--json] "<main prompt>"

set -euo pipefail

JSON_MODE=true

PROMPT="${*:-}"
if [ -z "$PROMPT" ]; then
  echo "Usage: $0 [--json] <main prompt>" >&2
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
DEF_FILE="$REPO_ROOT/recommended-stacks/DEFINITIONS.md"
STACK_DIR="$REPO_ROOT/recommended-stacks"

if [ ! -f "$DEF_FILE" ]; then
  echo "ERROR: Missing $DEF_FILE" >&2
  exit 2
fi

lower_prompt=$(echo "$PROMPT" | tr '[:upper:]' '[:lower:]')

# Parse stack definitions into lines: NAME|priority|tag1,tag2,...|order
stacks=$(awk '
  BEGIN{order=0; have=0}
  /^### / {
    if (have==1) {printf("%s|%s|%s|%d\n", name, priority, tags, order)}
    name=substr($0,5); priority="9999"; tags=""; order++; have=1; next
  }
  /^- \*\*Priority\*\*: / {
    pr=$0; sub(/^- \*\*Priority\*\*: /, "", pr); sub(/[^0-9].*$/, "", pr); if (pr!="") priority=pr; next
  }
  /^- \*\*Tags\*\*: / {
    tg=$0; sub(/^- \*\*Tags\*\*: /, "", tg); tags=tg; next
  }
  END{ if (have==1) {printf("%s|%s|%s|%d\n", name, priority, tags, order)} }
' "$DEF_FILE")

selected_name=""
selected_priority=9999
selected_order=9999
selected_tags=""
match_reason=""

while IFS='|' read -r name priority tags order; do
  # normalize
  lname=$(echo "$name" | tr '[:upper:]' '[:lower:]')
  # tags are comma-separated words
  lt=$(echo "$tags" | tr '[:upper:]' '[:lower:]' | tr -d '*' | tr -d '`' | sed 's/,/ /g')

  matched=0
  for t in $lt; do
    t=$(echo "$t" | sed 's/[^a-z0-9+-]//g')
  if [ -n "$t" ] && echo "$lower_prompt" | grep -qE "(^|[^a-z0-9])$t([^a-z0-9]|$)"; then
      matched=1
      break
    fi
  done

  if [ $matched -eq 1 ]; then
    if [ "$priority" -lt "$selected_priority" ] || { [ "$priority" -eq "$selected_priority" ] && [ "$order" -lt "$selected_order" ]; }; then
      selected_name="$name"
      selected_priority=$priority
      selected_order=$order
      selected_tags="$tags"
      match_reason="matched tags: $t"
    fi
  fi
done <<EOF
$stacks
EOF

# Fallback to most general-purpose (lowest priority) if no match
fallback=false
if [ -z "$selected_name" ]; then
  fallback=true
  # find min priority
  min_line=$(echo "$stacks" | awk -F'|' 'NR==1{minp=$2; mino=$4; line=$0} {if ($2<minp || ($2==minp && $4<mino)) {minp=$2; mino=$4; line=$0}} END{print line}')
  IFS='|' read -r selected_name selected_priority selected_tags selected_order <<EOF
$min_line
EOF
  match_reason="no tag match; fallback to lowest priority"
fi

STACK_FILE="$STACK_DIR/${selected_name}.md"
if [ ! -f "$STACK_FILE" ]; then
  echo "ERROR: Missing stack file: $STACK_FILE" >&2
  exit 3
fi

# Extract technologies: prefer "## Context7 Documentation" list of bold items; fallback to Core Technologies bold items
tech_json=$(awk '
  BEGIN{inctx=0; incore=0}
  /^## Context7 Documentation/ {inctx=1; incore=0; next}
  /^## Core Technologies/ {incore=1; inctx=0; next}
  /^## / {if ($0 !~ /^## Context7 Documentation/ && $0 !~ /^## Core Technologies/) {inctx=0; incore=0}}
  {
    # capture **...** items
    s=$0
    while (match(s, /\*\*[^*]+\*\*/)) {
      m=substr(s, RSTART+2, RLENGTH-4)
      gsub(/^ +| +$/, "", m)
      if (inctx==1) tech_ctx[m]=1
      if (incore==1) tech_core[m]=1
      s=substr(s, RSTART+RLENGTH)
    }
  }
  END{
    first=1; printf("[")
    used=0
    for (t in tech_ctx) { if (!first) printf(","); first=0; printf("\"%s\"", t); used=1 }
    if (used==0) {
      for (t in tech_core) { if (!first) printf(","); first=0; printf("\"%s\"", t) }
    }
    printf("]\n")
  }
' "$STACK_FILE")

# Stable order: sort the technologies
tech_list=$(echo "$tech_json" | python3 -c 'import sys,json; arr=json.load(sys.stdin); print("["+",".join(["\""+x+"\"" for x in sorted(arr)])+"]")')

printf '{"selected_stack":"%s","stack_file":"%s","priority":%d,"technologies":%s,"fallback":%s,"match_reason":"%s"}\n' \
  "$selected_name" "$STACK_FILE" "$selected_priority" "$tech_list" "$fallback" "$match_reason"
```
