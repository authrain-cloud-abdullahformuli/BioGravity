# EPIC-STM — Story Mode (Deferred)

**Status:** ⛔ Out of scope (backlog) for the public release.
**Decision:** Recorded in CC-14 on 2026-05-19.
**Canonical backlog row:** [../05-out-of-scope.md](../05-out-of-scope.md) — Story Mode line.
**Historical spec:** [../../../features/app-requirements.md](../../../features/app-requirements.md) § Story Mode.

No stories ship today. This file exists so the epic ID `EPIC-STM` is reserved (append-only) and discoverable to PM/QA, and so that when Story Mode is re-prioritised the future stories land here with stable IDs starting at `STORY-STM-001`.

## Why deferred
- No Prisma models (`Story`, `Slide`) exist.
- No `/story` route or store slice exists.
- The release-blocker sweep (CC-5 through CC-10) did not include Story Mode.
- Product description and out-of-scope doc already classify Story Mode as deferred.

## How to un-defer
1. Open a new feature ticket with `PRD.md` defining slide model, editor, viewer, camera capture, transitions, and public read-only behaviour.
2. Flip the EPIC-STM row in [`02-epic-taxonomy.md`](../02-epic-taxonomy.md) from `⛔` to `🟡 Partial` (or `✅` once shipped).
3. Append stories below in `STORY-STM-NNN` order — IDs are append-only.
4. Update [`../05-out-of-scope.md`](../05-out-of-scope.md) to remove Story Mode from the deferred table (or note partial implementation).
