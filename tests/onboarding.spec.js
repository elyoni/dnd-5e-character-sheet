const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('first-time onboarding', () => {
  test('shows the welcome modal on a fresh visit', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    await expect(page.locator('.modal-box h3')).toHaveText('Welcome to Character Scroll');
  });

  test('dismissing the welcome modal leaves a "no characters yet" screen, not an auto-created character', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    await page.locator('.modal-backdrop button:has-text("OK")').click();
    await expect(page.locator('.modal-backdrop')).toHaveCount(0);
    await expect(page.locator('h2:has-text("No characters yet")')).toBeVisible();
    expect(await page.evaluate(() => charIndex.length)).toBe(0);
    expect(await page.evaluate(() => state)).toBeNull();
  });

  test('switching language flips layout to RTL and persists across reload', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    await page.locator('.modal-backdrop button:has-text("עב")').click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await page.locator('.modal-backdrop button:has-text("אישור")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
    await page.locator('button:has-text("טען דמות הדגמה")').click();

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('.modal-backdrop')).toHaveCount(0);
  });

  test('"Create New Character" opens the new-character creation form', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    await page.locator('.modal-backdrop button:has-text("OK")').click();
    await page.locator('button:has-text("Create New Character")').click();
    await expect(page.locator('.modal-box h3')).toHaveText('New Character');
  });

  test('completing the new-character form creates exactly one character with the entered details', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    await page.locator('.modal-backdrop button:has-text("OK")').click();
    await page.locator('button:has-text("Create New Character")').click();
    await page.fill('#modalNewName', 'Borin Stonefist');
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await expect(page.locator('.modal-backdrop')).toHaveCount(0);
    const name = await page.evaluate(() => state.name);
    expect(name).toBe('Borin Stonefist');
    expect(await page.evaluate(() => charIndex.length)).toBe(1);
  });

  test('cancelling the new-character form creates nothing and returns to the "no characters" screen', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    await page.locator('.modal-backdrop button:has-text("OK")').click();
    await page.locator('button:has-text("Create New Character")').click();
    await page.locator('.modal-backdrop button:has-text("Cancel")').click();
    await expect(page.locator('.modal-backdrop')).toHaveCount(0);
    await expect(page.locator('h2:has-text("No characters yet")')).toBeVisible();
    expect(await page.evaluate(() => charIndex.length)).toBe(0);
    expect(await page.evaluate(() => state)).toBeNull();
  });

  test('"Load Demo Character" fills in the pre-made sample character', async ({ page }) => {
    await dismissOnboarding(page, { demo: true });
    const demo = await page.evaluate(() => ({ name: state.name, cls: state.cls, level: state.level }));
    expect(demo).toEqual({ name: 'Elric Steeledge', cls: 'Fighter', level: 3 });
  });

  test('does not reappear once dismissed', async ({ page }) => {
    await dismissOnboarding(page);
    await page.reload();
    await expect(page.locator('.modal-backdrop')).toHaveCount(0);
  });

  test('never shows for installs with characters saved before onboarding existed', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    await page.evaluate(() => {
      localStorage.clear();
      const id = 'c_legacy_1';
      localStorage.setItem('dnd-sheet:dnd-char-index', JSON.stringify([{ id, name: 'Legacy Hero' }]));
      localStorage.setItem('dnd-sheet:dnd-char:' + id, JSON.stringify({
        id, name: 'Legacy Hero', cls: 'Wizard', race: 'Elf', bg: 'Sage', level: 5,
        abilities: { str: 8, dex: 14, con: 12, int: 18, wis: 10, cha: 10 },
        saveProf: { str: false, dex: false, con: false, int: true, wis: true, cha: false },
        skillProf: {},
        armor: { base: 10, dexApplies: true, shieldEquipped: false, shieldBonus: 2, shieldName: 'Shield' },
        speed: 30, hpCur: 20, hpMax: 20, hitDice: '5d6', hpAutoCalc: true,
      }));
    });

    await page.reload();
    await expect(page.locator('.modal-backdrop')).toHaveCount(0);
    const name = await page.evaluate(() => state.name);
    expect(name).toBe('Legacy Hero');
  });
});
