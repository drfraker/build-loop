---
name: build-loop
description: Set up and run a software project where one owner works with several AI agent threads (builder, designer, reviewer, docs) in one repeatable loop, with each change verified in the running app before push. Use when starting a new project, when asked to set up a project with the build loop, when asked to update a project to the latest build loop, when asked how a change should move from ask to merge, when deciding whether a change needs design before build or build before design, or when a role thread (builder, reviewer, designer) has grown long, slow, or cluttered and needs a handover to a fresh thread.
---

# Build Loop

The full playbook is in `references/playbook.md`. Read it before you set up a project or answer a question about the loop.

## When the owner asks to set up a project

Follow the section "Start a project from this playbook" in `references/playbook.md`. In short:

1. Ask the owner for the product spec (or a short description) and the stack. Do not start before you have it.
2. Ask which screens the first version needs and what each one does, and write the screen list into the spec. For web apps, recommend React with shadcn/ui unless the owner chooses another stack. Recommend that the "Look and brand" questions (name, colors, feel, logo state) wait until the first screens work plain; ask them now only if the owner already has a brand or wants the design system started.
3. Do Day 0: repo, one check command (tested to fail when a test fails), seed data and one rebuild command, fakes for every outside service, the `verify` skill and the `Verified:` trailer hook, the spec with "Done when" IDs, the rules file, the review lessons file, `docs/design/`, a role file in `docs/roles/` for each role, and the line `Build loop version: <newest version in references/changelog.md>` in the rules file.
4. Write the project instructions (roles, owners, the 8-step loop, the four design paths, ground rules) and give the owner the first message for each role thread.
5. Tell the owner what is done and what still needs their answer, in one list.

## When the owner asks to update a project

A project copies rules, role prompts, and templates out of this playbook, so a new version of the playbook does not reach it by itself. `references/changelog.md` lists, for each version, the project steps that bring a project up to date.

1. Find the project's version: the line `Build loop version:` in the agent rules file or the source it is generated from. With no line, work it out: role files in `docs/roles/` mean 2.1.0; a `verify` skill and a `Verified:` trailer rule mean 2.0.0; neither means 1.x.
2. Read `references/changelog.md`. Take every version newer than the project's, oldest first, and do its project steps. Skip a step that is already done.
3. Fit each step to the project: its rules file source (some projects generate `AGENTS.md` and `CLAUDE.md` from another folder), its role names, its base branch, and its check command. Keep the project's own decisions; change only what the step names. Do not copy the playbook's rules into the project: the rules file points to this skill and holds only what differs in the project.
4. Put the update on its own branch and pull request, or in its own commit where the project pushes to main. It changes check files, so Reviewer reads it before any change that depends on it.
5. Leave out a step that you cannot test, for example the verify skill's start script when you cannot run the app. Name it on the version line: `Build loop version: 2.1.0 (not applied: 2.0.0 step 1)`.
6. Report in one list: what changed, what you left out and why, and what the owner must do outside the repo, with the exact text to paste.

## The loop

Ask → Spec → Design path → Build and design → Verify, then push → Notify → Check → Return.

## Design path (summary)

The order of design and build depends on the change. The Coordinator picks one design path for each change and writes it in the spec section. Full rules: "Pick the design path for each change" in the playbook.

Ask in order and stop at the first match:

1. Does the change alter what the user sees? If no: **No design**.
2. Are the flow, the data, and the API for this change settled? If no: **Plain first**, even on a designed page.
3. Does the page have a design spec (`docs/design/<page>.md`)? If no: **Plain first**.
4. Do existing components and patterns cover the change? If yes: **Design system only**. If no: **Design first**.

Plain first builds the page plain, then designs it once it works. Design first has the Designer update the frames and the design spec before the builder builds, in one pass, to the frames.

## Role threads (summary)

A role lasts for the project; a thread does not. Full rules: "Keep role threads small" in the playbook.

- Each role keeps a role file, `docs/roles/<role>.md`: its job, its current state, and loose notes, under about 60 lines.
- Start a new thread when the role's work ships (a spec section for Builder, a broad pass for Reviewer, a page's design for Designer), or when the thread is slow, compacted, or repeating settled mistakes.
- Handover: the old thread updates its role file and commits. Where every change needs a pull request, a role file changes only at a handover. The new thread starts with "Read docs/roles/<role>.md and the rules file, then continue from State."
- Threads carry commit ranges, file paths, and frame links, not pasted diffs, logs, or files.

## Ground rules (summary)

- Function first for new work. A new feature or page ships plain until its API, data model, and flow are stable. Only then is it designed. A visual pass changes no behavior.
- Design first for designed pages. Once a page has a design spec, a visible change to it starts with design, unless its flow is not settled or existing components cover it.
- Roles last; threads do not. What a role knows lives in repo files, so a fresh thread can take over at any time.
- Production infrastructure comes last. Outside services run as fakes or test modes behind one interface until the app is ready.
- The repo is the source of truth for specs, design spec text, and rules. They change in the same commit as the code.
- One owner per area. Send a request to the owner; two threads never edit the same code.
- Commits are the queue; notices are the doorbell. Reviewers and docs work from the git log, from the last commit they processed.
- Lessons move left. A defect kind found twice becomes a lesson with a trigger, added in the fix commit.
- One list of questions waits on the owner, each with a recommended answer. Work continues on the recommendation unless the step cannot be undone.
- Only P0 and P1 findings go to the owner.

## Verification rules

- Running the app is the main check. Before each push, the builder runs the `verify` skill: start the app with seed data and fakes, drive the changed flow in a real browser (or a simulator for a native app), look at each screenshot, and attach the useful ones to the Reviewer notice.
- The check command must exit non-zero when any step fails. Test that once by breaking a test on purpose.
- Each commit ends with a `Verified:` trailer that says what ran, or `none: <reason>`. A hook logs commits without one (observe mode).
- A change cannot change its own checks. Reviewer reads the review lessons, test config, and gate scripts from main before the change. A change to a check file goes in its own commit and is reviewed first.
- Every file type has a gate: a docs-only or hooks-only diff still runs the full check.
- Three rounds, then a person. After three failed fix attempts on a check, stop and ask the owner.
- No flaky tests: no re-runs, sleeps, or retries until green. Find the cause, or ask the owner to delete the test with the reason.
- New gates start in observe mode (log only). The owner chooses when they block.
- Review the reviewer. Each bug that got past review goes into a replay set; a miss that was visible in the diff becomes a lesson.
- Each lesson has a trigger (the kind of diff), a check, and a source. The reviewer checks only matching lessons, marks bugs that were already on main as "pre-existing", and prunes stale lessons.
- Invariants (money, ledgers, idempotent retries) get property tests: seeded random commands through the real API, every rule checked after each command. Use what the test framework already has before you add a library.
- Native apps: a UI test target runs the touched screens on a simulator in CI against in-memory sample data and keeps the screenshots.

## Simplicity rules

- Subtract first. Before you add code, remove what the change makes unneeded. Count lines on the real diff before you call a change a simplification.
- One rule, one place. A business rule lives in one place that every path calls. A client that shows the same result asks the server, or shares the same test cases.
