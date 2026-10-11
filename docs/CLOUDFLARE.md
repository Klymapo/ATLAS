# ATLAS en Cloudflare Workers · Cloud-only · $0

## Qué ya está configurado
- `wrangler.jsonc` (raíz): `assets.directory: "./dist"`; no contiene secretos.
- `tools/build_site.py`: genera carpeta pública de una allowlist. Nunca apuntar a la raíz del repo, porque `candidates/`, `reports/`, `master/` o contenido no aprobado no debe quedar público.
- `main` protegido con `atlas-quality-gate`; GitHub Pages existente queda operativo como respaldo mientras Cloudflare no esté conectado.

## Conexión una sola vez en Cloudflare Dashboard
1. **Workers & Pages → Create application → Worker → Import/connect Git repository**.
2. Autorizar GitHub y seleccionar **Klymapo/ATLAS**, rama **main**.
3. **Worker existente: `atlas`** (nombre verificado en la integración de GitHub/Cloudflare el 11 de octubre de 2026). El campo `name` de Wrangler ya coincide; no renombrar el Worker sin actualizar el repositorio.
4. Root path: `/`.
5. **Build command (obligatorio):** `python3 -m tools.build_site --root . --output dist`. Cloudflare ya instala automáticamente `requirements.txt` en el builder de este proyecto (confirmado en el log del 11 de octubre de 2026), por lo que el comando debe generar `dist/` directamente. Si la instalación automática deja de funcionar, configurar explícitamente la instalación de dependencias antes del build.
6. Deploy command: `npx wrangler deploy`.
7. Activar previews de PR para revisar cambios si está disponible. Producción debe usar solo `main`.
8. Comprobar la URL real `*.workers.dev` que Cloudflare devuelva. **No inventar ni presuponer URL**.

El Static Assets Worker permite servir assets sin ejecutar un Worker para cada solicitud. Las solicitudes estáticas y el almacenamiento de assets se indican gratuitos sin tope de solicitudes estáticas; siguen existiendo límites de plataforma/cuenta. No añadir base de datos, IA o servicios de pago.

## Migración segura desde GitHub Pages
GitHub Pages (`klymapo.github.io`) y Cloudflare (`*.workers.dev`) son **orígenes distintos**: sus datos de localStorage no se comparten. En el sitio antiguo entra a **Progreso → Exportar progreso JSON**, guarda el archivo en tu teléfono; luego abre la nueva versión en Cloudflare, entra a **Progreso → Importar progreso JSON** y selecciona el archivo. La importación reemplaza el estado local **solo después de tu confirmación**, lo valida y conserva la estructura de partidas antiguas. No utilices Cloudflare como dirección principal hasta probar esa migración con una copia.

Nunca publicar los JSON personales en un repositorio público.

## Criterio para publicar
GitHub requiere PR y verificación de calidad para actualizar main. Cloudflare despliega al detectar un cambio en main. Una acción nocturna solo genera rama/PR; no publica contenido sin revisión y QA. Para revisar si el sitio se sirve, observar Logs/Deployments en Cloudflare. No prometer que GitHub puede leer datos locales de navegador.

## Flujo nocturno
Mismo principio que Pokémon Infinite: leer instrucciones → inspeccionar progreso disponible → escribir en archivos separados de datos/motor → ejecutar validadores → simular recorrido móvil → revisar pistas y pedagogía → registrar evidencia → PR → merge solo cuando los filtros aprueben.

Fuentes:
- Workers Static Assets https://developers.cloudflare.com/workers/static-assets/
- Workers GitHub Integration https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/
- Workers Builds image https://developers.cloudflare.com/workers/ci-cd/builds/build-image/

## Solución al error «assets.directory ... /repo/dist does not exist»

En los logs de Cloudflare del 2026-10-11 el entorno instaló `bun`, Pillow y CairoSVG, **pero pasó directamente a** `npx wrangler deploy`. No hubo paso `Build command`: `dist/` no existía. Esto no exige cambiar `wrangler.jsonc` ni exponer el código fuente.

- Dentro de **Workers & Pages → atlas → Settings → Build** establecer exactamente:
  - **Build command:** `python3 -m tools.build_site --root . --output dist`
  - **Deploy command:** `npx wrangler deploy`
  - **Root directory:** raíz del repositorio `/`.
- Guardar y elegir **Retry deployment**; las configuraciones de build actualizadas se aplican al reintentar la compilación.
- En el log exitoso debe verse el comando de build, el JSON `{"result": "DEMO_ONLY", ...}` generado por el constructor y solo después Wrangler subiendo los assets.
- Si el nombre del Worker en Cloudflare no coincide con `atlas` en `wrangler.jsonc`, corregirlo antes de intentar publicar.

**Importante:** Cloudflare Workers Builds no toma el *Build command* de la configuración Custom Builds de Wrangler. El campo obligatorio se establece en el panel de Cloudflare; cambiar solamente el archivo de GitHub no puede reparar un proyecto cuyo Build command está vacío.

Fuente oficial: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ 
