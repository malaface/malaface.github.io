import { expect, test, type Page } from '@playwright/test';

const pagefindModule = ({ failFirstInit = false } = {}) => `
  let initAttempts = 0;
  export async function init() {
    initAttempts += 1;
    if (${failFirstInit} && initAttempts === 1) throw new Error('Synthetic init failure');
  }
  export async function search() {
    return {
      results: [{
        data: async () => ({
          url: '/knowledge-hub/context-engineering/',
          meta: { title: 'Context engineering para proyectos de software' },
          plain_excerpt: 'Resultado sintético local.'
        })
      }]
    };
  }
`;

async function openSearch(page: Page) {
  await page.getByRole('link', { name: 'Buscar en el sitio' }).click();
  return page.getByRole('dialog', { name: 'Buscar en el sitio' });
}

test('styles Pagefind results inserted at runtime', async ({ page }) => {
  await page.goto('/');
  const dialog = await openSearch(page);
  await expect(dialog.locator('[data-search-status]')).toContainText('Índice listo');

  await dialog.getByRole('searchbox').fill('automatización');
  await dialog.getByRole('button', { name: 'Buscar', exact: true }).click();

  const result = dialog.locator('[data-search-results] li').first();
  await expect(result).toBeVisible();
  await expect(result).toHaveCSS('border-top-style', 'solid');
  await expect(result.getByRole('link')).toHaveCSS('font-weight', '720');
});

test('retries Pagefind initialization after a transient failure', async ({ page }) => {
  await page.route('**/pagefind/pagefind.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: pagefindModule({ failFirstInit: true })
  }));
  await page.goto('/');
  const dialog = await openSearch(page);

  await expect(dialog.locator('[data-search-status]')).toContainText('No fue posible cargar');
  await dialog.getByRole('button', { name: 'Cerrar búsqueda' }).click();
  await openSearch(page);

  await expect(dialog.locator('[data-search-status]')).toContainText('Índice listo');
});
