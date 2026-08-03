# Usability improvement plan

Decisions reached via interview on 2026-08-03. Not implemented yet — this is
the spec to build against. Update `README.md` and both `T.en`/`T.he` blocks
as each item lands, per `CLAUDE.md` conventions.

Druid Wild Shape support was part of the original interview but deferred to
a later pass — see `FUTURE_IDEAS.md` for its design.

## 1. Non-spellcaster class support

- Add one boolean field, `state.hasSpells`, to `defaultChar()`/`hydrate()`.
- Auto-set from class on pick/change in the New Character modal and
  `applyTemplate()`: caster classes (Wizard, Cleric, Druid, Bard, Sorcerer,
  Warlock, Paladin, Ranger) → `true`; non-casters (Fighter, Barbarian, Rogue,
  Monk, Artificer) → `false`. User can override any time.
- Toggle lives in the new Identity/config section (see item 2).
- When `false`, hide the Spells panel and spellcasting stat block in
  `render()`.
- No changes to the Resources panel — it already supports Ki/Focus/Sorcery
  Points etc. as free-form entries; no new "focus point" concept needed.

## 2. Identity/config section

A new sub-section inside (or appended to) the existing Identity panel that
becomes the home for character *configuration* (as opposed to computed
combat values, which stay where they are today):

- "Has spells" toggle (item 1)
- Languages: closed multi-select of the 16 standard 5e languages + a custom
  "Other" free-text slot. Moves out of the Proficiencies panel.
- Armor proficiency: closed multi-select (Light/Medium/Heavy/Shields) +
  custom/other slot. Moves out of the Proficiencies panel.
- Weapon proficiency: closed multi-select covering Simple/Martial categories
  *and* individual PHB weapons (~30, split by category) + custom/other slot.
  Moves out of the Proficiencies panel.
- Tools: stays free text, also relocates into Identity for consistency
  (Armor/Weapons/Tools/Languages all move together).
- HP auto-calc checkbox (moved from Combat panel; item 4).
- Base speed number input (moved from Combat panel; item 12).
- Theme picker (item 5).

The Combat panel and the print/export views keep showing *computed* values
and their formula-note breakdowns exactly as today — only the raw
inputs/toggles relocate.

## 3. Dice icon on folded attack/spell rows

- Row-level fold (`attack-card.folded` / `spell-item.folded`) currently
  hides the roll button, roll history, *and* keeps 🗑️ visible in the
  always-visible header.
- Swap it: header row (visible even folded) gains a small die-roll icon
  next to the name/type icon. The 🗑️ delete button and the dice-history
  move inside the collapsible body (only visible when unfolded).
- Whole-panel-level fold (`foldedPanels['attacks']`/`['spells']`) is
  unchanged — still hides everything, including the new per-row icons.

## 4. Auto-HP-calc toggle relocation

- `hpAutoCalc` checkbox moves from the Combat panel's HP box into
  Identity/config (item 2).
- The Combat panel HP box keeps showing current/max HP, the HP bar, and the
  existing formula-note breakdown (`t.hpAutoNote` / feat-bonus line) — it
  just loses the checkbox control itself.

## 5. Theme / border customization

- New global preference (stored like `dnd-lang`, not per-character):
  `dnd-theme`, one of a small fixed set of presets (e.g. current "Leather",
  a new "Parchment/Light", a "High Contrast") — each preset is a full
  CSS-variable palette *including* border style/radius/color, no separate
  border control.
- Picker UI lives in Identity/config (per-character panel), but writes to
  the global key, not `state` — switching characters doesn't change theme.
- Implementation: extra `:root[data-theme="..."]` blocks alongside the
  existing `:root{...}`, toggled via a `data-theme` attribute on `<html>`,
  same pattern the app already uses for `dir` (rtl/ltr).

## 6. Hit dice as a level-scaled constant + usage dots

- Die size (d6/d8/d10/d12) becomes fixed per class via a new
  `CLASS_HIT_DIE` lookup (Barbarian d12; Fighter/Paladin/Ranger d10;
  Bard/Cleric/Druid/Monk/Rogue/Warlock/Artificer d8; Sorcerer/Wizard d6),
  applied when a list class is picked/changed. Custom (non-list) classes
  keep the die size manually editable, same as today.
- Count continues to auto-scale with level exactly as today
  (`state.hitDice` count is rewritten on level-up).
- Add a dot-tracker row (reusing the existing `slotDotsInteractive`/
  `resourceDots` interaction pattern) showing `level`-many dots, click to
  toggle spent/available, for tracking hit dice spent on short rests.

## 7. Crit-range feat (crit on 19–20)

- Generalize `feat.mod` with a new stat kind, e.g.
  `{stat:"critRange", amount:1}` meaning "lower the natural-20 threshold by
  N" — consumed wherever a crit is currently checked (`hitRoll===20`) via a
  new `getCritThreshold(state)` helper, not hardcoded to one named feat.
  Matches the existing convention (`getFeatBonus`) of never special-casing
  individual feats.
- UI: the feat card shows an effect badge like existing feats (e.g. "Crit on
  19–20"). Each attack row's to-hit formula-note gets a small annotation
  showing the lowered threshold.

## 8. Auto-roll second damage die on critical hit

- Two-phase roll: `rollAttack()` throws the hit die (+ normal damage dice)
  first, as today. If the settled hit roll meets the crit threshold from
  item 7, immediately fire a second automatic `rollPhysicalDice()` call for
  the bonus crit damage dice, and fold the result into the same displayed
  total.
- This also gives "Savage Attacks" (extra damage die on melee crit) a real
  mechanism instead of being a text-only feat note.

## 9. Skills / Saving Throws locked by default

- Change the default `panelLocks` used for brand-new installs (no stored
  `dnd-folded-panels` key yet) to `{saves:true, skills:true}` instead of
  `{}`.
- Existing users' stored lock state is left untouched — no retroactive
  re-lock.

## 10. Feat notes locked to edit

- `feat-notes-input` textarea in the inline feat card becomes a read-only
  display (plain text, not an editable `<textarea>`).
- The existing ✏️ edit-feat modal already has a notes `<textarea>`
  (`modalFeatNotes`) — it becomes the only direct-edit path via
  `openEditFeatModal(i)`.
- AI-paste import (`addAIItem`) already writes `feat.notes` directly and is
  unaffected.

## 11. Speed configuration relocation

- Base speed number input moves from the Combat panel into Identity/config
  (item 2), same pattern as HP auto-calc (item 4).
- The Combat panel's speed box keeps showing the effective computed speed
  (including feat bonuses) and its formula-note breakdown, unchanged except
  for losing the input control.

---

### Cross-cutting notes

- Every new `state` field needs a `hydrate()` back-fill default and stays
  backward-compatible with old exports (per `CLAUDE.md`).
- Every new user-facing string needs both `T.en` and `T.he` entries.
- `README.md` needs updates for: hit-die-per-class table, weapon/armor/
  language proficiency lists, theme presets, and the crit-range feat
  mechanic.
- No implementation has started — this file is the agreed spec to build
  against next.
