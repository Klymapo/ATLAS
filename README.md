# ATLAS — El Archivo de las Cuatro Voces

Infraestructura de control de calidad **100 % nube, coste de software 0** para una aventura detectivesca vectorial minimalista de aprendizaje multilingüe.

- Interfaz y explicaciones: **español**
- Idioma pivote: **inglés**
- Idiomas estudiados: **francés, alemán, ruso y japonés**
- Mundo narrativo persistente: los casos se resuelven, el juego no tiene un final global.

## Estado actual
ATLAS v0.1 es un conjunto de **validadores automáticos**, no agentes de IA autónomos. El código no inventa aprobaciones ni declara verificados audios, traducciones o personajes sin evidencia. `published/manifest.json` comienza vacío. Los assets maestros todavía **no se han fijado**.

## Flujo
1. Crear contenido en `candidates/` y registrar las evidencias.
2. Revisar comparando contra referencias maestras versionadas.
3. Registrar el artefacto aprobado en `published/manifest.json` con su SHA-256 y las atestaciones requeridas.
4. CI ejecuta pruebas, valida cada elemento y bloquea los errores o revisiones pendientes.
5. Integrar **solo por Pull Request**, tras aprobar los controles obligatorios.

## Configuración necesaria del repositorio
**Settings → Rules → Rulesets / Branch protection → main**: exigir Pull Request, revisión independiente y el status `atlas-quality-gate`, sin permitir bypass. La existencia del YAML **no protege por sí sola** la rama. El conector puede publicar código, pero no garantiza configurar Rulesets; esa protección se comprueba por separado.

Los archivos de revisión en JSON **no autentican identidad**: una firma escrita a mano se puede falsificar. Para decisiones críticas, se requiere la aprobación real de otro revisor de GitHub, si existe; de lo contrario, conservar como pendiente o solicitar aprobación consciente del dueño sin llamarla independiente.

## Ejecutar en GitHub Actions / Codespaces
```sh
python -m pip install -r requirements.txt
python -m unittest discover -s tests -v
python -m atlas.gate --root .
```

Resultados: `reports/atlas.json` y `reports/atlas.md`, publicados como artifact en GitHub Actions.

**Límites:** un test automático no certifica anatomía chibi, naturalidad nativa, eficacia educativa o derechos de audio. No hay servicios comerciales, GPU ni dependencias locales requeridas.
## Diseño visual 0.2.1 — Vector minimalista, sin anime

Los cinco SVG están en [candidates/visual-pack-v02](candidates/visual-pack-v02/README.md). La CI comprueba que no se salgan de la paleta, que no incluyan recursos externos y que las declaraciones de revisión permanezcan en PENDING. La acción produce una **lámina de comparación PNG** como artifact de GitHub.

Antes de promover estos bocetos como maestros oficiales, el usuario debe aprobar el diseño de personaje y la dirección artística. No se alterará el registro de masters ni el manifiesto de producción hasta entonces.

**Cambio de dirección aprobado:** se descarta la orientación chibi del primer lote. Las ilustraciones vectoriales actuales son candidatos no certificados; solo se promoverán con auditoría visual real.

## Hito 0.2.1 — Primer banco de 20 conceptos

Se creó un banco de **20 conceptos (80 expresiones entre cuatro lenguas)** en `candidates/lexicon-v01/catalog.json`, acompañado por cinco sesiones didácticas. Ninguna palabra, ejemplo o audio está marcado como certificado; ATLAS bloquea cualquier intento de falsa publicación. `python -m atlas.candidate_lexicon --root .` genera su reporte en GitHub Actions.

## Prototipo jugable v0.3 — Caso 001
Sitio en `site/`: oficina detectivesca, pistas, cartas de memoria, deducción final, fichas comparativas FR/DE/RU/JA, exportación CSV/JSON e impresión. Guarda progreso en localStorage (sin sincronización). Las voces opcionales son TTS del navegador **no verificadas** y los dibujos y textos visibles están etiquetados como **DEMO no certificada**.

**No se publicaron contenidos en `published/`.** El sitio muestra únicamente la demo explícita para pruebas. Copia los SVG desde `candidates/visual-pack-v02`, sin alterarlos.

### Ejecutarlo desde la nube
1. En GitHub Actions, ATLAS Quality Gate prueba el código, genera `dist/` y corre navegador Chromium en vista móvil y escritorio.
2. GitHub Pages requiere ir a `Settings → Pages → Build and deployment → Source: GitHub Actions` una sola vez.
3. Al integrar un PR con CI aprobada, el workflow `Publish playable demo to GitHub Pages` publica desde `dist/` (ruta prevista `https://Klymapo.github.io/ATLAS/`). **No asumir que el enlace funciona hasta que Pages confirme el deployment.**
4. Para probar en nube sin publicar, abrir Codespaces y ejecutar `python -m tools.build_site` y `python -m http.server 4173 --directory dist`, compartiendo el puerto únicamente cuando se desee.

Dependencias de juego: HTML/CSS/JS nativos y SVG reutilizados. Herramientas de QA: Python, Pillow, CairoSVG, Node y Playwright, ejecutadas en GitHub Actions gratuitos para repositorios públicos, sujetos a condiciones de GitHub.

## ATLAS v0.8 — escritura y despliegue continuo
La web incluye una **práctica escrita de cuatro palabras en cuatro idiomas**, con género/artículo FR/DE, ayudas explícitas y resultados en localStorage. Es material demo NO certificado y no afirma retención duradera. Motor independiente y ampliable por datos: `site/practice.js`.

Para hospedar también en Cloudflare Workers con el mismo método de Pokémon Infinite, conectar repo GitHub y compilar `dist/` según [`docs/CLOUDFLARE.md`](docs/CLOUDFLARE.md). **No se ha activado Cloudflare todavía; GitHub Pages continúa como hosting confirmado.**
