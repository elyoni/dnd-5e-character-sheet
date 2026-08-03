const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('panel locking', () => {
  test('Saving Throws are locked by default on a new install, and unlocking enables its proficiency checkboxes', async ({ page }) => {
    await dismissOnboarding(page);

    const savesPanel = page.locator('.panel', { has: page.locator('h2', { hasText: 'Saving Throws' }) });
    const checkbox = savesPanel.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeDisabled();

    await page.evaluate(() => togglePanelLock('saves'));

    await expect(checkbox).toBeEnabled();
  });

  test('Skills are locked by default on a new install, and unlocking enables both proficiency and expertise checkboxes', async ({ page }) => {
    await dismissOnboarding(page);

    const skillsPanel = page.locator('.panel', { has: page.locator('h2', { hasText: 'Skills' }) });
    const profCheckbox = skillsPanel.locator('.skill-row').first().locator('input[type="checkbox"]').first();
    await expect(profCheckbox).toBeDisabled();

    await page.evaluate(() => togglePanelLock('skills'));

    await expect(profCheckbox).toBeEnabled();
  });

  test('panel lock state persists across a reload', async ({ page }) => {
    await dismissOnboarding(page);

    // Both start locked by default on a fresh install; unlock saves only
    // and confirm that specific change (not just the default) survives.
    await page.evaluate(() => togglePanelLock('saves'));
    await page.waitForTimeout(100);

    await page.reload();
    await page.waitForTimeout(200);

    const state = await page.evaluate(() => ({ saves: !!panelLocks['saves'], skills: !!panelLocks['skills'] }));
    expect(state.saves).toBe(false);
    expect(state.skills).toBe(true);
  });
});
