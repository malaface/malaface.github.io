# Mantenimiento del sitio

Esta es la fuente única de operación para publicar contenido, curar el catálogo de proyectos y revertir una publicación. El sitio es una marca personal orientada a ayudar a profesionales de salud, negocios familiares y PYMEs de servicios; no es un currículum.

## Publicar contenido

1. Crea un archivo Markdown o MDX en la colección apropiada de `src/content` (`knowledge`, `playbooks`, `blog`, `lab` o `resources`).
2. Completa el frontmatter tipado: `title`, `description`, `publishedAt`, `section`, `category`, `tags`, `featured` y `draft`. Añade `updatedAt` o `externalUrl` solo cuando corresponda. Consulta `src/content.config.ts` para los valores válidos de `category`.
3. Redacta el artículo para una audiencia pública, con afirmaciones que puedan comprobarse. No inventes resultados, proyectos, clientes ni evidencia.
4. Ejecuta, en este orden, `pnpm validate:public && pnpm test && pnpm build`.
5. Abre un pull request y publica únicamente después de que CI haya terminado correctamente.

Una idea desarrollada originalmente en Obsidian debe reescribirse manualmente como un artículo público seguro y autocontenido. El sitio no tiene acceso a la bóveda de Obsidian: no la lee, indexa ni enlaza. Obsidian puede mencionarse de forma general como práctica o herramienta, nunca como fuente conectada al sitio.

Antes de abrir el pull request, confirma:

- [ ] El artículo ayuda a la audiencia definida y no presenta el sitio como CV.
- [ ] No contiene NOC, Data Center, infraestructura, infrastructure ni detalles operativos.
- [ ] No contiene datos personales, secretos, credenciales, direcciones internas, información financiera ni otro dato sensible.
- [ ] No promete ni atribuye resultados que no estén sustentados por evidencia pública.
- [ ] Los enlaces apuntan a destinos públicos revisados y el contenido se entiende sin material privado.

## Agregar una página de proyecto

Live Projects es un catálogo manual de páginas públicas aprobadas. No descubre proyectos, no usa conectores y no contiene enlaces a repositorios de código fuente.

Agrega una página solo cuando la persona propietaria haya proporcionado y aprobado explícitamente su URL pública. Entonces incorpora manualmente un `ProjectRecord` completo a `src/data/live-projects.json`; no agregues entradas de ejemplo ni rellenes datos desconocidos. Cada registro debe incluir exactamente estos campos:

```json
{
  "id": "identificador-estable",
  "name": "nombre público aprobado",
  "description": "descripción pública aprobada y verificable",
  "technologies": ["tecnología aprobada"],
  "productionUrl": "https://pagina-publica-aprobada.example",
  "status": "production",
  "updatedAt": "2026-08-05T00:00:00.000Z",
  "featured": false
}
```

Usa una URL HTTP(S) pública sin credenciales, una fecha ISO completa y uno de estos estados: `production`, `maintenance` o `archived`. Sustituye todos los valores ilustrativos por los datos aprobados antes de guardar el archivo. Ejecuta las validaciones de la sección anterior y abre el pull request.

## Privacidad

El sitio publica solo material preparado para ser público. No accede a la bóveda de Obsidian ni recibe su contenido automáticamente. No copies notas privadas: reescribe de forma manual, elimina contexto reservado y revisa cada afirmación.

No publiques información de personas, organizaciones o sistemas que no haya sido aprobada para difusión. Si hay duda sobre el permiso, la exactitud de un dato o la sensibilidad de un detalle, no lo publiques hasta contar con confirmación explícita.

## Rollback

Para retirar una publicación desplegada, identifica el commit de despliegue que introdujo el cambio y reviértelo con Git. Abre un pull request con esa reversión; al aprobarse y completarse CI, el push a `main` vuelve a desplegar la versión revertida en GitHub Pages.

No edites manualmente el sitio publicado como sustituto del rollback. Después de revertir, confirma que la página retirada ya no está en el artefacto generado y documenta la razón en el pull request.
