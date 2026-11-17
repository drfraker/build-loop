#!/bin/bash
# Observe mode: after a `git commit` that an agent runs, log a commit whose
# message has no `Verified:` trailer, and tell the agent. It never blocks.
# The owner chooses when this gate starts to block.
#
# Install: copy to .claude/hooks/verified-trailer.sh, chmod +x, and add the
# PostToolUse entry from settings.example.json. Needs jq and git.
set -uo pipefail

LOG_DIR="${VERIFIED_TRAILER_LOG_DIR:-.claude/logs}"   # keep it git-ignored

input=$(cat)
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)

# Only a git commit (also `git -C dir commit` or `git -c k=v commit`).
printf '%s' "$command" | grep -qE '(^|[;&|[:space:]])git([[:space:]]+-[Cc][[:space:]]+[^[:space:]]+)*[[:space:]]+commit([[:space:]]|$)' || exit 0

# Only a commit that was made: git prints "[branch abc1234] subject".
# A failed or empty commit, or a dry run, prints no such line.
output=$(printf '%s' "$input" | jq -r '(.tool_response.stdout // .tool_response.output // "") | tostring' 2>/dev/null)
made=$(printf '%s\n' "$output" | grep -oE '^\[[^]]* [0-9a-f]{7,40}\]' | head -1 | grep -oE '[0-9a-f]{7,40}\]$' | tr -d ']')

CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$CLAUDE_PROJECT_DIR" || exit 0

# `git commit -q` prints no summary line. Then take HEAD when the last
# reflog entry is a commit made in the last 10 seconds.
if [ -z "$made" ]; then
  read -r action when < <(git reflog -1 --format='%gs %ct' 2>/dev/null | sed -E 's/^([a-z]+)[^0-9]*.* ([0-9]+)$/\1 \2/')
  case "$action" in
    commit) ;;
    *) exit 0 ;;
  esac
  [ $(( $(date +%s) - ${when:-0} )) -le 10 ] || exit 0
  made=$(git rev-parse HEAD 2>/dev/null)
fi
[ -n "$made" ] || exit 0

# A commit in another repository (git -C elsewhere) is not this one.
git cat-file -e "$made^{commit}" 2>/dev/null || exit 0

message=$(git log -1 --format=%B "$made" 2>/dev/null) || exit 0
if printf '%s\n' "$message" | grep -qE '^Verified: .+'; then
  exit 0
fi

sha=$(git rev-parse --short "$made" 2>/dev/null)
subject=$(git log -1 --format=%s "$made" 2>/dev/null)
mkdir -p "$LOG_DIR"
printf '%s %s would block: no Verified: trailer: %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$sha" "$subject" >> "$LOG_DIR/verified-trailer.log"

jq -n --arg sha "$sha" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: ("Observe mode: commit " + $sha + " has no Verified: trailer. Add one that says what ran (the check command, verify <items>, or none: <reason>), for example with git commit --amend before the push. This check does not block yet.")}}'
