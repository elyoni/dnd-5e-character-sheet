// Shared helpers for driving the character sheet in tests.
// Every test starts with a fresh browser context (empty storage), so a
// visit is always the "first-time" onboarding flow unless a test seeds
// storage itself.

async function dismissOnboarding(page, { demo = false } = {}) {
  await page.goto('/dnd_character_sheet.html');
  await page.locator('.modal-backdrop button:has-text("OK")').click();
  if (demo) {
    await page.locator('.modal-backdrop button:has-text("Load Demo Character")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
  } else {
    // "Create New Character" opens the New Character creation form; accept the
    // defaults (blank name -> "New Adventurer") to get back to a plain sheet.
    await page.locator('.modal-backdrop button:has-text("Create New Character")').click();
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
  }
}

module.exports = { dismissOnboarding };
