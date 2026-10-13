import { test, expect } from '@playwright/test';
import { drawStroke } from './drawStroke';

test('a drawn stroke survives a reload', async ({ page }) => {
  await page.goto('/');
  const name = `__test__ e2e ${Date.now()}`;
  await page.getByLabel('name').fill(name);
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('link', { name: new RegExp(name) }).click();

  const persisted = page.waitForResponse(
    (r) => r.url().includes('/rest/v1/doc_updates') && r.request().method() === 'POST' && r.ok(),
  );

  // create an open game, land on it
  await drawStroke(page, [
    [100, 100],
    [200, 180],
  ]);

  const strokes = page.getByTestId('canvas').locator('path[data-stroke-id]');
  await expect(strokes).toHaveCount(1);

  await persisted;
  await page.reload();
  await expect(strokes).toHaveCount(1);
});
