# Character photo: storage/hosting approach — parked, no decision made

**Status:** parked (exploration only — nothing implemented, nothing chosen)

## Context

We want to let a player attach a photo/portrait to their character. Two
worries drove the whole discussion: how much bigger this makes the app's
storage/export footprint, and how the photo survives export/import and the
shareable link (`buildShareURL`, `dnd_character_sheet.src.html:3029`).

One fact resolved early: `dnd_character_sheet.html` (the shipped app shell)
would **not** grow — a photo is per-character data, not part of the shell.
What's actually at risk is three things that already exist for every
character today:

- `localStorage` quota, shared across *all* characters saved in one browser
  (`storageSet`, `dnd_character_sheet.src.html:1877`)
- the exported JSON file (`exportCharacter`, line 2917)
- the share-link URL, which base64-encodes the *entire* character state
  into a URL hash (`buildShareURL`, line 3029) — meant to be pasted into
  chat apps, so it has tighter practical limits than a browser address bar

The app's stated design goal (`CLAUDE.md`) is a single self-contained file
with **zero runtime network dependency** — it works fully offline, forever,
with no accounts. Every option below trades against that guarantee to some
degree.

## Considered Options

### A. Embed as a base64 data URI in character state

The photo lives directly in `state.photo`, flows through existing
export/import/share machinery for free (they already dump/restore `state`
wholesale), and needs a client-side resize/compress step (e.g. downscale +
JPEG-compress on `<canvas>` before storing) to keep the string small.

- **Pros:** fully offline forever, matches the app's existing zero-backend
  philosophy exactly, export stays a true durable archive (nothing external
  can ever go missing).
- **Cons:** the thing we were worried about — inflates `localStorage`
  usage, export file size, and especially the share-link URL — unless size
  is aggressively controlled at capture time.

### B. External image URL (user pastes a link they host elsewhere)

`state.photo` stores a URL string instead of bytes.

- **Pros:** zero storage/export/share-link bloat, no new infrastructure.
- **Cons:** breaks the offline guarantee for this field; export stops being
  a durable archive — if the linked image ever goes dead, re-importing an
  old export no longer reproduces the photo, unlike every other field in
  this app.

### C. Curated preset gallery (stock portraits by race/class), hosted in-repo or via public URL, browser-cached

User picks from a small fixed set of stock images instead of uploading
their own; `state.photo` stores a preset id/URL. Loaded live when online,
hidden on failure/offline.

- **Pros:** fully solves the size problem (nothing touches state size
  meaningfully), no upload UI/infra needed, you control the hosting.
- **Cons:** not a photo of *this specific character* — no user-uploaded
  artwork/real portrait; still breaks the offline guarantee on first load
  per device; export durability still isn't guaranteed (a renamed/removed
  repo asset breaks old exports the same way a dead link does in Option B).

### D. Login-gated cloud upload (e.g. Firebase or Supabase, Google sign-in), only for users who opt in

Anonymous/offline users see the app completely unchanged — no photo option
at all. A logged-in user uploads an image to cloud storage; `state.photo`
ends up holding just a URL pointing at that upload (same shape as Option B,
but the URL is produced by an upload flow instead of the user hunting down
their own host).

- **Pros:** the only option offering a genuinely custom per-character photo
  without inflating local storage/export/share-link size; leaves the
  no-login, fully-offline experience completely untouched for everyone who
  doesn't opt in.
- **Cons:** this would be the app's first real backend dependency ever —
  accounts, auth, storage security rules, ongoing free-tier limits shared
  across all users (not per-user), genuinely new maintenance surface. Does
  **not** solve the offline/export-durability trade-off — same caveat as
  Option B, since what's stored is still a reference, not the bytes
  themselves.

## Where we stopped

No option was chosen. The user's read at the end of this discussion: Option
D (or any backend-dependent option) feels like more than this app needs at
its current stage — the infra/maintenance jump from "zero backend, ever" to
"real accounts + cloud storage" is a bigger step than the original "add a
photo" ask warranted. The feature is parked, not rejected — revisit this
file (and update its Status) if/when the photo feature comes back up.
