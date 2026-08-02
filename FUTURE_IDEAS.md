# Future ideas

Ideas raised during design discussions that were deliberately deferred, and why. This isn't a roadmap — just a record so we don't re-litigate the same tradeoffs from scratch next time one of these comes up.

## AI integration

The current "AI" feature (see CLAUDE.md / the modal that copies a YAML export and parses AI suggestions back in) is a manual copy/paste round trip, scoped to *additions only* (new feats/weapons/spells/resources/items — no modification of existing fields like level or HP). A few bigger versions of this were considered and set aside:

### Direct API integration (user's own AI account, e.g. Gemini)

Let the user connect their own AI account/API key and get suggestions without ever leaving the app — no copy/paste.

**Why not yet:** This is a genuinely separate feature, not an extension of the copy/paste flow. It needs a key-management story (the key would have to live in the browser/localStorage, since the app is a static file with no server), a "call the API" action with its own failure modes (rate limits, network errors, auth errors), and UI for all of that. Building it now would mean designing and maintaining a second, much heavier feature before the simple version has even shipped or been used. Per the project's own principle of not designing for hypothetical future requirements, the copy/paste version's internals (build export → parse pasted response) were kept as plain, reusable functions so this could plug in later without a rewrite — but no UI scaffolding for it exists yet.

### Full-URL round trip

Instead of a scoped YAML addition snippet, hand the AI the full shareable link (`#char=...`, the existing base64-encoded character), let it edit the character directly (add a feat, level up, adjust HP, etc.), and have it hand back a new URL that fully represents the updated character — reusing the existing `checkURLImport()` import path.

**Why not yet:** This is a full-overwrite approach. The whole character gets replaced by whatever the AI generated, with no scoped safety net — one hallucinated or malformed field and the AI silently clobbers the entire sheet, not just the item the user asked about. That's exactly the risk the additions-only scope was chosen to avoid. It's tempting because the plumbing already exists, but "the plumbing exists" isn't the same as "the risk profile is acceptable" — the current design deliberately trades that convenience for safety (nothing existing can be silently overwritten; at most you get an extra row you can delete).

### Field modification via the importer (beyond additions) — revisited, narrower than first proposed

The first version cut all modification: the AI just told the user in plain text to update their level, and the user applied it manually. In practice this was one of the main things people wanted the AI feature for (leveling up), so the whitelist was revisited and turned out to be much smaller than originally feared once we checked how the app actually derives values from `level`:

- **Ability scores don't need to be in the whitelist at all.** `getEffectiveAbilities()` already adds every feat's `mod.stat`/`amount` onto the base score, and that effective value feeds every calculation (attacks, damage, skills, saves). So an Ability Score Improvement is just a feat addition (`mod:{stat:"str", amount:2}`) — already fully covered by the existing additions-only mechanism, no new risk introduced.
- **Proficiency bonus, attack bonuses, spell save DC, and max HP (when `hpAutoCalc` is on) already recompute live from `state.level`** — so changing `level` alone cascades correctly through almost everything for free.
- **`hpCur` is adjusted by the app itself, not the AI**: 5e's actual rule is that the HP gained on level-up adds to current HP too, not just max (e.g. 20/28 → level up gaining 8 → 28/36, not 20/36 or 28/28). Since `hpMax` is already auto-derived, the app computes the before/after delta when `level` changes and applies that same delta to `hpCur` — the AI never specifies an HP number directly.
- **Spell slot totals stay out of scope** — level/class-dependent in a way that's genuinely hard for an LLM to get exactly right (multiclassing, Pact Magic, etc.), and errors there are the kind a user might not catch. The AI just explains in plain text what the user should update, same as it already does today.

So the actual whitelist ended up being just `level` (an integer), plus the app-computed `hpCur` side effect — much narrower than the original "level + ability scores" proposal.

## Hit dice as a level label + die-size dropdown

`hitDice` is currently a free-text field (e.g. `"3d10"`). While investigating what needs to change on level-up, we found `computeMaxHP()` only ever reads the die *size* out of it via regex — the leading count is never used in any calculation, purely cosmetic. Proposed redesign: replace the free-text field with a `state.level`-driven count label (already auto-updating, no stale text) plus a dropdown for just the die size (d6/d8/d10/d12 — fixed by class, essentially never changes after character creation).

**Why not now:** this is a UI/data-model change to the Combat panel unrelated to the AI feature that surfaced it — a separate, self-contained refactor (`defaultChar`/`hydrate` back-fill, translation keys, the Combat panel input). Also flagged as an open question: the app has no short-rest "spend hit dice to heal" tracker at all right now (hit dice are only ever used for that in real 5e play) — worth asking whether that's wanted at the same time, or if `hitDice` should stay purely cosmetic.
