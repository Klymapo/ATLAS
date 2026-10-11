# ATLAS v0.5 · Diseño del videojuego y la experiencia

**Estado:** investigación y especificación; no juego implementado. **Arte:** vectorial minimalista, NO anime, NO chibi. **Costo:** cero servicios pagados; ejecución y despliegue en nube.

## 1. Diagnóstico de la demo v0.4
La demo presenta a Nora, un lugar y cuatro palabras; sin embargo:
- la identidad del protagonista y el motivo de su llegada son demasiado difusos;
- la secuencia enseña cuatro fichas y pasa directamente a Memory, sin recuperación guiada ni transferencia;
- la investigación muestra la solución posible con poco esfuerzo lingüístico;
- la ganancia de XP o el fin de caso podría confundirse con aprendizaje efectivo.
El objetivo no es añadir 10 pantallas decorativas, sino diseñar un **ciclo de juego donde comprender idioma = investigar mejor**.

## 2. Enfoque de género
**Aventura detectivesca narrativa + juego de puzles contextualizados + curso adaptativo**, con un metajuego de Archivo/biblioteca de casos y estadísticas. No roguelike, no acción por reflejos y no simulación de detective hiperrealista.

- Mecánica (MDA): encontrar y leer pruebas, entrevistar NPC, reconstruir un significado, formular hipótesis y justificar una deducción.
- Dinámica: incertidumbre, contraste, curiosidad, recuperación de vocabulario y decisiones con consecuencias.
- Experiencia deseada: descubrimiento, competencia adquirida y vínculos con personajes; no miedo a fallar.
- Integración intrínseca: el lenguaje sirve para abrir pistas, contrastar testimonios y redactar informes, NO para pasar un examen arbitrario antes de poder jugar.
- Elección significativa: una respuesta cambia el orden de hallazgos, reacción de Nora, testigos o herramientas, sin falsificar la gramática ni introducir bloqueos definitivos.

## 3. Tres bucles de juego
### Sesión 12–20 min (duración orientativa, personalizable)
1. **Retomar** (0–2 min): Nora recuerda la ubicación, misión y vocabulario vencido de revisión. Accesibilidad: resumen que puede omitirse.
2. **Conocer** (2–4 min): contextualización en la escena; máximo ~4–6 conceptos nuevos en una sesión inicial como preferencia provisional, ajustable por desempeño.
3. **Entrenar** (3–6 min): reconocimiento -> recuerdo guiado -> recuerdo escrito/auditivo; explicación ante error, sin castigo.
4. **Investigar** (4–7 min): pistas auténticamente legibles y puzzles que emplean esas habilidades.
5. **Cerrar** (1–2 min): deducción basada en evidencias, informe y un plan personalizado de repaso.

### Bucle diario
Repasos vencidos según memoria individual -> 1 misión o un tramo -> breve aplicación a contexto nuevo -> registro de lo que domina cada destreza -> nuevos casos.

### Metajuego sin final global
Nora y otros personajes continúan, expedientes resueltos se archivan, bibliotecas temáticas amplían vocabulario y gramática, y la organización persiste. Puede existir un final por caso, acto o temporada **nunca final del aprendizaje ni del Archivo**.

## 4. Máquina de estados / guardas
\`ARRIVAL -> IDENTITY -> NORA -> LANGUAGE_DIAGNOSTIC_OPTIONAL -> PROLOGUE_CASE -> TEACH -> GUIDED_RETRIEVAL -> INQUIRY -> DEDUCTION -> REPORT -> SPACED_REVIEW\`.

- El usuario puede volver a cualquier fase visitada. Las rutas avanzadas no muestran soluciones ni frases no enseñadas sin contexto.
- La misión principal no se cierra si faltan evidencias narrativas; la unidad didáctica no se certifica por completar la misión.
- Dificultad adaptativa: sugerir **ayudas opcionales** cuando hay errores, nunca quitar el contenido narrativo.
- Saltar cinemática/prosa deja un **resumen permanente** y acceso al dossier de personaje; el salto de enseñanza se registra como \`not_taught\`, no \`mastered\`.
- Usuarios con avance de v0.4: **migración aditiva** que conserva pistas, logros y progreso; nueva introducción voluntaria sin reiniciar partida.

## 5. Sistemas del primer episodio
- **Ficha de reclutamiento:** nombre o alias elegido por el jugador; identidad de ficción sin pedir datos reales.
- **Tarjeta del Archivo:** mapa textual de ciudad/sede, época aproximada, función, estructura de equipos.
- **Relaciones:** Nora conserva una actitud estable, confía más si argumentas con evidencia, no si aciertas al azar.
- **Inventario:** pruebas separadas de vocabulario; cada documento incluye origen, fecha, hallazgo, texto legible y consecuencias.
- **Cuaderno de hipótesis:** hecho verificado / inferencia / conjetura; contradicciones comparadas lado a lado.
- **Mecánicas de puzle:** identificar género correcto de una ficha alemana; reconstruir aviso; detectar inconsistencia semántica; ordenar conversación; escuchar una grabación; traducir fragmento suficiente para desbloquear una línea de investigación.
- **Sincronía narrativa-didáctica:** las pruebas se escriben a nivel del alumno; cualquier palabra inesperada tiene glosa o soporte.

## 6. No negociables del diseño
1. El jugador sabe al minuto 1 quién es, dónde está y qué se espera de él.
2. Nora debe dar contexto, motivación y un vínculo dramático, no ser solo una voz de tutorial.
3. Cada nuevo concepto se **enseña y se recupera**, no solo se expone.
4. Al menos una decisión por caso provoca un cambio perceptible.
5. No hay temporizador obligatorio, pérdida por errores o racha que bloquee aprender.
6. Toda deducción es justificable con pistas accesibles antes de pedirla.
7. Todo contenido lingüístico y asset exhibe su estado de auditoría; la demo no simula certificación.
8. Móvil accesible, controles grandes, texto legible, música opcional y silencio por defecto.

## 7. Referencias consultadas
- MDA Hunicke/LeBlanc/Zubek (2004): https://aaai.org/papers/ws04-04-001-mda-a-formal-approach-to-game-design-and-game-research/
- Habgood & Ainsworth (2011), integración intrínseca del aprendizaje: https://eric.ed.gov/?id=EJ922627
- Cardona-Rivera et al. (2014), elecciones significativas: https://ojs.aaai.org/index.php/AIIDE/article/view/12716
- Bodi & Thon (2020), agencia narrativa: https://research.birmingham.ac.uk/en/publications/playing-stories-narrative-dramatic-agency-in-disco-elysium-2019-a/
