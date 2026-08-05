import { expect, test } from '@playwright/test';
import { expectVisibleKeyboardFocus } from './helpers';

test('navigates to the Knowledge Hub with Spanish controls', async ({ page }) => {
  await page.goto('/');
  const knowledgeLink = page.getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: 'Conocimiento', exact: true });

  for (let tabCount = 0; tabCount < 10; tabCount += 1) {
    await page.keyboard.press('Tab');
    if (await knowledgeLink.evaluate((element) => element === document.activeElement)) break;
  }

  await expectVisibleKeyboardFocus(knowledgeLink);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/knowledge-hub\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

const destinations = [
  ['Inicio', '/'],
  ['Conocimiento', '/knowledge-hub/'],
  ['Guías', '/playbooks/'],
  ['Blog', '/blog/'],
  ['Laboratorio', '/laboratorio/'],
  ['Proyectos', '/live-projects/'],
  ['Recursos', '/recursos/'],
  ['Ahora', '/now/']
] as const;

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: '375 px', width: 375, height: 812 },
  { name: '320 px', width: 320, height: 700 }
]) {
  test(`keeps every primary destination usable without page overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const [label, pathname] of destinations) {
      await page.goto('/');
      const link = page.getByRole('navigation', { name: 'Navegación principal' })
        .getByRole('link', { name: label, exact: true });
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${pathname.replaceAll('/', '\\/')}$`));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
        .toBe(true);
    }
  });
}
