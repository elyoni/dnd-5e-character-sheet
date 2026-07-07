// Shared helpers for driving the character sheet in tests.
// Every test starts with a fresh browser context (empty storage), so a
// visit is always the "first-time" onboarding flow unless a test seeds
// storage itself.

async function dismissOnboarding(page, { demo = false } = {}) {
  await page.goto('/dnd_character_sheet.html');
  await page.locator('.modal-backdrop button:has-text("OK")').click();
  const label = demo ? 'Load Demo Character' : 'Create New Character';
  await page.locator(`.modal-backdrop button:has-text("${label}")`).click();
  await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
}

module.exports = { dismissOnboarding };
