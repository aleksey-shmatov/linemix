import { test, expect } from '@playwright/test';
import { drawStroke } from './drawStroke';

test('a drawn stroke survives a reload', async ({ page }) => {
  await page.goto('/');
  const name = `__test__ e2e ${Date.now()}`;
  await page.getByLabel('name').fill(name);
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('link', { name: new RegExp(name) }).click();

  // create an open game, land on it
  await drawStroke(page, [
    [100, 100],
    [200, 180],
  ]);

  const strokes = page.getByTestId('canvas').locator('path[data-stroke-id]');
  await expect(strokes).toHaveCount(1);

  await expect(page.getByTestId('save-state')).toHaveAttribute('data-state', 'saved');

  await page.reload();
  await expect(strokes).toHaveCount(1);
});
