# Attack and Spell cards get a View/Edit split; print reuses the View rendering

Every card-based list in the app (Attacks, Spells, Feats/Traits, Resources,
Inventory) currently renders as an always-editable form — every field is a
live input, all the time. We considered applying a read-only View mode with
an Edit button to all five, but scoped it down to just Attacks and Spells:
they're the densest, most input-heavy cards, and the ones most looked at
during actual play rather than character building. Feats/Resources/
Inventory keep their current always-editable pattern.

The toggle is per-card, not per-section — each attack/spell has its own
Edit button, independent of its siblings. It layers on top of the existing
fold/unfold toggle rather than replacing it: folded (collapsed to name+icon)
→ unfolded View (full read-only display) → Edit (today's input form),
entered via an Edit button and exited via Done. Clicking Edit on a folded
card unfolds it too — a card can't land in a state where Edit is active but
its input form is hidden by folding. View/Edit state is never persisted —
it's transient UI state like a modal being open, not character data, so
every reload/character-switch shows View. A card created via the Add modal
is the one exception: it starts straight in Edit mode, since the player
just filled out the modal and likely wants to double-check or tweak before
settling into View.

One field stays live even in View mode: the spell's Prepared checkbox — a
play-time toggle you flip between rests, not a character-building field,
so forcing an Edit click for it would defeat the point of View mode
existing. We considered also keeping an attack's magic-bonus number live in
View (it's adjusted mid-combat too, e.g. a temporary +1 from a buff) but
decided against it: a lone editable stepper sitting next to otherwise
read-only text read as broken/inconsistent rather than convenient. Its
value is still visible in View mode — folded into the To Hit bonus and
spelled out in the formula note — editing it now requires Edit like every
other field.

The print document (`buildPrintHTML`) currently has its own separate,
bespoke table markup for the Attacks and Spells sections, independent of
the live app's rendering. Rather than hand-styling new print markup to
visually match the new View card, the Attacks/Spells print rows now call
the same View-rendering function the live app uses, wrapped in print's own
container/CSS. This is the one shared piece — the rest of `buildPrintHTML`
(dense tables for everything else, minimal mode, blank handwriting rows for
extra attacks/spells) is untouched. The shared function means a future
field addition to an Attack or Spell only has to happen once instead of
being kept in sync by hand in two places, the same risk `CLAUDE.md` already
flags for the Ask AI schemas.
