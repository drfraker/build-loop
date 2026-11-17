---
name: verify
description: 'Run the app end to end before a push: start it with seed data and fakes, drive a real browser through the checklist items of the changed area, and save screenshots. Use for the "Verify, then push" step of the build loop on every user-facing change, when a reviewer or walkthrough asks for proof that a flow works, or to reproduce a bug in the running app. Not for unit or feature tests; those run in the check command.'
---

# Verify a change in the running app

> TEMPLATE. Fill in every `<...>` value for your project, then delete this note.
> Keep the skill short and keep its scripts in the repo, so every agent runs the same steps.

Running the app is the main check. A change is verified only when an agent ran it end to end in a browser. Tests and `<check command>` come first; this skill comes after them and before the push.

Use synthetic seed data only. Never sign in to a real account, and never put customer data, credentials, or tokens in screenshots, logs, or reports.

## 1. Start the app

```bash
bash <skill dir>/scripts/start.sh            # write this script for your stack
bash <skill dir>/scripts/start.sh --fresh    # a migration changed
```

The start script must:

- start the database (and any container runtime it needs);
- set the fakes in the environment: fake payments, mail and text messages to the log, fixture answers for AI models, no outside accounts;
- rebuild the seed data (`<seed command>`) and build the assets;
- start the app on `<app URL>` and a queue worker;
- end with `ready`, or with the path of the log to read;
- keep a copy of the environment file, which `stop.sh` puts back;
- refuse to run where the local data matters (for example on a developer laptop), unless the owner says yes.

Seed users (synthetic): `<owner@example.com>`, `<staff@example.com>`, ... with the password `<seed password>`.

## 2. Write the checks

Make one short script for the change in the scratchpad (not in the repository). Each checklist item is a few steps and a screenshot. The helpers in `scripts/verify.cjs` use Playwright.

```js
// Run from the repository root.
const v = require(require('path').resolve('<skill dir>/scripts/verify.cjs'));

(async () => {
    const run = v.run('invites-s4'); // the screenshot folder
    const s = await v.open('<owner@example.com>'); // signed in, 1440 px, light

    await s.page.goto(v.url('/settings/team'));
    await s.page.getByRole('button', { name: 'Invite' }).click();
    await s.page.getByLabel('Email').fill('new.member@example.com');
    await s.page.getByRole('button', { name: 'Send invite' }).click();
    await s.page.waitForLoadState('networkidle');
    await run.shot(s.page, 'invite-sent');
    run.check(s, 'invite'); // page errors, console errors, HTTP >= 400

    if (!(await s.page.getByText('Invite sent').isVisible())) {
        run.fail('No "Invite sent" message');
    }

    await run.shotPhone('<owner@example.com>', '/settings/team', 'team-390-dark');
    await s.browser.close();
    run.done(); // prints the summary; exit 1 on a problem
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
```

- `v.open(email, { width, height, dark })` signs in once and keeps the session, so repeated runs do not hit the login limit.
- `run.shotPhone(email, path, label)` opens the page at 390 px in dark mode and fails when the page scrolls sideways. Check each user-facing page at desktop width (light) and phone width (dark).
- Use roles and labels to find elements (`getByRole`, `getByLabel`), not CSS classes. Wait for `networkidle` or for an element, never for a fixed time.

## 3. Read the results

- Mail and text messages go to the app log. Read them there.
- Look at every screenshot: readable text, the right state, no private data, no layout break.

## 4. Report and stop

```bash
bash <skill dir>/scripts/stop.sh
```

- Screenshots are in `<state dir>/runs/<time>-<name>/` (git-ignored). Attach the ones that matter to the Reviewer notice.
- End each commit message with a `Verified:` trailer that says what ran:
    - `Verified: <check command>; verify invites-s4 (3 items, 6 screenshots)`
    - `Verified: <check command>` (no user-facing change)
    - `Verified: none: docs only`
- A problem that `run.done()` prints is a failure. Fix the cause and run again. After three failed rounds, stop and send the failure to the owner.
- Do not retry a flaky step until it passes. Find why it is flaky (a missing wait, data from a run before) and fix the check or the app.
