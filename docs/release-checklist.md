# Checklist de release

## Verificación local

Ejecuta desde la raíz del repositorio y no publiques si algún comando falla:

```bash
pnpm test
pnpm check
pnpm build
pnpm test:e2e
pnpm lighthouse
git diff --check
git status --short
```

Confirma que las pruebas y comprobaciones terminan con código `0`, que `git diff --check` no imprime errores y que `git status --short` contiene únicamente los archivos previstos para el release.

## Configuración de GitHub Pages

En el repositorio de GitHub abre:

`Settings → Pages → Build and deployment → Source: GitHub Actions`

La publicación debe usar el workflow versionado y únicamente el artefacto estático `dist/` generado por el build.
