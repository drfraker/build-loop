<!-- Copy to docs/roles/<role>.md, one file per role (builder.md, reviewer.md, designer.md, ...). Fill in <...>. -->

# <Role>

Current state only, under about 60 lines. Git holds the history. A new thread must be able to continue from this file and the rules file alone.

## Job

<the starter prompt for this role, from the playbook, with the project values filled in>

## State

- Thread: <Role> <number>
- Last commit processed: <hash>
- Work in flight: <spec IDs, and where each one stands>
- Waiting on another thread: <the request or finding, and who has it>

## Notes

What this role has learned that is not yet written down elsewhere. Move each note to its proper file when it firms up:

- an always-on rule: the agent rules file
- a defect that repeated or got past review: `docs/review-lessons.md`
- why a feature was built the way it was: "How it was built" in the spec section
- a choice made without the owner: `docs/decisions.md`
- a design choice: `docs/design/<page>.md`

- <note>
