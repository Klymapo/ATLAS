# ATLAS v0.9 — app instalable + HUB + Bloque 1
**Estado:** implementación de demostración en rama/PR. Arte vectorial minimalista. Sin anime ni estilos chibi. Interfaz española e inglés como pivote.

## Uso desde Android (como Pokémon Infinite)
1. Abrir la **misma dirección de Cloudflare** del juego en **Chrome**.
2. Menú ⋮ → **Instalar aplicación** o **Añadir a pantalla de inicio**, según versión del navegador.
3. Confirmar. **Abrir desde el icono de ATLAS**, no desde una pestaña existente.
4. El manifest \`display: standalone\` y \`display_override: fullscreen, standalone\` solicitan una ventana independiente sin barra URL. El comportamiento exacto depende del navegador/plataforma. En una pestaña normal Chrome conserva sus barras.
5. La app genera iconos 192/512 desde el \`site/favicon.svg\` en el build cloud; no comparte los iconos de Pokémon.
6. PWA utiliza \`sw.js\` para cachear el *shell* de la demo. Offline después de la primera carga correcta. La caché **no sincroniza** localStorage; exporta/importa JSON para mover progreso entre dominios o dispositivos.

**No instalar desde dos dominios y esperar sincronización:** \`https://klymapo.github.io/ATLAS/\` y \`https://atlas.calimapo55.workers.dev/\` tienen orígenes y almacenamiento distintos. Migrar por \`Progreso → Exportar/Importar\`.

## HUB renovado
- Portada con llamado narrativo real («Hay una carta esperando»).
- Bloque 1, estado en 6 escenas, continuidad de decisiones y alias.
- Caso 001 con progreso de pruebas.
- Siguiente recomendación formativa (fichas, Memory o escritura según avance).
- Cuatro tarjetas de idiomas: aciertos **sin ayuda** de una práctica aún **no certificada**, sin fingir dominio.
- Mensaje de Nora, acceso rápido a repaso y botón de instalación web.
- Conserva enlaces de inducción anteriores, para usuarios y pruebas existentes.

## Bloque 1 interactivo · «La firma del día siguiente»
**Guion fuente:** \`site/data/block1.js\`. Las escenas, textos, objetos, elecciones y resultados son datos, no HTML duplicado por capítulo. El motor narrativo de \`site/app.js\` reutiliza 6 tipos de interacción de este bloque.

| Escena | Mecánica | Objetivo narrativo | Condición |
| --- | --- | --- | --- |
| 01 · La carta que llegó antes | inspeccionar fechas + clasificar inferencia | gancho y curiosidad | examinar emisión y matasellos, elegir interpretación |
| 02 · Puerto Umbral | inspeccionar puerta y plano | contexto espacial y autoridad de la organización | examinar ambas placas |
| 03 · Nora Vale | preguntas no exclusivas | quién es, por qué recluta, qué es Archivo | preguntar quién es y por qué te llama |
| 04 · Ficha de ingreso | alias opcional + método | identidad elegida y agencia | escoger método |
| 05 · Registro 417 | documento visible + identificación de objeto en inglés | enlazar lenguaje y pista | estudio previo de cuatro palabras + reconocer book |
| 06 · La primera puerta | elección de continuación | cliffhanger + caso local | abrir Caso 001 o releer |

**Guion:** las fechas son en-universo 11 y 12 de octubre, no cálculo con la hora real del teléfono. Nora no conoce la autoría, una firma sola no prueba falsificación y no se acusa a nadie sin evidencia. El sello del sobre puede tener continuidad futura en otro expediente. Se puede volver a escenas anteriores y conservar decisiones.

**Criterios:** el Bloque 1 es narrativa candidata, no canon certificado; lenguaje de cuatro idiomas se hereda de fichas de DEMO PENDING. El juego deja superar una microprueba de reconocimiento luego de aprender, sin afirmar retención de larga duración ni otorgar una placa.

## QA
- Build produce dist/ **allowlisted**, manifiesto, iconos PNG y assets SVG candidatos copiados sin modificación.
- E2E móvil/escritorio: HUB, sin desbordamiento, PWA manifest y service worker, recorrer 6 escenas con memoria guardada, compuerta de estudio, compatibilidad con la inducción y caso anterior.
- Scripts JS verificados por Node; tests Python verifican fuente narrativa y iconos reales.
- Despliegue en Cloudflare sigue el Git conectado \`main\` y la configuración Build ya verificada.

## Backlog siguiente
1. Adoptar diseño de escena reutilizable y guion JSON puro con validador más estricto (ramas sin salida, spoilers, identidad, idioma).
2. Ejercicios que evalúan frases propias y repaso espaciado real por destreza antes de permitir medallas de aprendizaje.
3. Música ambiental y SFX opcionales con prioridad del audio didáctico.
4. Exportar progreso y sincronizar solo con consentimiento explícito; GitHub Actions nocturno **no accede** al teléfono.
5. Investigar pictogramas/imágenes de objetos y su reconocimiento, sin confundir imagen decorativa con competencia.

Referencia técnica: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display
