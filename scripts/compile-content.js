#!/usr/bin/env node
// Reads content/races/*.md, content/classes/*.md and content/backgrounds/*.md
// — YAML frontmatter plus an optional markdown body for free-form lore not
// yet surfaced anywhere — and compiles them into src/data/races-classes.js,
// the plain-const file both dnd_character_sheet.src.html and
// field-guide.src.html inject via the existing <!-- BUILD:MODULE ... -->
// marker mechanism in build.js. (The filename predates BACKGROUNDS; kept
// as-is rather than churning every marker/path that references it.)
//
// This file itself is meant to be called from build.js's main(), before
// buildSheet()/buildFieldGuide() — content/**/*.md is the hand-edited source
// of truth now; src/data/races-classes.js becomes a generated artifact,
// exactly like dnd_character_sheet.html already is.

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const OUT_FILE = path.join(ROOT, "src", "data", "races-classes.js");

function loadDir(sub) {
  const dir = path.join(CONTENT_DIR, sub);
  if (!fs.existsSync(dir)) return {};
  const out = {};
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith(".md")) continue;
    const id = file.slice(0, -3);
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const lore = content.trim();
    out[id] = lore ? { ...data, lore } : { ...data };
  }
  return out;
}

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];
const HIT_DICE = [4, 6, 8, 10, 12];
const RECHARGES = ["short", "long"];

// Collects every problem instead of stopping at the first, so one compile
// run tells you (or the AI that just wrote the file) everything wrong at
// once — same "reject with an actionable message" shape as this app's own
// Ask AI schema-mismatch handling.
function validate(RACES, CLASSES, BACKGROUNDS) {
  const errors = [];
  const err = (file, msg) => errors.push(`content/${file}: ${msg}`);

  // Optional Hebrew sibling of a mechanical string field (traits[].name/.notes,
  // resources[].name, feat.name/.notes) — these stay plain English strings
  // because dnd_character_sheet.src.html's applyRaceTemplate()/applyTemplate()/
  // applyBackgroundTemplate() copy them verbatim into a player's (single-
  // language, free-text) character data. `xHe` is Field-Guide-display-only,
  // so it's optional — not every entry needs a translation.
  function checkOptionalHe(file, obj, field, label) {
    const v = obj[field];
    if (v === undefined) return;
    if (typeof v !== "string" || !v.trim()) err(file, `${label} "${field}" is present but empty`);
  }

  function checkTraits(file, traits) {
    if (traits === undefined) return;
    if (!Array.isArray(traits)) return err(file, `"traits" must be a list`);
    traits.forEach((t, i) => {
      if (!t.name) err(file, `traits[${i}] is missing "name"`);
      if (!t.notes) err(file, `traits[${i}] ("${t.name || "?"}") is missing "notes"`);
      checkOptionalHe(file, t, "nameHe", `traits[${i}] ("${t.name || "?"}")`);
      checkOptionalHe(file, t, "notesHe", `traits[${i}] ("${t.name || "?"}")`);
    });
  }

  function checkResources(file, resources) {
    if (resources === undefined) return;
    if (!Array.isArray(resources)) return err(file, `"resources" must be a list`);
    resources.forEach((r, i) => {
      if (!r.name) err(file, `resources[${i}] is missing "name"`);
      if (r.total === undefined) err(file, `resources[${i}] ("${r.name || "?"}") is missing "total"`);
      else if (typeof r.total !== "number" && r.total !== "level" && r.total !== "prof") {
        err(file, `resources[${i}] ("${r.name}") has total "${r.total}" — must be a number, "level", or "prof"`);
      }
      if (r.recharge && !RECHARGES.includes(r.recharge)) {
        err(file, `resources[${i}] ("${r.name}") has recharge "${r.recharge}" — must be one of: ${RECHARGES.join(", ")}`);
      }
      checkOptionalHe(file, r, "nameHe", `resources[${i}] ("${r.name || "?"}")`);
    });
  }

  // kidsBlurb/adultBlurb/combos[].tag are Field-Guide-only narrative text
  // (never read by the main sheet), so — unlike the mechanical fields above
  // — they're fully bilingual: {en, he}, both required, matching the
  // label:{en,he} shape. `requireField`=true also errors when the field is
  // absent entirely (used for combos[].tag, which is mandatory); false skips
  // silently when absent (used for the optional kidsBlurb/adultBlurb).
  function checkBilingual(file, obj, field, requireField, whatMsg) {
    if (!(field in obj)) {
      if (requireField) err(file, `${whatMsg} is missing "${field}"`);
      return;
    }
    const v = obj[field];
    if (typeof v !== "object" || v === null || Array.isArray(v)) {
      return err(file, `${whatMsg ? whatMsg + " " : ""}"${field}" must be an object with "en" and "he"`);
    }
    for (const lang of ["en", "he"]) {
      if (typeof v[lang] !== "string" || !v[lang].trim()) err(file, `${whatMsg ? whatMsg + " " : ""}"${field}.${lang}" is missing or empty`);
    }
  }

  function checkBlurbs(file, data) {
    for (const field of ["kidsBlurb", "adultBlurb"]) checkBilingual(file, data, field, false);
  }

  const raceIds = Object.keys(RACES);
  const classIds = Object.keys(CLASSES);

  for (const [id, data] of Object.entries(RACES)) {
    const file = `races/${id}.md`;
    checkTraits(file, data.traits);
    checkResources(file, data.resources);
    checkBlurbs(file, data);
    if (data.combos !== undefined) {
      if (!Array.isArray(data.combos)) err(file, `"combos" must be a list`);
      else data.combos.forEach((c, i) => {
        if (!c.cls) err(file, `combos[${i}] is missing "cls"`);
        else if (!classIds.includes(c.cls)) {
          err(file, `combos[${i}].cls "${c.cls}" is not a known class. Known classes: ${classIds.join(", ")}`);
        }
        checkBilingual(file, c, "tag", true, `combos[${i}] (cls "${c.cls || "?"}")`);
      });
    }
  }

  for (const [id, data] of Object.entries(CLASSES)) {
    const file = `classes/${id}.md`;
    if (data.hitDie !== undefined && !HIT_DICE.includes(data.hitDie)) {
      err(file, `"hitDie" is ${data.hitDie} — must be one of: ${HIT_DICE.join(", ")}`);
    }
    if (data.saves !== undefined) {
      if (!Array.isArray(data.saves)) err(file, `"saves" must be a list`);
      else data.saves.forEach(s => { if (!ABILITIES.includes(s)) err(file, `saves contains "${s}" — must be one of: ${ABILITIES.join(", ")}`); });
    }
    if (data.casterAbility !== undefined && data.casterAbility !== null && !ABILITIES.includes(data.casterAbility)) {
      err(file, `"casterAbility" is "${data.casterAbility}" — must be one of: ${ABILITIES.join(", ")}, or null`);
    }
    checkResources(file, data.resources);
    checkBlurbs(file, data);
    if (data.combos !== undefined) {
      if (!Array.isArray(data.combos)) err(file, `"combos" must be a list`);
      else data.combos.forEach((c, i) => {
        if (!c.race) err(file, `combos[${i}] is missing "race"`);
        else if (!raceIds.includes(c.race)) {
          err(file, `combos[${i}].race "${c.race}" is not a known race. Known races: ${raceIds.join(", ")}`);
        }
        checkBilingual(file, c, "tag", true, `combos[${i}] (race "${c.race || "?"}")`);
      });
    }
  }

  for (const [id, data] of Object.entries(BACKGROUNDS)) {
    const file = `backgrounds/${id}.md`;
    if (data.abilityChoices !== undefined) {
      if (!Array.isArray(data.abilityChoices) || data.abilityChoices.length !== 3) {
        err(file, `"abilityChoices" must be a list of exactly 3 abilities`);
      } else {
        data.abilityChoices.forEach(a => { if (!ABILITIES.includes(a)) err(file, `abilityChoices contains "${a}" — must be one of: ${ABILITIES.join(", ")}`); });
      }
    }
    if (data.skillProficiencies !== undefined && !Array.isArray(data.skillProficiencies)) {
      err(file, `"skillProficiencies" must be a list`);
    }
    if (data.toolProficiency !== undefined && typeof data.toolProficiency !== "string") {
      err(file, `"toolProficiency" must be a string`);
    }
    if (data.feat !== undefined) {
      if (!data.feat.name) err(file, `"feat" is missing "name"`);
      if (!data.feat.notes) err(file, `"feat" ("${data.feat.name || "?"}") is missing "notes"`);
      checkOptionalHe(file, data.feat, "nameHe", `"feat" ("${data.feat.name || "?"}")`);
      checkOptionalHe(file, data.feat, "notesHe", `"feat" ("${data.feat.name || "?"}")`);
    }
    checkBlurbs(file, data);
    if (data.combos !== undefined) {
      if (!Array.isArray(data.combos)) err(file, `"combos" must be a list`);
      else data.combos.forEach((c, i) => {
        if (!c.cls) err(file, `combos[${i}] is missing "cls"`);
        else if (!classIds.includes(c.cls)) {
          err(file, `combos[${i}].cls "${c.cls}" is not a known class. Known classes: ${classIds.join(", ")}`);
        }
        checkBilingual(file, c, "tag", true, `combos[${i}] (cls "${c.cls || "?"}")`);
      });
    }
  }

  return errors;
}

function compileContent() {
  const RACES = loadDir("races");
  const CLASSES = loadDir("classes");
  const BACKGROUNDS = loadDir("backgrounds");

  const errors = validate(RACES, CLASSES, BACKGROUNDS);
  if (errors.length) {
    console.error(`compile-content: ${errors.length} problem(s) found — nothing was written.\n`);
    errors.forEach(e => console.error("  - " + e));
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  const banner = `/* GENERATED FILE — do not edit directly. Edit content/races/*.md, content/classes/*.md and content/backgrounds/*.md, then run \`node build.js\`. */\n`;
  const out =
    banner +
    `const RACES = ${JSON.stringify(RACES, null, 2)};\n\n` +
    `const CLASSES = ${JSON.stringify(CLASSES, null, 2)};\n\n` +
    `const BACKGROUNDS = ${JSON.stringify(BACKGROUNDS, null, 2)};\n`;

  fs.writeFileSync(OUT_FILE, out);
  console.log(
    `Compiled ${Object.keys(RACES).length} races + ${Object.keys(CLASSES).length} classes + ${Object.keys(BACKGROUNDS).length} backgrounds ` +
    `from content/ -> ${path.relative(ROOT, OUT_FILE)}`
  );
  return { RACES, CLASSES, BACKGROUNDS };
}

if (require.main === module) compileContent();
module.exports = { compileContent };
