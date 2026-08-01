const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('panel locking', () => {
  test('locking the Saving Throws panel disables its proficiency checkboxes', async ({ page }) => {
    await dismissOnboarding(page);

    const savesPanel = page.locator('.panel', { has: page.locator('h2', { hasText: 'Saving Throws' }) });
    const checkbox = savesPanel.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeEnabled();

    await page.evaluate(() => togglePanelLock('saves'));

    await expect(checkbox).toBeDisabled();
  });

  test('locking the Skills panel disables both proficiency and expertise checkboxes', async ({ page }) => {
    await dismissOnboarding(page);

    const skillsPanel = page.locator('.panel', { has: page.locator('h2', { hasText: 'Skills' }) });
    const profCheckbox = skillsPanel.locator('.skill-row').first().locator('input[type="checkbox"]').first();
    await expect(profCheckbox).toBeEnabled();

    await page.evaluate(() => togglePanelLock('skills'));

    await expect(profCheckbox).toBeDisabled();
  });

  test('panel lock state persists across a reload', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => togglePanelLock('saves'));
    await page.waitForTimeout(100);

    await page.reload();
    await page.waitForTimeout(200);

    const state = await page.evaluate(() => ({ saves: !!panelLocks['saves'], skills: !!panelLocks['skills'] }));
    expect(state.saves).toBe(true);
    expect(state.skills).toBe(false);
  });
});
