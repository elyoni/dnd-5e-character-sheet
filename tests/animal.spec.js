const { test, expect } = require('@playwright/test');

async function createAnimalCharacter(page, { name = 'Fenris', species = 'Wolf' } = {}) {
  await page.goto('/dnd_character_sheet.html');
  await page.locator('.modal-backdrop button:has-text("OK")').click();
  await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
  await page.locator('button:has-text("Create New Character")').click();
  await page.selectOption('#modalNewCharType', 'animal');
  await page.fill('#modalNewName', name);
  await page.fill('#modalNewSpecies', species);
  await page.locator('.modal-backdrop button:has-text("Done")').click();
  await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
}

test.describe('animal character type', () => {
  test('selecting "Animal" in the new-character modal hides Class/Race and shows Species', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    await page.locator('.modal-backdrop button:has-text("OK")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
    await page.locator('button:has-text("Create New Character")').click();

    await expect(page.locator('#modalNewClassRow')).toBeVisible();
    await expect(page.locator('#modalNewSpeciesRow')).toBeHidden();

    await page.selectOption('#modalNewCharType', 'animal');

    await expect(page.locator('#modalNewClassRow')).toBeHidden();
    await expect(page.locator('#modalNewRaceRow')).toBeHidden();
    await expect(page.locator('#modalNewSubraceRow')).toBeHidden();
    await expect(page.locator('#modalNewSpeciesRow')).toBeVisible();
  });

  test('creating an Animal character sets charType and a Wisdom-based AC ability', async ({ page }) => {
    await createAnimalCharacter(page);

    const info = await page.evaluate(() => ({
      charType: state.charType,
      acAbility: state.armor.acAbility,
      race: state.race,
      name: state.name,
    }));
    expect(info.charType).toBe('animal');
    expect(info.acAbility).toBe('wis');
    expect(info.race).toBe('Wolf');
    expect(info.name).toBe('Fenris');

    // AC = base (10) + WIS mod, not DEX mod.
    await page.evaluate(() => { set('abilities.wis', 16); set('abilities.dex', 20); });
    const ac = await page.evaluate(() => computeAC(state));
    expect(ac).toBe(13); // 10 + (16-10)/2 = 13, ignoring the much higher DEX
  });

  test('an Animal character\'s HP follows the flat 5 + 5×level formula', async ({ page }) => {
    await createAnimalCharacter(page);

    let hpMax = await page.evaluate(() => computeMaxHP(state));
    expect(hpMax).toBe(10); // level 1: 5 + 5*1

    await page.evaluate(() => set('level', 3));
    hpMax = await page.evaluate(() => computeMaxHP(state));
    expect(hpMax).toBe(20); // level 3: 5 + 5*3

    const hitDice = await page.evaluate(() => computeHitDice(state));
    expect(hitDice).toBe('3d8');
  });

  test('a "natural" attack type resolves to the Wisdom modifier', async ({ page }) => {
    await createAnimalCharacter(page);

    const abil = await page.evaluate(() => abilForAttack(state.attacks[0]));
    expect(abil).toBe('wis');
  });

  test('the New Character modal\'s Source Link carries through to state.sourceLink, for either character type', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    await page.locator('.modal-backdrop button:has-text("OK")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
    await page.locator('button:has-text("Create New Character")').click();
    await page.selectOption('#modalNewCharType', 'animal');
    await page.fill('#modalNewName', 'Guardian');
    await page.fill('#modalNewSpecies', 'Shield Guardian');
    await page.fill('#modalNewSourceLink', 'https://www.dndbeyond.com/monsters/17012-shield-guardian');
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });

    const sourceLink = await page.evaluate(() => state.sourceLink);
    expect(sourceLink).toBe('https://www.dndbeyond.com/monsters/17012-shield-guardian');
  });

  test('a normal PC character is unaffected: AC still uses DEX', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    await page.locator('.modal-backdrop button:has-text("OK")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
    await page.locator('button:has-text("Create New Character")').click();
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });

    const acAbility = await page.evaluate(() => state.armor.acAbility);
    expect(acAbility).toBe('dex');

    await page.evaluate(() => { set('abilities.dex', 16); set('abilities.wis', 20); });
    const ac = await page.evaluate(() => computeAC(state));
    expect(ac).toBe(13); // 10 + (16-10)/2, ignoring the much higher WIS
  });
});
