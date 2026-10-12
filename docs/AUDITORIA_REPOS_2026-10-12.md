# ATLAS · auditoría de mantenimiento (2026-10-12)

**Dictamen:** conservar como producto educativo experimental autónomo, sin mezclar con Rupert ni con los RPG.

- Inventario de **75 archivos** rastreados, centrados en la demo web, validadores Python, tests JS/Playwright y candidatos de léxico y arte. No hay razón para purgar versiones pedagógicas sin evaluar su valor didáctico.
- `published/manifest.json` y el quality gate distinguen candidatos de contenido certificado. La app todavía contiene material de demostración: no presentar el léxico o audio como traducción validada o nivel alcanzado automáticamente.
- CI ejecuta Python, validación de manifiestos, comprobación JS, pruebas de aprendizaje y navegador Playwright. Varias ejecuciones recientes terminaron PASS. **No equivale** a auditoría lingüística humana.
- Una misma rama podía acumular validaciones de navegador obsoletas. Se configuró **concurrencia con cancelación** para ahorrar minutos y priorizar el último commit.
- GitHub Pages aparece habilitado; Cloudflare posee configuración y guía, pero no se comprobó despliegue externo desde aquí.
- `localStorage` no se sincroniza entre orígenes de GitHub Pages y Cloudflare. Exportar/importar progreso usando las funciones de la app antes de mudarse de URL.

**Conservar:** `master/`, `candidates/`, `tests/`, `site/` y reportes disponibles como artifacts. No automatizar publicación de material no aprobado.

**Próximo paso recomendado:** incorporar tests de contenido A2/C1 revisados por humanos y una matriz de cobertura de idiomas; no aumentar consumo de nube sin un beneficio pedagógico demostrable.
