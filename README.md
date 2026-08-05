# Plataforma técnica personal

## Desarrollo

```bash
pnpm install
pnpm dev
pnpm test
pnpm check
pnpm build
```

Cada pull request y cada push ejecutan la validación de contenido público, las pruebas, las comprobaciones
de Astro, la compilación y las pruebas E2E. Los pushes a `main` vuelven a validar y publicar únicamente
el directorio estático `dist/` en GitHub Pages.

## Verificación en navegador

Instala Chromium una vez en cada entorno nuevo y genera el sitio antes de ejecutar las comprobaciones:

```bash
pnpm exec playwright install --with-deps chromium
pnpm build
pnpm test:e2e
pnpm lighthouse
```

Playwright usa `pnpm preview` para validar navegación, teclado, foco visible y la vista móvil de 375 px. Lighthouse
audita Inicio, Conocimiento y Proyectos con umbrales mínimos de 0.95 en rendimiento, accesibilidad, buenas prácticas
y SEO. Los reportes permanecen en `.lighthouseci/`; no se suben a servicios externos.
