# Build Loop

A Claude Code plugin for running a software project with one human owner and a few AI agent threads (Builder, Reviewer, Designer, Docs, Walkthrough tester). Every change goes around the same loop:

Ask → Spec → Design path → Build and design → **Verify, then push** → Notify → Check → Return

Each change runs end to end in a real browser before the push. Each commit says how it was verified. The reviewer checks against the rules as they were before the change.

Each change gets a design path: new work ships plain first, and a visible change to a page that already has a design starts with design. Each role keeps its state in a role file in the repo, so its thread can be replaced when it gets long or slow.

## Install

In Claude Code:

```text
/plugin marketplace add drfraker/build-loop
/plugin install build-loop@build-loop
```

To update later: `/plugin marketplace update build-loop`.

No Claude Code? Copy `plugins/build-loop/skills/build-loop/` into your agent's skills folder, or give it `references/playbook.md` as a project document.

## Use

In a new project, say: **"Set up this project with the build loop."** The agent asks about the product, stack, tools, brand, and approvals, and then does the Day 0 setup with you. At any time, ask:

- "How should this change move from ask to merge?"
- "Does this change need design first?"
- "My Builder thread is slow. Hand it over to a new thread."

## What the plugin includes

| Part | What it does |
| --- | --- |
| `skills/build-loop` | The playbook: roles, Day 0 setup, repo starter files, the four design paths, the 8-step loop, role files and thread handover, ground rules, starter prompts for each role, how to verify, and lessons learned. |
| `hooks/verified-trailer.sh` | Runs after each `git commit` that the agent makes. If the message has no `Verified:` trailer, it logs the commit to `.claude/logs/verified-trailer.log` in your project and reminds the agent. Observe mode: it never blocks. Needs `jq` and `git`. Add `.claude/logs/` to your `.gitignore`. |
| `templates/verify-skill/` | A template `verify` skill to copy into each repo. It drives the changed flow with Playwright, saves desktop and phone screenshots, and fails on page errors, console errors, HTTP errors, or a page that scrolls sideways. You write `start.sh` and `stop.sh` for your stack. |
| `templates/review-lessons.md` | A starter review lessons file. Each lesson has a trigger, a check, and a source. |
| `templates/role-file.md` | A role file to copy to `docs/roles/<role>.md` for each role: its job, its current state, and loose notes. A new thread starts from it. |
| `templates/agent-rules-snippet.md` | Design path, thread, verification, and simplicity rules to paste into `AGENTS.md` or `CLAUDE.md`. |

The templates live in the plugin folder. After install, find them under `~/.claude/plugins/`, or copy them from this repository.

### Set up the verify skill in a repo

1. Copy `plugins/build-loop/templates/verify-skill/` to `<repo>/.claude/skills/verify/`.
2. Write `scripts/start.sh` and `scripts/stop.sh` for your stack. `SKILL.md` lists what they must do.
3. Fill in the `<...>` values in `SKILL.md`. Set the sign-in selectors at the top of `scripts/verify.cjs`.
4. Make Playwright and Chromium available where the agent runs, and git-ignore `.verify/`.
5. Do one run by hand on a page you know, and look at the screenshots.

## The main ideas

- **Function first for new work.** A new page ships plain and works before anyone designs it.
- **Design first for designed pages.** A visible change to a page that has a design starts with design.
- **Roles last; threads do not.** Each role's state lives in a role file, so a fresh thread can take over.
- **Production infrastructure comes last.** Fakes for every outside service until the app is ready for real users.
- **Running the app is the main check.** Tests are necessary but not enough.
- **A change cannot change its own checks.** The reviewer reads the lessons, test config, and gate scripts from main before the change.
- **Lessons have triggers.** Only the lessons that match the diff are checked, and stale ones get pruned.
- **Three rounds, then a person.** No flaky tests, and no retrying until green.
- **New gates start in observe mode.**
- **Invariants get property tests.** Use seeded random commands through the real API, with no new library.
- **Subtract first, and one rule in one place.**
- **Synthetic data only** in seeds, tests, screenshots, and logs.

## License

MIT
