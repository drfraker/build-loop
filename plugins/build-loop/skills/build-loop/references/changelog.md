# Build Loop changelog

The newest version is first. Each version lists what changed, and the project steps that bring a project from the version before it up to date. "Update a project" in `SKILL.md` says how to use this file.

A project records its version in one line in its agent rules file:

```text
Build loop version: 2.1.0
```

## 2.1.0 (2026-11-25)

What changed:

- **Design paths.** The order of design and build now depends on the change. The Coordinator picks one design path for each change: no design, plain first, design first, or design system only. New work still ships plain first. A visible change to a page that has a design spec starts with design.
- **Role files.** A role lasts for the project; a thread does not. Each role keeps a role file in `docs/roles/` with its job, its current state, and loose notes. A thread is replaced when its work ships or it gets slow, and the new thread starts from the role file.
- **Setup.** Setup asks for the screen list. The look and brand questions can wait until the first screens work plain.
- **Updates.** This changelog, the version line, and "Update a project" in `SKILL.md`.

Project steps, from 2.0.0:

1. **Design path rules.** In the agent rules file (or the source it is generated from), replace the rule that every page ships plain before it is designed with the "Design path" rules in `templates/agent-rules-snippet.md`. Already done when the rules file names the four design paths.
2. **Thread rules.** Add the "Threads" rules from the same snippet. Already done when the rules file tells each role to keep its role file current.
3. **Role files.** Add `docs/roles/<role>.md` for each role the project runs, except the Owner and the Coordinator, from `templates/role-file.md`. Fill "Job" from the role's starter prompt in the playbook, with the project's own values. Fill "State" only with facts you can read from the repo. Each running thread writes the rest of its own State before its next handover. Already done when each role has a file.
4. **Ownership.** Add to the ownership rules: `docs/roles/<role>.md` belongs to that role only. Reviewer may commit its own role file, and it skips commits that touch only `docs/roles/`.
5. **Last commit processed.** Reviewer, Documentation, and the Walkthrough tester keep the last commit they processed in their role file, not in memory. Change any rule or prompt that says "in memory".
6. **Spec sections.** Each new spec section gets a `Design path:` line. Do not change old sections.
7. **The project's own copy of the loop.** If the repo has its own build-loop skill or its own description of the loop, make the same changes there: the design path step, the role files, and the handover.
8. **Record the version.** Set `Build loop version: 2.1.0` in the agent rules file.

The owner does these outside the repo:

- Replace the ground rules in the project instructions with "Ground rules" from the playbook.
- Replace the Coordinator prompt with the one in "Starter prompts".
- Tell each running thread to read the new rules and to write its State in its role file.

## 2.0.0

What changed:

- **Running the app is the main check.** A `verify` skill drives the changed flow in a real browser before each push, with screenshots.
- **Every commit says how it was verified.** A `Verified:` trailer, and a hook in observe mode that logs commits without one.
- **The check command must fail when a step fails.** Test it once by breaking a test on purpose.
- **A change cannot change its own checks.** Reviewer reads the lessons, the test config, and the gate scripts from main before the change.
- **Every file type has a gate.** A docs-only or hooks-only diff still runs the full check.
- **Three rounds, then a person. No flaky tests. New gates start in observe mode.**
- **Review lessons have triggers.** `docs/review-rules.md` became `docs/review-lessons.md`: each lesson has a trigger, a check, and a source. Bugs that got past review go into a replay set.
- **Property tests for invariants, and simulator UI tests for native apps.**
- **Simplicity rules.** Subtract first, and one rule in one place.

Project steps, from 1.x:

1. **The verify skill.** Copy `templates/verify-skill/` into the repo's skills folder. Write `scripts/start.sh` and `scripts/stop.sh` for the stack, fill in the `<...>` values, and do one run by hand on a page you know. Already done when the repo has a `verify` skill that runs.
2. **The trailer hook.** Add `hooks/verified-trailer.sh` in observe mode. The plugin registers it for Claude Code; another agent tool needs its own hook. Already done when a commit without a `Verified:` trailer is logged.
3. **The check command.** Break one test on purpose and run the check command. Fix the command if it exits 0.
4. **Rules.** Paste "Verify before a push" and "Simplicity" from `templates/agent-rules-snippet.md` into the agent rules file.
5. **Review lessons.** Start `docs/review-lessons.md` from `templates/review-lessons.md`. Move each rule from `docs/review-rules.md` into it and give it a trigger, a check, and a source.
6. **CI.** Make sure CI does not skip tests for docs, skills, scripts, hooks, or config paths.
7. **Record the version.** Set `Build loop version: 2.0.0` in the agent rules file.

The owner does these outside the repo:

- Replace the ground rules in the project instructions with "Ground rules" from the playbook.
- Replace the Builder, App builder, and Reviewer prompts with the ones in "Starter prompts".

## 1.x

The first playbook: roles, Day 0 setup, repo starter files, the loop, ground rules, starter prompts, and lessons. A project with no `verify` skill and no `Verified:` trailer rule is on 1.x.
