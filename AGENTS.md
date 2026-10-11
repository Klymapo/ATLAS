# ATLAS — Rutina de desarrollo continuo (inspirada en Pokémon Infinite)

**Regla principal:** incrementar aprendizaje medible, no solo crear más capítulos. La experiencia crece indefinidamente; cada expediente es resoluble, el mundo no tiene cierre.

## Orden en cada ejecución
1. Leer `docs/design-v07/README.md`, `docs/design-v06/README.md`, la documentación de arte y el último informe de calidad.
2. Leer problemas abiertos, cambios de PR y respuestas recientes. Nunca asumir progreso telefónico si solo está en localStorage.
3. Elegir prioridad: fallos funcionales y audio; pedagogía (recuperación independiente, género y gramática); contenido aprobado listo; historia candidata (solo si aporta contenido útil).
4. Programar **motores una vez**: examinar, escribir, seleccionar, reconstruir, comparar pruebas, gramática. El contenido nuevo entra por datos validados, no por cambios de UI para cada historia.
5. Registrar cada propuesta en `candidates/`, con fuentes lingüísticas, licencias, continuidad narrativa, ilustraciones que coincidan con referencias maestras y estados PENDING hasta revisión.
6. Verificar la implementación en navegador Chromium móvil/escritorio y tests de contenido; fallos bloquean integración.
7. Crear PR compacto, dejar capturas/logs y resumen **sin spoilers**. No modificar `master/`, ni `published/` sin las atestaciones requeridas.
8. Si la revisión no pasó o no hay progreso real, mejorar mecanismos de enseñanza o dejar borrador. **No fabricar cifras, aprobaciones o episodios**.

## Separar responsables
- Story editor: coherencia de pistas, motivaciones, diálogos; cada línea de aprendizaje debe servir la historia.
- Linguists: cuatro verificaciones separadas; no autoaprobar textos de idioma.
- Pedagogy: preguntas sin respuestas visibles, uso de ayudas registrado, repaso espaciado, habilidad por idioma.
- Visual: comparación contra masters originales, coherencia de paleta/silueta, revisión humana en diseños nuevos.
- QA integrator: validadores, secuencia de experiencia, seguridad, licencias, compatibilidad de guardado, pruebas de navegador.

## Sitio y hosting
El repositorio es **Klymapo/ATLAS** y el Worker de destino se llama **atlas-archivo**. `wrangler.jsonc` publica únicamente `dist/`, generada por Python de forma reproducible. GitHub Pages ya funciona y debe mantenerse hasta confirmar que Workers está desplegado. **La conexión del repositorio con Cloudflare requiere un paso en la cuenta Cloudflare**.

## Política de progreso
`practiceAttempts` en el navegador incluye respuesta correcta, idioma, modalidad y ayuda; es información privada. No publicar métricas personales en repo público. El nightly del asistente solo recibirá datos si hay un camino explícitamente consentido y disponible. No enviar tokens al frontend.
