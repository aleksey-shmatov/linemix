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

export async function selectStrokeAt(page: Page, [x, y]: [number, number]) {
  await page.getByRole('button', { name: 'select', exact: true }).click();
  const canvas = page.getByTestId('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas has no bounding box');
  await page.mouse.click(box.x + x, box.y + y);
}

export async function setStrokeColor(page: Page, color: string) {
  await page.getByRole('button', { name: `Color ${color}`, exact: true }).click();
}

export async function setStrokeWidth(page: Page, width: number) {
  await page.getByRole('button', { name: `Width ${width}`, exact: true }).click();
}
