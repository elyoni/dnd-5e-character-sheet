# D&D 5e Character Sheet

A single-file, no-build-step character sheet for D&D 5e. Everything — markup, styles, and logic — lives in one HTML file: [`dnd_character_sheet.html`](dnd_character_sheet.html). Open it in a browser (or serve it locally) and it just works, no server or install required.

Bilingual: **English** and **Hebrew** (with right-to-left layout), switchable at any time.

## Running it

```bash
python3 -m http.server 8000
# then open http://localhost:8000/dnd_character_sheet.html
```

Or just double-click the file and open it directly in a browser.

Every push to `main` auto-deploys it to GitHub Pages — there's no separate staging step.

## Characters

You can create and switch between any number of characters, each saved independently in browser storage (or `window.storage` when embedded as a Claude artifact). Two character types are supported:

- **Player Character** — the full sheet described below.
- **Animal** — a lighter sheet for companions/mounts/summons: no class or spellcasting, AC/HP/attacks keyed off Wisdom instead of the usual ability scores, and a "Species" field instead of race/class.

New characters can start blank, from the built-in **demo character** (a filled-in level-3 Human Fighter), or from a race/class quick-start (see below). Deleting a character is unrestricted — you can delete down to zero, at which point the app shows a "no characters yet" screen instead of the sheet.

## Races

Picking a race in the New Character form (or changing it later) auto-applies that race's traits as feats/resources — it only *adds* to what you have, it never overwrites anything you've already filled in. Supported races and subraces:

| Race | Subraces | Traits granted automatically |
|---|---|---|
| **Human** | Variant Human | Resourceful (Heroic Inspiration each Long Rest), Skillful (bonus skill proficiency) |
| **Dwarf** | Hill, Mountain, Gold, Gray (Duergar) | Darkvision, Dwarven Resilience (advantage vs. Poisoned, poison resistance), Dwarven Toughness (+1 max HP per level), Stonecunning (Tremorsense resource), tool proficiency |
| **Elf** | High, Wood, Drow, Eladrin, Sea, Shadar-kai | Darkvision, Fey Ancestry (advantage vs. Charmed, immune to magical sleep), Trance, Perception proficiency — picking the **Drow** subrace additionally grants Superior Darkvision (120 ft), Sunlight Sensitivity, Drow Magic (Dancing Lights, later Faerie Fire/Darkness), and rapier/shortsword/hand crossbow proficiency |
| **Halfling** | Lightfoot, Stout, Ghostwise | Lucky (reroll natural 1s), Brave (advantage vs. Frightened), Halfling Nimbleness (move through larger creatures' spaces) |
| **Dragonborn** | — | Draconic Ancestry (choice of damage type), Damage Resistance (matching type), Breath Weapon resource |
| **Gnome** | Forest, Rock, Deep | Darkvision, Gnomish Cunning (advantage on INT/WIS/CHA saves vs. magic) |
| **Half-Elf** | — | (pick race traits manually — no auto-template yet) |
| **Half-Orc** | — | Darkvision, Relentless Endurance (drop to 1 HP instead of 0, once per Long Rest), Savage Attacks (extra crit damage die) |
| **Tiefling** | Abyssal, Chthonic, Infernal Legacy | Darkvision, Otherworldly Presence (knows Thaumaturgy), Fiendish Resilience (resistance to one damage type) |
| **Orc** | — | (pick race traits manually — no auto-template yet) |
| **Aasimar** | — | (pick race traits manually — no auto-template yet) |
| **Fairy** | — | Fairy Magic (Druidcraft cantrip, later Faerie Fire/Enlarge-Reduce), Flight (fly speed always equal to walking speed, via a feat) — also sets Size to Small if still at its default |
| **Minotaur** | — | Horns (natural weapon, 1d6 + Str piercing), Goring Rush (bonus horn attack after Dashing 20+ ft), Hammering Horns (shove after a melee hit), Labyrinthine Recall (never get lost) |

Any race/subrace name can also be typed in freely (`raceCustom`/`subraceCustom`) if you don't want to use the preset list.

## Classes

Picking a class similarly auto-applies saving-throw proficiencies, suggested skill proficiencies, class resources, and (where relevant) the spellcasting ability — again, additive only:

| Class | Saving Throws | Suggested Skills | Resources / Spellcasting granted |
|---|---|---|---|
| **Barbarian** | Str, Con | Athletics, Perception | Rage |
| **Bard** | Dex, Cha | Performance, Persuasion | Bardic Inspiration; spellcasting (Cha) |
| **Cleric** | Wis, Cha | Religion, Insight | Channel Divinity; spellcasting (Wis) |
| **Druid** | Int, Wis | Nature, Survival | Wild Shape; spellcasting (Wis) |
| **Fighter** | Str, Con | Athletics, Perception | Second Wind, Action Surge |
| **Monk** | Str, Dex | Acrobatics, Stealth | Ki Points; default attack becomes Unarmed Strike (Martial Arts) |
| **Paladin** | Wis, Cha | Religion, Persuasion | Spellcasting (Cha) |
| **Ranger** | Str, Dex | Survival, Stealth | Spellcasting (Wis) |
| **Rogue** | Dex, Int | Stealth, Sleight of Hand | — |
| **Sorcerer** | Con, Cha | Arcana, Persuasion | Sorcery Points; spellcasting (Cha) |
| **Warlock** | Wis, Cha | Arcana, Deception | Spellcasting (Cha) |
| **Wizard** | Int, Wis | Arcana, Investigation | Spellcasting (Int) |
| **Artificer** | Con, Int | Investigation, Arcana | — |

As with race, a custom class name can be typed in instead (`clsCustom`). A free-text **Subclass** field sits next to Class (e.g. "Champion", "Battle Master") — it's not tied to a preset list or auto-applied template, just a place to record the player's choice.

## Feats

Feats are modeled generically rather than as a fixed list — add any feat by name with free-text notes, and optionally a single mechanical modifier:

- **Stat** — which derived value it affects (an ability score, HP, speed, initiative, an attack/damage type, etc.)
- **Amount** — the flat bonus
- **Per level** — whether the bonus scales with character level instead of staying flat
- **Equal to Speed** / **Set base value** — Climb/Swim/Fly Speed only: instead of a flat bonus, the feat can instead *replace* the base value — either matching it to walking speed (e.g. a Fairy's Flight trait) or to a fixed number you choose (optionally scaling per level too). Other feats' flat bonuses still stack on top of whichever base a replacing feat establishes.

This one generic `{stat, amount, perLevel, matchSpeed, fixed}` shape drives all feat math in combat/derived stats, so any homebrew or official feat can be represented without code changes — including the ones races grant automatically (Darkvision, Lucky, Dwarven Toughness, etc., listed above), which show up in the same Feats panel.

## Combat & abilities

- **Ability scores** (Str/Dex/Con/Int/Wis/Cha) with auto-computed modifiers, feeding every derived stat below.
- **AC** — driven by your Inventory: mark an item as type Armor and Equipped to set the base AC plus its own governing-ability modifier (or None), and equip Shield-type item(s) to add their bonus on top. With no Armor item equipped, AC falls back to 10 + a selectable ability (Dex by default, Wis for Animals, or None), chosen right in the AC box.
- **HP** — auto-calculated from class hit die + Constitution (toggleable to manual entry), with current/max/temp tracking.
- **Initiative, Speed**, **Passive Perception**, **Proficiency Bonus** (auto by level), all as live-derived values — never hand-entered or stored stale.
- **Climb/Swim/Fly speed** — each only shows up in the Combat panel once it's nonzero. Swim speed has a manually-editable base (plus any feat bonus); climb and fly speed are feat-only — the only way to grant them is a feat with Stat set to Climb Speed/Fly Speed, either as a flat bonus, matching walking speed (e.g. a Fairy's Flight trait), or a fixed base value of your choosing.
- **Size** (Tiny/Small/Medium/Large/Huge/Gargantuan) — a simple field in Identity; purely descriptive, doesn't feed into any derived stat.
- **Saving throws** and all 18 **skills**, each with proficiency and expertise toggles, computed off the right ability + proficiency bonus.
- **Attacks** — a repeatable list (name, type, damage die, damage type, notes) with an animated 3D dice-roll for attack rolls and damage, plus roll history per row. Each attack's type (Melee 🗡️/Ranged 🏹/Finesse 🤺/Natural 🐾/Spell 🔮) shows as an icon next to its name at a glance. Rolling replaces the roll button with the hit/damage dice themselves — click either die again to reroll — and the totals show beside them. Each attack can be individually collapsed to just its name/icon (hiding the type/prof controls, stat block, dice, and notes); "Collapse"/"Expand" buttons fold or unfold the whole list at once. Damage type is a dropdown of the 13 D&D 5e types (bludgeoning, piercing, slashing, acid, cold, fire, force, lightning, necrotic, poison, psychic, radiant, thunder) or blank. The "New Attack" modal also offers an optional preset picker (Unarmed Strike, Dagger, Shortsword, Longsword, Greatsword, Shortbow, Longbow, Light Crossbow, Fire Bolt, Eldritch Blast) that pre-fills name/type/damage/damage-type (and casting stat for spell attacks) with a short hint about how the weapon/cantrip works — you can still edit everything before confirming, and plain manual entry works exactly as before.
- **Spellcasting** — spell slots (levels 1–9) with click-to-toggle used/available dots, a spell list, and dice-rolled spell damage. The New Spell dialog includes an optional premade-spell picker for classes with a defined preset list (currently Cleric, Druid, and Ranger — a handful of common cantrips/1st/2nd-level spells each) that pre-fills level/name/damage/notes/type, which you can still edit before adding; other classes (and a blank or custom class) simply don't show the picker, and manual entry always works. Each spell can be tagged as Attack (⚔️), Buff/Aid (✨), or Other (🔹) — the icon shows next to the name at a glance — and individually collapsed to just its name/icon (hiding range, cast type, components, damage, and notes); "Collapse"/"Expand" buttons fold or unfold the whole list at once. The Damage field only shows for spells tagged Attack (or untagged ones); Buff/Aid and Other spells hide it. Cast Type is a dropdown grouped into "Action Used" (Action/Bonus Action/Reaction) and "Longer Casting Time" (1 Minute–24 Hours), with a "Custom…" option for anything else (e.g. Shield's reaction trigger).
- **Resources** — arbitrary trackable pools (Rage, Ki Points, Second Wind, custom homebrew resources, ...) with per-use dots, short/long-rest recharge, and a free-text notes field (e.g. what Channel Divinity actually does).
- **Concentration tracker**, **inventory** (currency, plus two separate item tables: a **Gear** table — name/qty/notes, tagged with a Category: Food, Potion, Poison, Ammunition, Tool, Focus, Magic Item, Container, or Other, which auto-sorts the list into that order — and an **Armor & Shields** table — name/qty/notes plus an Equipped flag and AC fields (base + governing ability for Armor, bonus for Shields) that feed the AC calculation), and free-text **notes**.
- **Turn-flow reference** — an in-sheet cheat-sheet/diagram of what you can do on your turn (currently text-only; the interactive diagram view is hidden pending a fix).

## Other features

- **Bilingual UI** (English/Hebrew) with automatic RTL layout switch — every string is looked up from a translation table, so nothing is hardcoded per-language.
- **Autosave** — every change is debounced and persisted to browser storage automatically; a save-status indicator shows it.
- **Import / export** — download/upload a character as JSON, or share one via a self-contained link (character data is base64-encoded into the URL hash). Newer app versions always stay able to import files exported by older versions.
- **Ask AI** — copies a curated YAML snapshot of the character (plus instructions) to the clipboard for pasting into any AI chat, so you can ask things like "which feat should I take?" or "does anything look wrong here?" If the AI suggests concrete additions (a feat, weapon, spell, resource, or item) in the expected format, paste its reply back in and each suggestion appears as its own card to accept or discard individually. This is additions-only — it never modifies existing fields like level, HP, or ability scores — and a schema-version mismatch is rejected with a message the user can hand back to the AI to self-correct.
- **Print view** — a separate, print-optimized layout independent of the on-screen sheet.
- **First-run onboarding** — a lightweight language-picker flow for brand-new installs only; existing users never see it.
- **Destructive-action confirmation** — deleting an attack, spell, feat, resource, item, or entire character always asks for confirmation first.
- **Fold/collapse** any panel to declutter the sheet, independently per panel.

## Development

See [`CLAUDE.md`](CLAUDE.md) for architecture notes, coding conventions, and how the automated test suite (`tests/*.spec.js`, Playwright) is run.

**Note:** this README describes user-facing content (races, classes, feats, mechanics) and should be updated whenever that content changes — new races/classes/traits, new panels, or other player-visible features.
