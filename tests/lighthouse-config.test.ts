import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

const require = createRequire(import.meta.url);
const configPath = resolve('.lighthouserc.cjs');
const originalCi = process.env.CI;

function loadLighthouseConfig(ci: string | undefined) {
  if (ci === undefined) delete process.env.CI;
  else process.env.CI = ci;

  delete require.cache[require.resolve(configPath)];
  return require(configPath);
}

afterEach(() => {
  if (originalCi === undefined) delete process.env.CI;
  else process.env.CI = originalCi;
  delete require.cache[require.resolve(configPath)];
});

describe('Lighthouse Chromium launch settings', () => {
  test('uses no-sandbox only when GitHub CI launches Playwright Chromium', () => {
    const ciConfig = loadLighthouseConfig('true');
    expect(ciConfig.ci.collect.settings.chromeFlags).toContain('--no-sandbox');

    const localConfig = loadLighthouseConfig(undefined);
    expect(localConfig.ci.collect.settings?.chromeFlags).toBeUndefined();
  });
});
