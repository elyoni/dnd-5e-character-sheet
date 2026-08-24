---
label:
  en: Dwarf
  he: גמד
traits:
  - name: Darkvision
    notes: 60 ft — see in dim light as bright, and darkness as dim (no color, just shades of gray).
    mod:
      stat: darkvision
      amount: 60
      perLevel: false
  - name: Dwarven Resilience
    notes: Advantage on saves vs being Poisoned; resistance to Poison damage.
  - name: Dwarven Toughness
    notes: Max HP increases by 1, and again every level.
    mod:
      stat: hp
      amount: 1
      perLevel: true
resources:
  - name: Stonecunning (Tremorsense)
    total: prof
    recharge: long
proficiencies:
  tools: Smith's tools, Brewer's supplies, or Mason's tools (choose one)
kidsBlurb: Dwarves aren't only tough fighters — some are the best spellcasters around.
adultBlurb: Beyond the forge and the front line, dwarven halls have always produced their share of scholars and mystics.
combos:
  - cls: Wizard
    tag: runes carved as carefully as stone
  - cls: Sorcerer
    tag: magic in the blood, not the books
  - cls: Monk
    tag: discipline as solid as bedrock
  - cls: Ranger
    tag: tracks foes through the deepest tunnels
---
