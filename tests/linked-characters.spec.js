const { test, expect } = require('@playwright/test');
const { dismissOnboarding, deleteActiveCharacter } = require('./helpers');

// The "Has Linked Character" checkbox lives inside Identity's Configuration
// sub-section (only rendered once Identity is unlocked), and mirrors "Has
// Spells": checking it is what reveals the standalone Linked Characters box
// elsewhere on the sheet.
async function enableLinkedChar(page) {
  await page.click('button:has-text("Unlock to edit")');
  await page.click('label:has-text("Has Linked Character")');
}

test.describe('Linked Characters', () => {
  test('create, switch, and cascade-delete a linked character', async ({ page }) => {
    await dismissOnboarding(page);
    await enableLinkedChar(page);

    // Owner: box visible, empty, with both create buttons.
    await expect(page.locator('h2:has-text("Linked Characters")')).toBeVisible();
    await expect(page.locator('button:has-text("➕ New Linked Character")')).toBeVisible();
    await expect(page.locator('button:has-text("New Linked Character (AI)")')).toBeVisible();

    const ownerId = await page.evaluate(() => state.id);

    // Create a linked character via the plain modal.
    await page.click('button:has-text("➕ New Linked Character")');
    await expect(page.locator('.modal-box')).toContainText('This character will be linked to New Adventurer.');
    await page.selectOption('#modalNewCharType', 'animal');
    await page.fill('#modalNewName', 'Bear Form');
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });

    const linked = await page.evaluate(() => ({ name: state.name, linkedTo: state.linkedTo, hasLinkedChar: state.hasLinkedChar, charType: state.charType }));
    expect(linked).toEqual({ name: 'Bear Form', linkedTo: ownerId, hasLinkedChar: true, charType: 'animal' });

    // Linked character's own box shows the reduced view automatically (hasLinkedChar was auto-enabled on creation, no manual toggle needed).
    await expect(page.locator('text=Linked to: New Adventurer')).toBeVisible();
    const transformBack = page.locator('button:has-text("Transform back")');
    await expect(transformBack).toBeVisible();

    // Switcher groups owner + linked character under one optgroup.
    const optgroup = await page.evaluate(() => {
      const og = document.querySelector('.char-select-group select optgroup');
      return og ? { label: og.label, options: [...og.querySelectorAll('option')].map(o => o.textContent) } : null;
    });
    expect(optgroup).toEqual({ label: 'New Adventurer', options: ['New Adventurer', '↳ Bear Form'] });

    // Transform back switches active character to the owner.
    await transformBack.click();
    await page.waitForFunction((id) => state.id === id, ownerId);

    // The owner's list has a clickable button (not just text) for the linked character.
    const bearBtn = page.locator('button:has-text("Bear Form")');
    await expect(bearBtn).toBeVisible();
    await bearBtn.click();
    await page.waitForFunction(() => state.name === 'Bear Form');

    // Switch back to the owner before testing cascade delete.
    await transformBack.click();
    await page.waitForFunction((id) => state.id === id, ownerId);

    // Deleting the owner cascades to delete the linked character too (ADR 0004).
    await deleteActiveCharacter(page);
    const idxIds = await page.evaluate(() => charIndex.map(c => c.id));
    expect(idxIds).toEqual([]);
    expect(await page.evaluate(() => state)).toBeNull();
  });

  test('bundle export/import round-trip keeps owner and linked character linked, with fresh ids', async ({ page }) => {
    await dismissOnboarding(page);
    await enableLinkedChar(page);

    await page.click('button:has-text("➕ New Linked Character")');
    await page.selectOption('#modalNewCharType', 'animal');
    await page.fill('#modalNewName', 'Bear Form');
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
    await page.click('button:has-text("Transform back")');
    // The click's onclick handler (switchCharacter) is async; wait for it to
    // actually finish before reading state, or the next steps race it.
    await page.waitForFunction(() => state.linkedTo === null);

    const originalIds = await page.evaluate(() => charIndex.map(c => c.id));
    const bundle = await page.evaluate(() => collectBundleStates());
    expect(bundle.map(c => c.name).sort()).toEqual(['Bear Form', 'New Adventurer']);

    await page.evaluate((characters) => importParsedBundle(characters), bundle);
    await page.waitForFunction((ids) => !ids.includes(state.id), originalIds);

    const result = await page.evaluate((ids) => ({
      count: charIndex.length,
      ownerId: state.id,
      ownerName: state.name,
      ownerLinkedTo: state.linkedTo,
      child: charIndex.find(c => c.name === 'Bear Form' && !ids.includes(c.id)),
    }), originalIds);
    expect(result.count).toBe(4); // 2 originals + 2 freshly-imported
    expect(result.ownerName).toBe('New Adventurer');
    expect(result.ownerLinkedTo).toBeNull();
    expect(result.child).toBeTruthy();
    expect(result.child.linkedTo).toBe(result.ownerId);
    // Imported ids must be brand new, never reused from the original pair.
    expect(originalIds).not.toContain(result.child.id);
    expect(originalIds).not.toContain(result.ownerId);
  });

  test('disambiguates characters that share a name in the switcher', async ({ page }) => {
    await dismissOnboarding(page); // creates the first "New Adventurer"
    const firstId = await page.evaluate(() => state.id);

    // A second blank character defaults to the exact same name.
    await page.selectOption('.char-select-group select', '__new__');
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
    const secondId = await page.evaluate(() => state.id);
    expect(secondId).not.toBe(firstId);

    const options = await page.evaluate(() => [...document.querySelectorAll('.char-select-group select option')]
      .map(o => ({ value: o.value, text: o.textContent, selected: o.selected })));
    const named = options.filter(o => o.text.startsWith('New Adventurer'));
    expect(named.map(o => o.text).sort()).toEqual(['New Adventurer (1)', 'New Adventurer (2)']);
    // The currently-active one (the second, just-created character) is the one marked selected.
    const selected = named.find(o => o.selected);
    expect(selected.value).toBe(secondId);
  });
});
