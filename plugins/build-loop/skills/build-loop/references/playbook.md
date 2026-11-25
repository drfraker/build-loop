# Build Loop Playbook

Contents: What this is · Start a project from this playbook · Design tool · Design system · Roles · Day 0 setup · Repo starter files · Pick the design path for each change · How one change moves · Keep role threads small · Ground rules · Starter prompts · Lessons from running the loop · Verification

## What this is

This playbook runs a software project with one human owner and a small team of AI agent threads. Each role has one job, and every change goes around the same loop.

Use it when you build a real product mostly with AI agents and you want speed without losing track of what was built and why. You need a tool that runs several agent threads with shared memory and a shared folder, plus a git host and a design tool. We ran it with Claude projects, GitHub, and Figma.

Six ideas carry the loop:

- **The repo and the design file are the sources of truth.** The product spec, the design spec text, the agent rules, and each role's current state live in the repo and change in the same commit as the code. The design system and the frames live in one design file (we used Figma). Any coding agent (Claude Code, Codex, Cursor) reads it through the design tool's MCP server, and a human designer can open it too.
- **Each role owns one thing and hands off on a fixed path.** Work moves forward one way and findings come back another way, so the owner is not the router.
- **The order of design and build depends on the change.** A new page ships plain first: the main navigation, the actions, and the raw API responses on the page. Design starts once the page works, and it grows from what the page does. A design made before that means each change redoes both the design and the code. Once a page has a design, a visible change to it starts with design, so the builder does not make up a look that the Designer then redoes.
- **Roles last; threads do not.** What a role knows lives in repo files, so a fresh thread can take over at any time. A thread kept for the whole project gets slow and carries old names and replaced decisions.
- **Production infrastructure comes last.** Until the app works end to end, it runs on local machines or one simple staging host with synthetic data, and each outside service (payments, email, text messages, AI models, file storage) is a fake behind one interface. Each deploy step added early slows every change after it, so build the production environment only when the app is ready for real users.
- **Running the app is the main check.** Tests are necessary but not enough. A change is verified only when an agent started the app with seed data and fakes and drove the changed flow in a real browser (or a simulator for a native app), with screenshots as proof.

The loop: Ask → Spec → Design path → Build and design → Verify → Notify → Check → Return. Work moves forward to main; findings return to the builders, and only P0 and P1 go up to the owner.

## Start a project from this playbook

Make a new project in your agent tool and write: "Set up this project with the build loop." The agent then asks you about the product and does the Day 0 setup with you.

**Instructions for the agent.** When someone asks you to set up a project from this file, do these steps in order. Ask the questions in small groups, give a recommended answer for each one, and wait for the answers before you write files.

1. **The product.** Ask: What are we building, and for whom? What problem does it solve? What must the first version do, and what is out of scope? Is there a spec, a document, or an older app to start from? If the person has a spec, read it. If not, write a first draft of `docs/spec.md` from the answers and ask the person to check it.
2. **Screens.** Ask which screens the first version needs and what each one does. Write the screen list into `docs/spec.md`: each screen, its actions, and the API calls it uses.
3. **Data and risk.** Ask: Will the app hold personal, health, or payment data? Which laws or contracts apply? Which user roles are there? Write the safety rules from the answers.
4. **Stack and hosting.** Ask: Which language, framework, and database? Is there a native phone or tablet app? When the person has no preference, recommend a stack that they already know. For a web app with no preference, recommend React with shadcn/ui. Recommend that production hosting waits until the app is ready for real users: until then the app runs locally or on one simple staging host, with fakes for outside services. Ask only which outside services the app will need, so each one gets a fake now.
5. **Tools.** Ask which git host, which other coding agents (for example Codex or Cursor), and which design tool the team uses. Recommend Figma (see "Design tool" below).
6. **Look and brand.** Recommend that these questions wait until the first screens work plain. Ask them now only if the owner already has a brand or wants the design system started. The questions: Are there brand colors, a logo, a name, or fonts already? What three words describe how the app should feel? Which apps do you like the look of? Light mode, dark mode, or both? The Designer turns the answers into the design system (see "Design system" below).
7. **Team.** Ask who besides the owner works on the project, and which roles to start. Recommend the four starter roles.
8. **Approvals.** Ask how changes reach main for now (a direct push after the check command, or pull requests) and who merges.
9. **Set up.** Do the Day 0 setup: the repo starter files, the check command, and the seed data. Paste the ground rules into the project instructions, write a role file for each role from the starter prompts filled in with the answers, and write the owners and approvals into memory.
10. **Report.** Give the person a short list: what you made, the open questions, and the first spec section to build plain.

## Design tool

Keep the design system and the frames in one place that every coding agent and every person on the team can reach. Whatever you choose, the spec text stays in `docs/design/` and links to each frame.

| Option | Good for | Limits |
| --- | --- | --- |
| Figma (recommended) | A full design system with tokens and components; an MCP server that Claude Code, Codex, and Cursor can read and write; a file that a human designer already knows | Paid seats for editors; each agent tool needs the MCP server connected |
| Google Drive or another shared drive | PNG and PDF exports and spec drafts that any app can read through its connector | No live tokens or components; exports go out of date when the design changes |
| Design files in the repo (SVG, tokens in CSS or JSON) | History next to the code, with no extra tool | Hard to draw and review; large images make the repo heavy |
| Pages made inside one agent tool | Fast mockups and design system pages | Other tools cannot reach them, and a designer cannot edit them |

## Design system

The design system is the Designer's first job. It starts when the first screens work plain, or earlier if the owner already has a brand. It never blocks plain pages: plain pages use the component library as it comes, and they take the tokens when the tokens land.

**Pick the component library with Builder.** For a web app, use React with shadcn/ui (Radix primitives and Tailwind). It has the most active development, coding agents build with it well, and its components are copied into the repo, so the team owns and themes them. Before you design, check that the repo really uses it (for example `components.json` and the React entry point). If the app uses another stack, use the library that fits it (for example shadcn-vue for Vue, or SwiftUI for a native Apple app) and write the choice in the rules file.

**Ask the owner about the brand**, if setup did not: brand colors, if any; three words for how the app should feel; two or three apps whose look they like or dislike; an existing logo, name, or fonts; and light mode, dark mode, or both. Then show two or three short directions (color, type, one sample screen) and let the owner pick one before you build the full set.

**Make everything the app will need.** Use this list, and add to it when the product needs more:

- **Tokens.** Color roles with light and dark values (background, foreground, primary for actions, accent, muted, border, focus ring, destructive, success, warning, info, and chart colors), the type scale and fonts, spacing, radius, and shadows. Write them once in code, in the theme file with the component library's own token names, and mirror them as variables in the design file. Pages use tokens, never raw color values.
- **Components.** The full component library, themed. Add the app's own patterns: page header, navigation and sidebar, empty state, loading state, error state, data table, form layout, and toasts.
- **Brand assets.** The logo (full, mark only, one-color, and light and dark versions), the app icon (favicon 16 and 32 px, Apple touch icon 180 px, web app icons 192 and 512 px plus a maskable version, and the iOS and Android icon sets for a native app), the social share image (1200 × 630 px), the email header, and the loading or splash screen.
- **Icons and images.** One icon set (Lucide comes with shadcn/ui) and a style for illustrations and empty-state images.
- **Checks.** Text and controls meet WCAG AA contrast in light and dark mode, focus states are visible, and touch targets are at least 44 px.
- **A reference.** A design system page in the design file, and `docs/design/system.md` in the repo with the token names, the component list, where each asset lives, and the rules of use (for example, which color is for actions).

## Roles

Start with four roles: Owner, Coordinator, Builder, and Reviewer. Add the others when the project needs them.

| Role | Owns | Works in | Sends to | Hears from |
| --- | --- | --- | --- | --- |
| Owner (you) | Goals, scope, decisions, approvals | Project chat | Coordinator: asks and answers | Coordinator; Reviewer for P0 and P1 only |
| Coordinator | Routing, the design path for each change, project memory, new threads, the "waiting on owner" list | Project chat, memory | The thread that owns each ask | Every thread |
| Designer | The design system, the frames, and the design spec text | Design tool, `docs/design/` | Builders: frame links and the design spec | Builders: build needs and built differences |
| Builder | Web app, API, database, `docs/spec.md` | Repo, main branch | Reviewer after each push; Documentation for user-facing changes | App builder (API requests), Designer, Reviewer, Walkthrough tester |
| App builder | The native app (phone or tablet), in its own folder | Repo, platform CI | Builder: API requests; Reviewer and Documentation after each push | Reviewer |
| Reviewer | Review of every push; a broad pass about every 10 merges | Repo; writes only its role file | Owning thread: findings; Owner: P0 and P1 only | Builder, App builder |
| Documentation | Help articles for what is on main | `docs/help/` in the repo | The repo: article changes | Builder, App builder, Walkthrough tester |
| Walkthrough tester | A test checklist run in a real browser | The running app with seed data | Builder: bugs; Documentation: help gaps | Builder, when a build is ready |

Add the Designer when pages need a designed look, and the App builder when you ship a native app. Add Documentation when users need help articles, and a Walkthrough tester when you can no longer click through the whole app yourself.

Name each thread by its role and a number (`Builder 1`, `Builder 2`). The role lasts for the project. The thread is replaced often, and the new thread starts from the role file (see "Keep role threads small").

## Day 0 setup

Set up the repo before the first ask, so every thread starts from the same files.

1. **Create the repo** with the starter files in the next section.
2. **Make one check command** that runs lint, type checks, front-end tests, and back-end tests, for example `npm run ci` or `composer ci:check`. Builders run it before every push. CI runs the same command when you have CI. Test that it exits non-zero when any step fails: break one test on purpose and run it. A check command that prints a failure and exits 0 is worse than none.
3. **Make seed data and fakes.** Add synthetic users for each role, sample records, and one command that rebuilds the database. Add a fake for each outside service (payments, email, AI models), so the app runs with no outside accounts. Tests, walkthroughs, screenshots, demos, and the verify skill all use them.
4. **Add the verify skill and the trailer hook.** Copy the `verify` skill template into the repo and fill in its start command, seed users, and URLs. Add the `Verified:` trailer hook in observe mode (see "Verification" below).
5. **Create the project.** Connect the repo, the design tool, and other services. Connect the design tool's MCP server to every agent tool you use, so each one can read the design system and the frames. Paste the ground rules (below) into the project instructions.
6. **Write the role files and start the threads.** Write `docs/roles/<role>.md` for each role from its starter prompt (below). Start each thread with the first message in "Handover".
7. **Seed the memory.** Write who owns what, and your standing approvals, for example "Builder pushes to main when the check command passes."
8. **Record the version.** Write `Build loop version: <version>` in the agent rules file. The newest version is the first entry in `changelog.md`, next to this file. A later update reads this line to know which steps the project still needs.
9. **Write the first spec section** with its "Done when" checks, then send the first ask.

## Repo starter files

Seven kinds of file hold everything the threads must agree on. Each one changes in the same commit as the work it describes.

| File | Holds | Written by | Changes when |
| --- | --- | --- | --- |
| Agent rules file (`AGENTS.md`, `CLAUDE.md`) | Always-on rules: stack, safety and data rules, who owns which code, how to test and push | Owner and Builder | A rule changes or a review lesson repeats |
| `docs/spec.md` | Goal, scope, screen list, data model, milestones; one section per feature with an ID, a design path, and "Done when" checks; a "How it was built" note after the build | Builder; the owner approves scope | In the same commit as the code |
| `docs/design/<page>.md` | The design spec for one page: parts, states, words, a frame list with node IDs, build needs, accepted differences | Designer; Builder adds differences | The design or the build changes |
| `docs/decisions.md` | Choices made without the owner, for one review pass later; owner decisions with dates | Any thread | A choice is made |
| `docs/review-lessons.md` | Review lessons: for each one, the kind of diff that triggers it, the check, and the source | Reviewer proposes; the fixing thread commits | A finding repeats, or a bug got past review |
| `docs/help/` | Help articles for users | Documentation | A user-facing change ships |
| `docs/roles/<role>.md` | The role file: the role's job, its current state, and loose notes | The role itself | The role finishes a piece of work |

If several agents read different rules files, keep one source (for example `.ai/guidelines/`) and generate each agent's file from it. Laravel Boost does this for Laravel projects.

Keep design images out of git. One designed page made 3 to 19 MB of PNG exports. The frames stay in the design file, and the spec points to them by node ID. Export PNGs only for a tool that cannot reach the design file.

**Screen list template** (in `docs/spec.md`)

```markdown
## Screens

| Screen | What the user does there | API calls |
| --- | --- | --- |
| Settings, Team | Sees members, sends and cancels invites | GET /team, POST /invites, DELETE /invites/{id} |
```

**Spec section template**

```markdown
## S4. Team invites

Goal: an admin invites a teammate by email.
Out of scope: bulk invites and single sign-on.
Design path: plain first

Done when:
- [ ] S4.1 An admin sends an invite from Settings.
- [ ] S4.2 The invite link works once and expires after 7 days.
- [ ] S4.3 The new member gets the role that the admin chose.

Design: docs/design/invites.md
Tests: tests/Feature/TeamInviteTest.php
Checklist items: INV-01 to INV-05

### How it was built
- <date>, <commit>: what changed from the plan, and why.
```

**Design spec template**

```markdown
# <Page> design spec

Design file: <link>, page "<Page>"

## Rules that stay
## Page frame (layout, header, actions)
## Parts (one heading per card, sheet, or dialog)
## States (empty, loading, error; each status in words, not only color)
## Sample data for the frames (synthetic)
## Frames (name, size, node ID, light or dark)
## Build needs (API fields, permissions)
## Not drawn on purpose
## Changes made while drawing
## Built differences, accepted (commit, what changed, who accepted)
```

**Role file template** (`docs/roles/<role>.md`)

```markdown
# <Role>

## Job
<the starter prompt for this role>

## State
- Thread: <Role> <number>
- Last commit processed: <hash>
- Work in flight: <spec IDs>
- Waiting on another thread: <request or finding, and who has it>

## Notes
- <something learned that is not yet a rule, a lesson, a spec note, or a decision>
```

**Agent rules file skeleton**

```markdown
# Project rules

Build loop version: <version>

## Scope and safety
- Use only synthetic data in tests, seeds, logs, and screenshots.
- Ask the owner before you add a dependency or a top-level folder.

## Ownership
- Web app, API, database, docs/spec.md: Builder.
- <app folder>/: App builder. Send API requests to Builder.
- docs/roles/<role>.md: that role only.

## How we build
- Data and API first. A new page ships plain (navigation, actions, raw API responses) and works before it is designed.
- Each change follows the design path in its spec section: no design, plain first, design first, or design system only. A visible change to a page with a design spec in docs/design/ starts with design.
- A page with a design spec follows it. A visual pass changes no behavior.
- Code, files, tables, routes, and config keys use neutral words. The product name lives in one config value.

## Verification
- Before each push: rebase on main, run <check command>, then run the verify skill on the changed flow. Push only when both pass.
- Each commit message ends with a `Verified:` trailer: `Verified: <check command>; verify <items>`, or `Verified: none: <reason>`.
- A behavior change updates docs/spec.md in the same commit.
- Commit messages name the spec IDs they touch.
- A change to a check file (review lessons, test config, gate scripts, hooks) goes in its own commit, reviewed before the change that depends on it.

## Simplicity
- Subtract first. Before you add code, look for code, a rule, or a step that the change makes unneeded, and remove it in the same change.
- One rule, one place. A business rule lives in one place that every path calls. A client that must show the same result asks the server, or uses the same rule with tests that share the same cases.

## Threads
- Keep your role file (docs/roles/<role>.md) current. A new thread must be able to continue from it.
- Send commit ranges, file paths, and frame links. Do not paste diffs, logs, or whole files into a thread.
```

## Pick the design path for each change

The order of design and build depends on the change, not on the project.

Early in a project nearly every change is plain first. Nothing has a design yet, and the work is about how the app and the API fit together and which screens exist. A design made at that point gets redone with every change.

Later, most pages have a design spec (`docs/design/<page>.md`). If the builder changes one of those pages with no design, the builder makes up the look and the Designer redoes it. That is the same double work in the other direction. So a visible change to a designed page starts with design.

The Coordinator picks one design path when it routes the ask. The path goes in the spec section as `Design path: <path>`, or in the routing message when the spec does not change. The owning thread can ask for a different path with one line of reason.

| Design path | Use when | Order |
| --- | --- | --- |
| No design | Nothing the user sees changes (API, data, jobs, a bug fix on the same screen) | Build, verify, check |
| Plain first | The page has no design spec, or the change adds a flow whose steps, data, or API are not settled | Build plain, verify, settle the flow, design, visual pass, verify, check |
| Design first | The page has a design spec, the flow is settled, and the change adds or moves a part, a state, or a screen | Design (frames and design spec text), build to the design, verify, check |
| Design system only | The page has a design spec, and existing components and patterns cover the change (a new field, column, filter, or button in a pattern that exists) | Build with the design system, verify, Designer compares screenshots, check |

To pick, ask these questions in order and stop at the first match:

1. Does the change alter what the user sees? If no: No design.
2. Are the flow, the data, and the API for this change settled? If no: Plain first, even on a designed page. Build the new part plain with design system components, and design it once it works.
3. Does the page have a design spec? If no: Plain first.
4. Do existing components and patterns cover the change with no new layout decision? If yes: Design system only. If no: Design first.

How Plain first runs:

- The builder builds the plain page: the main navigation, the actions, and the raw API responses, with stock components.
- Once the page works and its flow is settled, the Designer draws frames from the working page in the design file (light, dark, each screen size), writes `docs/design/<page>.md`, and links each frame by node ID.
- The builder then makes a visual pass that changes no behavior.

How Design first runs:

- The spec section still comes first. It says what the change does and lists the "Done when" checks. The Designer draws from the spec section and the current page.
- The Designer updates the frames and `docs/design/<page>.md`, and lists the build needs (API fields, permissions). If the design needs data or behavior the API does not have, the Designer sends that build need to Builder before drawing further, so nobody designs something the API cannot support.
- Builder builds the behavior and the look in one pass, to the frames. There is no separate visual pass.
- The Designer compares the verify screenshots to the frames after the push. If the build shows that the design does not work, Builder lists the difference in the design spec, and the Designer accepts it or redraws.

There is no project-level switch from plain first to design first. The test is per page: does it have a design spec? A new page in a mature project still goes plain first when its flow is not settled.

## How one change moves

A change goes around the loop in eight steps. Small fixes skip step 2. No change skips step 5: a change with nothing to run in a browser says so in its trailer (`Verified: none: <reason>`).

1. **Ask.** The owner writes the ask in the project chat. The Coordinator sends it to the thread that owns the area, or starts a thread for new work.
2. **Spec.** The owning thread writes or changes the spec section first: goal, scope, and "Done when" checks with IDs. The owner approves any change in scope.
3. **Design path.** The Coordinator picks the design path for the change, and it is written in the spec section or the routing message (see "Pick the design path for each change").
4. **Build and design.** The builder and the Designer work in the order the design path gives, with tests for each "Done when" check. On plain first, the builder builds the plain page and takes it through steps 5 to 8; the design and the visual pass follow later as a second trip from this step. On design first, the Designer updates the frames and the design spec, and then the builder builds to them.
5. **Verify, then push.** The builder rebases on main and runs the full check command. Then it runs the `verify` skill: it starts the app with seed data and fakes, drives the changed flow in a real browser (a simulator for a native app), and saves screenshots. Each commit ends with a `Verified:` trailer that says what ran. The builder pushes only when both pass.
6. **Notify.** After each push, the builder sends Reviewer the commit range, one line, and the verify screenshots. It also tells Documentation when users will see the change.
7. **Check.** Reviewer reviews the exact pushed commits against the spec, and against the rule files as they were on main before the change (so a change cannot loosen its own checks). The Designer compares screenshots to the frames, the Walkthrough tester runs the checklist items for the touched spec IDs, and Documentation updates the articles.
8. **Return.** Findings go to the owning thread with file, line, and fix. Only P0 and P1 go to the owner. The fix goes around the same loop.

## Keep role threads small

A role lasts for the whole project. A thread does not. A long thread loads slowly and makes the agent reread old names, replaced decisions, and finished work on every turn. The fix is to keep everything a role knows in files and to replace the thread often.

### Role file

Each role except the Owner and the Coordinator has a role file, `docs/roles/<role>.md`, in the repo (template in "Repo starter files"). The Coordinator's state is project memory. The role file has three sections:

- **Job.** The starter prompt for the role.
- **State.** The current thread name, the last commit processed, the work in flight (spec IDs), and the requests or findings waiting on another thread.
- **Notes.** What this role has learned that is not yet a rule, a lesson, a spec note, or a decision. Move each note to its proper file when it firms up.

The role file holds current state only and stays under about 60 lines. Git holds the history.

A role that commits code updates its role file in the same commit. A role that does not commit code (Reviewer, Walkthrough tester) commits its role file alone at the end of each piece of work. That commit goes through the check command and carries a `Verified:` trailer like any other. It needs no Reviewer notice, and Reviewer skips commits that touch only `docs/roles/`.

### Where each kind of knowledge goes

Nothing important lives only in a thread.

| Knowledge | File |
| --- | --- |
| An always-on rule | The agent rules file |
| A defect that repeated or got past review | `docs/review-lessons.md` |
| Why a feature was built the way it was | "How it was built" in the spec section |
| A choice made without the owner | `docs/decisions.md` |
| A design choice | `docs/design/<page>.md` |
| The current state of a role | `docs/roles/<role>.md` |
| Everything else | The git log |

### When to start a new thread

- **Builder and App builder:** when a spec section ships. One thread per feature or milestone.
- **Reviewer:** at each broad pass (about every 10 merges). A review needs only the rule files from main, the spec sections touched, and the commit range, so the Reviewer loses nothing by starting fresh, and a fresh Reviewer is not anchored on what it approved before.
- **Designer:** when a page's design ships. The design system lives in the design file and `docs/design/system.md`, not in the thread.
- **Any role:** when the thread is slow to load, when the tool has summarized or compacted its earlier messages, or when the thread repeats a mistake that an earlier message already settled.

### Handover

1. The old thread finishes or parks its work in flight, updates its role file, moves its notes to the proper files, and commits.
2. The Coordinator starts a new thread named by role and number (for example `Builder 3`) with this first message: "You are the <role> for <project>. Read docs/roles/<role>.md and the rules file, then continue from State."
3. Archive the old thread once the new thread has finished one piece of work correctly.

The test for a good handover: a new thread that reads only the repo can continue the work. If it has to ask the old thread a question, the answer goes into a file.

### Keep a thread light while it runs

- Send commit ranges, file paths, and frame links. Do not paste diffs, logs, or whole files into a thread.
- Attach only the verify screenshots that matter. Leave the rest in the run folder and give the path.
- When the tool has short-lived helpers (a subagent or a one-off thread), give each large single job to one: one feature build, one review, one page's frames. Pass the spec section and the file paths, and take back a short summary. The role thread keeps the summary, not the work.

## Ground rules

Paste these rules into the project instructions so that every thread follows them.

- **One owner per area.** Two threads never edit the same code. Other threads send requests to the owner of that area.
- **The spec changes with the code.** Use the same commit, and name the spec IDs in the commit message. When a build differs from the design, the builder lists the difference and the Designer accepts it or asks for a fix.
- **Function first for new work.** A new feature or page ships plain and low-fidelity (stock components, the main navigation, the actions, and the raw API data) until its API, data model, and flow are defined and stable. Only then does anyone design it. A visual pass changes no behavior.
- **Design first for designed pages.** Once a page has a design spec, a change to what the user sees on it starts with design, unless existing components cover it. Each change gets one design path: no design, plain first, design first, or design system only.
- **Roles last; threads do not.** Each role keeps its role file in `docs/roles/` current. A thread is replaced when its work ships or when it gets slow, and the new thread starts from the role file.
- **Threads carry links, not copies.** Send commit ranges, file paths, and frame links. Do not paste diffs, logs, or whole files.
- **Production infrastructure comes last.** Build and demo on local machines or one simple staging host with synthetic data. Mock each outside service behind one interface with a fake that tests, seeds, and demos use. Build the production environment (hosting, backups, monitoring, security and compliance review) only when the app is ready for real users, and swap the fakes for the real services then.
- **Findings have one format.** Severity (P0 to P3), file and line, what breaks, and the fix, sent to the owning thread.
- **Only P0 and P1 reach the owner.** All other findings stay between the threads.
- **Commits are the queue; notices are the doorbell.** Reviewer and Documentation each keep the last commit they processed in their role file and work from the git log, so a missed notice loses nothing.
- **Check on a timer too.** With no notice, Reviewer checks main every 30 minutes, then backs off to 1, 2, 4, and 8 hours while nothing changes.
- **Lessons move left.** When a finding repeats, Reviewer proposes a rule or a test and the builder commits it, so the next build avoids the mistake.
- **The merge gate follows the stage.** With no users, push to main after the full check, under the owner's standing yes. Before real data, changes to money, sign-in, permissions, data isolation, and migrations get review before merge. With users, use pull requests and CI for all changes.
- **One list waits on the owner.** Each open question goes on one list with the thread, the question, and a recommended answer. Threads keep working on the recommended answer unless the step cannot be undone.
- **Memory stays small.** Memory holds who owns what and decisions that are not yet in the repo. Git holds the history, the rules file holds the rules, and the role files hold each role's state.
- **Names live in one place.** Product names change, so code uses neutral words and the name sits in one config value.
- **Synthetic data only.** Tests, seeds, logs, screenshots, and issue text never hold real customer data.
- **Running the app is the main check.** A change is verified only when an agent ran it end to end: a browser for web, a simulator run for a native app.
- **Every commit says how it was verified.** A `Verified:` trailer names what ran, or `none: <reason>`.
- **A change cannot change its own checks.** Reviewer reads the review lessons, the test config, and the gate scripts from main before the change. A change to a check file goes in its own commit, and Reviewer reviews it first.
- **Every file type has a gate.** A diff with only docs, skills, scripts, hooks, or config still runs the full check. CI must not skip tests for those paths when the check command lints them.
- **Three rounds, then a person.** A thread tries to fix a failing check at most three times. Then it stops and sends the failure to the owner.
- **No flaky tests.** Do not re-run, add sleeps, or retry until green. Find the cause. If no cause is found, ask the owner to delete the test, with the reason.
- **New gates start in observe mode.** A new hook or gate first only logs what it would block. The owner chooses when it starts to block.
- **Review the reviewer.** Each bug that got past review (found later by another tool, the walkthrough, or the owner) goes into a replay set. If the bug was visible in the diff, it becomes a lesson with a diff trigger.
- **Lessons have triggers and get pruned.** Each review lesson names the kind of diff that triggers it. Reviewer checks only the lessons whose trigger matches, and removes lessons that no longer apply about every 10 broad passes.
- **Invariants get property tests.** Money, ledger, and idempotency rules get property tests: many generated inputs against one rule that must always hold. Use the test framework and random source you already have before you add a library.
- **Subtract first.** Before you add code, look for code, rules, or steps that the change makes unneeded, and remove them. Count lines on the real diff before you call a change a simplification.
- **One rule, one place.** A business rule lives in one place that every path (web, API, jobs, native app) calls. Do not copy a rule into a client; ask the server, or share the test cases.
- **Freeze before a launch.** The owner can freeze features. Threads then finish the work in flight and after that only fix and refine.

## Starter prompts

Each prompt goes in the "Job" section of that role's role file (`docs/roles/<role>.md`). The first message of a role thread is the one in "Handover". The Coordinator prompt goes in the project instructions. Replace the words in angle brackets.

**Coordinator**

```text
You are the Coordinator for <project>. Route each ask from <owner> to the thread that owns it, or start a new thread for new work. Pick the design path for each change (no design, plain first, design first, or design system only) and make sure it is written in the spec section or the routing message. Keep project memory small: one file per subject, who owns what, standing approvals, the current thread for each role, and decisions not yet in the repo. Keep one "Waiting on <owner>" list, each item with a recommended answer. Check on each thread about once an hour. When a role's work ships or its thread gets slow, run the handover and start a new thread from the role file. Do not write app code.
```

**Designer**

```text
You are the Designer for <project>. Your first job is the design system. Confirm the component library with Builder (for a web app, React with shadcn/ui; check that the repo uses it). Ask the owner about the brand, show two or three directions, and build the chosen one from the "Design system" checklist: tokens in light and dark, the themed components and app patterns, the logo, the app icon in every size, the social share image, and the other brand assets, with contrast checks. Keep the design system in <design file> and the tokens in the repo theme file, with the same names in both, and write docs/design/system.md. After that, follow the design path in each spec section. Plain first: when the page works plain and its flow is settled, draw frames from the working page, light and dark, each screen size. Design first: draw the change before Builder builds it, list the build needs, and send any need the API does not meet to Builder before you draw further. For both, write or update docs/design/<page>.md in <repo> from the template, link each frame by node ID, and send the frame links and the design spec to Builder. After a designed page ships, compare screenshots to the frames and list the differences in the design spec. Use only the design system tokens. Keep docs/roles/designer.md current.
```

**Builder**

```text
You are the Builder for <project>. You own the web app, the API, the database, and docs/spec.md in <repo>. Build data and API first. Follow the design path in each spec section. Plain first: build the page plain, and make the visual pass later with no behavior change. Design first: build the behavior and the look in one pass, to the frames in docs/design/<page>.md. Design system only: build with the existing components and patterns. Subtract first: remove what a change makes unneeded, and keep each business rule in one place. Before each push, rebase on main, run <check command>, then run the verify skill on the changed flow; push only when both pass. End each commit with a `Verified:` trailer that says what ran. After three failed rounds on one check, stop and ask <owner>. Change the spec in the same commit and name the spec IDs in the commit message. After each push, send Reviewer the commit range, one line, and the verify screenshots, and tell Documentation about user-facing changes. Fix the findings and bugs that come back to you. Update docs/roles/builder.md in the same commit as your work.
```

**App builder**

```text
You are the App builder for <project>. You own the native app in <repo>/<app folder>. Never edit backend code: send API requests to Builder with the request and response shape you need. Follow the design path in each spec section. Before each push, rebase on main and run the app tests. A UI test target runs the touched screens on a simulator in CI against sample data in memory (no server) and keeps the screenshots. After the push, check the platform CI run and fix a red build at once. Tell Reviewer about each push, and tell Documentation about user-facing changes. Update docs/roles/app-builder.md in the same commit as your work.
```

**Reviewer**

```text
You are the Reviewer for <project>. Review every push to main in <repo>, from the last commit you reviewed (keep it in docs/roles/reviewer.md) to the newest. Skip commits that touch only docs/roles/. Review the exact pushed commits against docs/spec.md and against the rule files, review lessons, test config, and gate scripts as they were on main before the change, not as the change left them. List the lessons whose trigger matches the diff and the result of each. Mark a bug that was already on main as "pre-existing": it does not block the change. Keep a replay set of bugs that got past you; a miss that was visible in the diff becomes a lesson with a trigger. Send each finding to the thread that owns the code: severity P0 to P3, file and line, what breaks, and the fix. Tell <owner> only about P0 and P1. Do a broad pass about every 10 merges. When a finding repeats, propose a lesson with a trigger, or a test. Do not change app code; commit only your role file. With no notice, check main every 30 minutes, and back off to 8 hours while nothing changes.
```

**Documentation**

```text
You are Documentation for <project>. Write help articles in <repo>/docs/help/ for what is on main, not for plans. Keep the last commit you processed in docs/roles/documentation.md and work from the git log. Use the words that the app shows on screen. Take screenshots only from the running app with seed data.
```

**Walkthrough tester**

```text
You are the Walkthrough tester for <project>. Keep a test checklist with one ID per item, each linked to a spec ID. Run it in a real browser against the app with seed data. Send each failure to Builder with the steps, the expected result, the actual result, and a screenshot. Send help gaps to Documentation. Record each result with the date and the commit you tested. Keep docs/roles/walkthrough-tester.md current.
```

## Lessons from running the loop

We ran this loop for one product build. Each problem below happened, and each fix is now part of this playbook.

| What went wrong | What we do now |
| --- | --- |
| Design specs lived in a shared folder outside git, so their changes had no history | Spec text goes in the repo; only the images stay outside |
| A push notice was missed during long work, and the owner had to ask about it | Commits are the queue: Reviewer and Documentation work from the last commit they processed, and check on a timer |
| A fix for a serious finding merged just before Reviewer found that the fix was wrong | Before real data, risky areas get review before merge, and review fixes wait for the Reviewer's read |
| CI minutes ran out in the middle of the build | One local check command is the gate; CI runs the same command when it is available |
| Native app code could not compile in the agents' cloud environment | The App builder checks the platform CI run after each push and fixes a red build at once |
| Review lessons stayed in the Reviewer's notes, where builders did not see them before they wrote code | Repeat findings become rules or tests in the repo |
| Memory grew into a long history log with old names, and every new thread read all of it | Memory holds owners and open decisions; git holds history; prune memory at each rename |
| The builders could use only a few design tool features | Every agent tool gets the design tool's MCP server; the spec text and PNG exports are the fallback |
| The product name changed more than once during the build | Neutral names in code; the product name in one config value |
| Questions for the owner were spread across many threads | One "waiting on owner" list, each item with a recommended answer |
| The owner did not review merges in the early build | `docs/decisions.md` lists the choices made without the owner, for one review pass at the MVP |
| Pages designed before they worked meant that each change redid both the design and the code | New pages ship plain first; design starts once the flow works |
| Builders changed designed pages with no design, and the Designer redid the look afterward | Each change gets a design path; a visible change to a designed page starts with design |
| Role threads kept for the whole project grew slow and carried old names and replaced decisions | Each role keeps a role file in the repo, and its thread is replaced when its work ships or it gets slow |
| Design kept only in agent threads could not be reached from other coding tools or by a human designer | The design system and frames live in one design file with an MCP server; the repo holds the spec text |
| The check command printed test failures but exited 0, so red builds were pushed as green | Test the check command: break a test on purpose and see it fail |
| Tests passed, but the page broke when a person used it | The verify skill drives the changed flow in a real browser before each push, with screenshots |
| A change edited the review rules that would have caught it | Reviewer reads the rule files from main before the change; a check-file change goes in its own commit |
| A docs-only and hooks-only change turned main red, because CI skipped tests for those paths | Every file type has a gate; the full check runs on every diff |
| The review lessons list grew long, and the Reviewer checked all of it on every diff | Each lesson has a trigger (the kind of diff), a check, and a source; only matching lessons run |
| A simplicity review promised savings that the real diff did not show | Subtract first, and count lines on the real diff before you call it a simplification |
| A native UI test found a layout bug that the compile check and unit tests passed | The simulator UI test runs the touched screens in CI and keeps the screenshots |

## Verification

The ground rules above say what. This section says how. The skill package that comes with this playbook has a `verify` skill template and a `Verified:` trailer hook.

**The verify skill.** One skill in the repo that every builder runs before a push. It has three parts:

1. A start script: start the database, set the fakes in the environment (fake payments, mail and texts to the log, fixture AI answers), rebuild the seed data, build the assets, and start the app and a queue worker. It ends with `ready` or with the log to read. It must refuse to rebuild data on a machine where the data matters.
2. Browser helpers: sign in a seed user once and keep the session, collect page errors, console errors, and HTTP responses of 400 and up, take full-page screenshots at desktop width in light mode and at phone width (390 px) in dark mode, and fail when the phone page scrolls sideways.
3. A short script for each change, written in the scratchpad (not the repo): a few steps and a screenshot for each checklist item of the changed area. Find elements by role and label, not CSS classes. Wait for the network or an element, never for a fixed time.

The agent looks at every screenshot (readable text, the right state, no private data, no layout break), attaches the useful ones to the Reviewer notice, and stops the app.

**The trailer.** Each commit ends with one line:

```text
Verified: <check command>; verify <run name> (4 items, 9 screenshots)
Verified: <check command>
Verified: none: docs only
```

A hook after each `git commit` logs a commit with no trailer and tells the agent. It starts in observe mode and never blocks until the owner says so.

**Reviewer reads the rules from main.** Before a review, Reviewer reads the lessons, test config, and gate scripts with `git show origin/main~N:<path>` (the commit before the change), not from the working tree. A change to one of those files goes in its own commit, and Reviewer reviews it before the commits that depend on it.

**Review lessons.** Each lesson has a trigger, a check, and a source:

```markdown
- **K1 Lock type.** Trigger: a row lock on a record that other rows reference. Check: use a lock that does not block foreign key checks of inserts; take the stronger lock only on a row that the action deletes. Source: #123.
```

Group lessons by area (locks and transactions, one rule on every path, data people read, clients, sign-in, gates). Reviewer lists the triggered lessons and the result of each in the review note.

**The replay set.** Each bug that got past Reviewer goes into a list with the commit that Reviewer passed. Now and then, Reviewer reviews those commits again and reports how many it finds. Each miss that was visible in the diff becomes a lesson.

**Property tests.** For a rule that must always hold (a balance is charges less payments plus refunds; a refund is never more than its payment; an idempotent retry gives the same answer and changes nothing; a refused command changes nothing):

- Make random input from a seed with the language's own seeded random source, so a run is the same each time. Run seeds 1 to N in CI (a small N, for example 4), and allow one seed to be replayed with an environment variable.
- Send a random list of commands through the real API, and check every rule after each command. Send some commands again with the same idempotency key.
- On a failure, print the seed and the list of steps.
- Probe the test: remove each rule from the app in turn and see the test fail, then put the rule back.

**Native app UI tests.** Add a debug-only sample data source with synthetic data in memory (no server), a launch argument that selects it, and a UI test target that walks the touched screens at each size class. CI runs it on a simulator, exports the screenshots as a build artifact, and prints the accessibility tree when a test fails, so the failure can be read in the log. A contract test checks that the sample data matches the API shapes.
