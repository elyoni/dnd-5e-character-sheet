const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('multi-character persistence', () => {
  test('remembers the last-used character across reloads', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => set('name', 'Character A'));
    await page.waitForTimeout(500); // let the 400ms autosave debounce flush
    const idA = await page.evaluate(() => state.id);

    await page.locator('select').first().selectOption('__new__');
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.evaluate(() => set('name', 'Character B'));
    await page.waitForTimeout(500);
    const idB = await page.evaluate(() => state.id);

    await page.reload();
    await expect.poll(() => page.evaluate(() => state.id)).toBe(idB);

    await page.locator('select').first().selectOption({ label: 'Character A' });
    await page.waitForTimeout(300);

    await page.reload();
    await expect.poll(() => page.evaluate(() => state.id)).toBe(idA);
  });

  test('deleting the active character falls back to a remaining one', async ({ page }) => {
    await dismissOnboarding(page);

    await page.locator('select').first().selectOption('__new__');
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => charIndex.length)).toBe(2);

    await page.click('.char-select-group button[title="Delete"]');
    await page.waitForTimeout(300);

    expect(await page.evaluate(() => charIndex.length)).toBe(1);
    const remainingId = await page.evaluate(() => charIndex[0].id);
    const activeId = await page.evaluate(() => state.id);
    expect(activeId).toBe(remainingId);
  });

  test('the delete button is never disabled, even with a single character left', async ({ page }) => {
    await dismissOnboarding(page);
    expect(await page.evaluate(() => charIndex.length)).toBe(1);
    await expect(page.locator('.char-select-group button[title="Delete"]')).toBeEnabled();
  });

  test('deleting the only remaining character sends you to the creation form instead of leaving you stuck', async ({ page }) => {
    await dismissOnboarding(page);
    expect(await page.evaluate(() => charIndex.length)).toBe(1);

    await page.click('.char-select-group button[title="Delete"]');
    await expect.poll(() => page.evaluate(() => charIndex.length)).toBe(0);
    await expect(page.locator('.modal-box h3')).toHaveText('New Character');

    await page.locator('.modal-backdrop button:has-text("Done")').click();
    expect(await page.evaluate(() => charIndex.length)).toBe(1);
    const name = await page.evaluate(() => state.name);
    expect(name).toBe('New Adventurer');
  });
});
