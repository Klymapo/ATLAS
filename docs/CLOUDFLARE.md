# ATLAS en Cloudflare Workers · Cloud-only · $0

## Qué ya está configurado
- `wrangler.jsonc` (raíz): `assets.directory: "./dist"`; no contiene secretos.
- `tools/build_site.py`: genera carpeta pública de una allowlist. Nunca apuntar a la raíz del repo, porque `candidates/`, `reports/`, `master/` o contenido no aprobado no debe quedar público.
- `main` protegido con `atlas-quality-gate`; GitHub Pages existente queda operativo como respaldo mientras Cloudflare no esté conectado.

## Conexión una sola vez en Cloudflare Dashboard
1. **Workers & Pages → Create application → Worker → Import/connect Git repository**.
2. Autorizar GitHub y seleccionar **Klymapo/ATLAS**, rama **main**.
3. Nombre del Worker: `atlas-archivo` (igual que el archivo Wrangler). Si Cloudflare asigna otro nombre, actualizar Wrangler antes de desplegar.
4. Root path: `/`.
5. Build command: `python3 -m venv .atlas-build-env && .atlas-build-env/bin/pip install -r requirements.txt && .atlas-build-env/bin/python -m tools.build_site --root . --output dist`. El entorno temporal se crea **en el builder cloud**, nunca en tu laptop y nunca entra a `dist/`. Cloudflare dispone de Python en su imagen de construcción.
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
