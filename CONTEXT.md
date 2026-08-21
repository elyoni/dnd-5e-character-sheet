# D&D 5e Character Sheet

A single-file character sheet app for tabletop D&D 5e play. This glossary
covers domain terms the code and UI must use consistently — not
implementation details (see `CLAUDE.md` for those).

## Language

**Trait**:
A special ability granted by a character's race/species (Darkvision, Fey
Ancestry) or class, not chosen freely — the character simply has it.
Mechanically identical to a Feat (same numeric-effect system), but kept in
a separate list purely for player organization/display.
_Avoid_: Racial feat, ability (too generic)

**Feat**:
An optional special ability a player actively chooses, usually instead of
an Ability Score Improvement at certain levels. Mechanically identical to
a Trait.
_Avoid_: Racial feat (a Trait, not a Feat), perk

**Resource**:
A limited-use class or racial feature tracked as uses-remaining with a
recharge condition (short rest / long rest) — e.g. Rage, Ki Points, Second
Wind. Purely a usage tracker today: spending a Resource has no numeric
effect on any other stat.
_Avoid_: Ability, charge

**Weight class** (armor):
An armor item's category — Light, Medium, or Heavy — which determines how
its AC combines with the wearer's Dex modifier: Light adds the full Dex
mod, Medium caps it at +2, Heavy adds none.
_Avoid_: Armor type (ambiguous with the Armor/Shield item-type field),
armor category

**Armor proficiency**:
Training with a weight class of armor (Light/Medium/Heavy) or with
Shields, tracked per-character as a reference list. Wearing armor of a
weight class you lack proficiency in imposes Disadvantage on Strength-
and Dexterity-based D20 Tests and blocks spellcasting — a rule that
applies to armor weight classes only, never to Shields.
_Avoid_: Armor training

**Unarmored AC**:
The Armor Class formula used when no Armor item is equipped: 10 + the
governing ability modifier (Dex by default, or a different ability/none
if configured). Distinct from an equipped armor's own AC value, which is
already a complete AC (not "10 + a bonus") and replaces the Unarmored
formula entirely while worn.
_Avoid_: Base AC (ambiguous — could mean 10, or an equipped armor's base
number)

**Darkvision range**:
The distance (in feet) a character can see in darkness as if it were dim
light. Multiple sources of Darkvision (e.g. a racial trait plus a feat)
don't stack additively — the character has whichever single range is
highest.
_Avoid_: Vision range (too generic — this app has no general lighting/
vision system, only this one numeric value)

**Ask AI**:
The app's feature for round-tripping a character through an external AI
chat via copy/paste: the app produces a prompt, the user pastes it into
their own AI chat, and pastes the reply back in. Covers two distinct
flows: Sheet Additions (onto an existing character) and Character Draft
(creating a new one). No direct API integration — the AI account/key is
the user's own, entirely outside the app.
_Avoid_: AI integration (too broad — implies direct API access, which
this app doesn't have)

**Sheet Additions**:
The Ask AI flow that proposes changes to the player's *existing*,
already-created character: new Feats/Traits/Attacks/Spells/Resources/
Items, plus a narrow set of whitelisted field edits (level, subclass,
skill expertise, spell slot totals). Deliberately scoped to never
silently overwrite data the character already has — additions are
reviewed and applied one at a time, and the whitelisted edits are the
only fields it may change in place.
_Avoid_: AI suggestions (too generic), additions block (implementation
detail — the term names the flow, not the YAML shape)

**Character Draft**:
The Ask AI flow that proposes a brand-new character from a free-text
concept: identity and ability scores presented as a single block that
must be confirmed before the character is actually created, plus
Starting Suggestions offered alongside it. Distinct from Sheet Additions
because there's no existing character to protect from being overwritten
— the whitelist/one-at-a-time caution that governs Sheet Additions
doesn't apply here.
_Avoid_: New character generation (doesn't distinguish the AI flow from
the app's own blank "New Character" form)

**Linked Character**:
A character created via the "+ New Linked Character" action, tied
permanently to the character it was created from via `linkedTo` (set
once at creation, never changed). That action, plus the rest of the
Linked Characters box, only appears once **Has Linked Character** is
checked in Identity → Configuration — the same shows/hides-a-box pattern
as **Has Spells**, auto-enabled the moment a character becomes linked
either way (as an owner or as the linked one) but freely toggleable
after that. A Linked Character cannot itself own further Linked
Characters — linking is strictly one level deep, never a chain. Deleting
the character it's linked to also deletes it. The mechanism is generic
(any PC can create one, of any `charType`); Druid Wild Shape is just its
first use case, not a special case baked into the mechanism itself.
_Avoid_: Beast form (too narrow — only correct when describing the Wild
Shape use case specifically, not the general mechanism), child character
(implies a tree/chain, which this explicitly isn't), sub-character

**Bundle**:
A Linked Character's owner plus every character linked to it, treated as
one unit for sharing — always all of them together, never a partial
selection. Exported as a distinct file/link shape (`{bundle: true,
characters: [...]}`, or a `#charbundle=` URL) alongside — never in place
of — the existing single-character export/share, which continues to
cover only whichever one character is currently active. Importing a
Bundle always assigns every character in it a fresh id and remaps
`linkedTo` between them accordingly; it never reuses ids from the file,
exactly like importing a single character never does.
_Avoid_: Party (this app has no multi-character "party" concept — a
Bundle is strictly one owner + its own Linked Characters), group export
(doesn't name the specific owner+links relationship being exported)

**Hardcore Mode**:
A dice-mode preference (alongside 3D Dice and Slow Device Mode, all one
global `diceMode` setting) for players who roll physical dice themselves.
Instead of generating a result, the app shows the formula to add up (e.g.
`d20 +3 (INT) +2 (feat)`) and stops there — it never learns the actual
rolled number, so no total, hit/crit outcome, or roll history is ever
recorded in this mode. The standalone Dice Roller panel is hidden
entirely, since it has nothing to add in this mode.
_Avoid_: Manual mode (doesn't convey the "no safety net" framing), Physical
dice mode (accurate but loses the name's connection to the app's other
dice-mode options)

**View mode** (Attack/Spell card):
The default, read-only display of an unfolded Attack or Spell card — every
field shown as static text/icons, except the spell's Prepared checkbox and
the roll button/history, which stay live. Clicking Edit on a folded card
unfolds it and enters Edit in the same action. Reached by unfolding a
card; a card returns here on Done, and always starts here again after a
reload (View/Edit state is never persisted).
_Avoid_: display mode, read-only mode

**Edit mode** (Attack/Spell card):
The input-form state of an Attack or Spell card — every field becomes an
editable input, same as today's cards and as Feats/Resources/Inventory
still work everywhere. Entered via the card's Edit button, exited via
Done back to View mode. A card created via the Add modal starts here
instead of in View mode.
_Avoid_: edit form (names the markup, not the state)

**Starting Suggestions**:
The itemized Feats/Traits/Attacks/Spells/Resources/Items proposed
alongside a Character Draft, reviewed and applied one at a time exactly
like Sheet Additions — the same review mechanism, just offered at
character-creation time instead of onto an existing character.
_Avoid_: Starting equipment (too narrow — covers all addition
categories, not just inventory items)
