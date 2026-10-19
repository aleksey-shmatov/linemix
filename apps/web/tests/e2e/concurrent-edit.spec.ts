import { test, expect } from '@playwright/test';
import { drawStroke, selectStrokeAt, setStrokeColor, setStrokeWidth } from './drawStroke';

test('concurrent edit by two users', async ({ browser }) => {
  const aliceCtx = await browser.newContext();
  const bobCtx = await browser.newContext();

  const alice = await aliceCtx.newPage();
  const bob = await bobCtx.newPage();

  await alice.goto('/');
  const name = `__test__ e2e ${Date.now()}`;
  await alice.getByLabel('name').fill(name);
  await alice.getByRole('button', { name: /create/i }).click();
  const link = alice.getByRole('link', { name: new RegExp(name) });
  const href = await link.getAttribute('href');
  await link.click();
  await alice.waitForURL(href!);

  const gameUrl = alice.url();
  await bob.goto(gameUrl);
  await expect(bob.getByTestId('connection')).toHaveAttribute('data-state', 'joined');

  await drawStroke(alice, [
    [100, 100],
    [200, 180],
  ]);
  await expect(bob.locator('path[data-stroke-id]')).toHaveCount(1);

  await selectStrokeAt(alice, [150, 140]);
  await setStrokeColor(alice, '#ef4444');
  await expect(bob.locator('path[data-stroke-id]')).toHaveAttribute('stroke', '#ef4444');
  await selectStrokeAt(bob, [150, 140]);

  await bobCtx.setOffline(true);

  await setStrokeColor(alice, '#f59e0b');
  await setStrokeWidth(bob, 8);

  await expect(alice.getByTestId('save-state')).toHaveAttribute('data-state', 'saved');

  await bobCtx.setOffline(false);

  await expect(bob.getByTestId('save-state')).toHaveAttribute('data-state', 'saved');

  await alice.reload();
  await bob.reload();

  for (const page of [alice, bob]) {
    const path = page.locator(`path[data-stroke-id]`);
    await expect(path).toHaveAttribute('stroke', '#f59e0b');
    await expect(path).toHaveAttribute('stroke-width', '8');
  }

  await alice.close();
  await bob.close();
});
