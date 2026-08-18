const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('traits vs feats', () => {
  test('Traits and Feats are separate lists with separate add buttons in one shared panel', async ({ page }) => {
    await dismissOnboarding(page);
    await expect(page.locator('h2:has-text("Feats & Traits")')).toBeVisible();
    await expect(page.locator('h3:has-text("Traits")')).toBeVisible();
    await expect(page.locator('h3:has-text("Feats")')).toBeVisible();

    await page.evaluate(() => openFeatModal('traits'));
    await page.fill('#modalFeatName', 'Darkvision');
    await page.click('.modal-actions button.primary');
    await page.evaluate(() => openFeatModal('feats'));
    await page.fill('#modalFeatName', 'Alert');
    await page.click('.modal-actions button.primary');

    const shape = await page.evaluate(() => ({
      traits: state.traits.map(t => t.name),
      feats: state.feats.map(f => f.name),
    }));
    expect(shape.traits).toEqual(['Darkvision']);
    expect(shape.feats).toEqual(['Alert']);
  });

  test('a numeric mod works identically whether it lives in traits or feats', async ({ page }) => {
    await dismissOnboarding(page);
    const bonus = await page.evaluate(() => {
      state.traits.push({ name: 'Dwarven Toughness', level: 1, notes: '', mod: { stat: 'hp', amount: 1, perLevel: true } });
      return getFeatBonus(state, 'hp');
    });
    expect(bonus).toBe(1); // level 1
  });

  test('applying a race template adds racial traits to state.traits, not state.feats', async ({ page }) => {
    await dismissOnboarding(page);
    const result = await page.evaluate(() => {
      applyRaceTemplate('dwarf');
      return { traitNames: state.traits.map(t => t.name), featNames: state.feats.map(f => f.name) };
    });
    expect(result.traitNames).toContain('Darkvision');
    expect(result.traitNames).toContain('Dwarven Toughness');
    expect(result.featNames).toEqual([]);
  });
});

test.describe('Darkvision', () => {
  test('getEffectiveDarkvision takes the best single source, not the sum', async ({ page }) => {
    await dismissOnboarding(page);
    const range = await page.evaluate(() => {
      state.traits.push({ name: 'Darkvision', level: 1, notes: '', mod: { stat: 'darkvision', amount: 60, perLevel: false } });
      state.feats.push({ name: 'Superior Darkvision Feat', level: 1, notes: '', mod: { stat: 'darkvision', amount: 120, perLevel: false } });
      return getEffectiveDarkvision(state);
    });
    expect(range).toBe(120); // not 180
  });

  test('the Speed section shows a Darkvision row once a trait grants it', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => {
      state.traits.push({ name: 'Darkvision', level: 1, notes: '', mod: { stat: 'darkvision', amount: 60, perLevel: false } });
      render();
    });
    await expect(page.locator('.combat-box:has-text("Speed")')).toContainText('60 ft');
  });
});

test.describe('armor weight class and proficiency', () => {
  test('Medium armor caps the Dex bonus at +2 in computeAC', async ({ page }) => {
    await dismissOnboarding(page);
    const ac = await page.evaluate(() => {
      state.abilities.dex = 20; // +5 mod
      state.inventory.items.push({ name: 'Half Plate', qty: 1, notes: '', type: 'armor', equipped: true, acBase: 15, acAbility: 'dex', weightClass: 'medium', shieldBonus: 2 });
      return computeAC(state);
    });
    expect(ac).toBe(17); // 15 + capped 2, not + 5
  });

  test('Heavy armor gets no Dex bonus even if acAbility is left as dex', async ({ page }) => {
    await dismissOnboarding(page);
    const ac = await page.evaluate(() => {
      state.abilities.dex = 20;
      state.inventory.items.push({ name: 'Plate', qty: 1, notes: '', type: 'armor', equipped: true, acBase: 18, acAbility: 'dex', weightClass: 'heavy', shieldBonus: 2 });
      return computeAC(state);
    });
    expect(ac).toBe(18);
  });

  test('Light armor is uncapped', async ({ page }) => {
    await dismissOnboarding(page);
    const ac = await page.evaluate(() => {
      state.abilities.dex = 20;
      state.inventory.items.push({ name: 'Studded Leather', qty: 1, notes: '', type: 'armor', equipped: true, acBase: 12, acAbility: 'dex', weightClass: 'light', shieldBonus: 2 });
      return computeAC(state);
    });
    expect(ac).toBe(17); // 12 + full +5
  });

  test('getArmorProficiencyWarning fires when equipped armor weight class is not in armorList, and not for shields', async ({ page }) => {
    await dismissOnboarding(page);
    const noArmor = await page.evaluate(() => getArmorProficiencyWarning(state));
    expect(noArmor).toBe(false); // nothing equipped, nothing to warn about

    const mismatched = await page.evaluate(() => {
      state.proficiencies.armorList = ['light'];
      state.inventory.items.push({ name: 'Plate', qty: 1, notes: '', type: 'armor', equipped: true, acBase: 18, acAbility: 'none', weightClass: 'heavy', shieldBonus: 2 });
      return getArmorProficiencyWarning(state);
    });
    expect(mismatched).toBe(true);

    const matched = await page.evaluate(() => {
      state.proficiencies.armorList = ['light', 'heavy'];
      return getArmorProficiencyWarning(state);
    });
    expect(matched).toBe(false);
  });

  test('the AC breakdown labels its base number as (Armor) or (Unarmored), with no space before a +', async ({ page }) => {
    await dismissOnboarding(page);
    const unarmoredNote = await page.evaluate(() => acFormulaNote(state, T[lang]));
    expect(unarmoredNote).toMatch(/^10\(Unarmored\)/);
    expect(unarmoredNote).not.toContain(' +');

    const armoredNote = await page.evaluate(() => {
      state.inventory.items.push({ name: 'Chain Shirt', qty: 1, notes: '', type: 'armor', equipped: true, acBase: 13, acAbility: 'dex', weightClass: 'light', shieldBonus: 2 });
      return acFormulaNote(state, T[lang]);
    });
    expect(armoredNote).toMatch(/^13\(Armor\)/);
    expect(armoredNote).not.toContain(' +');
  });

  test('the armor proficiency warning banner appears in the Combat panel when equipped armor is unproficient', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => {
      state.proficiencies.armorList = [];
      state.inventory.items.push({ name: 'Plate', qty: 1, notes: '', type: 'armor', equipped: true, acBase: 18, acAbility: 'none', weightClass: 'heavy', shieldBonus: 2 });
      render();
    });
    await expect(page.locator('.ac-box .save-warning')).toBeVisible();
  });
});
