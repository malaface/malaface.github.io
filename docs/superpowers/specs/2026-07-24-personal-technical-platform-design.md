# Plataforma de marca personal técnica — Diseño

## Propósito

Transformar `malaface.github.io` en la plataforma pública de Luis Miguel Malacara Jiménez: un espacio orientado a ayudar a profesionales de la salud, negocios familiares y PYMEs de servicios que trabajan con pasión y desean ayudar a otras personas. No es un CV ni una copia del vault privado.

La promesa editorial parte de sus resultados: **más alcance, mejor seguimiento de clientes, gestión financiera empresarial más clara y menos tareas repetitivas**. Automatización, desarrollo de producto, IA aplicada y knowledge systems son medios para avanzar hacia esos resultados, no el centro del mensaje.

La comunicación no atribuye resultados de clientes no verificados. Presenta con honestidad las audiencias a las que Luis busca ayudar, los problemas que desea abordar y los métodos técnicos que está desarrollando.

## Evidencia usada

El diseño se apoya exclusivamente en fuentes revisadas durante el descubrimiento:

- `malaface.github.io` tiene una página HTML mínima y GitHub Pages activo, sin framework ni Actions.
- Los repositorios locales muestran trabajo en Next.js, TypeScript, Tailwind, Supabase, RLS, pruebas unitarias/E2E/accesibilidad, Kotlin/libGDX y documentación de producto.
- El vault usa Markdown curado con frontmatter OKF, wikilinks, índices y timestamps. Los temas publicables detectados son knowledge systems, AI coding/context engineering, automatización, seguridad de aplicaciones, desarrollo de producto y documentación.
- Ninguna página pública de proyecto ha sido proporcionada y aprobada todavía; Live Projects permanece vacío hasta recibir una URL explícita del propietario.
- La dirección de marca proporcionada por el propietario define tres audiencias: profesionales de la salud, negocios familiares y PYMEs de servicios; y cuatro resultados: alcance, seguimiento de clientes, claridad financiera empresarial y automatización de tareas repetitivas.

No se infiere experiencia adicional a partir de estas fuentes.

## Límites de seguridad y privacidad

Estas reglas son invariantes de producto y se validan en CI:

1. El sitio **no accede al vault de Obsidian**. No habrá scripts de lectura, checkout del vault, tokens de vault, rutas de vault ni sincronización con Obsidian.
2. Las notas públicas vivirán en este repositorio, bajo `src/content/`. Publicar una idea derivada del vault requiere crear o editar manualmente un archivo público en este repositorio.
3. El sitio solo puede decir que Obsidian se usa como sistema personal de conocimiento y explicar aplicaciones generales de ese método. No muestra contenido, enlaces, nombres de notas, grafo, rutas, metadatos ni datos del vault.
4. Se prohíben NOC, Data Center, infraestructura operativa, servidores, topologías, runbooks privados, incidentes, credenciales, IPs, sistemas internos, datos identificables de clientes, datos financieros privados o personales, números de cuenta, registros financieros sensibles, diario personal y datos personales sensibles. La gestión financiera genérica de un negocio o una PYME sí es contenido público permitido.
5. El importador de contenido no existe por diseño. Un validador local/CI revisa el contenido que ya vive en el repositorio y rechaza patrones, categorías y rutas bloqueados.
6. Live Projects es un catálogo manual sin descubrimiento ni conectores externos. Solo acepta páginas públicas cuya URL haya sido proporcionada y aprobada explícitamente por el propietario.

## Decisión tecnológica

Se utilizará **Astro** con salida estática (`output: 'static'`).

Astro es la opción elegida porque entrega HTML estático adecuado para GitHub Pages, tiene colecciones de contenido tipadas, soporta Markdown/MDX, sitemap, RSS y SEO sin un servidor de aplicación, y permite mantener JavaScript mínimo. Las islas se limitan a la búsqueda y al selector de tema.

No se elegirá Next.js export estático porque su complejidad no aporta valor en un sitio editorial sin backend. Hugo tampoco se elegirá porque TypeScript facilita los validadores y el catálogo manual tipado.

## Dirección visual

La dirección aprobada es **Command Center**: interfaz oscura por defecto, precisa, editorial y legible; acentos verdes reservados para estado y navegación técnica. La jerarquía visual presenta primero las audiencias y sus resultados; las capacidades técnicas aparecen como medios de apoyo. La página evita estética militar, telemetría falsa o cualquier referencia a NOC, Data Center o infraestructura.

Elementos visuales:

- Marca `LM / SYSTEMS` y navegación compacta.
- Titulares editoriales de gran escala y copy humano en español.
- Etiquetas técnicas discretas para categorías y estado de contenido.
- Tarjetas con bordes finos, espaciado generoso y alta legibilidad.
- Modo claro opcional, persistido en el navegador.
- Diseño responsive, accesible con teclado, contraste AA y reducción de movimiento.

## Sitemap y propósito de cada ruta

| Ruta | Propósito | Fuente de contenido |
| --- | --- | --- |
| `/` | Audiencias, resultados buscados, identidad, medios técnicos verificados, notas y proyectos destacados | Configuración editorial y colecciones públicas |
| `/sobre-mi/` | Narrativa de método, aprendizaje y construcción de sistemas | Archivo manual público |
| `/knowledge-hub/` | Índice de artículos técnicos reutilizables | Colección `knowledge` |
| `/knowledge-hub/[slug]/` | Artículo con breadcrumbs, tags, tiempo de lectura y relacionados | Markdown/MDX público |
| `/playbooks/` | Biblioteca de guías públicas de automatización, desarrollo y productividad | Colección `playbooks` |
| `/blog/` | Artículos de reflexión y aprendizaje | Colección `blog` |
| `/laboratorio/` | Scripts, experimentos y herramientas seleccionadas | Colección `lab` |
| `/live-projects/` | Páginas públicas de proyectos aprobadas manualmente | `src/data/live-projects.json` |
| `/recursos/` | Snippets, plantillas y herramientas aprobadas | Colección `resources` |
| `/now/` | Qué se aprende, construye e investiga, redactado para publicación | Archivo manual público |
| `/contacto/` | Canales que el usuario configure explícitamente | Configuración del sitio |
| `/tags/[tag]/` | Archivo por tag | Colecciones públicas |
| `/search/` | Búsqueda global Pagefind | Índice estático |
| `/rss.xml` y `/sitemap-index.xml` | Distribución y descubrimiento | Generados durante build |

Las secciones que no tengan contenido aprobado mostrarán una página de estado editorial; no se inventarán entradas ni categorías vacías.

## Modelo de contenido público

Cada archivo público usa frontmatter tipado:

```yaml
title: Context engineering para proyectos de software
description: Cómo convierto investigación y decisiones en contexto reutilizable.
publishedAt: 2026-07-24
updatedAt: 2026-07-24
section: knowledge
category: knowledge-systems
tags: [ai-coding, context-engineering, metodologia]
featured: true
draft: false
```

`section`, `category` y `tags` se validan contra una lista explícita de valores permitidos. Las categorías iniciales son `automation`, `knowledge-systems`, `ai-coding`, `application-security`, `product-building` y `developer-experience`, porque son las únicas sustentadas por evidencia actual. Las categorías sin contenido no se renderizan.

Los wikilinks no se importan desde Obsidian. Si un artículo público necesita enlaces internos, usa enlaces Markdown normales a rutas públicas del sitio. Los backlinks y relacionados se calculan a partir de tags, categoría y enlaces públicos dentro de `src/content/`.

## Arquitectura de datos y automatizaciones

```text
Markdown/MDX público en este repositorio ──┐
Configuración editorial pública ───────────┼──> validación ──> Astro build ──> GitHub Pages
Catálogo manual de páginas aprobadas ──────┘
```

### Contenido

El autor crea contenido público dentro de este repositorio. No existe conexión con el vault. Una guía de contribución explica cómo resumir una idea de forma segura sin copiar notas privadas.

### Live Projects

`src/data/live-projects.json` se edita manualmente y contiene únicamente páginas públicas aprobadas. Cada registro usa `id`, `name`, `description`, `technologies`, `productionUrl`, `status`, `updatedAt` y `featured`. No almacena enlaces de código ni identificadores de repositorios. Si el propietario no ha proporcionado URLs, el archivo es `[]` y tanto la ruta como Inicio muestran un estado vacío honesto.

## Componentes y comportamiento

- `BaseLayout`: metadatos, navegación, pie, tema, Open Graph y analítica opcional.
- `CommandHeader`: identidad, navegación desktop/móvil y búsqueda.
- `Hero`: audiencias y resultados buscados primero; especialidades técnicas con evidencia editorial como medios.
- `ContentCard`, `ProjectCard`, `TagList`: tarjetas consistentes y accesibles.
- `TableOfContents`: generado de encabezados de artículo.
- `RelatedContent`: puntuación por tag/categoría, sin recomendar borradores.
- `ActivityFeed`: publicaciones públicas recientes de las colecciones editoriales.
- `Search`: Pagefind estático, sin servicio externo ni rastreo del visitante.
- `ThemeToggle`: preferencia del sistema con selector manual persistente.

Los fallos de validación de privacidad bloquean build y deploy. Live Projects no depende de red ni de servicios externos durante el build.

## SEO, distribución y rendimiento

- Metadatos únicos por ruta, canonical y tarjetas Open Graph.
- Sitemap y RSS generados en build.
- Datos estructurados `Person`, `WebSite`, `BlogPosting` y `SoftwareSourceCode` cuando corresponda.
- Fuentes locales o del sistema, imágenes optimizadas y JavaScript mínimo.
- Objetivo Lighthouse: al menos 95 en Performance, Accessibility, Best Practices y SEO en las rutas críticas de producción.

## CI/CD

El workflow de pull request ejecuta: validación de frontmatter y privacidad, pruebas unitarias, `astro check`, build, comprobación de enlaces y Lighthouse.

El workflow de `main` repite las validaciones y publica el directorio estático mediante GitHub Pages. No ejecuta enriquecimiento externo de proyectos. La publicación usa permisos mínimos de Pages e `id-token`.

## Criterios de aceptación

1. `malaface.github.io` construye y despliega como sitio Astro estático en GitHub Pages.
2. Ningún comando, workflow, dependencia ni configuración lee o menciona una ruta, token o contenido del vault.
3. Ningún contenido o navegación contiene NOC, Data Center o datos de infraestructura/operación privada.
4. Inicio explica primero cómo Luis busca ayudar a profesionales de la salud, negocios familiares y PYMEs de servicios mediante mayor alcance, mejor seguimiento de clientes, claridad financiera empresarial y automatización de tareas repetitivas; después presenta la tecnología como medio, sin parecer CV ni atribuir resultados no verificados.
5. Las rutas del sitemap funcionan en móvil y escritorio, con navegación por teclado.
6. Knowledge Hub, Playbooks, Blog, Lab y Recursos se alimentan solo de Markdown/MDX público tipado.
7. Búsqueda, RSS, sitemap, tags, tabla de contenidos, relacionados y metadatos sociales se generan correctamente.
8. Live Projects solo lista páginas públicas proporcionadas y aprobadas manualmente; sin URLs aprobadas muestra un estado vacío y no inventa proyectos.
9. CI bloquea contenido prohibido y publica únicamente después de todas las verificaciones.

## Alcance posterior

La primera entrega incluye la plataforma, sus colecciones, dos o más piezas de contenido público redactadas desde cero, CI/CD y documentación de mantenimiento. Las páginas de proyectos se incorporan únicamente cuando el propietario proporcione y apruebe sus URLs públicas. Analítica se mantiene desactivada hasta que el usuario elija un proveedor y su política de privacidad.
