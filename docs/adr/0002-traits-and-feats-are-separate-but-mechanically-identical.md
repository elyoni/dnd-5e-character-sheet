# Traits and Feats are separate lists but share one numeric-effect system

Until now, racial traits (Darkvision, Fey Ancestry, Dwarven Toughness) and
player-chosen Feats (Alert, Tough) were both stored in one `feats[]`
array and both called "feats" in the UI, even though they're distinct
concepts in 5e (granted vs. chosen). We split them into `traits[]` and
`feats[]`, each with its own panel.

The two lists remain mechanically identical: both use the same
`mod:{stat, amount, perLevel, matchSpeed, fixed}` shape, and every helper
that reads a numeric effect (`getFeatBonus`, `getSecondarySpeed`,
`getEffectiveDarkvision`, etc.) scans `feats.concat(traits)` rather than
just one list. The split is purely organizational — a Trait and a Feat
granting `{stat:"hp", amount:1, perLevel:true}` behave identically no
matter which list holds it. This was a deliberate choice over treating
Traits as flavor-text-only, since real 5e traits routinely carry numeric
effects (Dwarven Toughness, Darkvision's range).

No retroactive migration was done: existing saved characters keep their
race-granted entries in `feats[]` as-is. Only new race-template
applications write to `traits[]` going forward, per the project's
existing "never rename/repurpose a field in place" convention.
