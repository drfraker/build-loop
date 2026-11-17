---
name: build-loop
description: Set up and run a software project where one owner works with several AI agent threads (builder, designer, reviewer, docs) in one repeatable loop, with each change verified in the running app before push. Use when starting a new project, when asked to set up a project with the build loop, or when asked how a change should move from ask to merge.
---

# Build Loop

The full playbook is in `references/playbook.md`. Read it before you set up a project or answer a question about the loop.

## When the owner asks to set up a project

Follow the section "Start a project from this playbook" in `references/playbook.md`. In short:

1. Ask the owner for the product spec (or a short description) and the stack. Do not start before you have it.
2. Ask the "Look and brand" questions (name, colors, feel, logo state). For web apps, recommend React with shadcn/ui unless the owner chooses another stack.
3. Do Day 0: repo, one check command (tested to fail when a test fails), seed data and one rebuild command, fakes for every outside service, the `verify` skill and the `Verified:` trailer hook, the spec with "Done when" IDs, the rules file, the review lessons file, and `docs/design/`.
4. Write the project instructions (threads, owners, the 8-step loop, ground rules) and give the owner the starter prompt for each role thread.
5. Tell the owner what is done and what still needs their answer, in one list.

## The loop

Ask → Spec → Build (plain) → Verify, then push → Design (once stable) → Notify → Check → Return.

## Ground rules (summary)

- Function first. A new feature or page ships plain until its API, data model, and flow are stable. Only then is it designed. A visual pass changes no behavior.
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
