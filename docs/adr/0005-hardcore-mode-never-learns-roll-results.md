# Hardcore Mode shows formulas, never captures roll results

Hardcore Mode exists for players who want to throw physical dice themselves
instead of letting the app roll (real or simulated) for them. We considered
having the app prompt for the number the player actually rolled, so it could
still compute totals, detect crits, and keep roll history exactly like the
other two dice modes. We rejected that: it would mean building an entry UI
for every roll trigger (attack, save, skill, spell damage, initiative) just
to re-derive numbers the player already has in front of them on the table,
and it re-introduces exactly the "app decides the outcome" trust boundary
Hardcore Mode exists to opt out of.

Instead, the app only ever shows the formula to add up (e.g.
`d20 +3 (INT) +2 (feat)`) and stops. A direct consequence: since the app
never learns the hit-die result, it can't conditionally reveal the crit-only
damage formula the way the live-roll flow does — Attacks show both the hit
formula and the base damage formula up front, plus a static note that a
natural 20 means rolling the damage dice again. No total, hit/crit outcome,
or entry is ever written to roll history in this mode.
