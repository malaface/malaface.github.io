# Contribuir

Este repositorio mantiene una marca personal para ayudar a profesionales de salud, negocios familiares y PYMEs de servicios. No es un currículum ni un canal para publicar detalles operativos, datos sensibles o proyectos no aprobados.

Antes de proponer cambios, sigue la guía operativa en [docs/maintenance.md](docs/maintenance.md). Define el contenido público desde cero o reescribe manualmente las ideas; el sitio no tiene acceso a la bóveda de Obsidian.

Para cualquier cambio de contenido o catálogo, ejecuta:

```bash
pnpm validate:public
pnpm test
pnpm check
pnpm build
```

Envía los cambios mediante pull request. No publiques hasta que CI haya terminado correctamente. Las páginas de Live Projects requieren una URL pública proporcionada y aprobada por su propietario; el catálogo es manual y no enlaza a repositorios de código fuente.
