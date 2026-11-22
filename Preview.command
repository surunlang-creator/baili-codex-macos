#!/bin/zsh
set -e
cd "$(dirname "$0")"
log=$(mktemp -t baili-preview)
cleanup(){ rm -f "$log"; }
trap cleanup EXIT INT TERM
/usr/bin/env node server.mjs >"$log" 2>&1 &
pid=$!
for i in {1..50}; do
  if grep -q 'Preview: http://' "$log"; then break; fi
  sleep 0.1
done
url=$(sed -n 's/^Preview: //p' "$log" | head -1)
if [[ -z "$url" ]]; then
  cat "$log"
  kill "$pid" 2>/dev/null || true
  exit 1
fi
open "$url"
echo "已打开动画预览：$url"
wait "$pid"
