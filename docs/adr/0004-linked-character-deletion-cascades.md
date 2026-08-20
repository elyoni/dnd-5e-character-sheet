# Deleting a character cascades to its Linked Characters

Every other delete in this app (attacks, spells, feats, resources, items, characters themselves) goes through one generic `confirmRemove` popup — "Remove this? This can't be undone." — with no per-item custom logic or blast-radius messaging. For Linked Characters (see `CONTEXT.md`), we deliberately broke that pattern: deleting a character also deletes every character linked to it, and the confirm popup stays exactly as generic as it is everywhere else — it does not mention how many linked characters will go with it.

**Considered Options**

- **Orphan linked characters** (delete only the target; anything that was linked to it becomes a normal standalone character) — rejected because it leaves stray, unlabeled characters behind that the player has to notice and clean up themselves.
- **Cascade + custom confirm copy** (e.g. "This will also delete 2 linked characters") — rejected in favor of keeping `confirmRemove` fully generic; the extra precision wasn't judged worth a special case in the one shared confirmation component every delete action in the app relies on.
- **Cascade, generic confirm (chosen)** — matches the domain (a beast form has no independent existence once its Druid is gone), at the cost of a delete action whose actual blast radius isn't disclosed by the popup that gates it.
