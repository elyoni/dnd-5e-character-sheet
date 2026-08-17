# Armor proficiency penalty is an informational warning, not a mechanical dice change

The app's dice roller (`rollPhysicalDice`) always throws a single d20 per
check/save/attack — there's no advantage/disadvantage concept anywhere,
even though several existing traits already reference it in free-text
notes (Dodge, Fey Ancestry, Brave, Gnomish Cunning). Implementing the
armor-proficiency penalty (disadvantage on Str/Dex D20 Tests, no
spellcasting) mechanically would mean building a real advantage/
disadvantage system: rolling two d20s, showing both, taking the
lower/higher — a significant addition to the 3D physics dice engine.

We chose instead to detect the mismatch (equipped armor's weight class
vs. `proficiencies.armorList`) and surface it as a persistent warning
banner near AC/Combat, leaving the player to apply disadvantage by hand
when rolling physical dice. This keeps the feature self-contained and
matches how every other advantage/disadvantage trait already works in
this app today (text note, applied manually). Building the general
advantage/disadvantage mechanism is a separate, larger effort that this
decision deliberately doesn't force.
