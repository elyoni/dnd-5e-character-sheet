const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

// Regression coverage for a bug where flow-style YAML arrays
// (`armorList: ["light", "medium"]`) — which is exactly what our own
// Create-with-AI prompt schema example shows, and what a compliant AI reply
// uses — silently failed to parse as arrays, so proficiencies.armorList/
// weaponList/languageList were dropped on import. Block-style arrays
// (`armorList:\n  - "light"`) worked fine; only the flow-style form was
// broken. See dnd_character_sheet.src.html's parseYamlScalar/splitFlowItems.

test.describe('parseYAML — flow-style array support', () => {
  test('parses a simple flow array of double-quoted strings', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    const result = await page.evaluate(() => parseYAML('armorList: ["light", "medium", "heavy", "shields"]'));
    expect(result).toEqual({ armorList: ['light', 'medium', 'heavy', 'shields'] });
  });

  test('parses multiple flow arrays under a nested map, matching the app\'s own AI prompt schema', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    const yaml = [
      'proficiencies:',
      '  armorList: ["light", "medium", "shields"]',
      '  weaponList: ["simple", "martial"]',
      '  languageList: ["common", "orc"]',
      '  tools: "Smith\'s tools"',
    ].join('\n');
    const result = await page.evaluate((y) => parseYAML(y), yaml);
    expect(result).toEqual({
      proficiencies: {
        armorList: ['light', 'medium', 'shields'],
        weaponList: ['simple', 'martial'],
        languageList: ['common', 'orc'],
        tools: "Smith's tools",
      },
    });
  });

  test('parses an empty flow array', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    const result = await page.evaluate(() => parseYAML('languageList: []'));
    expect(result).toEqual({ languageList: [] });
  });

  test('parses flow arrays of bare (unquoted) scalars, including numbers and booleans', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    const result = await page.evaluate(() => parseYAML('levels: [1, 2, 3]\nflags: [true, false]\nmixed: [str, "dex", 5]'));
    expect(result).toEqual({ levels: [1, 2, 3], flags: [true, false], mixed: ['str', 'dex', 5] });
  });

  test('a comma inside a quoted flow-array item does not split that item', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    const result = await page.evaluate(() => parseYAML('notes: ["a, b", "c"]'));
    expect(result).toEqual({ notes: ['a, b', 'c'] });
  });

  test('block-style arrays still parse correctly (no regression)', async ({ page }) => {
    await page.goto('/dnd_character_sheet.html');
    const yaml = 'armorList:\n  - "light"\n  - "medium"';
    const result = await page.evaluate((y) => parseYAML(y), yaml);
    expect(result).toEqual({ armorList: ['light', 'medium'] });
  });

  test("the app's own Create-with-AI prompt schema example round-trips through parseYAML with real arrays", async ({ page }) => {
    await dismissOnboarding(page);
    const parsed = await page.evaluate(() => {
      const exportText = buildCreateAIExport();
      const block = extractCreateAIBlock(exportText);
      return parseYAML(block);
    });
    expect(Array.isArray(parsed.savingThrows)).toBe(true);
    expect(Array.isArray(parsed.skillProficiencies)).toBe(true);
    expect(Array.isArray(parsed.proficiencies.armorList)).toBe(true);
    expect(Array.isArray(parsed.proficiencies.weaponList)).toBe(true);
    expect(Array.isArray(parsed.proficiencies.languageList)).toBe(true);
    expect(parsed.proficiencies.armorList.length).toBeGreaterThan(0);
    expect(parsed.proficiencies.weaponList.length).toBeGreaterThan(0);
    expect(parsed.proficiencies.languageList.length).toBeGreaterThan(0);
  });
});

test.describe('Create with AI — end-to-end import of flow-style proficiency arrays', () => {
  test('a pasted reply using flow-style armorList/weaponList/languageList actually lands on the created character', async ({ page }) => {
    await dismissOnboarding(page);

    // The Create-with-AI modal is normally reached via the character
    // selector's "+ Create with AI…" option; open it directly since the
    // dropdown interaction isn't what this test is about.
    await page.evaluate(() => openCreateAIModal());
    await expect(page.locator('.modal-box')).toBeVisible();

    const schemaVersion = await page.evaluate(() => AI_SCHEMA_VERSION);
    const yamlBlock = [
      '```dnd-sheet-newcharacter',
      `schemaVersion: ${schemaVersion}`,
      'charType: "pc"',
      'name: "Human Fighter"',
      'class: "Fighter"',
      'subclass: ""',
      'race: "Human"',
      'subrace: "Variant Human"',
      'background: "Soldier"',
      'level: 1',
      'size: "Medium"',
      'sourceLink: ""',
      'abilities:',
      '  str: 16',
      '  dex: 10',
      '  con: 14',
      '  int: 8',
      '  wis: 12',
      '  cha: 10',
      'savingThrows: ["str", "con"]',
      'skillProficiencies: ["acrobatics", "athletics"]',
      'proficiencies:',
      '  armorList: ["light", "medium", "heavy", "shields"]',
      '  weaponList: ["simple", "martial"]',
      '  languageList: ["common", "dwarvish"]',
      '  tools: "dice set"',
      '  armorOther: ""',
      '  weaponOther: ""',
      '  languageOther: ""',
      '```',
    ].join('\n');

    await page.fill('#createAIPasteInput', yamlBlock);
    await page.click('button:has-text("Parse reply")');
    await expect(page.locator('.modal-box')).toContainText('Human Fighter');

    await page.click('button:has-text("✓ Create character")');
    // Confirming lands on an "extras" step (add feats/attacks/etc.) within
    // the same modal, rather than closing it — the character (and its
    // proficiencies) is already saved to `state` at this point.
    await expect(page.locator('.modal-box')).toContainText('Starting suggestions');
    await expect.poll(() => page.evaluate(() => state && state.name)).toBe('Human Fighter');

    const proficiencies = await page.evaluate(() => state.proficiencies);
    expect(proficiencies.armorList.sort()).toEqual(['heavy', 'light', 'medium', 'shields']);
    expect(proficiencies.weaponList.sort()).toEqual(['martial', 'simple']);
    expect(proficiencies.languageList.sort()).toEqual(['common', 'dwarvish']);
    expect(proficiencies.tools).toBe('dice set');

    const saveProf = await page.evaluate(() => state.saveProf);
    expect(saveProf.str).toBe(true);
    expect(saveProf.con).toBe(true);
  });
});
