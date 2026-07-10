const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('feat-driven secondary speeds', () => {
  test('a matchSpeed feat combines additively with a separate fly-speed feat', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => set('speed', 30));

    // One feat grants fly speed equal to walking speed (e.g. a Fairy's Flight trait).
    // A second, unrelated feat grants a flat +10 to fly speed on top of that.
    const flySpeed = await page.evaluate(() => {
      state.feats.push({ name: 'Flight', level: 1, notes: '', mod: { stat: 'fly', amount: 0, perLevel: false, matchSpeed: true } });
      state.feats.push({ name: 'Wing Boost', level: 1, notes: '', mod: { stat: 'fly', amount: 10, perLevel: false, matchSpeed: false } });
      return getEffectiveSecondarySpeed(state, 'fly');
    });
    expect(flySpeed).toBe(40); // 30 (walking speed) + 10 (flat bonus)
  });

  test('a stale amount left on a matchSpeed feat is not double-counted', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => set('speed', 30));

    // Reproduces a real save produced by the Add Feat modal: the amount input is
    // only disabled (not cleared) once "Equal to Speed" is checked, so a feat that
    // started life as a flat +40 bonus and was later switched to matchSpeed can end
    // up saved with matchSpeed:true AND a leftover non-zero amount.
    const flySpeed = await page.evaluate(() => {
      state.feats.push({ name: 'Fairy Magic', level: 1, notes: '', mod: { stat: 'fly', amount: 10, perLevel: false, matchSpeed: false } });
      state.feats.push({ name: 'Flight', level: 1, notes: '', mod: { stat: 'fly', amount: 30, perLevel: false, matchSpeed: true } });
      return getEffectiveSecondarySpeed(state, 'fly');
    });
    expect(flySpeed).toBe(40); // 30 (walking speed, matchSpeed override) + 10 (Fairy Magic's flat bonus) — the matchSpeed feat's own stale amount must be ignored
  });

  test('checking "Equal to Speed" in the feat modal clears the amount so it cannot go stale', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openFeatModal());
    await page.fill('#modalFeatName', 'Flight');
    await page.selectOption('#modalFeatAffects', 'fly');
    await page.fill('#modalFeatAmount', '40');
    await page.check('#modalFeatMatchSpeed');
    await page.locator('.modal-box button.primary').click();

    const mod = await page.evaluate(() => state.feats.find(f => f.name === 'Flight').mod);
    expect(mod.matchSpeed).toBe(true);
    expect(mod.amount).toBe(0);
  });
});

test.describe('fixed-value speed feats', () => {
  test('a "Set base value" feat sets an absolute climb speed, ignoring the manual base', async ({ page }) => {
    await dismissOnboarding(page);

    const climbSpeed = await page.evaluate(() => {
      set('climbSpeed', 999); // should be ignored once a fixed feat is present
      state.feats.push({ name: 'Spider Climb', level: 1, notes: '', mod: { stat: 'climb', amount: 20, perLevel: false, matchSpeed: false, fixed: true } });
      return getEffectiveSecondarySpeed(state, 'climb');
    });
    expect(climbSpeed).toBe(20);
  });

  test('a fixed-value feat still stacks with a separate additive bonus feat', async ({ page }) => {
    await dismissOnboarding(page);

    const flySpeed = await page.evaluate(() => {
      state.feats.push({ name: 'Innate Flight', level: 1, notes: '', mod: { stat: 'fly', amount: 20, perLevel: false, matchSpeed: false, fixed: true } });
      state.feats.push({ name: 'Wing Boost', level: 1, notes: '', mod: { stat: 'fly', amount: 10, perLevel: false, matchSpeed: false } });
      return getEffectiveSecondarySpeed(state, 'fly');
    });
    expect(flySpeed).toBe(30); // 20 (fixed base) + 10 (flat bonus)
  });

  test('a perLevel fixed-value feat scales its base with character level', async ({ page }) => {
    await dismissOnboarding(page);

    const swimSpeed = await page.evaluate(() => {
      set('level', 4);
      state.feats.push({ name: 'Growing Fins', level: 1, notes: '', mod: { stat: 'swim', amount: 5, perLevel: true, matchSpeed: false, fixed: true } });
      return getEffectiveSecondarySpeed(state, 'swim');
    });
    expect(swimSpeed).toBe(20); // 5 * level 4
  });

  test('checking "Set base value" in the feat modal unchecks "Equal to Speed" and keeps the amount editable', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openFeatModal());
    await page.fill('#modalFeatName', 'Spider Climb');
    await page.selectOption('#modalFeatAffects', 'climb');
    await page.check('#modalFeatMatchSpeed');
    await page.check('#modalFeatFixed');
    await expect(page.locator('#modalFeatMatchSpeed')).not.toBeChecked();
    await expect(page.locator('#modalFeatAmount')).toBeEnabled();
    await page.fill('#modalFeatAmount', '25');
    await page.locator('.modal-box button.primary').click();

    const mod = await page.evaluate(() => state.feats.find(f => f.name === 'Spider Climb').mod);
    expect(mod.fixed).toBe(true);
    expect(mod.matchSpeed).toBe(false);
    expect(mod.amount).toBe(25);
  });
});
