<!-- Paste into AGENTS.md / CLAUDE.md (or your generated rules source). Fill in <...>. -->

Build loop version: <the newest version in skills/build-loop/references/changelog.md>

## Design path

- Each change follows the design path in its spec section: no design, plain first, design first, or design system only.
- A new page, or a change whose flow, data, or API is not settled, ships plain first and is designed once it works.
- A visible change to a page with a design spec in `docs/design/` starts with design, unless its flow is not settled or existing components cover it. The builder builds to the frames in one pass.
- A change that existing components and patterns cover is built with the design system, and the Designer compares screenshots after.
- A visual pass changes no behavior.

## Threads

- Keep your role file (`docs/roles/<role>.md`) current: your job, your state, and loose notes. A new thread must be able to continue from it.
- Send commit ranges, file paths, and frame links. Do not paste diffs, logs, or whole files into a thread.

## Verify before a push

- Running the app is the main check. A change is verified only when an agent ran it end to end: a browser for web (the `verify` skill), the simulator UI test job for the native app. After `<check command>` passes (it exits non-zero when any step fails), run the `verify` skill on the checklist items of the changed area and attach its screenshots to the Reviewer notice.
- Each commit message ends with a `Verified:` trailer that says what ran: `<check command>`, `verify <items>`, or `none: <reason>`. The `verified-trailer` hook logs a commit without one (observe mode; it does not block yet).
- A change cannot change its own checks. A change to a check file (`docs/review-lessons.md`, the test config, the gate scripts, the hooks) goes in its own commit, and Reviewer reviews it before the change that depends on it. Reviewer reads these files from main before the change.
- Three rounds, then a person. Try to fix a failing check at most three times. Then stop and send the failure to the owner.
- No flaky tests. Do not re-run, add sleeps, or retry until green. Find the cause. If no cause is found, ask the owner to delete the test and give the reason.
- A new hook or gate starts in observe mode: it only logs what it would block. The owner chooses when it starts to block.
- Each lesson in `docs/review-lessons.md` names the kind of diff that triggers it. A bug that got past Reviewer and was visible in the diff becomes a lesson with a trigger.
- Money, ledger, and idempotency rules get property tests: seeded random commands through the API, with every rule checked after each command. Use the test framework's own tools; a new test library needs the owner's OK.

## Simplicity

- Subtract first. Before you add code, look for code, rules, or steps that the change makes unneeded, and remove them in the same change. Count lines on the real diff before you call a change a simplification.
- One rule, one place. A business rule lives in one action that every path (web, API, jobs, commands, native app) calls. A client that shows the same result asks the server, or uses the same rule with tests that share the same cases.
