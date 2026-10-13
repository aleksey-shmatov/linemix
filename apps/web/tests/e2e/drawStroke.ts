import type { Page } from '@playwright/test';

export async function drawStroke(page: Page, points: [number, number][]) {
  const svg = page.getByTestId('canvas');
  const box = await svg.boundingBox();
  if (!box) throw new Error('SVG bounding box not found');
  const start = points[0];
  await page.mouse.move(box.x + start[0], box.y + start[1]);
  await page.mouse.down();
  for (const [x, y] of points.slice(1)) {
    await page.mouse.move(box.x + x, box.y + y);
  }
  await page.mouse.up();
}
