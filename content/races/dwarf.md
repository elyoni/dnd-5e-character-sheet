---
label:
  en: Dwarf
  he: גמד
img: content/images/races/dwarf.jpg
traits:
  - name: Darkvision
    nameHe: ראיית חושך
    notes: 60 ft — see in dim light as bright, and darkness as dim (no color, just shades of gray).
    notesHe: 60 רגל — רואים באור חלש כאילו הוא בהיר, ובחושך כאילו הוא אור חלש (ללא צבע, רק גווני אפור).
    mod:
      stat: darkvision
      amount: 60
      perLevel: false
  - name: Dwarven Resilience
    nameHe: חוסן גמדי
    notes: Advantage on saves vs being Poisoned; resistance to Poison damage.
    notesHe: יתרון בהצלות נגד הרעלה; התנגדות לנזק רעל.
  - name: Dwarven Toughness
    nameHe: קשיחות גמדית
    notes: Max HP increases by 1, and again every level.
    notesHe: נקודות החיים המרביות עולות ב-1, ושוב בכל רמה.
    mod:
      stat: hp
      amount: 1
      perLevel: true
resources:
  - name: Stonecunning (Tremorsense)
    nameHe: חוכמת אבן (חוש רעד)
    total: prof
    recharge: long
proficiencies:
  tools: Smith's tools, Brewer's supplies, or Mason's tools (choose one)
kidsBlurb:
  en: Dwarves aren't only tough fighters — some are the best spellcasters around.
  he: גמדים הם לא רק לוחמים קשוחים — חלקם הם מטילי הקסמים הכי טובים שיש.
adultBlurb:
  en: Beyond the forge and the front line, dwarven halls have always produced their share of scholars and mystics.
  he: מעבר לכור ההיתוך ולקו החזית, אולמות הגמדים תמיד הצמיחו את חלקם בחוקרים ומיסטיקנים.
combos:
  - cls: Wizard
    tag:
      en: runes carved as carefully as stone
      he: רונות חקוקות בקפידה, כמו באבן
  - cls: Sorcerer
    tag:
      en: magic in the blood, not the books
      he: קסם שבדם, לא שבספרים
  - cls: Monk
    tag:
      en: discipline as solid as bedrock
      he: משמעת מוצקה כמו סלע יסוד
  - cls: Ranger
    tag:
      en: tracks foes through the deepest tunnels
      he: מתחקה אחר אויבים במנהרות העמוקות ביותר
---
