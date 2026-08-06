# Navegación de colecciones y Live Projects

## Objetivo

Hacer accesibles desde la navegación principal todas las colecciones publicadas, diversificar los CTA de Inicio y agregar al catálogo manual exclusivamente T-Ethos y Nexus HVAC. Nexus HVAC será el único proyecto destacado en Inicio.

## Alcance

- Agregar Blog y Recursos al menú superior.
- Mantener accesibles Inicio, Conocimiento, Guías, Blog, Laboratorio, Proyectos, Recursos y Ahora.
- Repetir en el pie de página las siete colecciones públicas como ruta alternativa.
- Cambiar los CTA de Inicio para que Conocimiento deje de ser su destino principal.
- Agregar dos registros manuales a Live Projects a partir de sus páginas públicas aprobadas.
- Verificar navegación y ausencia de desbordamiento horizontal en escritorio, 375 px y 320 px.

Quedan fuera de alcance los cambios de diseño general, un menú móvil nuevo, el descubrimiento automático de proyectos, enlaces a repositorios, conectores, APIs, analytics, despliegue y merge.

## Navegación

`siteConfig.navigation` será la fuente única del menú superior y contendrá, en este orden:

1. Inicio
2. Conocimiento
3. Guías
4. Blog
5. Laboratorio
6. Proyectos
7. Recursos
8. Ahora

En escritorio se conserva la barra existente. Por debajo de 64 rem se conserva la segunda fila horizontal desplazable que ya usa el sitio. Los enlaces permanecen en el DOM, son alcanzables mediante teclado y no amplían el ancho del documento. Solo se ajustará el espaciado del menú si la verificación de escritorio demuestra que es necesario.

El pie de página incluirá enlaces a Conocimiento, Guías, Blog, Laboratorio, Proyectos, Recursos y Ahora, además de conservar Sobre mí, Contacto y RSS.

## CTA de Inicio

Los destinos quedarán distribuidos de esta forma:

- Hero principal: `Ver proyectos` → `/live-projects/`.
- Hero secundario: `Explorar recursos` → `/recursos/`.
- Enlace de Contenido destacado: `Ir al Blog` → `/blog/`.
- CTA final principal: `Contactar` → `/contacto/`.
- CTA final secundario: `Abrir Guías` → `/playbooks/`.

No se cambia la estructura de las secciones, sus componentes ni el lenguaje visual existente.

## Catálogo manual de Live Projects

`src/data/live-projects.json` conservará el contrato estricto actual. Las dos entradas usarán solo datos observados el 5 de agosto de 2026 en las páginas públicas aprobadas. Ambas usarán `2026-08-05T00:00:00.000Z` como `updatedAt`; este valor representa la fecha de revisión del registro en el catálogo, no una fecha de lanzamiento.

### Nexus HVAC

- ID estable: `nexus-hvac`.
- Nombre: `Nexus HVAC`.
- Descripción: `Servicios de instalación, reparación y mantenimiento de sistemas de aire acondicionado y refrigeración para hogares y negocios en Guadalajara.`
- Tecnología verificable por la entrega pública: `Next.js`.
- URL: `https://nexus-hvac.malacaran8n.uk/`.
- Estado: `production`.
- Destacado: `true`.

### T-Ethos

- ID estable: `t-ethos`.
- Nombre: `T-Ethos`.
- Descripción: `Presencia digital para profesionales y artesanos mediante automatizaciones, asistentes de IA, páginas web y consultoría personalizada.`
- Tecnología verificable por la entrega pública: `Next.js`.
- URL: `https://t-ethos.malacaran8n.uk/`.
- Estado: `production`.
- Destacado: `false`.

Nexus HVAC será la única ficha de proyecto en Inicio. Ambas fichas aparecerán en la página Proyectos. No se publicarán métricas, resultados, fechas de lanzamiento, otras tecnologías ni información obtenida de notas privadas.

## Comportamiento y estados

El catálogo continuará siendo un archivo JSON importado durante el build y validado por `parseProjectRecords`. Si un registro incumple el contrato, el build o las pruebas fallarán con la validación existente. No se agregan solicitudes en runtime ni nuevos estados de interfaz.

El enlace activo del menú seguirá calculándose con la ruta actual. En pantallas estrechas, cada enlace podrá recibir foco y desplazarse dentro del contenedor horizontal sin generar desplazamiento horizontal del documento.

## Pruebas y verificación

La implementación seguirá TDD:

1. Actualizar primero las pruebas unitarias y de build para exigir las ocho rutas del menú, las siete colecciones del pie, los CTA aprobados, las dos fichas exactas y Nexus HVAC como destacado.
2. Ejecutar esas pruebas y confirmar que fallan por la ausencia de los cambios.
3. Aplicar la implementación mínima.
4. Confirmar que las pruebas pasan.
5. Agregar o ampliar pruebas E2E que recorran la navegación en escritorio, 375 px y 320 px, comprueben acceso a los enlaces y verifiquen `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.

Antes de entregar se ejecutará el checklist vigente: `pnpm validate:public`, `pnpm test`, `pnpm check`, `pnpm build`, `pnpm test:e2e`, `pnpm lighthouse`, `pnpm check:links`, `git diff --check` y `git status --short`.

## Privacidad y publicación

El repositorio, el build y el sitio no accederán al vault de Obsidian. La wiki privada solo registrará el estado operativo de la sesión. No se hará merge, despliegue ni publicación sin autorización explícita.
