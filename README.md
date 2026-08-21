# D&D 5e Character Sheet

A character sheet for D&D 5e that ships as a single self-contained HTML file. Everything — markup, styles, and logic — lives in one page, built from source with `node build.js` (see [Development](#development) below); the built page needs no server or install to run, just a browser.

Bilingual: **English** and **Hebrew** (with right-to-left layout), switchable at any time.

## Running it

The live app is auto-deployed to GitHub Pages on every push to `main` — there's no separate staging step. To run it from this repo, see [Development](#development) below for the build step.

## Characters

You can create and switch between any number of characters, each saved independently in browser storage (or `window.storage` when embedded as a Claude artifact). Two character types are supported:

- **Player Character** — the full sheet described below.
- **Beast / Companion** (internally `charType: "animal"`) — a lighter sheet for companions/mounts/summons/reference monsters: no class or spellcasting, AC/HP/attacks keyed off Wisdom instead of the usual ability scores, and a "Species" field instead of race/class.

Every character — either type — also has an optional **Source Link** field in Identity, for a URL to the creature/character's full stat block on an external site (D&D Beyond, a wiki, a PDF...). It's most useful on a Beast/Companion you're not building out by hand (e.g. a Shield Guardian pulled straight from its official stat block): fill in Source Link with the reference instead of reverse-engineering it into a class/race combination. When Identity is locked it renders as a clickable "🔗 Open source" link.

New characters can start blank, from the built-in **demo character** (a filled-in level-3 Human Fighter), or from a race/class quick-start (see below). Deleting a character is unrestricted — you can delete down to zero, at which point the app shows a "no characters yet" screen instead of the sheet.

### Linked Characters

Any character can have one or more **Linked Characters** — separate character sheets tied to it, useful for anything that needs its own full stat block: a Druid's Wild Shape beast forms, a Ranger's animal companion, a Warlock's familiar, and so on. Everything about linking lives in the character switcher dropdown at the top of the sheet, which groups each owner together with its linked characters. Its "➕ Create new character…" entry opens a small chooser (Just Create or 🤖 with AI); either creation form then offers an optional "Link to" field, defaulted to the character you created it from, so a new character can be born already linked. The same dropdown also carries a context-sensitive link/unlink entry for the *currently active* character: "🔗 Link to another character…" if it's currently independent (and doesn't itself own any linked characters — an owner can't also become someone else's child, to keep the structure one level deep), or "🔗 Unlink" (with a confirmation popup) if it's currently linked. A linked character's Identity panel shows who it's linked to, with a "↩ Transform back" button to switch straight back to the owner. Deleting an owner deletes everything linked to it too.

Export (⬇) offers extra **bundle** options — "Download JSON bundle" / "🔗 Copy shareable bundle link" — whenever the current character is linked to others: the bundle is always the owner plus every character linked to it, all together, with no partial selection. This is separate from (and doesn't change) the normal single-character Export, which still only ever covers whichever one character is currently active. Importing a bundle (file or link) always creates every character in it fresh — new ids, relinked to each other the same way they were linked in the original — and lands you on the imported owner.

The plain single-character Export also works fine on a Linked Character by itself (e.g. sharing just your own beast form or one player's PC out of a group, rather than the whole bundle) — if whoever imports it doesn't have its owner, it just comes in as an ordinary standalone character instead of a broken link to nothing.

## Races

Picking a race in the New Character form (or changing it later) auto-applies that race's traits (see [Traits vs. Feats](#traits-vs-feats) below) as traits/resources — it only *adds* to what you have, it never overwrites anything you've already filled in. Supported races and subraces:

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

Picking a class similarly auto-applies saving-throw proficiencies, suggested skill proficiencies, class resources, hit die size, and whether the class casts spells at all — again, additive only for saves/skills/resources (it never overwrites anything you've already filled in), while Hit Die size and the Has Spells toggle are set directly since they're determined entirely by class, not a starting suggestion:

| Class | Hit Die | Saving Throws | Suggested Skills | Resources / Spellcasting granted |
|---|---|---|---|---|
| **Barbarian** | d12 | Str, Con | Athletics, Perception | Rage |
| **Bard** | d8 | Dex, Cha | Performance, Persuasion | Bardic Inspiration; spellcasting (Cha) |
| **Cleric** | d8 | Wis, Cha | Religion, Insight | Channel Divinity; spellcasting (Wis) |
| **Druid** | d8 | Int, Wis | Nature, Survival | Wild Shape; spellcasting (Wis) |
| **Fighter** | d10 | Str, Con | Athletics, Perception | Second Wind, Action Surge |
| **Monk** | d8 | Str, Dex | Acrobatics, Stealth | Ki Points; default attack becomes Unarmed Strike (Martial Arts) |
| **Paladin** | d10 | Wis, Cha | Religion, Persuasion | Spellcasting (Cha) |
| **Ranger** | d10 | Str, Dex | Survival, Stealth | Spellcasting (Wis) |
| **Rogue** | d8 | Dex, Int | Stealth, Sleight of Hand | — |
| **Sorcerer** | d6 | Con, Cha | Arcana, Persuasion | Sorcery Points; spellcasting (Cha) |
| **Warlock** | d8 | Wis, Cha | Arcana, Deception | Spellcasting (Cha) |
| **Wizard** | d6 | Int, Wis | Arcana, Investigation | Spellcasting (Int) |
| **Artificer** | d8 | Con, Int | Investigation, Arcana | — |

As with race, a custom class name can be typed in instead (`clsCustom`) — Hit Die stays freely editable for custom classes, since there's no list entry to look it up from. A free-text **Subclass** field sits next to Class (e.g. "Champion", "Battle Master") — it's not tied to a preset list or auto-applied template, just a place to record the player's choice.

**Has Spells** (in Identity → Configuration) shows or hides the whole Spells panel and spellcasting stat block; it's auto-set from the class table above (Bard/Cleric/Druid/Paladin/Ranger/Sorcerer/Warlock/Wizard default on, everyone else off) but can be flipped manually any time — useful for a spellcasting subclass of an otherwise non-caster class (e.g. Eldritch Knight), or the reverse.

A Druid's Wild Shape resource (added above) is just a uses tracker; the beast forms themselves are built as [Linked Characters](#linked-characters).

## Traits vs. Feats

**Traits** are things your race or class *gives* you — Darkvision, Fey Ancestry, Dwarven Toughness — never a player choice. **Feats** are the player's own *optional* picks, usually taken instead of an Ability Score Improvement (e.g. Alert, Tough). The sheet keeps them in two separate lists (Traits, then Feats) within one shared "Feats & Traits" panel so a glance at either tells you where it came from, but mechanically they're identical: both use the exact same modifier system below, and every derived-stat calculation reads both lists together — a numeric effect works the same whichever list it sits in.

Racial traits are added to the **Traits** list automatically by the race template (see [Races](#races) above); feats are added by hand (or via Ask AI) to the **Feats** list. Both lists use the same "add" modal and the same generic modifier:

- **Stat** — which derived value it affects (an ability score, HP, speed, initiative, Darkvision range, an attack/damage type, Crit Range, etc.)
- **Amount** — the flat bonus (or, for Darkvision, the vision range in feet)
- **Per level** — whether the bonus scales with character level instead of staying flat
- **Equal to Speed** / **Set base value** — Climb/Swim/Fly Speed only: instead of a flat bonus, it can instead *replace* the base value — either matching it to walking speed (e.g. a Fairy's Flight trait) or to a fixed number you choose (optionally scaling per level too). Other entries' flat bonuses still stack on top of whichever base a replacing entry establishes.
- **Crit Range** — lowers the natural-roll threshold that counts as a critical hit (e.g. amount 1 = crit on 19–20, matching the Champion Fighter's Improved Critical). Every attack roll checks against this lowered threshold, and a "Crit on X–20" badge shows on the card.
- **Darkvision Range** — the character's vision-in-darkness range in feet; shows up as a row in the Combat panel's Speed box once nonzero. Multiple Darkvision sources (e.g. a racial trait plus Superior Darkvision) don't stack additively — the character has whichever single range is highest.

Notes on a trait/feat card are edit-locked in the card itself (read-only display) — change them via the ✏️ edit button, which opens the same modal used to add one; that's also the field the Ask AI import writes into.

This one generic `{stat, amount, perLevel, matchSpeed, fixed}` shape drives all trait/feat math in combat/derived stats, so any homebrew or official trait or feat can be represented without code changes.

## Identity & Configuration

Besides Name/Class/Race/Level/Size, the Identity panel has a **Configuration** sub-section holding settings that change less often than combat numbers but more often than your character's core identity:

- **Has Spells** — shows/hides the Spells panel (see [Classes](#classes) and Spellcasting above).
- **Theme** — Leather (default), Parchment (Light), or High Contrast. This is a global app preference (like language), not saved per-character — switching characters doesn't change it.
- **Dice Mode** — 3D Dice (default, animated physics throw), Slow Device (skips the animation and just shows the rolled number instantly, for older/slower devices where the physics animation lags), or Hardcore (for players who roll physical dice themselves — the app never rolls; it just shows the formula to add up, e.g. `d20 +3 (INT) +2 (feat)`, and stops. Since the app never learns the actual result, Attacks show both the hit and damage formulas up front along with a note that a natural 20 means rolling the damage dice again, and no roll history is recorded in this mode. The standalone Dice Roller panel is hidden entirely while Hardcore is active). One global app preference like Theme, not saved per-character.
- **Auto-calc HP** and **Base Speed** — the input controls live here; the Combat panel always shows the resulting computed value and its formula, never the raw input.
- **Armor / Weapon / Language proficiencies** — checklist pickers plus a free-text "Other" slot each, replacing the old single free-text fields (still shown correctly on the Print view and any character exported before this change still imports cleanly — see [Development](#development)):
  - **Armor**: Light, Medium, Heavy, Shields.
  - **Weapons**: the Simple/Martial category checkboxes, plus every individual PHB simple and martial weapon (club, dagger, rapier, longsword, hand crossbow, etc.) for classes/races that grant specific weapons instead of a whole category.
  - **Languages**: the 16 standard 5e languages (Common, Dwarvish, Elvish, Giant, Gnomish, Goblin, Halfling, Orc, Abyssal, Celestial, Draconic, Deep Speech, Infernal, Primordial, Sylvan, Undercommon).
  - **Tools** stays a single free-text field (no fixed list in 5e).
- A read-only **"Proficiencies & Languages"** panel sits below Saving Throws/Skills and always shows the current Armor/Weapons/Languages/Tools picks as plain text (side-by-side badges on wide screens, stacked on narrow ones, text direction matching whichever language you typed it in) — so you can see them at a glance without unlocking Identity. Editing still only happens in Identity → Configuration.

## Combat & abilities

- **Ability scores** (Str/Dex/Con/Int/Wis/Cha) with auto-computed modifiers, feeding every derived stat below.
- **AC** — driven by your Inventory: mark an item as type Armor and Equipped, and pick its weight class (Light/Medium/Heavy, or a homebrew ability instead of Dex for non-standard armor) alongside its base AC number and Equipped(shield) bonus items on top. An equipped armor's own AC number is already the *complete* AC for wearing it — not "10 + a bonus" — so the breakdown under the AC box labels it `(Armor)` to make that explicit; with no Armor item equipped, AC falls back to 10 + a selectable ability (Dex by default, Wis for Animals, or None), labeled `(Unarmored)`. Weight class also determines how much of your Dex modifier applies: Light gets the full modifier, Medium caps it at +2, Heavy gets none, matching the 5e rule. If the equipped armor's weight class isn't checked in Armor proficiency (Identity → Configuration), a warning banner appears under the AC box: 5e's rule for wearing armor you're not trained in is Disadvantage on Strength/Dexterity checks, saves, and attacks, and no spellcasting — the sheet only warns about this (informational only), it doesn't roll with disadvantage automatically.
- **HP** — auto-calculated from class hit die + Constitution, or toggleable to manual entry via the **Auto-calc** checkbox in Identity → Configuration (the Combat panel's HP box always shows the resulting number and, when auto-calc is on, the formula behind it), with current/max/temp tracking.
- **Hit Dice** — die size (d6/d8/d10/d12) is fixed by class (see the Classes table above) and locked from editing once a list class is picked; custom classes keep it free-text. The count always equals your level. A row of click-to-toggle dots (one per hit die) tracks how many you've spent on short rests — click a dot to mark/unmark it spent.
- **Critical hits** — a natural 20 always crits; a Crit Range feat (see Feats above) can lower that threshold. On a crit, the extra damage dice are rolled automatically as a second dice throw immediately after the hit lands (5e's roll-the-damage-dice-twice rule), with the combined total shown as one result.
- **Initiative, Speed**, **Passive Perception**, **Proficiency Bonus** (auto by level), all as live-derived values — never hand-entered or stored stale. Speed's base number is set in Identity → Configuration; the Combat panel always shows the final effective speed (including feat bonuses) and the formula behind it.
- **Climb/Swim/Fly speed** — each only shows up in the Combat panel once it's nonzero. Swim speed has a manually-editable base (plus any trait/feat bonus); climb and fly speed are trait/feat-only — the only way to grant them is a trait or feat with Stat set to Climb Speed/Fly Speed, either as a flat bonus, matching walking speed (e.g. a Fairy's Flight trait), or a fixed base value of your choosing.
- **Darkvision** — shows as its own row under Speed once a trait or feat grants it (Stat: Darkvision Range), e.g. a Dwarf's 60 ft or a Drow's Superior Darkvision at 120 ft.
- **Size** (Tiny/Small/Medium/Large/Huge/Gargantuan) — a simple field in Identity; purely descriptive, doesn't feed into any derived stat.
- **Saving throws** and all 18 **skills**, each with proficiency and expertise toggles, computed off the right ability + proficiency bonus. Click the modifier itself to roll a real d20 for that save/skill in the 3D dice overlay; the total flashes in place of the modifier for a few seconds afterward. Both panels are **locked by default** on a brand-new install (🔒 icon in the header) so a stray tap can't silently flip a proficiency — unlock to edit; existing installs keep whatever lock state they already had before this changed.
- **3D physics dice** — every roll in the app (attacks, spell damage, saves, skills, the freeform dice panel) throws real dice with real physics (Three.js + cannon-es) in a full-screen overlay, rather than a scripted animation; the result is whatever face the die actually lands on. All seven standard polyhedral dice are modeled with true geometry (tetrahedron/cube/octahedron/pentagonal-trapezohedron/dodecahedron/icosahedron; d100 is two physical d10s combined into a percentile). Tap the overlay to dismiss it early.
- **Attacks** — a repeatable list (name, type, damage die, damage type, notes) with a real-physics dice roll for attack rolls and damage, plus roll history per row. Each row also has a "Magic" bonus field: a flat number (e.g. +1/+2/+3) automatically added to both the attack roll and the damage roll, for magic weapons like a standard +1/+2/+3 weapon or something like a Sun Blade — no need to hand-edit the damage die text to bake the bonus in. Each attack's type (Melee 🗡️/Ranged 🏹/Finesse 🤺/Natural 🐾/Spell 🔮) shows as an icon next to its name at a glance. Rolling replaces the roll button with the hit/damage dice themselves — click either die again to reroll — and the totals show beside them. Each attack can be individually collapsed to just its name/icon and a small die-roll icon (hiding the type/prof controls, stat block, delete button, dice history, and notes) — you can still roll straight from a collapsed row; "Collapse"/"Expand" buttons fold or unfold the whole list at once. Damage type is a dropdown of the 13 D&D 5e types (bludgeoning, piercing, slashing, acid, cold, fire, force, lightning, necrotic, poison, psychic, radiant, thunder) or blank. The "New Attack" modal also offers an optional preset picker (Unarmed Strike, Dagger, Shortsword, Longsword, Greatsword, Shortbow, Longbow, Light Crossbow, Fire Bolt, Eldritch Blast) that pre-fills name/type/damage/damage-type (and casting stat for spell attacks) with a short hint about how the weapon/cantrip works — you can still edit everything before confirming, and plain manual entry works exactly as before.
- **Spellcasting** — the whole Spells panel only shows when **Has Spells** (Identity → Configuration) is on; see [Classes](#classes) above for the default per class. When shown: spell slots (levels 1–9) with click-to-toggle used/available dots, a spell list, and dice-rolled spell damage. The New Spell dialog includes an optional premade-spell picker for classes with a defined preset list (currently Cleric, Druid, and Ranger — a handful of common cantrips/1st/2nd-level spells each) that pre-fills level/name/damage/notes/type, which you can still edit before adding; other classes (and a blank or custom class) simply don't show the picker, and manual entry always works. Each spell can be tagged as Attack (⚔️), Buff/Aid (✨), or Other (🔹) — the icon shows next to the name at a glance — and individually collapsed to just its name/icon and a small die-roll icon when it has a damage die (hiding range, cast type, components, delete button, and notes) — you can still roll straight from a collapsed row; "Collapse"/"Expand" buttons fold or unfold the whole list at once. The Damage field only shows for spells tagged Attack (or untagged ones); Buff/Aid and Other spells hide it. Cast Type is a dropdown grouped into "Action Used" (Action/Bonus Action/Reaction) and "Longer Casting Time" (1 Minute–24 Hours), with a "Custom…" option for anything else (e.g. Shield's reaction trigger).
- **Resources** — arbitrary trackable pools (Rage, Ki Points, Second Wind, custom homebrew resources, ...) with per-use dots, short/long-rest recharge, and a free-text notes field (e.g. what Channel Divinity actually does).
- **Concentration tracker**, **inventory** (currency, plus two separate item tables: a **Gear** table — name/qty/notes, tagged with a Category: Food, Potion, Poison, Ammunition, Tool, Focus, Magic Item, Container, or Other, which auto-sorts the list into that order — and an **Armor & Shields** table — name/qty/notes plus an Equipped flag and AC fields (base + governing ability for Armor, bonus for Shields) that feed the AC calculation), and free-text **notes**. Each table can be individually locked (🔒/🔓 in its own header, unlocked by default): locked, everything except Qty renders as plain read-only text and the delete button disappears, so mid-game you can still track ammo/potions used without risking an accidental edit to a name or note; unlock to add/remove items or change anything else. On phones, each row becomes a stacked card instead of a table row so long notes wrap and stay fully readable instead of getting clipped.
- **Turn-flow reference** — an in-sheet cheat-sheet/diagram of what you can do on your turn (currently text-only; the interactive diagram view is hidden pending a fix).

## Other features

- **Bilingual UI** (English/Hebrew) with automatic RTL layout switch — every string is looked up from a translation table, so nothing is hardcoded per-language.
- **Autosave** — every change is debounced and persisted to browser storage automatically; a save-status indicator shows it.
- **Import / export** — download/upload a character as JSON, or share one via a self-contained link (character data is base64-encoded into the URL hash). Newer app versions always stay able to import files exported by older versions.
- **Ask AI** — copies a curated YAML snapshot of the character (plus instructions) to the clipboard for pasting into any AI chat, so you can ask things like "which feat should I take?" or "does anything look wrong here?" "🔗 Copy as link instead" copies the exact same content as a `data:` URL instead, for AI tools that fetch/read a link rather than pasted text — since the payload has to be the URL itself (there's no server to host it at a real address), this only works with AI tools that actually retrieve a given link's content; if yours doesn't, use the plain copy button instead. If the AI suggests concrete additions (a trait, feat, weapon, spell, resource, or item) in the expected format, paste its reply back in and each suggestion appears as its own card to accept or discard individually. It can also set level, subclass, skill Expertise, or spell slot totals directly, but never HP or ability scores — an ability score change must be a feat addition instead — and a schema-version mismatch is rejected with a message the user can hand back to the AI to self-correct. Suggestions matching something already on the sheet by name are silently skipped, so re-pasting the same or an updated reply doesn't offer duplicates. The instructions also tell the AI to ask the player rather than decide for them (or invent a placeholder entry) whenever 5e rules present a choice, such as an Ability Score Improvement or a subclass feature, and to only include the additions block once something is actually settled rather than attaching it speculatively to every reply.
- **Create with AI** — a separate flow (from the "no characters yet" screen, or "➕ Create with AI" in the character switcher) that builds a brand-new character from a short free-text concept instead of editing an existing one. Copy the generated prompt into any AI chat, paste its reply back in, and review a preview of the proposed identity and ability scores before confirming — nothing is created until you do. Class and race must exactly match this app's own lists (a mismatch is rejected with a message you can hand back to the AI); the app then fills in class/race mechanics itself (saves, skills, racial traits) the same way the manual "New Character" form does, rather than trusting the AI's guess. If the reply also includes starting armor/weapon/language proficiencies, they're applied directly (additively, on top of whatever the class/race template already granted). Any other suggested extras (starting weapons, spells, feats, gear, etc.) show up afterward as the same kind of individual accept/discard cards as Ask AI. If your concept describes a beast/companion/mount/monster rather than a player character, the prompt tells the AI to create it as a Beast/Companion (skipping class/race entirely, and reusing the "race" field as a free-text species) instead of reverse-engineering a class/subclass combo that merely resembles it, and to carry over a stat-block link you give it (or a canonical source it knows of) into Source Link.
- **Print view** — a separate, print-optimized layout independent of the on-screen sheet.
- **Help & Rules** — a "❓ Help" button in the top bar opens a modal explaining each panel's controls alongside the underlying 5e rule it implements (ability modifiers, AC/armor weight-class math, attack/damage rolls, spell save DC, etc.), in the current UI language.
- **First-run onboarding** — a lightweight language-picker flow for brand-new installs only; existing users never see it.
- **What's New** — a one-time popup summarizing recent changes for returning users after an update; dismissing it marks that update seen so it doesn't reappear. Brand-new installs never see it (onboarding covers them instead).
- **Destructive-action confirmation** — deleting an attack, spell, trait, feat, resource, item, or entire character always asks for confirmation first.
- **Fold/collapse** any panel to declutter the sheet, independently per panel.
- **Lock** the Saving Throws or Skills panel (🔒/🔓 icon in its header) to disable its proficiency/expertise checkboxes and guard against accidental misclicks; locked by default on a brand-new install, and the lock state persists across sessions.

## Development

`dnd_character_sheet.html` — the file that actually ships — is a **generated build artifact** and is not committed to this repo. To build and run it locally:

```bash
node build.js                     # generates dnd_character_sheet.html from source
python3 -m http.server 8000
# then open http://localhost:8000/dnd_character_sheet.html
```

Re-run `node build.js` after editing `dnd_character_sheet.src.html` or `src/dice-physics.js`. CI (`.github/workflows/deploy.yml`) runs the same build step before publishing to GitHub Pages, so nothing needs to be built or committed by hand before pushing.

See [`CLAUDE.md`](CLAUDE.md) for architecture notes, coding conventions, and how the automated test suite (`tests/*.spec.js`, Playwright) is run.

**Note:** this README describes user-facing content (races, classes, feats, mechanics) and should be updated whenever that content changes — new races/classes/traits, new panels, or other player-visible features.
