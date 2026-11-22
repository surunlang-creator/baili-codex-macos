#!/bin/zsh
cd "$(dirname "$0")"
exec /usr/bin/env node launcher.mjs --forget-risk
