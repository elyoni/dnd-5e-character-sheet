// Shared helpers for driving the character sheet in tests.
// Every test starts with a fresh browser context (empty storage), so a
// visit is always the "first-time" onboarding flow unless a test seeds
// storage itself.

async function dismissOnboarding(page, { demo = false } = {}) {
  await page.goto('/dnd_character_sheet.html');
  // Dismissing the welcome modal leaves you on a plain "no characters yet" screen
  // (not another modal) with "Create New Character" / "Load Demo Character" buttons.
  await page.locator('.modal-backdrop button:has-text("OK")').click();
  await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
  if (demo) {
    await page.locator('button:has-text("Load Demo Character")').click();
  } else {
    // "Create New Character" opens the New Character creation form; accept the
    // defaults (blank name -> "New Adventurer") to get back to a plain sheet.
    await page.locator('button:has-text("Create New Character")').click();
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
  }
}

// Clicks the trash-bin icon in the character selector, then confirms in the
// "Remove this?" popup that guards it (same pattern as attacks/spells/feats/etc).
async function deleteActiveCharacter(page) {
  await page.click('.char-select-group button[title="Delete"]');
  await page.locator('.modal-box h3:has-text("Remove this?")').waitFor({ state: 'visible' });
  await page.locator('.modal-backdrop button:has-text("Delete")').click();
}

module.exports = { dismissOnboarding, deleteActiveCharacter };
