# AI Decision Guides Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar seis guías en español que ayuden a profesionales de la salud y PYMEs a decidir qué procesos delegar a la IA, cómo encajan n8n, Flowise, Open WebUI y Pydantic, y cómo elegir entre ChatGPT, Claude y Gemini y sus formas de pago.

**Architecture:** La serie vive en las colecciones Markdown tipadas existentes de Astro: una guía práctica en `playbooks` y cinco artículos explicativos en `knowledge`. Cada pieza comparte una estructura editorial comprobable, utiliza enlaces públicos a documentación oficial y se conecta con las demás mediante rutas internas; las etiquetas nuevas se agregan al esquema cerrado existente.

**Tech Stack:** Astro Content Collections, Markdown, Zod, TypeScript, Vitest, Playwright, Pagefind, Lighthouse CI, pnpm.

## Global Constraints

- Escribir contenido público y documentación operativa en español.
- Dirigir las guías a profesionales de la salud, negocios familiares y PYMEs de servicios sin asumir experiencia técnica.
- Explicar decisiones de negocio; no convertir los artículos en tutoriales de instalación o configuración.
- Incluir exactamente dos ejemplos, una conclusión y un CTA consultivo en cada artículo.
- No presentar n8n, Flowise, Open WebUI, Pydantic y los modelos de IA como sustitutos directos.
- No incluir datos de clientes, decisiones clínicas automatizadas, información financiera privada, credenciales, rutas privadas, resultados inventados ni detalles operativos sensibles.
- Usar únicamente fuentes oficiales para capacidades, modelos, planes y facturación; revisar esas fuentes el mismo día de la redacción.
- Evitar precios exactos salvo que sean indispensables; cuando se incluyan, indicar moneda, unidad, fecha de consulta y enlace oficial.
- Mantener `draft: false` y `publishedAt: 2026-08-11` en los seis artículos.
- Preservar los cambios locales ajenos en `.gitignore` y `.pnpm-store/`.
- No hacer merge ni desplegar sin autorización explícita.

## File Structure

- Create: `tests/ai-decision-guides.test.ts` — contrato editorial de la serie y comprobación de enlaces oficiales.
- Modify: `src/config/content-schema.ts` — etiquetas públicas específicas de la serie.
- Create: `src/content/playbooks/elegir-tareas-para-delegar-a-la-ia.md` — matriz de frecuencia y criticidad.
- Create: `src/content/knowledge/n8n-automatizacion-de-procesos.md` — guía de decisión sobre orquestación.
- Create: `src/content/knowledge/flowise-flujos-visuales-de-ia.md` — guía de decisión sobre flujos visuales de IA.
- Create: `src/content/knowledge/open-webui-interfaz-para-modelos-de-ia.md` — guía de decisión sobre una interfaz central de IA.
- Create: `src/content/knowledge/pydantic-validacion-de-datos-en-automatizaciones.md` — guía de decisión sobre validación estructural.
- Create: `src/content/knowledge/chatgpt-claude-gemini-comparativa.md` — comparación de productos, modelos y facturación.

---

### Task 1: Define the editorial contract and publish the delegation framework

**Files:**
- Create: `tests/ai-decision-guides.test.ts`
- Modify: `src/config/content-schema.ts`
- Create: `src/content/playbooks/elegir-tareas-para-delegar-a-la-ia.md`

**Interfaces:**
- Consumes: `contentTags` and `contentSchemaFor()` from `src/config/content-schema.ts`; `assertPublicContent()` from `src/config/content-policy.ts`.
- Produces: reusable `articleCases` test data and `expectDecisionGuide()` helper; public route `/playbooks/elegir-tareas-para-delegar-a-la-ia/`.

- [ ] **Step 1: Write the failing editorial contract test**

Create `tests/ai-decision-guides.test.ts` with this initial content:

```ts
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { assertPublicContent } from '../src/config/content-policy';

interface ArticleCase {
  path: string;
  title: string;
  section: 'knowledge' | 'playbooks';
  category: 'automation' | 'ai-coding';
  officialHosts: string[];
}

export const articleCases: ArticleCase[] = [
  {
    path: 'src/content/playbooks/elegir-tareas-para-delegar-a-la-ia.md',
    title: 'Qué tareas conviene delegar a la IA',
    section: 'playbooks',
    category: 'automation',
    officialHosts: []
  }
];

export async function expectDecisionGuide(article: ArticleCase) {
  const source = await readFile(new URL(`../${article.path}`, import.meta.url), 'utf8');

  expect(source).toContain(`title: ${article.title}`);
  expect(source).toContain('publishedAt: 2026-08-11');
  expect(source).toContain(`section: ${article.section}`);
  expect(source).toContain(`category: ${article.category}`);
  expect(source).toMatch(/^draft: false$/m);
  expect(source).toMatch(/^## Dos ejemplos$/m);
  expect(source).toMatch(/^### Ejemplo 1:/m);
  expect(source).toMatch(/^### Ejemplo 2:/m);
  expect(source).toMatch(/^## Conclusión$/m);
  expect(source).toMatch(/^## Siguiente paso$/m);
  expect(assertPublicContent(source, article.path)).toEqual([]);

  for (const host of article.officialHosts) {
    expect(source).toContain(`https://${host}`);
  }
}

describe('AI decision guides', () => {
  for (const article of articleCases) {
    it(`publishes ${article.path} with the shared editorial structure`, async () => {
      await expectDecisionGuide(article);
    });
  }
});
```

- [ ] **Step 2: Run the test to verify it fails because the first article does not exist**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts`

Expected: FAIL with `ENOENT` for `elegir-tareas-para-delegar-a-la-ia.md`.

- [ ] **Step 3: Add the series tags to the typed schema**

Append these exact values to `contentTags` in `src/config/content-schema.ts`, preserving the existing values:

```ts
  'n8n',
  'flowise',
  'open-webui',
  'pydantic',
  'modelos-de-ia',
  'validacion-de-datos',
  'toma-de-decisiones'
```

- [ ] **Step 4: Write the delegation article**

Create `src/content/playbooks/elegir-tareas-para-delegar-a-la-ia.md` with this frontmatter:

```yaml
---
title: Qué tareas conviene delegar a la IA
description: Una matriz práctica para priorizar actividades repetitivas según su frecuencia, criticidad y facilidad de revisión.
publishedAt: 2026-08-11
section: playbooks
category: automation
tags: [automatizacion, metodologia, toma-de-decisiones]
featured: true
draft: false
---
```

Write original Spanish prose with these exact `##` sections: `El mejor punto de partida`, `La matriz de frecuencia y criticidad`, `Antes de automatizar`, `Qué debe conservar una persona`, `Dos ejemplos`, `Conclusión`, and `Siguiente paso`. Define a four-quadrant decision matrix: high-frequency/low-criticality is first priority; low-frequency/low-criticality is optional; high-frequency/high-criticality requires controls and human review; low-frequency/high-criticality stays human unless a narrowly bounded support step is demonstrably safe. Add `### Ejemplo 1: Clasificar mensajes administrativos` and `### Ejemplo 2: Preparar un resumen semanal`. Explain that clinical judgment and irreversible decisions are outside autonomous delegation. End with a CTA to map processes by weekly frequency, error impact, detectability, reversibility, and current effort.

- [ ] **Step 5: Run the focused test and public validator**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts && pnpm validate:public`

Expected: PASS and both commands exit `0`.

- [ ] **Step 6: Commit the editorial contract and first guide**

```bash
git add tests/ai-decision-guides.test.ts src/config/content-schema.ts src/content/playbooks/elegir-tareas-para-delegar-a-la-ia.md
git commit -m "content: add AI delegation decision guide"
```

### Task 2: Publish the n8n decision guide

**Files:**
- Modify: `tests/ai-decision-guides.test.ts`
- Create: `src/content/knowledge/n8n-automatizacion-de-procesos.md`

**Interfaces:**
- Consumes: `expectDecisionGuide()` and `articleCases` from Task 1.
- Produces: public route `/knowledge-hub/n8n-automatizacion-de-procesos/` and an official-source link to n8n documentation.

- [ ] **Step 1: Add the failing n8n article case**

Append this object to `articleCases` before its closing bracket:

```ts
  {
    path: 'src/content/knowledge/n8n-automatizacion-de-procesos.md',
    title: 'n8n: cuándo automatizar un proceso de principio a fin',
    section: 'knowledge',
    category: 'automation',
    officialHosts: ['docs.n8n.io/']
  }
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts -t "n8n-automatizacion"`

Expected: FAIL with `ENOENT` for `n8n-automatizacion-de-procesos.md`.

- [ ] **Step 3: Verify the current official n8n description**

Open `https://docs.n8n.io/` and `https://docs.n8n.io/workflows/executions/all-executions/`. Confirm on the same day that n8n describes itself as workflow automation combining business-process and AI capabilities, and that execution history supports reviewing success or failure. Do not introduce edition-specific claims that are not supported by those pages.

- [ ] **Step 4: Write the n8n article**

Create the file with this frontmatter:

```yaml
---
title: "n8n: cuándo automatizar un proceso de principio a fin"
description: Cómo decidir si un proceso necesita conectar aplicaciones, aplicar reglas y dejar seguimiento de cada ejecución.
publishedAt: 2026-08-11
section: knowledge
category: automation
tags: [automatizacion, n8n, toma-de-decisiones]
featured: true
draft: false
---
```

Use these exact `##` sections: `Qué es n8n`, `Qué problema resuelve`, `Cuándo conviene utilizarlo`, `Cuándo elegir otra opción`, `Controles que no deben faltar`, `Dos ejemplos`, `Conclusión`, and `Siguiente paso`. Cite the two official pages from Step 3. Contrast its process-and-integration focus with Flowise, Open WebUI, and Pydantic. Include `### Ejemplo 1: Recordatorio después de un cambio de estado` and `### Ejemplo 2: Seguimiento de documentación pendiente`. End by inviting the reader to document triggers, inputs, decisions, exceptions, owner, and expected output before automating.

- [ ] **Step 5: Run the focused test and validator**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts -t "n8n-automatizacion" && pnpm validate:public`

Expected: PASS and both commands exit `0`.

- [ ] **Step 6: Commit the n8n guide**

```bash
git add tests/ai-decision-guides.test.ts src/content/knowledge/n8n-automatizacion-de-procesos.md
git commit -m "content: explain when to use n8n"
```

### Task 3: Publish the Flowise decision guide

**Files:**
- Modify: `tests/ai-decision-guides.test.ts`
- Create: `src/content/knowledge/flowise-flujos-visuales-de-ia.md`

**Interfaces:**
- Consumes: the shared editorial test helper and the n8n comparison from Task 2.
- Produces: public route `/knowledge-hub/flowise-flujos-visuales-de-ia/` and an official-source link to Flowise documentation.

- [ ] **Step 1: Add the failing Flowise article case**

Append:

```ts
  {
    path: 'src/content/knowledge/flowise-flujos-visuales-de-ia.md',
    title: 'Flowise: cuándo construir un flujo visual de IA',
    section: 'knowledge',
    category: 'ai-coding',
    officialHosts: ['docs.flowiseai.com/']
  }
```

- [ ] **Step 2: Verify the test fails for the missing file**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts -t "flowise-flujos"`

Expected: FAIL with `ENOENT`.

- [ ] **Step 3: Verify Flowise terminology in its current official documentation**

Open `https://docs.flowiseai.com/` and confirm the current definitions of Flowise, Assistant, Chatflow, Agentflow, human-in-the-loop, evaluations, tracing, API, and embedded chat. Use only the capabilities still listed there.

- [ ] **Step 4: Write the Flowise article**

Use this frontmatter:

```yaml
---
title: "Flowise: cuándo construir un flujo visual de IA"
description: Una guía para reconocer cuándo una solución necesita modelos, fuentes, herramientas y revisión humana dentro de un flujo visual.
publishedAt: 2026-08-11
section: knowledge
category: ai-coding
tags: [ai-coding, flowise, automatizacion, toma-de-decisiones]
featured: false
draft: false
---
```

Use exact `##` sections: `Qué es Flowise`, `Qué problema resuelve`, `Cuándo conviene utilizarlo`, `Cuándo elegir otra opción`, `La información y las pruebas importan más que el diagrama`, `Dos ejemplos`, `Conclusión`, and `Siguiente paso`. Explain RAG in plain Spanish as retrieving relevant fragments from approved sources before answering. Contrast Flowise's AI-flow focus with n8n's broader business-process orchestration and Open WebUI's interface focus. Add `### Ejemplo 1: Preguntas frecuentes administrativas` and `### Ejemplo 2: Clasificación inicial de solicitudes`. The CTA asks the reader to define the question, approved sources, escalation rule, and review method.

- [ ] **Step 5: Run the focused test and validator**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts -t "flowise-flujos" && pnpm validate:public`

Expected: PASS.

- [ ] **Step 6: Commit the Flowise guide**

```bash
git add tests/ai-decision-guides.test.ts src/content/knowledge/flowise-flujos-visuales-de-ia.md
git commit -m "content: explain when to use Flowise"
```

### Task 4: Publish the Open WebUI decision guide

**Files:**
- Modify: `tests/ai-decision-guides.test.ts`
- Create: `src/content/knowledge/open-webui-interfaz-para-modelos-de-ia.md`

**Interfaces:**
- Consumes: the shared editorial test helper and comparisons from Tasks 2–3.
- Produces: public route `/knowledge-hub/open-webui-interfaz-para-modelos-de-ia/` and official Open WebUI references.

- [ ] **Step 1: Add the failing Open WebUI article case**

Append:

```ts
  {
    path: 'src/content/knowledge/open-webui-interfaz-para-modelos-de-ia.md',
    title: 'Open WebUI: cuándo conviene una interfaz propia para usar IA',
    section: 'knowledge',
    category: 'ai-coding',
    officialHosts: ['docs.openwebui.com/']
  }
```

- [ ] **Step 2: Verify the missing-file failure**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts -t "open-webui-interfaz"`

Expected: FAIL with `ENOENT`.

- [ ] **Step 3: Verify current Open WebUI capabilities and responsibilities**

Open `https://docs.openwebui.com/features/`, `https://docs.openwebui.com/features/workspace/`, and `https://docs.openwebui.com/getting-started/quick-start/`. Confirm supported model connections, workspace building blocks, access controls, and deployment choices. Treat operating, updating, securing, backing up, and supporting the service as responsibilities, not product guarantees.

- [ ] **Step 4: Write the Open WebUI article**

Use this frontmatter:

```yaml
---
title: "Open WebUI: cuándo conviene una interfaz propia para usar IA"
description: Cómo decidir si un equipo necesita un punto común para acceder a modelos, conocimiento y asistentes aprobados.
publishedAt: 2026-08-11
section: knowledge
category: ai-coding
tags: [ai-coding, open-webui, modelos-de-ia, toma-de-decisiones]
featured: false
draft: false
---
```

Use exact `##` sections: `Qué es Open WebUI`, `Qué problema resuelve`, `Cuándo conviene utilizarlo`, `Cuándo una cuenta comercial es suficiente`, `Responsabilidades de operar una interfaz propia`, `Dos ejemplos`, `Conclusión`, and `Siguiente paso`. Separate interface, model, knowledge, and automation layers. Add `### Ejemplo 1: Un acceso común para asistentes aprobados` and `### Ejemplo 2: Comparar respuestas entre modelos`. State that a self-managed interface does not by itself establish safe data handling. The CTA asks for users, permitted information, model providers, access roles, support owner, and continuity requirements.

- [ ] **Step 5: Run the focused test and validator**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts -t "open-webui-interfaz" && pnpm validate:public`

Expected: PASS.

- [ ] **Step 6: Commit the Open WebUI guide**

```bash
git add tests/ai-decision-guides.test.ts src/content/knowledge/open-webui-interfaz-para-modelos-de-ia.md
git commit -m "content: explain when to use Open WebUI"
```

### Task 5: Publish the Pydantic decision guide

**Files:**
- Modify: `tests/ai-decision-guides.test.ts`
- Create: `src/content/knowledge/pydantic-validacion-de-datos-en-automatizaciones.md`

**Interfaces:**
- Consumes: the shared editorial test helper.
- Produces: public route `/knowledge-hub/pydantic-validacion-de-datos-en-automatizaciones/` and official Pydantic references.

- [ ] **Step 1: Add the failing Pydantic article case**

Append:

```ts
  {
    path: 'src/content/knowledge/pydantic-validacion-de-datos-en-automatizaciones.md',
    title: 'Pydantic: por qué validar los datos antes de automatizar',
    section: 'knowledge',
    category: 'ai-coding',
    officialHosts: ['docs.pydantic.dev/']
  }
```

- [ ] **Step 2: Verify the missing-file failure**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts -t "pydantic-validacion"`

Expected: FAIL with `ENOENT`.

- [ ] **Step 3: Verify current Pydantic concepts**

Open `https://docs.pydantic.dev/latest/` and `https://docs.pydantic.dev/latest/concepts/models/`. Confirm how current Pydantic models use Python type annotations to validate input and how validation errors are reported. Do not claim that structural validation proves truth, clinical correctness, or business correctness.

- [ ] **Step 4: Write the Pydantic article**

Use this frontmatter:

```yaml
---
title: "Pydantic: por qué validar los datos antes de automatizar"
description: El valor empresarial de comprobar estructura, tipos y campos requeridos antes de permitir que un proceso continúe.
publishedAt: 2026-08-11
section: knowledge
category: ai-coding
tags: [ai-coding, pydantic, validacion-de-datos, automatizacion]
featured: false
draft: false
---
```

Use exact `##` sections: `Qué es Pydantic`, `Qué problema resuelve`, `Cuándo conviene utilizarlo`, `Qué no puede comprobar`, `Validar antes de continuar`, `Dos ejemplos`, `Conclusión`, and `Siguiente paso`. Explain required fields, types, permitted values, and understandable error handling without a code tutorial. Add `### Ejemplo 1: Revisar una solicitud administrativa` and `### Ejemplo 2: Comprobar un registro empresarial`. Contrast Pydantic with platforms and interfaces. The CTA asks the reader to define accepted data, rejection rules, correction paths, and who reviews exceptions.

- [ ] **Step 5: Run the focused test and validator**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts -t "pydantic-validacion" && pnpm validate:public`

Expected: PASS.

- [ ] **Step 6: Commit the Pydantic guide**

```bash
git add tests/ai-decision-guides.test.ts src/content/knowledge/pydantic-validacion-de-datos-en-automatizaciones.md
git commit -m "content: explain data validation with Pydantic"
```

### Task 6: Publish the ChatGPT, Claude, and Gemini comparison

**Files:**
- Modify: `tests/ai-decision-guides.test.ts`
- Create: `src/content/knowledge/chatgpt-claude-gemini-comparativa.md`

**Interfaces:**
- Consumes: the shared editorial test helper and `modelos-de-ia` tag.
- Produces: public route `/knowledge-hub/chatgpt-claude-gemini-comparativa/` and official OpenAI, Anthropic, and Google references.

- [ ] **Step 1: Add the failing comparison case**

Append:

```ts
  {
    path: 'src/content/knowledge/chatgpt-claude-gemini-comparativa.md',
    title: 'ChatGPT, Claude o Gemini: cómo elegir modelo y forma de pago',
    section: 'knowledge',
    category: 'ai-coding',
    officialHosts: [
      'developers.openai.com/',
      'help.openai.com/',
      'platform.claude.com/',
      'support.claude.com/',
      'ai.google.dev/',
      'support.google.com/'
    ]
  }
```

- [ ] **Step 2: Verify the missing-file failure**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts -t "chatgpt-claude-gemini"`

Expected: FAIL with `ENOENT`.

- [ ] **Step 3: Perform a same-day official-source model audit**

Review these exact official pages on the implementation date:

- `https://developers.openai.com/api/docs/models`
- `https://help.openai.com/en/articles/8156019-how-can-i-move-my-chatgpt-subscription-to-the-api`
- `https://platform.claude.com/docs/en/about-claude/models/overview`
- `https://support.claude.com/es/articles/9876003-tengo-una-suscripcion-pagada-de-claude-planes-pro-max-team-o-enterprise-por-que-tengo-que-pagar-por-separado-para-usar-la-claude-api-y-console`
- `https://ai.google.dev/gemini-api/docs/models`
- `https://ai.google.dev/gemini-api/docs/pricing`
- `https://support.google.com/gemini/answer/16275805`

For each provider, record only in working notes: current model families shown, the provider's stated positioning, access surface, usage-limit language, API billing unit, and whether chat subscription and API billing are separate. Do not commit the working notes. If a page contradicts a previously drafted claim, use the current official page and phrase the article with `Revisado el 11 de agosto de 2026`.

- [ ] **Step 4: Write the comparison article**

Use this frontmatter:

```yaml
---
title: "ChatGPT, Claude o Gemini: cómo elegir modelo y forma de pago"
description: Una comparación práctica de productos, familias de modelos, fortalezas, límites y pago mensual frente a consumo por API.
publishedAt: 2026-08-11
section: knowledge
category: ai-coding
tags: [ai-coding, modelos-de-ia, toma-de-decisiones]
featured: true
draft: false
---
```

Use exact `##` sections: `Primero separa producto, modelo y API`, `ChatGPT y los modelos de OpenAI`, `Claude y los modelos de Anthropic`, `Gemini y los modelos de Google`, `Fortalezas y límites según la tarea`, `Cuenta mensual o pago por consumo`, `Cómo tomar la decisión`, `Dos ejemplos`, `Conclusión`, and `Siguiente paso`. Start with `> Revisado el 11 de agosto de 2026.` Link every provider section to the audited official pages. Describe model families by their current documented tiers rather than declaring a universal winner. Explain that a monthly product account fits interactive individual or team work with an included interface and product features; API consumption fits software integration, repeatable automation, measurable volume, and programmatic control. State the separation between chat subscription and API billing where official documentation supports it. Add `### Ejemplo 1: Apoyo cotidiano para redactar y analizar` and `### Ejemplo 2: Clasificar solicitudes dentro de una automatización`. End with a CTA to compare task, frequency, required integrations, permitted information, expected volume, and review controls.

- [ ] **Step 5: Run the focused test and validator**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts -t "chatgpt-claude-gemini" && pnpm validate:public`

Expected: PASS.

- [ ] **Step 6: Commit the comparison**

```bash
git add tests/ai-decision-guides.test.ts src/content/knowledge/chatgpt-claude-gemini-comparativa.md
git commit -m "content: compare AI models and billing choices"
```

### Task 7: Connect the series and complete release verification

**Files:**
- Modify: `src/content/playbooks/elegir-tareas-para-delegar-a-la-ia.md`
- Modify: `src/content/knowledge/n8n-automatizacion-de-procesos.md`
- Modify: `src/content/knowledge/flowise-flujos-visuales-de-ia.md`
- Modify: `src/content/knowledge/open-webui-interfaz-para-modelos-de-ia.md`
- Modify: `src/content/knowledge/pydantic-validacion-de-datos-en-automatizaciones.md`
- Modify: `src/content/knowledge/chatgpt-claude-gemini-comparativa.md`
- Modify: `tests/ai-decision-guides.test.ts`

**Interfaces:**
- Consumes: all six public routes from Tasks 1–6.
- Produces: a cross-linked series with verified local routes and a release-ready branch.

- [ ] **Step 1: Add the failing cross-link test**

Add this test inside the existing `describe` block:

```ts
  it('connects every guide to at least two other articles in the series', async () => {
    const seriesRoutes = articleCases.map(({ path }) => {
      const slug = path.split('/').at(-1)?.replace(/\.md$/, '');
      return path.includes('/playbooks/')
        ? `/playbooks/${slug}/`
        : `/knowledge-hub/${slug}/`;
    });

    for (const article of articleCases) {
      const source = await readFile(new URL(`../${article.path}`, import.meta.url), 'utf8');
      const ownSlug = article.path.split('/').at(-1)?.replace(/\.md$/, '');
      const links = seriesRoutes.filter((route) => !route.includes(`/${ownSlug}/`) && source.includes(`](${route})`));
      expect(links, article.path).toHaveLength(2);
    }
  });
```

- [ ] **Step 2: Run the cross-link test to verify it fails**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts -t "connects every guide"`

Expected: FAIL because each guide does not yet contain exactly two series links.

- [ ] **Step 3: Add a focused related-reading section to every article**

Before `## Conclusión`, add `## Para seguir decidiendo` with exactly two Markdown links to the most relevant guides:

- Delegation → n8n and model comparison.
- n8n → delegation and Pydantic.
- Flowise → n8n and Open WebUI.
- Open WebUI → Flowise and model comparison.
- Pydantic → delegation and n8n.
- Model comparison → delegation and Open WebUI.

Use the exact public routes derived in the test; write one sentence explaining why each next article matters.

- [ ] **Step 4: Run the complete focused suite**

Run: `pnpm vitest run tests/ai-decision-guides.test.ts`

Expected: all seven tests PASS.

- [ ] **Step 5: Run the local release checklist in order**

Run each command separately and stop at the first failure:

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

Expected: every command exits `0`; `git diff --check` prints nothing; `git status --short` shows only the six articles, schema, series test, plan/spec commits already tracked as appropriate, plus the pre-existing `.gitignore` modification and `.pnpm-store/` directory that must remain unstaged.

- [ ] **Step 6: Review every rendered article in a local browser**

Run `pnpm dev`, open the six public routes, and confirm headings, tables or lists, links, typography, mobile layout, CTA placement, and absence of accidental private or unsupported content. Stop the development server after review. Correct any issue and rerun the affected focused test plus `pnpm build`.

- [ ] **Step 7: Commit the connected and verified series**

```bash
git add tests/ai-decision-guides.test.ts src/content/playbooks/elegir-tareas-para-delegar-a-la-ia.md src/content/knowledge/n8n-automatizacion-de-procesos.md src/content/knowledge/flowise-flujos-visuales-de-ia.md src/content/knowledge/open-webui-interfaz-para-modelos-de-ia.md src/content/knowledge/pydantic-validacion-de-datos-en-automatizaciones.md src/content/knowledge/chatgpt-claude-gemini-comparativa.md
git commit -m "content: connect AI decision guide series"
```

- [ ] **Step 8: Push the branch and open a Pull Request without merging**

Run:

```bash
git push -u origin content/ai-decision-guides
gh pr create --title "content: publish AI decision guide series" --body "## Resumen

- publica seis guías de decisión sobre IA y automatización
- compara las capas de n8n, Flowise, Open WebUI y Pydantic
- distingue ChatGPT, Claude y Gemini, sus modelos y sus formas de pago
- fuentes oficiales revisadas el 11 de agosto de 2026
- contenido revisado contra la política pública del repositorio

## Verificación

- pnpm validate:public
- pnpm test
- pnpm check
- pnpm build
- pnpm test:e2e
- pnpm lighthouse
- pnpm check:links
- git diff --check"
```

Confirm CI status and report the PR URL to the user. Do not merge or deploy.

### Task 8: Record the private session closeout after delivery

**Files:**
- Modify only with explicit authorization: `/Users/luismiguelmalacarajimenez/Documents/Obsidian/main/proyectos/malaface.github.io/malaface.github.io.md`

**Interfaces:**
- Consumes: branch name, commit hashes, PR URL, verification results, CI results, and remaining work.
- Produces: a private session link from the existing project hub, only if the user authorizes the vault edit.

- [ ] **Step 1: Ask for authorization before editing the vault**

State that the existing project hub was found and ask permission to append a private session summary. If permission is not granted, leave the vault unchanged and report that in the handoff.

- [ ] **Step 2: If authorized, add a concise private session note and link it from the hub**

Record only the branch, public PR URL, decisions, commits, checks, CI state, and pending merge/deployment. Keep all private context in the vault and do not copy vault content into the repository or PR.

- [ ] **Step 3: Deliver the final status**

Report the real branch, commits, PR, verification evidence, CI state, unchanged local user files, vault update state, and the next safe action. Explicitly state that merge and deployment have not occurred.
