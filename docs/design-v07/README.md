# ATLAS v0.7 · Arquitectura de aprendizaje e historia continua

## Lo esencial
ATLAS no necesita "temporadas" obligatorias. Es un **curso de idiomas potencialmente ilimitado en forma de ficción detectivesca continua**. Se pueden cerrar expedientes pequeños, pero el Archivo y la formación permanecen abiertos. Los siguientes sucesos narrativos se ofrecen en cuanto se cumplen objetivos de aprendizaje; NO se retienen hasta una hora determinada.

## Una sola mecánica, muchísimas variantes
Los motores se programan una vez y después leen bancos de ejercicios validados:
- Voltear fichas y escuchar una palabra
- Reconocer por imagen o por pista oral
- Emparejar objetos y traducciones
- Escribir sin opciones, con o sin ayudas
- Elegir artículo, género y casos cuando corresponda
- Reconstruir una frase que ya fue enseñada
- Interrogar un testigo mediante expresiones conocidas
- Leer dos documentos y confrontar su significado
- Recuperar palabras en un contexto distinto varios días después

Lo que cambia es el vocabulario, el dibujo, el documento, la conversación, el contexto, el idioma focal y la dificultad. Evitar repetir literalmente las mismas preguntas. Los distractores y las respuestas correctas solo proceden de contenido lingüístico aprobado; no pedir a una IA que invente gramática en tiempo real.

## Progreso y desbloqueo
No hay requisitos arbitrarios del tipo "gana Memory 4 veces". Ejemplo de un bloque inicial:
1. Aprender la forma y significado de cuatro objetos con imágenes, audio y artículo cuando aplica.
2. Reconocer algunos objetos entre distractores: esto demuestra *reconocimiento*, nada más.
3. Escribir o reconstruir sin ayuda una forma ya enseñada: demuestra *recuperación independiente*.
4. Usarla en un documento distinto o construir una frase corta: demuestra *aplicación*.
5. Desbloquear la siguiente escena cuando se cumplen los criterios del bloque en el idioma focal.

Las revisiones de retención diferida de días posteriores son un requisito **para placas de aprendizaje**, no para impedir leer la próxima conversación del detective. Cuando el alumno falla, se ofrecen explicaciones y ejercicios equivalentes, no un castigo por monotonía.

### Rapidez variable
- Si avanza muy rápido, la web puede ir liberando contenido **ya redactado y validado** sin esperar a la madrugada.
- Mantener como meta operativa una reserva de unas tres escenas o unidades verificadas por delante (cifra de planificación, no requisito obligatorio).
- Si no queda contenido nuevo, permitir explorar pistas opcionales y practicar material anterior sin inventar un "capítulo" no revisado.
- Si se estanca, crear formatos alternativos del mismo objetivo (escritura, diálogo, escucha, lectura), sin subir la dificultad artificialmente.
- Elegir libremente lengua focal y alternar las otras tres para repasar; no exigir cuatro exámenes simultáneos para una sola escena.

## Dos directores
**Director de aprendizaje (en el navegador):** mira cada respuesta, registra modalidad, ayudas y fecha, programa repasos y desbloquea historia verificando evidencia a nivel de concepto/idioma. Usa solo progreso local por defecto.
**Director editorial (GitHub / trabajo nocturno):** examina el inventario de escenas aprobadas y, si existe un informe de avance voluntariamente compartido, propone preparar la continuación o reforzar un módulo. Produce borradores, auditorías y PR. Nunca publica contenido por sí solo si falta revisión.

### Semáforo nocturno
| Evidencia | Decisión |
| --- | --- |
| Datos de progreso ausentes, antiguos o sin consentimiento | Escribir borrador general, no presumir avance |
| Muchos repasos pendientes / problemas de recuerdo diferido | Ampliar materiales de refuerzo |
| Contenido aprobado en cola y requisitos locales satisfechos | Liberación **local inmediata**, sin esperar la noche |
| Avance real alto, cola agotada | Preparar un nuevo tramo de historia y ejercicios candidatos |
| Material narrativo o gramatical sin visto bueno | Mantener PENDING, no publicarlo |

Esta es la *política deseada*; los umbrales no garantizan por sí solos dominio humano y se calibrarán en pruebas reales. El motor aporta la primera implementación de la lógica, pero **todavía no está conectado a la web v0.4**.

## Privacidad y limitación técnica del progreso diario
En ATLAS v0.4 el avance vive en localStorage del teléfono o navegador. Los agentes de GitHub y las tareas programadas **no pueden leerlo remotamente**. Para alimentar decisiones personalizadas:
1. Exportar voluntariamente un JSON desde la web y subirlo en privado para revisión, **o**
2. Desarrollar una sincronización privada con autenticación segura, consentimiento, controles de acceso y coste verificado cero.

No escribir tokens GitHub en JavaScript público. No enviar logs personales a un repositorio público. El reporte sin consentimiento solo puede decir "avance desconocido". La sincronización queda PENDIENTE.

## Producción nocturna
La idea: ejecutar alrededor de las 03:00 (CDMX) una revisión en este orden:
1. Determinar inventario narrativo y educativo, últimas aprobaciones, cobertura por idioma.
2. Leer progreso individual solo si está disponible con autorización.
3. Decidir entre siguiente suceso de la historia, ejercicios de refuerzo, nuevas pruebas o auditoría del material.
4. Crear contenido en rama candidata con versionado: continuidad narrativa, referencias a conceptos, distractores, textos, variantes visuales reutilizadas.
5. Pasar por lingüistas FR/DE/RU/JA, pedagogía, narrativa, comparación visual y tests. Un agente no se autoaprueba.
6. Abrir PR; el Quality Gate y revisiones de contenidos determinarán qué entra al banco liberable.

**IMPORTANTE:** aún no se pudo crear esa tarea periódica, pues ChatGPT devolvió límite de cinco tareas activas. No se cancelaron tareas existentes. Si se libera una tarea activa y se programa, el trabajo solo se puede garantizar dentro de los permisos y herramientas disponibles en la ejecución futura.

Los GitHub Actions programados pueden sufrir retrasos y desactivarse si el repositorio público queda sin actividad prolongada. No confiar en un cron como único modo de liberar historia a un jugador rápido.

## Estado comprobable de la entrega
- Código puro sin dependencias externas: engine/continuous_learning.mjs
- Regresiones con Node: tests/continuous_learning.test.mjs
- Contrato de objetivos: specs/continuous-learning-v07.json
- CI ampliada para ejecutar pruebas del motor con GitHub Actions.
- **No incorpora pantallas nuevas al juego público**. No genera de manera automática contenido lingüístico ni escenas. Esta es la base reutilizable para integrar en el siguiente hito.

## Bibliografía
- L2 spaced practice, meta-análisis (2022): https://doi.org/10.1111/lang.12479
- Spacing and retrieval, revisión (2022): https://www.nature.com/articles/s44159-022-00089-1
- Transferencia de recuerdo a otras tareas (2018): https://pubmed.ncbi.nlm.nih.gov/29733621/
- GitHub Actions schedule: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
