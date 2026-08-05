import { expect, type Locator } from '@playwright/test';

export async function expectVisibleKeyboardFocus(target: Locator) {
  await expect(target).toBeFocused();
  const outline = await target.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.outlineColor, style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) };
  });

  expect(outline.style).toBe('solid');
  expect(outline.width).toBeGreaterThan(0);
  expect(outline.color).not.toBe('transparent');
  expect(outline.color).not.toBe('rgba(0, 0, 0, 0)');
}
