const { test, expect } = require('@playwright/test');
const { dismissOnboarding, deleteActiveCharacter } = require('./helpers');

test.describe('multi-character persistence', () => {
  test('remembers the last-used character across reloads', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => set('name', 'Character A'));
    await page.waitForTimeout(500); // let the 400ms autosave debounce flush
    const idA = await page.evaluate(() => state.id);

    await page.locator('select').first().selectOption('__create__');
    await page.locator('.modal-actions button:has-text("New Character")').click();
    // Not testing linking here — keep the two characters independent.
    await page.selectOption('#modalNewLinkedTo', '');
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

    await page.locator('select').first().selectOption('__create__');
    await page.locator('.modal-actions button:has-text("New Character")').click();
    await page.selectOption('#modalNewLinkedTo', '');
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => charIndex.length)).toBe(2);

    await deleteActiveCharacter(page);
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

  test('deleting a character always asks for confirmation first', async ({ page }) => {
    await dismissOnboarding(page);

    await page.click('.char-select-group button[title="Delete"]');
    await expect(page.locator('.modal-box h3')).toHaveText('Remove this?');
    // still there — confirming was never clicked
    expect(await page.evaluate(() => charIndex.length)).toBe(1);

    await page.locator('.modal-backdrop button:has-text("Cancel")').click();
    await expect(page.locator('.modal-backdrop')).toHaveCount(0);
    expect(await page.evaluate(() => charIndex.length)).toBe(1);
  });

  test('deleting the only remaining character returns to the "no characters" screen without creating a replacement', async ({ page }) => {
    await dismissOnboarding(page);
    expect(await page.evaluate(() => charIndex.length)).toBe(1);

    await deleteActiveCharacter(page);

    await expect.poll(() => page.evaluate(() => charIndex.length)).toBe(0);
    expect(await page.evaluate(() => state)).toBeNull();
    await expect(page.locator('h2:has-text("No characters yet")')).toBeVisible();
    await expect(page.locator('.modal-backdrop')).toHaveCount(0);
  });
});
