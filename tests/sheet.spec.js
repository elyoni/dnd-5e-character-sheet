const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('character sheet editing', () => {
  test('edits autosave and survive a reload', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => set('name', 'Aria Nightwind'));
    await expect(page.locator('#saveStatus')).toContainText('saved', { timeout: 2000 });

    await page.reload();
    const name = await page.evaluate(() => state.name);
    expect(name).toBe('Aria Nightwind');
  });

  test('rolling a die records a result in range', async ({ page }) => {
    await dismissOnboarding(page);

    await page.locator('.die-btn:has-text("d20")').click();
    const lastRoll = await page.evaluate(() => diceState.lastRoll);
    expect(lastRoll).toBeGreaterThanOrEqual(1);
    expect(lastRoll).toBeLessThanOrEqual(20);
  });

  test('adding an attack via the modal adds it to state', async ({ page }) => {
    await dismissOnboarding(page);

    await page.click('button:has-text("Attack")');
    await page.fill('#modalAttackName', 'Dagger');
    await page.fill('#modalAttackDmg', '1d4');
    await page.locator('.modal-backdrop button:has-text("Done")').click();

    const attackNames = await page.evaluate(() => state.attacks.map(a => a.name));
    expect(attackNames).toContain('Dagger');
  });

  test('typing HP notes persists to state', async ({ page }) => {
    await dismissOnboarding(page);

    const hpNotesInput = page.locator('textarea[placeholder="Death saves, temp HP source, etc."]');
    await hpNotesInput.fill('Failed 1 death save; 5 temp HP from Shield of Faith.');
    await hpNotesInput.dispatchEvent('change');

    const hpNotes = await page.evaluate(() => state.hpNotes);
    expect(hpNotes).toBe('Failed 1 death save; 5 temp HP from Shield of Faith.');
  });

  test('exporting a character downloads a JSON file', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => set('name', 'Export Test'));
    await page.waitForTimeout(500);

    await page.click('button:has-text("Export")');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download JSON file")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('Export_Test.json');
  });

  test('class/race dropdown options show Hebrew labels while state keeps the English value', async ({ page }) => {
    await dismissOnboarding(page);

    await page.locator('button:has-text("Unlock to edit")').click();
    await page.locator('button:has-text("עב")').click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    const classSelect = page.locator('.id-fields select').nth(0);
    const raceSelect = page.locator('.id-fields select').nth(1);

    // Option labels are translated for display...
    await expect(classSelect.locator('option[value="Fighter"]')).toHaveText('לוחם');
    await expect(raceSelect.locator('option[value="Elf"]')).toHaveText('אלף');

    // ...but selecting them still stores the English value that the rest of
    // the app (CLASS_SAVES, applyTemplate, SUBRACE_MAP, etc) keys off of.
    await classSelect.selectOption('Fighter');
    await raceSelect.selectOption('Elf');

    const identity = await page.evaluate(() => ({ cls: state.cls, race: state.race }));
    expect(identity).toEqual({ cls: 'Fighter', race: 'Elf' });
  });
});
