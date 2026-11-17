# Review lessons

Each lesson is a defect that got past a review at least once. It has a trigger (the kind of diff that needs the check), a check, and its source.

- Before a push, the builder finds the lessons whose trigger matches the diff and does those checks. Reviewer does the same and lists the triggered lessons and the result of each in the review note. A lesson whose trigger does not match the diff is not checked.
- Reviewer reads this file, the test config, and the gate scripts from main before the change, not from the change.
- A finding for a bug that was on main before the change is "pre-existing". It does not block the change and goes to the owner as its own item.
- When a defect repeats, or a bug that was visible in the diff gets past review, the fix commit adds a lesson here with a trigger. Reviewer removes lessons that no longer apply about every 10 broad passes.

## Examples (replace with your own)

### K. Locks, transactions, and outside calls

- **K1 Outside work after the commit.** Trigger: a call to an outside service, a stored file, a queued job, or a mail inside a transaction. Check: the call runs after the commit, no row lock is held during the call, and the call has a timeout shorter than the job's timeout. Source: <PR or commit>.
- **K2 Retries.** Trigger: a retried outside call. Check: the same idempotency key and the same parameters; a time-based parameter is computed once and stored. Source: <PR or commit>.

### R. One rule on every path

- **R1 Every path, same rule.** Trigger: a new write path (route, API endpoint, job, command, native app call) or a business rule in a controller. Check: the rule is in the shared action that every path calls. Source: <PR or commit>.
- **R2 New kind or status.** Trigger: a diff adds a value to a closed set. Check: grep every list that names the set's values, and update it or read one constant. Source: <PR or commit>.

### D. Data that people read

- **D1 Local day.** Trigger: a date, a day boundary, or a period. Check: the user's or location's local day, never the UTC day. Source: <PR or commit>.

### C. Clients

- **C1 Answers match their inputs.** Trigger: an async request whose answer depends on inputs that can change. Check: the client ignores an answer for old inputs. Source: <PR or commit>.

### G. Gates

- **G1 Every file type has a gate.** Trigger: a diff that touches only docs, skills, scripts, hooks, or config. Check: the full check still runs before the push, and CI does not skip tests for those paths. Source: <PR or commit>.
