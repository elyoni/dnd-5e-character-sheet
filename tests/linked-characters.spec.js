const { test, expect } = require('@playwright/test');
const { dismissOnboarding, deleteActiveCharacter } = require('./helpers');

// Creating a character now always goes through the dropdown's single
// "Create new character…" entry, which opens a small chooser (Just Create
// vs AI) before landing in the real creation modal. The creation modal
// itself carries a "Link to (optional)" selector — pre-filled with the
// currently active character when it's eligible to be an owner — so a
// brand-new character can be born already linked (e.g. a Wild Shape form).
async function openJustCreateModal(page) {
  await page.selectOption('.char-select-group select', '__create__');
  await page.locator('.modal-box h3:has-text("Create New Character")').waitFor({ state: 'visible' });
  await page.locator('.modal-actions button:has-text("New Character")').click();
  await page.locator('.modal-box h3:has-text("New Character")').waitFor({ state: 'visible' });
}

test.describe('Linked Characters', () => {
  test('create, switch, and cascade-delete a linked character', async ({ page }) => {
    await dismissOnboarding(page);
    const ownerId = await page.evaluate(() => state.id);

    await openJustCreateModal(page);
    // Defaults to linking under the active (owner) character.
    await expect(page.locator('#modalNewLinkedTo')).toHaveValue(ownerId);
    await page.selectOption('#modalNewCharType', 'animal');
    await page.fill('#modalNewName', 'Bear Form');
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });

    const linked = await page.evaluate(() => ({ name: state.name, linkedTo: state.linkedTo, charType: state.charType }));
    expect(linked).toEqual({ name: 'Bear Form', linkedTo: ownerId, charType: 'animal' });

    // Identity panel (not a standalone panel anymore) shows "Linked to: X" + Transform back.
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

    // Switching to the linked character now goes through the dropdown directly.
    const bearId = await page.evaluate(() => charIndex.find(c => c.name === 'Bear Form').id);
    await page.selectOption('.char-select-group select', bearId);
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

  test('link an existing character to another, then unlink', async ({ page }) => {
    await dismissOnboarding(page);
    const firstId = await page.evaluate(() => state.id);

    // Create a second, fully independent character (explicitly clear the
    // pre-filled "Link to" selector so the two start out unlinked).
    await openJustCreateModal(page);
    await page.selectOption('#modalNewLinkedTo', '');
    await page.fill('#modalNewName', 'Second Adventurer');
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
    const secondId = await page.evaluate(() => state.id);
    expect(await page.evaluate(() => state.linkedTo)).toBeNull();

    // The active (unlinked, childless) character offers "Link to another character…".
    await page.selectOption('.char-select-group select', '__link__');
    await page.locator('.modal-box h3:has-text("Link to Another Character")').waitFor({ state: 'visible' });
    await page.selectOption('#linkCharOwnerSelect', firstId);
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });

    expect(await page.evaluate(() => state.linkedTo)).toBe(firstId);
    const idxAfterLink = await page.evaluate((id) => charIndex.find(c => c.id === id).linkedTo, secondId);
    expect(idxAfterLink).toBe(firstId);

    // Now the active (linked) character offers "Unlink" instead, guarded by a confirm popup.
    await page.selectOption('.char-select-group select', '__unlink__');
    await page.locator('.modal-box h3:has-text("Unlink this character?")').waitFor({ state: 'visible' });
    await page.locator('.modal-backdrop button:has-text("Unlink")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });

    expect(await page.evaluate(() => state.linkedTo)).toBeNull();
    const idxAfterUnlink = await page.evaluate((id) => charIndex.find(c => c.id === id).linkedTo, secondId);
    expect(idxAfterUnlink).toBeNull();
  });

  test('an owner with existing children cannot itself be linked (no chains)', async ({ page }) => {
    await dismissOnboarding(page);

    // Create a linked child under the first character, then switch back to it.
    await openJustCreateModal(page);
    await page.fill('#modalNewName', 'Child');
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });
    await page.locator('button:has-text("Transform back")').click();
    await page.waitForFunction(() => !state.linkedTo);

    // This character now owns a child, and is not itself linked — the
    // dropdown should offer neither "Link" nor "Unlink".
    const options = await page.evaluate(() => [...document.querySelectorAll('.char-select-group select option')].map(o => o.value));
    expect(options).not.toContain('__link__');
    expect(options).not.toContain('__unlink__');
  });

  test('bundle export/import round-trip keeps owner and linked character linked, with fresh ids', async ({ page }) => {
    await dismissOnboarding(page);

    await openJustCreateModal(page);
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
    await openJustCreateModal(page);
    await page.selectOption('#modalNewLinkedTo', '');
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

  test('importing a single Linked Character elsewhere (its owner absent) clears the dangling link', async ({ page, browser }) => {
    await dismissOnboarding(page);
    await openJustCreateModal(page);
    await page.selectOption('#modalNewCharType', 'animal');
    await page.fill('#modalNewName', 'Bear Form');
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    await page.locator('.modal-backdrop').waitFor({ state: 'detached' });

    const bearJSON = await page.evaluate(() => JSON.parse(JSON.stringify(state)));
    expect(bearJSON.linkedTo).toBeTruthy();

    // A fresh browser context = a different browser/device with empty storage
    // and no knowledge of the original owner, unlike the source page above.
    const page2 = await (await browser.newContext()).newPage();
    await page2.goto('/dnd_character_sheet.html');
    await page2.locator('.modal-backdrop button:has-text("OK")').click();
    await page2.locator('.modal-backdrop').waitFor({ state: 'detached' });

    await page2.evaluate((parsed) => importParsedCharacter(parsed), bearJSON);
    // `state` is a top-level `let`, not a `window` property, so check it as
    // a bare identifier (still resolves fine in the page's own scope).
    await page2.waitForFunction(() => typeof state !== 'undefined' && state && state.name === 'Bear Form');

    const result = await page2.evaluate(() => ({
      linkedTo: state.linkedTo,
      charIndexLen: charIndex.length,
    }));
    expect(result.linkedTo).toBeNull();
    expect(result.charIndexLen).toBe(1);
  });
});
