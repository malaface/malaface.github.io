# Plan de implementación de navegación y Live Projects

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** Exponer todas las colecciones públicas en la navegación, diversificar los CTA de Inicio y publicar exclusivamente las páginas aprobadas de T-Ethos y Nexus HVAC en el catálogo manual, con Nexus HVAC destacado en Inicio.

**Arquitectura:** Conservar `siteConfig.navigation` como fuente del menú principal, renderizar una lista estática de colecciones en el pie existente y mantener la navegación móvil horizontal desplazable. Continuar importando y validando `src/data/live-projects.json` durante el build, sin descubrimiento ni solicitudes en runtime.

**Stack técnico:** Astro, TypeScript, JSON, Vitest, Playwright, pnpm y Lighthouse CI.

## Restricciones globales

- El contenido público y la documentación operativa permanecen en español.
- Se conserva el diseño y la navegación móvil horizontal existentes.
- No se agregan analytics, descubrimiento de proyectos, enlaces a repositorios, conectores, APIs ni integraciones automáticas.
- No se publican resultados, métricas, fechas de lanzamiento ni tecnologías fuera de la evidencia pública aprobada.
- `2026-08-05T00:00:00.000Z` representa solo la revisión del catálogo, no un lanzamiento.
- Nexus HVAC es el único proyecto destacado en Inicio; T-Ethos permanece accesible en Proyectos.
- El cambio preexistente del usuario en `.gitignore` se conserva y se excluye de cada commit.
- No se hace merge, despliegue ni publicación sin otra autorización explícita.

---

## Mapa de archivos

- `src/config/site.ts`: registros ordenados del menú principal.
- `src/components/Footer.astro`: enlaces secundarios a todas las colecciones y enlaces utilitarios actuales.
- `src/pages/index.astro`: etiquetas y destinos aprobados de los CTA.
- `src/data/live-projects.json`: los dos registros manuales aprobados.
- `tests/site-style.test.ts`: etiquetas y orden exactos del menú principal.
- `tests/site-config.test.ts`: contrato exacto de `href` y `label`.
- `tests/site-pages.test.ts`: pie, CTA y visibilidad de proyectos en el build.
- `tests/project-data.test.ts`: datos exactos del catálogo y selección del destacado.
- `tests/e2e/navigation.spec.ts`: navegación real y ausencia de desbordamiento a 1280, 375 y 320 px.

### Tarea 1: Exponer todas las colecciones en la navegación principal y secundaria

**Archivos:**
- Modificar: `tests/site-style.test.ts:52-61`
- Modificar: `tests/site-config.test.ts:4-10`
- Modificar: `tests/site-pages.test.ts:18-34`
- Modificar: `tests/e2e/navigation.spec.ts:1-17`
- Modificar: `src/config/site.ts:8-15`
- Modificar: `src/components/Footer.astro:15-20`

**Interfaces:**
- Consume: `siteConfig.navigation: readonly { href: string; label: string }[]` y los landmarks `Navegación principal` y `Navegación secundaria`.
- Produce: ocho enlaces principales ordenados y siete enlaces de colecciones en la navegación secundaria.

- [ ] **Paso 1: Escribir pruebas unitarias y del build que fallen con el contrato exacto**

Sustituir la expectativa de navegación en `tests/site-style.test.ts` por:

```ts
expect(siteConfig.navigation.map(({ label }) => label)).toEqual([
  'Inicio',
  'Conocimiento',
  'Guías',
  'Blog',
  'Laboratorio',
  'Proyectos',
  'Recursos',
  'Ahora'
]);
```

Agregar a `tests/site-config.test.ts`:

```ts
it('links every primary destination in the approved order', () => {
  expect(siteConfig.navigation).toEqual([
    { href: '/', label: 'Inicio' },
    { href: '/knowledge-hub/', label: 'Conocimiento' },
    { href: '/playbooks/', label: 'Guías' },
    { href: '/blog/', label: 'Blog' },
    { href: '/laboratorio/', label: 'Laboratorio' },
    { href: '/live-projects/', label: 'Proyectos' },
    { href: '/recursos/', label: 'Recursos' },
    { href: '/now/', label: 'Ahora' }
  ]);
});
```

Agregar `playbooks/index.html`, `blog/index.html`, `laboratorio/index.html` y `recursos/index.html` a la tabla de rutas de `tests/site-pages.test.ts`. Agregar también:

```ts
it('links every public collection from the secondary navigation', async () => {
  const html = await readFile(builtPage('index.html'), 'utf8');
  const footer = html.match(/<footer class="site-footer">(?<footer>[\s\S]*?)<\/footer>/)?.groups?.footer ?? '';

  for (const href of [
    '/knowledge-hub/',
    '/playbooks/',
    '/blog/',
    '/laboratorio/',
    '/live-projects/',
    '/recursos/',
    '/now/'
  ]) {
    expect(footer).toContain(`href="${href}"`);
  }
});
```

- [ ] **Paso 2: Escribir la prueba E2E adaptable que falle**

Conservar la prueba de foco por teclado y agregar a `tests/e2e/navigation.spec.ts`:

```ts
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
```

- [ ] **Paso 3: Ejecutar las pruebas enfocadas y confirmar ROJO**

```bash
pnpm build
pnpm exec vitest run tests/site-style.test.ts tests/site-config.test.ts tests/site-pages.test.ts
pnpm exec playwright test tests/e2e/navigation.spec.ts
```

Resultado esperado: Vitest falla porque Blog y Recursos no existen en `siteConfig.navigation` y el pie no contiene las siete colecciones; Playwright falla al no encontrar Blog o Recursos en el menú principal.

- [ ] **Paso 4: Implementar el cambio mínimo de navegación**

Dejar `siteConfig.navigation` así:

```ts
navigation: [
  { href: '/', label: 'Inicio' },
  { href: '/knowledge-hub/', label: 'Conocimiento' },
  { href: '/playbooks/', label: 'Guías' },
  { href: '/blog/', label: 'Blog' },
  { href: '/laboratorio/', label: 'Laboratorio' },
  { href: '/live-projects/', label: 'Proyectos' },
  { href: '/recursos/', label: 'Recursos' },
  { href: '/now/', label: 'Ahora' }
]
```

Sustituir el contenido del `nav` del pie por:

```astro
<a href="/knowledge-hub/">Conocimiento</a>
<a href="/playbooks/">Guías</a>
<a href="/blog/">Blog</a>
<a href="/laboratorio/">Laboratorio</a>
<a href="/live-projects/">Proyectos</a>
<a href="/recursos/">Recursos</a>
<a href="/now/">Ahora</a>
<a href="/sobre-mi/">Sobre mí</a>
<a href="/contacto/">Contacto</a>
<a href="/rss.xml">RSS</a>
```

No modificar `src/styles/global.css`: el scroller del menú y el ajuste de línea del pie ya implementan el diseño aprobado.

- [ ] **Paso 5: Reconstruir y confirmar VERDE en los tres anchos**

```bash
pnpm build
pnpm exec vitest run tests/site-style.test.ts tests/site-config.test.ts tests/site-pages.test.ts
pnpm exec playwright test tests/e2e/navigation.spec.ts
```

Resultado esperado: pasan Vitest y Playwright, incluidas las pruebas a 1280, 375 y 320 px sin desbordamiento horizontal del documento.

- [ ] **Paso 6: Versionar la navegación**

```bash
git add src/config/site.ts src/components/Footer.astro tests/site-style.test.ts tests/site-config.test.ts tests/site-pages.test.ts tests/e2e/navigation.spec.ts
git commit -m "feat: expose all public collections"
```

### Tarea 2: Diversificar los CTA de Inicio

**Archivos:**
- Modificar: `tests/site-pages.test.ts:96-109`
- Modificar: `src/pages/index.astro:50-53,102-109,141-150`

**Interfaces:**
- Consume: la página compilada `dist/index.html`.
- Produce: cinco pares de etiqueta/destino aprobados, sin un CTA principal hacia Conocimiento.

- [ ] **Paso 1: Escribir la prueba del build que falle**

Agregar a `tests/site-pages.test.ts`:

```ts
it('distributes home calls to action across projects, resources, blog, contact and guides', async () => {
  const html = await readFile(builtPage('index.html'), 'utf8');

  expect(html).toContain('href="/live-projects/">Ver proyectos');
  expect(html).toContain('href="/recursos/">Explorar recursos');
  expect(html).toContain('href="/blog/">Ir al Blog');
  expect(html).toContain('href="/contacto/">Contactar');
  expect(html).toContain('href="/playbooks/">Abrir Guías');
  expect(html).not.toContain('>Explorar conocimiento');
  expect(html).not.toContain('>Ir a Conocimiento');
});
```

- [ ] **Paso 2: Ejecutar la prueba enfocada y confirmar ROJO**

```bash
pnpm build
pnpm exec vitest run tests/site-pages.test.ts
```

Resultado esperado: falla porque el hero y el CTA final todavía apuntan a `/knowledge-hub/` y el enlace de contenido conserva el texto anterior.

- [ ] **Paso 3: Implementar las etiquetas y destinos aprobados**

Usar estos anchors exactos en `src/pages/index.astro`:

```astro
<a class="button-link" href="/live-projects/">Ver proyectos <span aria-hidden="true">→</span></a>
<a class="text-link" href="/recursos/">Explorar recursos <span aria-hidden="true">↗</span></a>
```

```astro
<a class="text-link" href="/blog/">Ir al Blog <span aria-hidden="true">→</span></a>
```

```astro
<a class="button-link" href="/contacto/">Contactar <span aria-hidden="true">→</span></a>
<a class="text-link" href="/playbooks/">Abrir Guías <span aria-hidden="true">↗</span></a>
```

- [ ] **Paso 4: Reconstruir y confirmar VERDE**

```bash
pnpm build
pnpm exec vitest run tests/site-pages.test.ts
```

Resultado esperado: pasa todo `tests/site-pages.test.ts`.

- [ ] **Paso 5: Versionar los CTA**

```bash
git add src/pages/index.astro tests/site-pages.test.ts
git commit -m "feat: diversify home calls to action"
```

### Tarea 3: Agregar exclusivamente las páginas manuales aprobadas

**Archivos:**
- Modificar: `tests/project-data.test.ts:42-46`
- Modificar: `tests/site-pages.test.ts:111-123`
- Modificar: `src/data/live-projects.json:1`

**Interfaces:**
- Consume: el parser estricto `ProjectRecord` y `getHomeProject(projects)`.
- Produce: exactamente dos registros válidos; `getHomeProject` devuelve `nexus-hvac`; Proyectos muestra ambos e Inicio solo Nexus HVAC.

- [ ] **Paso 1: Sustituir la prueba del catálogo vacío por una prueba exacta que falle**

Usar en `tests/project-data.test.ts`:

```ts
it('contains exactly the two manually approved public pages', async () => {
  const projects = parseProjectRecords(JSON.parse(await readFile(dataFile('live-projects.json'), 'utf8')));

  expect(projects).toEqual([
    {
      id: 'nexus-hvac',
      name: 'Nexus HVAC',
      description: 'Servicios de instalación, reparación y mantenimiento de sistemas de aire acondicionado y refrigeración para hogares y negocios en Guadalajara.',
      technologies: ['Next.js'],
      productionUrl: 'https://nexus-hvac.malacaran8n.uk/',
      status: 'production',
      updatedAt: '2026-08-05T00:00:00.000Z',
      featured: true
    },
    {
      id: 't-ethos',
      name: 'T-Ethos',
      description: 'Presencia digital para profesionales y artesanos mediante automatizaciones, asistentes de IA, páginas web y consultoría personalizada.',
      technologies: ['Next.js'],
      productionUrl: 'https://t-ethos.malacaran8n.uk/',
      status: 'production',
      updatedAt: '2026-08-05T00:00:00.000Z',
      featured: false
    }
  ]);
  expect(getHomeProject(projects)?.id).toBe('nexus-hvac');
});
```

Sustituir la prueba del estado vacío en `tests/site-pages.test.ts` por:

```ts
it('shows Nexus HVAC on Inicio and both approved pages on Proyectos', async () => {
  const homeHtml = await readFile(builtPage('index.html'), 'utf8');
  const projectsHtml = await readFile(builtPage('live-projects/index.html'), 'utf8');

  expect(homeHtml).toContain('Nexus HVAC');
  expect(homeHtml).toContain('https://nexus-hvac.malacaran8n.uk/');
  expect(homeHtml).not.toContain('https://t-ethos.malacaran8n.uk/');
  expect(projectsHtml).toContain('Nexus HVAC');
  expect(projectsHtml).toContain('https://nexus-hvac.malacaran8n.uk/');
  expect(projectsHtml).toContain('T-Ethos');
  expect(projectsHtml).toContain('https://t-ethos.malacaran8n.uk/');
  expect(homeHtml).toContain('Publicaciones recientes');
  expect(homeHtml).not.toContain(siteConfig.github);
  expect(projectsHtml).not.toContain(siteConfig.github);
});
```

- [ ] **Paso 2: Ejecutar las pruebas enfocadas y confirmar ROJO**

```bash
pnpm build
pnpm exec vitest run tests/project-data.test.ts tests/site-pages.test.ts
```

Resultado esperado: fallan porque `src/data/live-projects.json` sigue vacío y ambas páginas renderizan el estado vacío.

- [ ] **Paso 3: Agregar los registros exactos al catálogo manual**

Dejar `src/data/live-projects.json` así:

```json
[
  {
    "id": "nexus-hvac",
    "name": "Nexus HVAC",
    "description": "Servicios de instalación, reparación y mantenimiento de sistemas de aire acondicionado y refrigeración para hogares y negocios en Guadalajara.",
    "technologies": ["Next.js"],
    "productionUrl": "https://nexus-hvac.malacaran8n.uk/",
    "status": "production",
    "updatedAt": "2026-08-05T00:00:00.000Z",
    "featured": true
  },
  {
    "id": "t-ethos",
    "name": "T-Ethos",
    "description": "Presencia digital para profesionales y artesanos mediante automatizaciones, asistentes de IA, páginas web y consultoría personalizada.",
    "technologies": ["Next.js"],
    "productionUrl": "https://t-ethos.malacaran8n.uk/",
    "status": "production",
    "updatedAt": "2026-08-05T00:00:00.000Z",
    "featured": false
  }
]
```

- [ ] **Paso 4: Reconstruir y confirmar VERDE**

```bash
pnpm build
pnpm exec vitest run tests/project-data.test.ts tests/site-pages.test.ts
```

Resultado esperado: pasan las pruebas; Inicio contiene solo Nexus HVAC y Proyectos contiene ambas páginas.

- [ ] **Paso 5: Versionar el catálogo manual**

```bash
git add src/data/live-projects.json tests/project-data.test.ts tests/site-pages.test.ts
git commit -m "feat: add approved live project pages"
```

### Tarea 4: Ejecutar la verificación completa y registrar la sesión

**Archivos:**
- Modificar fuera del repositorio: `/Users/luismiguelmalacarajimenez/Documents/Obsidian/main/proyectos/malaface.github.io/malaface.github.io.md`

**Interfaces:**
- Consume: la rama implementada y `docs/release-checklist.md`.
- Produce: evidencia fresca y un resumen privado; no hace merge, despliegue ni publicación.

- [ ] **Paso 1: Ejecutar todos los gates locales en orden**

```bash
pnpm validate:public
pnpm test
pnpm check
pnpm build
pnpm test:e2e
pnpm lighthouse
pnpm check:links
git diff --check
git status --short
```

Resultado esperado: cada comando termina con código 0; `git diff --check` no imprime nada; `git status --short` muestra únicamente el cambio preexistente del usuario en `.gitignore`.

- [ ] **Paso 2: Inspeccionar el delta final sin modificarlo**

```bash
git log --oneline --decorate main..HEAD
git diff --stat main...HEAD
git diff --name-only main...HEAD
```

Resultado esperado: solo aparecen la especificación, este plan y los tres commits de implementación; no aparecen rutas del vault, enlaces a repositorios en Live Projects, analytics, scripts de descubrimiento, conectores ni archivos ajenos al alcance.

- [ ] **Paso 3: Actualizar la nota privada autorizada de Obsidian**

Agregar bajo `## Sesiones` una viñeta fechada que enumere de forma literal:

- el resumen de navegación, CTA y las dos fichas;
- Nexus HVAC como destacado y el catálogo manual como decisión;
- la rama y cada hash/mensaje de commit;
- el código de salida observado para cada comando del checklist;
- el número y URL del PR si existe, o la frase `PR no creado`;
- cualquier fallo o trabajo realmente pendiente, o la frase `Sin pendientes de implementación` si no queda ninguno.

Mantener el detalle operativo privado únicamente en el vault y no copiar contenido del vault al repositorio o GitHub.

- [ ] **Paso 4: Entregar el estado real**

Informar rama, commits, archivos cambiados, resultados frescos, conservación de `.gitignore`, estado del PR y siguiente acción segura. No afirmar despliegue o publicación y no hacer merge o push sin autorización explícita.
