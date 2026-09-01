const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('share link compression', () => {
  test('a generated share link decodes back to the same character', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => set('name', 'Compressed Hero'));
    await page.waitForTimeout(500);

    const link = await page.evaluate(() => buildShareURL());
    expect(link).toContain('#char=');

    const decodedName = await page.evaluate(async (url) => {
      const m = /#char=([^&]+)/.exec(url);
      const decoded = await decodeBase64ToState(decodeURIComponent(m[1]));
      return decoded.state.name;
    }, link);
    expect(decodedName).toBe('Compressed Hero');
  });

  test('an old-format (uncompressed) link still decodes correctly', async ({ page }) => {
    await dismissOnboarding(page);

    const legacyPayload = await page.evaluate(() => {
      const obj = { lang: 'en', state: Object.assign(demoChar(1), { name: 'Legacy Link Hero' }) };
      return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
    });

    const decodedName = await page.evaluate(async (b64) => {
      const decoded = await decodeBase64ToState(b64);
      return decoded.state.name;
    }, legacyPayload);
    expect(decodedName).toBe('Legacy Link Hero');
  });
});

test.describe('import modal', () => {
  test('Import opens a modal with a file-upload option and a paste-a-link option', async ({ page }) => {
    await dismissOnboarding(page);

    await page.click('button:has-text("Import")');
    await expect(page.locator('.modal-box h3:has-text("Import Character")')).toBeVisible();
    await expect(page.locator('button:has-text("Upload JSON file")')).toBeVisible();
    await expect(page.locator('#importLinkInput')).toBeVisible();
  });

  test('pasting a share link into the box imports that character', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => set('name', 'Sender Character'));
    await page.waitForTimeout(500);
    const link = await page.evaluate(() => buildShareURL());

    await page.click('button:has-text("Import")');
    await page.fill('#importLinkInput', link);
    await page.getByRole('button', { name: 'Load', exact: true }).click();

    await expect(page.locator('.modal-backdrop')).toHaveCount(0);
    const name = await page.evaluate(() => state.name);
    expect(name).toBe('Sender Character');
  });

  test('pasting garbage text shows an inline error instead of crashing', async ({ page }) => {
    await dismissOnboarding(page);

    await page.click('button:has-text("Import")');
    await page.fill('#importLinkInput', 'not a real link');
    await page.getByRole('button', { name: 'Load', exact: true }).click();

    await expect(page.locator('.modal-box')).toContainText("doesn't look like a character share link");
  });

  test('the zero-character screen also offers Import', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    await page.locator('.modal-backdrop button:has-text("OK")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });

    await page.click('button:has-text("Import")');
    await expect(page.locator('.modal-box h3:has-text("Import Character")')).toBeVisible();
  });
});
