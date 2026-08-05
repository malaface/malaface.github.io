import { expect, test } from '@playwright/test';
import { expectVisibleKeyboardFocus } from './helpers';

test('navigates to the Knowledge Hub with Spanish controls', async ({ page }) => {
  await page.goto('/');
  const knowledgeLink = page.getByRole('link', { name: 'Conocimiento', exact: true });

  for (let tabCount = 0; tabCount < 10; tabCount += 1) {
    await page.keyboard.press('Tab');
    if (await knowledgeLink.evaluate((element) => element === document.activeElement)) break;
  }

  await expectVisibleKeyboardFocus(knowledgeLink);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/knowledge-hub\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
