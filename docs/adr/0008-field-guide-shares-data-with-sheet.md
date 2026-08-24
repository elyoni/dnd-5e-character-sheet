# The field guide is a second page in this repo, sharing race/class data with the sheet — not a separate project

**Status:** decided and implemented (races/classes; creatures/places left for later)

## Context

We wanted a second, more explorable surface for browsing D&D races and
classes — aimed partly at kids and newer players — that deliberately avoids
the common race/class stereotyping in most fantasy art (an Orc Barbarian on
every cover, never an Elf Barbarian).

## Considered Options

### A. Fully separate project — its own repo, its own site

Agreeing with this app only by convention on how race/class names are
spelled.

- **Rejected.** Two repos that merely agree on a JSON shape drift the moment
  either one adds a race or rewords a trait — there's no single place that
  owns the canonical list, and nothing catches the drift until a name
  mismatches at runtime.

### B. One repo, one shared hand-authored data file

`src/data/races-classes.js` as a plain JS object literal, edited directly,
consumed by both build outputs.

- **Rejected** (revised further, see below). Editing a race would mean
  touching a shared JS object literal shared by two very different
  consumers — mechanical fields the sheet needs, narrative fields only the
  Field Guide needs — with no validation that a new entry is well-formed.

### C. One repo, one markdown content vault compiled to a generated data file — chosen

`content/races/*.md` / `content/classes/*.md`, one file per race/class, YAML
frontmatter for every field code needs to read (traits, resources, saves,
hit die, combos, the two blurbs) plus an optional markdown body for lore
that hasn't been surfaced anywhere yet. `scripts/compile-content.js`
compiles that vault into `src/data/races-classes.js`, which becomes a
generated artifact — same status as `dnd_character_sheet.html` — feeding the
existing marker/injection mechanism `build.js` already uses for
`src/dice-physics.js`. Editing a race is now opening its `.md` file, not
touching a shared JS object literal. `compileContent()` validates the vault
on every build (missing required sub-fields, a `combos[].cls`/`combos[].race`
that isn't a known id, a bad `resources[].recharge` value, etc.) and refuses
to write anything if it finds a problem, listing every issue at once rather
than stopping at the first — so one compile run tells you everything wrong,
the same "reject with an actionable message" shape as this app's own Ask AI
schema-mismatch handling.

Same pattern is meant to extend to `content/creatures/*.md` and
`content/places/*.md` later without restructuring anything: each gets its
own frontmatter shape and its own small compiled table.

## What was built

The data file splits by who reads what. Mechanical fields — traits,
resources, saving throws, skill suggestions, hit die — are what the sheet
grants via `applyRaceTemplate()`/`applyTemplate()` (`dnd_character_sheet.src.html`),
now data-driven off `RACES[kind]`/`CLASSES[cls]` instead of imperative
if/else chains. Narrative fields — a kids-register and an adult-register
blurb per race/class, plus a handful of deliberately counter-stereotype race
+class "combos" — are Field-Guide-only (`field-guide.src.html`). Neither build reads
a field it doesn't need; nothing is duplicated between them.

The two sides aren't symmetric, and that's left honest rather than papered
over. The vault's 11 races don't perfectly match the sheet's `RACE_LIST`
either: Orc and Aasimar are sheet-only (no vault entry yet, so
`applyRaceTemplate()` is a no-op for them, same as before this refactor);
Half-Elf now has a vault entry and picks up an auto-template it never had
before (a strict improvement, not a regression — nothing was invented shut).
Classes match exactly — all 13 `CLASS_LIST` entries have a vault file.

Page structure: `field-guide.src.html` sits alongside `dnd_character_sheet.src.html`
as a second source template, using the same `<!-- BUILD:MODULE ... -->`
marker convention. `build.js` runs `compileContent()`, then `build()`
(the sheet), then `buildFieldGuide()` — all from one `node build.js`, both
outputs published by the same `deploy.yml` (as `index.html`+
`dnd_character_sheet.html` and `field-guide.html` respectively — the sheet is
kept reachable under its own filename on GitHub Pages too, since the
Field Guide's "back to sheet" link and its generated share-links both point at
`dnd_character_sheet.html` literally, the same relative link that works
against the local dev server).

The two pages connect at exactly one point each way: the sheet's New
Character modal links out to the Field Guide ("Not sure yet? Browse the
Field Guide"), and the Field Guide's "Open in Character Sheet" action hands back a
prefilled race/class/combo selection using the existing `#char=...`
share-link mechanism (`encodeStateToBase64({lang, state})`, the same wrapped
shape `buildShareURL()` produces) — `buildPickedCharacterState()` in
`field-guide.src.html` mirrors `defaultChar()`'s shape and applies the same
generic trait/resource/save/skill mapping `applyRaceTemplate()`/
`applyTemplate()` do, computed from the same `RACES`/`CLASSES` data so no
per-race/class logic is duplicated — only the shape and the generic
mapping. No new integration surface beyond that link.
