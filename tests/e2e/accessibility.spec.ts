import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectVisibleKeyboardFocus } from './helpers';

const auditedPages = [
  { name: 'Inicio', path: '/' },
  { name: 'Conocimiento', path: '/knowledge-hub/' },
  { name: 'Proyectos', path: '/live-projects/' }
] as const;

async function tabTo(page: Page, target: Locator) {
  for (let tabCount = 0; tabCount < 20; tabCount += 1) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
}

test.describe('mobile accessibility baseline', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const auditedPage of auditedPages) {
    test(`${auditedPage.name} has one visible H1 in a non-empty main landmark`, async ({ page }) => {
      await page.goto(auditedPage.path);

      const main = page.getByRole('main');
      await expect(main).toContainText(/\S/);
      await expect(main.locator('h1')).toHaveCount(1);
      await expect(main.locator('h1')).toBeVisible();
    });

    test(`${auditedPage.name} does not scroll horizontally at 375px`, async ({ page }) => {
      await page.goto(auditedPage.path);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test('the Spanish skip link is first in the keyboard order and reaches main content', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.getByRole('link', { name: 'Saltar al contenido', exact: true });
    const main = page.locator('#content');
    await expect(main).toHaveCount(1);
    await page.keyboard.press('Tab');
    await expectVisibleKeyboardFocus(skipLink);
    await expect(skipLink).toBeInViewport();
    await expect(skipLink).toHaveAttribute('href', '#content');

    await skipLink.click();
    await expect(page).toHaveURL(/\/#content$/);
    await expect(main).toBeFocused();
  });

  test('the theme button has a Spanish label and works from the keyboard', async ({ page }) => {
    await page.goto('/');

    const themeButton = page.locator('.theme-toggle');
    await expect(themeButton).toHaveAccessibleName('Cambiar a tema claro');
    await tabTo(page, themeButton);
    await expectVisibleKeyboardFocus(themeButton);

    await page.keyboard.press('Enter');
    await expect(themeButton).toHaveAccessibleName('Cambiar a tema oscuro');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});
