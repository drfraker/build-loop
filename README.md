# Build Loop

A Claude plugin for running a software project with one human owner and a few AI agent threads (Builder, Reviewer, Designer, Docs, Walkthrough tester). Every change goes around the same loop:

Ask → Spec → Design path → Build and design → **Verify, then push** → Notify → Check → Return

Each change runs end to end in a real browser before the push. Each commit says how it was verified. The reviewer checks against the rules as they were before the change.

Each change gets a design path: new work ships plain first, and a visible change to a page that already has a design starts with design. Each role keeps its state in a role file in the repo, so its thread can be replaced when it gets long or slow.

## Install

You install the plugin once, and it serves all your projects. Each project then keeps only its own facts in its repo (see "Use in a project"). Pick the install that fits where you work.

| Where you work | Install | Reaches |
| --- | --- | --- |
| The Claude desktop app or claude.ai | On your account | Chat, cloud tasks, and Claude Code signed in to the same account |
| Claude Code on one computer | In Claude Code | Every project on that computer, or one repo |
| Another agent tool | Copy the skill folder | That tool |

### On your Claude account (desktop app or claude.ai)

This is the install to use for cloud tasks. A cloud session does not load plugins that you installed on your computer, or plugins that a repo turns on.

1. Open **Customize > Plugins**.
2. Choose **Add > Add marketplace** and enter `drfraker/build-loop`.
3. Add the **build-loop** plugin from that marketplace.
4. Turn on **Sync automatically** for the marketplace, so new versions arrive with no step from you.

### In Claude Code

```text
/plugin marketplace add drfraker/build-loop
/plugin install build-loop@build-loop
```

The install asks for a scope:

- **Install for you** (user scope): every project on this computer. Use this unless you have a reason not to.
- **Install for all collaborators on this repository** (project scope): this repo only. Each collaborator also installs it once.
- **Install for you, in this repo only** (local scope).

In the desktop app's Code tab, for a local session: click **+** next to the prompt box, then **Plugins > Add plugin**.

If the plugin is already on your Claude account, do not also install it here. The copy installed in Claude Code wins over the account copy and can hide its updates.

### Another agent tool

Copy `plugins/build-loop/skills/build-loop/` into your agent's skills folder, or give it `references/playbook.md` as a project document.

## Use in a project

The plugin holds the shared playbook. A project's repo holds only what is specific to that project: its rules file, its role files in `docs/roles/`, and a `Build loop version:` line. There is nothing to install per project.

- **A new project.** Say: **"Set up this project with the build loop."** The agent asks about the product, stack, tools, brand, and approvals, and then does the Day 0 setup with you.
- **A project on an older version.** Say: **"Update this project to the latest build loop."** See "Update".
- **A project with its own notes on the loop.** Keep them in a skill or file with another name (for example `<project>-build-loop`), holding only what differs from the playbook. A second skill named `build-loop` clashes with the plugin's.

## Update

An update has two parts: the plugin, and each project that uses it.

**1. Update the plugin.**

- On your Claude account: nothing to do when **Sync automatically** is on. Otherwise open **Customize > Plugins**, select the marketplace, and choose **Check for updates**.
- In Claude Code: auto-update is off by default for this marketplace. Run `/plugin marketplace update build-loop`, then `claude plugin update build-loop@build-loop` in a shell, then restart Claude Code or run `/reload-plugins`. To skip these steps next time, turn on auto-update for the marketplace under `/plugin`, Marketplaces.
- A copied skill folder: copy `plugins/build-loop/skills/build-loop/` again.

**2. Update each project.** A project copies rules, role prompts, and templates out of the playbook, so the new plugin does not change it. In the project, say: **"Update this project to the latest build loop."** The agent reads the `Build loop version:` line in the project's rules file, does the project steps for each newer version, opens one pull request, and lists what you must paste into your project instructions.

The versions and their project steps are in the [changelog](plugins/build-loop/skills/build-loop/references/changelog.md).

## Ask at any time

- "How should this change move from ask to merge?"
- "Does this change need design first?"
- "My Builder thread is slow. Hand it over to a new thread."

## What the plugin includes

| Part | What it does |
| --- | --- |
| `skills/build-loop` | The playbook: roles, Day 0 setup, repo starter files, the four design paths, the 8-step loop, role files and thread handover, ground rules, starter prompts for each role, how to verify, and lessons learned. Also the changelog, with the project steps for each version. |
| `hooks/verified-trailer.sh` | Runs after each `git commit` that the agent makes. If the message has no `Verified:` trailer, it logs the commit to `.claude/logs/verified-trailer.log` in your project and reminds the agent. Observe mode: it never blocks. Needs `jq` and `git`. Add `.claude/logs/` to your `.gitignore`. |
| `templates/verify-skill/` | A template `verify` skill to copy into each repo. It drives the changed flow with Playwright, saves desktop and phone screenshots, and fails on page errors, console errors, HTTP errors, or a page that scrolls sideways. You write `start.sh` and `stop.sh` for your stack. |
| `templates/review-lessons.md` | A starter review lessons file. Each lesson has a trigger, a check, and a source. |
| `templates/role-file.md` | A role file to copy to `docs/roles/<role>.md` for each role: its job, its current state, and loose notes. A new thread starts from it. |
| `templates/agent-rules-snippet.md` | Design path, thread, verification, and simplicity rules to paste into `AGENTS.md` or `CLAUDE.md`. |

The templates live in the plugin folder. Copy them from this repository, or after a Claude Code install find them under `~/.claude/plugins/`. The hook runs in Claude Code.

### Set up the verify skill in a repo

1. Copy `plugins/build-loop/templates/verify-skill/` to `<repo>/.claude/skills/verify/`.
2. Write `scripts/start.sh` and `scripts/stop.sh` for your stack. `SKILL.md` lists what they must do.
3. Fill in the `<...>` values in `SKILL.md`. Set the sign-in selectors at the top of `scripts/verify.cjs`.
4. Make Playwright and Chromium available where the agent runs, and git-ignore `.verify/`.
5. Do one run by hand on a page you know, and look at the screenshots.

## The main ideas

- **Function first for new work.** A new page ships plain and works before anyone designs it.
- **Design first for designed pages.** A visible change to a page that has a design starts with design, unless its flow is not settled or existing components cover it.
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
