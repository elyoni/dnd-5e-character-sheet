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
