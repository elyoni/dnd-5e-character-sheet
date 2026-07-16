const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('spell damage field visibility', () => {
  test('the damage field shows for an Attack-tagged spell and for an untagged spell', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openSpellModal(1));
    await page.fill('#modalSpellName', 'Attack Spell');
    await page.selectOption('#modalSpellCategory', 'attack');
    await page.locator('.modal-box button.primary').click();

    await page.evaluate(() => openSpellModal(1));
    await page.fill('#modalSpellName', 'Untagged Spell');
    await page.locator('.modal-box button.primary').click();

    const attackItem = page.locator('.spell-item').filter({ has: page.locator('input.spell-name-input[value="Attack Spell"]') });
    const untaggedItem = page.locator('.spell-item').filter({ has: page.locator('input.spell-name-input[value="Untagged Spell"]') });
    await expect(attackItem.locator('.spell-dmg-row')).toBeVisible();
    await expect(untaggedItem.locator('.spell-dmg-row')).toBeVisible();
  });

  test('the damage field is hidden for Buff/Aid and Other spells', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openSpellModal(1));
    await page.fill('#modalSpellName', 'Buff Spell');
    await page.selectOption('#modalSpellCategory', 'buff');
    await page.locator('.modal-box button.primary').click();

    await page.evaluate(() => openSpellModal(1));
    await page.fill('#modalSpellName', 'Other Spell');
    await page.selectOption('#modalSpellCategory', 'other');
    await page.locator('.modal-box button.primary').click();

    const buffItem = page.locator('.spell-item').filter({ has: page.locator('input.spell-name-input[value="Buff Spell"]') });
    const otherItem = page.locator('.spell-item').filter({ has: page.locator('input.spell-name-input[value="Other Spell"]') });
    await expect(buffItem.locator('.spell-dmg-row')).toHaveCount(0);
    await expect(otherItem.locator('.spell-dmg-row')).toHaveCount(0);
  });

  test('switching the New Spell modal Type to Buff/Aid hides the Damage field there too', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openSpellModal(1));
    await expect(page.locator('#modalSpellDmgWrap')).toBeVisible();
    await page.selectOption('#modalSpellCategory', 'buff');
    await expect(page.locator('#modalSpellDmgWrap')).toBeHidden();
    await page.selectOption('#modalSpellCategory', 'attack');
    await expect(page.locator('#modalSpellDmgWrap')).toBeVisible();
  });
});

test.describe('spell row label style and notes field', () => {
  test('the Casting Time field is now labeled "Cast Type"', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => openSpellModal(1));
    await expect(page.locator('.modal-box')).toContainText('Cast Type');
    await expect(page.locator('.modal-box')).not.toContainText('Casting Time');
  });

  test('the spell notes textarea grows with content and auto-detects RTL for Hebrew text', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => {
      state.spells.push({name:'Notes Spell', level:0, prepared:true, verbal:false, somatic:false, material:false, range:'', castTime:'', save:'', dmg:'', notes:'', category:'', folded:false, castTimeCustom:false});
      render();
    });

    const spellItem = page.locator('.spell-item').filter({ has: page.locator('input.spell-name-input[value="Notes Spell"]') });
    const textarea = spellItem.locator('.spell-notes-input');
    await expect(textarea).toHaveAttribute('dir', 'auto');

    const shortHeight = await textarea.evaluate(el => el.getBoundingClientRect().height);

    await page.evaluate(() => {
      const i = state.spells.findIndex(s => s.name === 'Notes Spell');
      state.spells[i].notes = 'A long note. '.repeat(20);
      render();
    });
    const tallHeight = await textarea.evaluate(el => el.getBoundingClientRect().height);
    expect(tallHeight).toBeGreaterThan(shortHeight);
  });
});
