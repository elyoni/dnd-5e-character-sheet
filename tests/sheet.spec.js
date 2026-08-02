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
    // The 3D physics die resolves asynchronously once it actually settles.
    await page.waitForFunction(() => diceState.lastRoll !== null, null, { timeout: 10000 });
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

  test('the panel fold-toggle sits on the opposite side of the header from the title, in both LTR and RTL', async ({ page }) => {
    await dismissOnboarding(page);

    const header = page.locator("h2.ref-toggle[onclick*=\"togglePanelFold('identity')\"]");
    const toggle = header.locator('span');

    // LTR (English, default): title starts on the left, so the toggle floats right.
    let headerBox = await header.boundingBox();
    let toggleBox = await toggle.boundingBox();
    expect(toggleBox.x + toggleBox.width).toBeCloseTo(headerBox.x + headerBox.width, 0);

    // RTL (Hebrew): title starts on the right, so the toggle should float left instead.
    await page.evaluate(() => switchLang('he'));
    await page.waitForTimeout(300);
    headerBox = await header.boundingBox();
    toggleBox = await toggle.boundingBox();
    expect(toggleBox.x).toBeCloseTo(headerBox.x, 0);
  });
});
