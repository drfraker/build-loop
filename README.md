# Build Loop

A Claude Code plugin for running a software project with one human owner and a few AI agent threads (Builder, Reviewer, Designer, Docs, Walkthrough tester). Every change goes around the same loop:

Ask → Spec → Build (plain) → **Verify, then push** → Design (once stable) → Notify → Check → Return

Each change runs end to end in a real browser before the push. Each commit says how it was verified. The reviewer checks against the rules as they were before the change.

## Install

This repository is private. Ask the owner to add you as a collaborator. Your git must be able to clone it (for example after `gh auth login`, or with an SSH key).

In Claude Code:

```text
/plugin marketplace add drfraker/build-loop
/plugin install build-loop@build-loop
```

To update later: `/plugin marketplace update build-loop`.

No Claude Code? Copy `plugins/build-loop/skills/build-loop/` into your agent's skills folder, or give it `references/playbook.md` as a project document.

## Use

In a new project, say: **"Set up this project with the build loop."** The agent asks about the product, stack, tools, brand, and approvals, and then does the Day 0 setup with you. Ask "How should this change move from ask to merge?" at any time.

## What the plugin includes

| Part | What it does |
| --- | --- |
| `skills/build-loop` | The playbook: roles, Day 0 setup, repo starter files, the 8-step loop, ground rules, starter prompts for each role thread, how to verify, and lessons learned. |
| `hooks/verified-trailer.sh` | Runs after each `git commit` that the agent makes. If the message has no `Verified:` trailer, it logs the commit to `.claude/logs/verified-trailer.log` in your project and reminds the agent. Observe mode: it never blocks. Needs `jq` and `git`. Add `.claude/logs/` to your `.gitignore`. |
| `templates/verify-skill/` | A template `verify` skill to copy into each repo. It drives the changed flow with Playwright, saves desktop and phone screenshots, and fails on page errors, console errors, HTTP errors, or a page that scrolls sideways. You write `start.sh` and `stop.sh` for your stack. |
| `templates/review-lessons.md` | A starter review lessons file. Each lesson has a trigger, a check, and a source. |
| `templates/agent-rules-snippet.md` | Verification and simplicity rules to paste into `AGENTS.md` or `CLAUDE.md`. |

The templates live in the plugin folder. After install, find them under `~/.claude/plugins/`, or copy them from this repository.

### Set up the verify skill in a repo

1. Copy `plugins/build-loop/templates/verify-skill/` to `<repo>/.claude/skills/verify/`.
2. Write `scripts/start.sh` and `scripts/stop.sh` for your stack. `SKILL.md` lists what they must do.
3. Fill in the `<...>` values in `SKILL.md`. Set the sign-in selectors at the top of `scripts/verify.cjs`.
4. Make Playwright and Chromium available where the agent runs, and git-ignore `.verify/`.
5. Do one run by hand on a page you know, and look at the screenshots.

## The main ideas

- **Function first.** A page ships plain and works before anyone designs it.
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
