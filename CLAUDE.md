# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A D&D 5e character sheet web app that is a **single self-contained HTML file**: `dnd_character_sheet.html` (~3000 lines: `<style>` block, then one `<script>` block, no `<body>` markup beyond a single `<div id="app">`). There is no build step or bundler — the file is the entire product. `package.json` exists only to pull in Playwright for end-to-end tests.

Bilingual (English / Hebrew with RTL layout) — all UI text is looked up through a translation table, never hardcoded inline.

## Running / deploying

There's nothing to build. To work on it locally, just open the file in a browser, or serve it so relative/storage behavior matches production:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/dnd_character_sheet.html
```

Deployment is automatic: `.github/workflows/deploy.yml` copies `dnd_character_sheet.html` to `site/index.html` and publishes it to GitHub Pages on every push to `main`. There is no separate staging step — pushing to `main` ships to production.

## Testing

End-to-end tests live in `tests/*.spec.js` and drive the real page with Playwright (`playwright.config.js` spins up `python3 -m http.server` and points Chromium at it — no mocking, no headless DOM shim).

```bash
npm install                       # first time only
npx playwright install chromium   # first time only (downloads the browser binary)
npm test                          # run the full suite headless
npx playwright test tests/onboarding.spec.js   # a single file
npx playwright test -g "remembers the last-used character"  # a single test by title
npx playwright test --ui          # interactive/debug mode
```

`.github/workflows/test.yml` runs the same suite on every push and PR. Each test gets a fresh browser context (empty `localStorage`), so a plain `page.goto('/dnd_character_sheet.html')` is always the first-time onboarding flow — use the `dismissOnboarding()` helper in `tests/helpers.js` to get past it when a test doesn't care about onboarding itself. Since the app has no framework or component boundaries to unit-test in isolation, prefer adding to this Playwright suite over inventing a separate unit-test layer — and drive new features through it the same way (real DOM interactions, then assert on the in-page `state`/`charIndex` globals via `page.evaluate`) rather than reaching for mocks.

## Architecture

Everything lives in global scope inside the one `<script>` tag. There's no framework — it's hand-rolled immediate-mode rendering:

- **`state`** — the single in-memory object for the *currently active* character (abilities, HP, attacks, spells, feats, resources, inventory, notes, etc.), or **`null`** when the user has zero characters (fresh install before their first pick, or right after deleting their last one). `defaultChar(id)` creates a blank one; `demoChar(id)` creates a filled level-3 Human Fighter sample; `hydrate(s)` back-fills missing fields when loading older saved JSON so the shape stays current after schema additions. Nothing creates a character on the user's behalf — `state` only becomes non-null in response to an explicit action (confirming the New Character form, or picking the demo).
- **`charIndex`** — `[{id, name}]` list of all characters owned by this browser/user; the actual per-character data is stored separately per id. Deleting is not blocked at 1 remaining character — it can go to 0.
- **`render()`** — rebuilds `#app`'s `innerHTML` from scratch from `state`/`charIndex`/UI flags on every change (no diffing/virtual DOM). Its first line is a `state === null` check that renders a lightweight "no characters yet" screen (`noCharactersHTML(t)`) instead of the full sheet — keep that branch in sync if you add something that should be reachable with zero characters. All interactive elements wire back up via inline `onclick`/`onchange` attributes that call top-level functions. Any state mutation must be followed by a `render()` call to be visible, and `queueSave()` to persist it.
- **Derived values are recomputed on every render**, not stored: `getEffectiveAbilities`, `getEffectiveSpeed`, `computeMaxHP`, `computeAC`, `computePassivePerception`, `profByLevel`, feat-bonus helpers (`getFeatBonus`, `getAttackFeatBonus`, `getDamageFeatBonus`), etc. When adding a new stat, prefer a derived function over storing a computed value in `state`.
- **Modals** are plain booleans (`newCharModalOpen`, `attackModalOpen`, `featModalOpen`, `exportModalOpen`, `printModalOpen`, `onboardingModalOpen`, `pendingRemove`, ...) that gate template blocks inside `render()`'s template string. `newCharModalHTML(t)` and `onboardingModalHTML(t)` are factored into standalone functions (rather than inlined like the others) specifically because they need to render both from the normal sheet branch and from the `state === null` branch — follow that pattern if a new modal needs to be reachable from both. Follow the existing `.modal-backdrop` / `.modal-box` / `.modal-row` / `.modal-actions` CSS classes for new ones.
- **Destructive actions ask first**: every delete button — attacks, spells, feats, resources, items, and the character selector's trash icon — routes through `confirmRemove(fn)` / `pendingRemove` / `doRemove()` / `cancelRemove()`, which shows one generic "Remove this? This can't be undone." popup and only calls `fn` if the user confirms. Wire new delete buttons the same way (`onclick="confirmRemove(yourDeleteFn)"`) instead of calling the delete function directly.
- **Translations**: `T.en` / `T.he` are flat key→string maps (`T[lang].someKey`), consulted in `render()` via `const t = T[lang]`. Every new user-facing string needs an entry in *both* language blocks — there's no fallback. `document.documentElement.dir` is set to `rtl`/`ltr` based on `lang` at the end of `render()`.
- **Storage abstraction** (`storageGet`/`storageSet`/`storageDelete`, `LS_PREFIX = "dnd-sheet:"`) tries, in order: `window.storage` (used when embedded in claude.ai as an artifact) → `localStorage` (standalone-file/browser usage) → an in-memory object as a last resort (private-browsing fallback, does not survive reload). Never call `localStorage` directly — always go through these wrappers so all three modes keep working. Known storage keys: `dnd-char-index`, `dnd-char:<id>`, `dnd-last-char` (last active character, restored on load), `dnd-lang`, `dnd-onboarded`.
- **Autosave**: `queueSave()` debounces (400ms) writes of `state` to `dnd-char:<id>` and updates the save-status indicator; call it after any mutation via the generic `set(path, value)` helper (dotted-path setter) or a dedicated mutator.
- **First-run onboarding**: `init()` (bottom of the script) shows the onboarding welcome modal (language picker only) for genuinely new installs (empty `charIndex` and no `dnd-onboarded` flag); pre-existing installs are silently marked onboarded so they never see it. Dismissing it (`closeOnboardingWelcome()`) just reveals the same "no characters yet" screen that a fresh delete-down-to-zero lands on — there's one landing state for "you have no character," not a separate onboarding-only variant of it.
- **Import/export**: JSON file export/import, plus a shareable link that base64-encodes the whole character into a URL hash (`#char=...`), decoded by `checkURLImport()` on load.
- **Dice rolling / cube animation**: `rollAttack`, `rollSpellDamage`, `rollDice`, `computeCubeRollData`, and the `DIE_*`/`CUBE_*`/`PIP_LAYOUT` constants drive an animated CSS 3D die. Roll history is kept per-row in `attackRollHistories`/`spellRollHistories`.
- **Print**: `buildPrintHTML(opts)` generates a separate print-optimized HTML document (opened via `doPrint()`/`confirmPrint()`), independent of the live `render()` template.

## Conventions to follow

- New character fields go in `defaultChar()`, get a matching back-fill default in `hydrate()`, and (if displayed) a translation key in both `T.en` and `T.he`.
- New class/race "quick add" content goes in `CLASS_SAVES` / `CLASS_SKILL_SUGGEST` / `applyTemplate()` / `applyRaceTemplate()` — these only *add* to existing state, never overwrite what a user already filled in.
- Feat effects are modeled generically via `feat.mod = {stat, amount, perLevel}` consumed by `getFeatBonus`; don't special-case individual feats in combat math.
- **Every change must keep export/import backward compatible.** `exportCharacter()` dumps `state` as-is to JSON, and `importParsedCharacter()` reloads it through `hydrate()` — so a file exported by an older build must still import cleanly into a newer one. Never rename or repurpose an existing field in place; add a new field (with a `hydrate()` back-fill) instead, so old exports don't silently lose or corrupt data. If you do need to change a field's shape, keep `hydrate()` able to read the old shape and convert it.
