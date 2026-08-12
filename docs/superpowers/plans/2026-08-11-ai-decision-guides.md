# AI Decision Guides Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar seis guías en español que ayuden a profesionales de la salud y PYMEs a decidir qué procesos delegar a la IA, cómo encajan n8n, Flowise, Open WebUI y Pydantic, y cómo elegir entre ChatGPT, Claude y Gemini y sus formas de pago.

**Architecture:** La serie vive en las colecciones Markdown tipadas existentes de Astro: una guía práctica en `playbooks` y cinco artículos explicativos en `knowledge`. Cada pieza comparte una estructura editorial, utiliza documentación oficial vigente y enlaza dos guías relacionadas; las etiquetas nuevas se agregan al esquema cerrado existente.

**Tech Stack:** Astro Content Collections, Markdown, Zod, TypeScript, Playwright, Pagefind, Lighthouse CI, pnpm.

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
- Preservar los cambios locales ajenos en `.gitignore` y `.pnpm-store/` del checkout principal.
- No hacer merge ni desplegar sin autorización explícita.
- No agregar pruebas que inspeccionen frases, frontmatter o encabezados exactos de la prosa. La aceptación se comprobará mediante el consumidor real: esquema Astro, política pública, render, enlaces y revisión visual.

## File Structure

- Modify: `src/config/content-schema.ts` — etiquetas públicas específicas de la serie.
- Create: `src/content/playbooks/elegir-tareas-para-delegar-a-la-ia.md` — matriz de frecuencia y criticidad.
- Create: `src/content/knowledge/n8n-automatizacion-de-procesos.md` — guía de decisión sobre orquestación.
- Create: `src/content/knowledge/flowise-flujos-visuales-de-ia.md` — guía de decisión sobre flujos visuales de IA.
- Create: `src/content/knowledge/open-webui-interfaz-para-modelos-de-ia.md` — guía de decisión sobre una interfaz central de IA.
- Create: `src/content/knowledge/pydantic-validacion-de-datos-en-automatizaciones.md` — guía de decisión sobre validación estructural.
- Create: `src/content/knowledge/chatgpt-claude-gemini-comparativa.md` — comparación de productos, modelos y facturación.

---

### Task 1: Publish the delegation framework and add typed tags

**Files:**
- Modify: `src/config/content-schema.ts`
- Create: `src/content/playbooks/elegir-tareas-para-delegar-a-la-ia.md`

- [ ] Add these exact values to `contentTags`, preserving all existing values: `n8n`, `flowise`, `open-webui`, `pydantic`, `modelos-de-ia`, `validacion-de-datos`, `toma-de-decisiones`.
- [ ] Create the article with title `Qué tareas conviene delegar a la IA`, description `Una matriz práctica para priorizar actividades repetitivas según su frecuencia, criticidad y facilidad de revisión.`, section `playbooks`, category `automation`, tags `[automatizacion, metodologia, toma-de-decisiones]`, `featured: true`, and the global publication date and draft state.
- [ ] Use sections `El mejor punto de partida`, `La matriz de frecuencia y criticidad`, `Antes de automatizar`, `Qué debe conservar una persona`, `Dos ejemplos`, `Conclusión`, and `Siguiente paso`.
- [ ] Define the four quadrants: frequent/low-criticality first; infrequent/low-criticality optional; frequent/high-criticality only as bounded support with controls and human review; infrequent/high-criticality remains human unless a narrow support step is demonstrably safe.
- [ ] Include `Ejemplo 1: Clasificar mensajes administrativos` and `Ejemplo 2: Preparar un resumen semanal`. Exclude autonomous clinical judgment and irreversible decisions.
- [ ] End with a CTA to map weekly frequency, error impact, detectability, reversibility, and current effort.
- [ ] Run `pnpm validate:public && pnpm check && pnpm build`; expect exit `0`.
- [ ] Commit only these two files with `content: add AI delegation decision guide`.

### Task 2: Publish the n8n decision guide

**Files:**
- Create: `src/content/knowledge/n8n-automatizacion-de-procesos.md`

- [ ] Verify `https://docs.n8n.io/` and `https://docs.n8n.io/workflows/executions/all-executions/` on the implementation date. Use only current claims about workflow automation, integrations, AI capabilities, and execution review.
- [ ] Create the article with title `n8n: cuándo automatizar un proceso de principio a fin`, description `Cómo decidir si un proceso necesita conectar aplicaciones, aplicar reglas y dejar seguimiento de cada ejecución.`, section `knowledge`, category `automation`, tags `[automatizacion, n8n, toma-de-decisiones]`, `featured: true`, and the global publication date and draft state.
- [ ] Use sections `Qué es n8n`, `Qué problema resuelve`, `Cuándo conviene utilizarlo`, `Cuándo elegir otra opción`, `Controles que no deben faltar`, `Dos ejemplos`, `Conclusión`, and `Siguiente paso`.
- [ ] Contrast its process-and-integration focus with Flowise, Open WebUI, and Pydantic. Explain that connecting applications does not repair an undefined process.
- [ ] Include `Ejemplo 1: Recordatorio después de un cambio de estado` and `Ejemplo 2: Seguimiento de documentación pendiente`.
- [ ] End with a CTA to document triggers, inputs, decisions, exceptions, owner, and expected output.
- [ ] Run `pnpm validate:public && pnpm check && pnpm build`; expect exit `0`.
- [ ] Commit the article with `content: explain when to use n8n`.

### Task 3: Publish the Flowise decision guide

**Files:**
- Create: `src/content/knowledge/flowise-flujos-visuales-de-ia.md`

- [ ] Verify `https://docs.flowiseai.com/` on the implementation date. Confirm current descriptions of Flowise, Assistant, Chatflow, Agentflow, human-in-the-loop, evaluations, tracing, API, and embedded chat.
- [ ] Create the article with title `Flowise: cuándo construir un flujo visual de IA`, description `Una guía para reconocer cuándo una solución necesita modelos, fuentes, herramientas y revisión humana dentro de un flujo visual.`, section `knowledge`, category `ai-coding`, tags `[ai-coding, flowise, automatizacion, toma-de-decisiones]`, `featured: false`, and the global publication date and draft state.
- [ ] Use sections `Qué es Flowise`, `Qué problema resuelve`, `Cuándo conviene utilizarlo`, `Cuándo elegir otra opción`, `La información y las pruebas importan más que el diagrama`, `Dos ejemplos`, `Conclusión`, and `Siguiente paso`.
- [ ] Explain RAG in plain Spanish as retrieving relevant fragments from approved sources before answering. Contrast Flowise's AI-flow focus with n8n's broader process orchestration and Open WebUI's interface focus.
- [ ] Include `Ejemplo 1: Preguntas frecuentes administrativas` and `Ejemplo 2: Clasificación inicial de solicitudes`.
- [ ] End with a CTA to define the question, approved sources, escalation rule, and review method.
- [ ] Run `pnpm validate:public && pnpm check && pnpm build`; expect exit `0`.
- [ ] Commit the article with `content: explain when to use Flowise`.

### Task 4: Publish the Open WebUI decision guide

**Files:**
- Create: `src/content/knowledge/open-webui-interfaz-para-modelos-de-ia.md`

- [ ] Verify `https://docs.openwebui.com/features/`, `https://docs.openwebui.com/features/workspace/`, and `https://docs.openwebui.com/getting-started/quick-start/` on the implementation date. Confirm current model connections, workspace building blocks, access controls, and deployment choices.
- [ ] Create the article with title `Open WebUI: cuándo conviene una interfaz propia para usar IA`, description `Cómo decidir si un equipo necesita un punto común para acceder a modelos, conocimiento y asistentes aprobados.`, section `knowledge`, category `ai-coding`, tags `[ai-coding, open-webui, modelos-de-ia, toma-de-decisiones]`, `featured: false`, and the global publication date and draft state.
- [ ] Use sections `Qué es Open WebUI`, `Qué problema resuelve`, `Cuándo conviene utilizarlo`, `Cuándo una cuenta comercial es suficiente`, `Responsabilidades de operar una interfaz propia`, `Dos ejemplos`, `Conclusión`, and `Siguiente paso`.
- [ ] Separate interface, model, knowledge, and automation layers. State that a self-managed interface does not by itself establish appropriate information handling.
- [ ] Include `Ejemplo 1: Un acceso común para asistentes aprobados` and `Ejemplo 2: Comparar respuestas entre modelos`.
- [ ] End with a CTA to define users, permitted information, model providers, access roles, support owner, and continuity requirements.
- [ ] Run `pnpm validate:public && pnpm check && pnpm build`; expect exit `0`.
- [ ] Commit the article with `content: explain when to use Open WebUI`.

### Task 5: Publish the Pydantic decision guide

**Files:**
- Create: `src/content/knowledge/pydantic-validacion-de-datos-en-automatizaciones.md`

- [ ] Verify `https://docs.pydantic.dev/latest/` and `https://docs.pydantic.dev/latest/concepts/models/` on the implementation date. Confirm how models use Python type annotations to validate input and report validation errors.
- [ ] Create the article with title `Pydantic: por qué validar los datos antes de automatizar`, description `El valor empresarial de comprobar estructura, tipos y campos requeridos antes de permitir que un proceso continúe.`, section `knowledge`, category `ai-coding`, tags `[ai-coding, pydantic, validacion-de-datos, automatizacion]`, `featured: false`, and the global publication date and draft state.
- [ ] Use sections `Qué es Pydantic`, `Qué problema resuelve`, `Cuándo conviene utilizarlo`, `Qué no puede comprobar`, `Validar antes de continuar`, `Dos ejemplos`, `Conclusión`, and `Siguiente paso`.
- [ ] Explain required fields, types, permitted values, and understandable error handling without a code tutorial. State that structural validation does not prove truth or correctness.
- [ ] Include `Ejemplo 1: Revisar una solicitud administrativa` and `Ejemplo 2: Comprobar un registro empresarial`.
- [ ] End with a CTA to define accepted data, rejection rules, correction paths, and who reviews exceptions.
- [ ] Run `pnpm validate:public && pnpm check && pnpm build`; expect exit `0`.
- [ ] Commit the article with `content: explain data validation with Pydantic`.

### Task 6: Publish the ChatGPT, Claude, and Gemini comparison

**Files:**
- Create: `src/content/knowledge/chatgpt-claude-gemini-comparativa.md`

- [ ] Review on the implementation date: `https://developers.openai.com/api/docs/models`, the OpenAI Help article explaining separate ChatGPT/API billing, `https://platform.claude.com/docs/en/about-claude/models/overview`, the Claude Help article explaining separate paid-plan/API billing, `https://ai.google.dev/gemini-api/docs/models`, `https://ai.google.dev/gemini-api/docs/pricing`, and `https://support.google.com/gemini/answer/16275805`.
- [ ] Record only in untracked working notes the current model families, stated positioning, access surface, usage-limit language, API billing unit, and subscription/API relationship. Do not commit the notes.
- [ ] Create the article with title `ChatGPT, Claude o Gemini: cómo elegir modelo y forma de pago`, description `Una comparación práctica de productos, familias de modelos, fortalezas, límites y pago mensual frente a consumo por API.`, section `knowledge`, category `ai-coding`, tags `[ai-coding, modelos-de-ia, toma-de-decisiones]`, `featured: true`, and the global publication date and draft state.
- [ ] Begin with `Revisado el 11 de agosto de 2026` and use sections `Primero separa producto, modelo y API`, `ChatGPT y los modelos de OpenAI`, `Claude y los modelos de Anthropic`, `Gemini y los modelos de Google`, `Fortalezas y límites según la tarea`, `Cuenta mensual o pago por consumo`, `Cómo tomar la decisión`, `Dos ejemplos`, `Conclusión`, and `Siguiente paso`.
- [ ] Describe current model families by documented tiers, cite every provider section, and avoid declaring a universal winner. Explain monthly products for interactive use and APIs for integrations, repeatable automation, measurable volume, and programmatic control.
- [ ] Include `Ejemplo 1: Apoyo cotidiano para redactar y analizar` and `Ejemplo 2: Clasificar solicitudes dentro de una automatización`.
- [ ] End with a CTA to compare task, frequency, required integrations, permitted information, expected volume, and review controls.
- [ ] Run `pnpm validate:public && pnpm check && pnpm build`; expect exit `0`.
- [ ] Commit the article with `content: compare AI models and billing choices`.

### Task 7: Connect the series and complete release verification

**Files:**
- Modify: all six articles created in Tasks 1–6.

- [ ] Before `Conclusión`, add `Para seguir decidiendo` with exactly two relevant internal Markdown links: delegation → n8n and comparison; n8n → delegation and Pydantic; Flowise → n8n and Open WebUI; Open WebUI → Flowise and comparison; Pydantic → delegation and n8n; comparison → delegation and Open WebUI.
- [ ] Read every article against the design and confirm: exactly two examples, conclusion, CTA, clear differentiation, audience fit, source support, and no unsupported results or disallowed public information.
- [ ] Run separately and stop at the first failure: `pnpm validate:public`, `pnpm test`, `pnpm check`, `pnpm build`, `pnpm test:e2e`, `pnpm lighthouse`, `pnpm check:links`, `git diff --check`, and `git status --short`.
- [ ] Start `pnpm dev`; review all six public routes at desktop and mobile widths; confirm headings, lists, links, typography, CTA placement, and public-safe copy; then stop the server.
- [ ] Correct any issue, rerun its relevant verification plus `pnpm build`, and commit the connected series with `content: connect AI decision guide series`.
- [ ] Push `content/ai-decision-guides` and open a Pull Request titled `content: publish AI decision guide series`, including the six-guide summary, official-source review date, public-policy review, and exact checks. Do not merge or deploy.

### Task 8: Record the private session closeout after delivery

**Files:**
- Modify only with explicit authorization: `/Users/luismiguelmalacarajimenez/Documents/Obsidian/main/proyectos/malaface.github.io/malaface.github.io.md`

- [ ] Ask for authorization before editing the existing project hub in the private vault.
- [ ] If authorized, append a concise session link and note containing branch, public PR URL, decisions, commits, checks, CI state, and pending merge/deployment. Do not copy private context to the repository or PR.
- [ ] Deliver the actual branch, commits, PR, verification evidence, CI state, unchanged user files, vault update state, and next safe action. State explicitly that merge and deployment have not occurred.
