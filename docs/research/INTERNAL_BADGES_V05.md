# Rango de investigador y placas de progreso PDF · ATLAS v0.5

## 1. Distinción imprescindible
Dos indicadores independientes:
- **Rango ficcional dentro del Archivo**: Aprendiz, Auxiliar, Investigador, Analista, Inspector, Director de Casos (nombres provisionales). Subir por informes y pruebas resueltas.
- **Progreso real por idioma y destreza**: francés, alemán, ruso y japonés, separando lectura, escucha, gramática, escritura, producción oral y mantenimiento de vocabulario.

NUNCA llamar una placa del juego "certificado oficial A1/B1/N5" ni usar logos de Goethe, DELF, JLPT, Consejo de Europa o universidades. La equivalencia al MCER es **orientativa** solo si hay cobertura de contenidos y una calibración de evaluación seria; no se determina por aciertos en Memory.

## 2. Placas internas propuestas
- **Recluta del Archivo**: completó tutorial y una práctica guiada; placa narrativa, sin afirmación de competencia.
- **Descifrador inicial — FR/DE/RU/JA**: demostró en ese idioma recuperación independiente, tarea nueva y repaso diferido de un bloque revisado, con habilidades evaluadas indicadas.
- **Lector de expedientes — [idioma]**: lectura de texto breve nuevo y preguntas de comprensión validadas.
- **Analista de estructuras — [idioma]**: construyó frases propias con las estructuras del bloque.
- **Oído de investigador — [idioma]**: completó audición evaluada con material licenciado, no solo TTS sin contraste.
- **Especialista del Archivo — [idioma]**: alcanza conjunto de unidades aprobadas, evaluaciones diferidas y tareas de aplicación.
Los nombres son **categorías de juego**, no equivalencias con estándares externos.

## 3. Política para emitir una placa de aprendizaje
Propuesta de requisitos internos, **sujetos a validación y calibración**:
1. Unidad y banco de preguntas previamente aprobados por los agentes pedagógico y lingüista.
2. Examen nuevo no idéntico al repaso, sin opciones que filtren la respuesta.
3. Umbral provisional ≥80 % en el examen con mínimo específico por destreza; superar con una sola modalidad no basta.
4. Comprobación diferida al menos otro día; la regla concreta dependerá de pilotaje y datos.
5. Mostrar explícitamente qué destrezas se comprobaron y cuáles siguen \`not_assessed\`.
6. Si la evaluación aún no está certificada, la placa indica **"logro de juego / demostración"**, no aval pedagógico externo.

## 4. Formato del PDF descargable
Título: **EL ARCHIVO DE LAS CUATRO VOCES**
Subtítulo: **Reconocimiento interno de progreso — no oficial**
- Nombre ficticio o alias elegido voluntariamente.
- Idioma y denominación del logro.
- Fecha, ID del logro, sello minimalista vectorial con paleta nocturna.
- Habilidades evaluadas y evidencias; nunca afirmar destrezas no medidas.
- Texto fijo visible: **"Distinción lúdica interna. No constituye certificación oficial de competencia lingüística."**
- Debajo: progresión hasta la siguiente placa y botón **guardar/imprimir PDF**.

## 5. Arquitectura cero costo
- Generación 100 % cliente: HTML/CSS \`@media print\` con opción "Guardar como PDF", o una librería JS abierta empaquetada durante el build en GitHub Actions.
- Primera implementación: plantilla HTML imprimible accesible, con PDF de navegador. Segunda: botón de descarga PDF directa con dependencia libre y licencia auditada.
- Datos guardados localmente (sin servidor) y exportados JSON; versión de algoritmo y registro de ejercicios aprobados pueden acompañar la placa. No afirmar autenticidad criptográfica pública: sin servicio de verificación, el archivo podría editarse.
- Datos privados: nada de nombres reales requeridos, ni registros enviados a terceros.

## 6. QA de placas
Prohibir emisión si el banco de evaluación no está aprobado, si la evidencia corresponde solo a reconocimiento, si el idioma no coincide, si hay \`not_assessed\` etiquetado como aprobado, si el PDF insinúa aval externo, o si el alumno puede activar la placa solo por abrir una ficha.

## Fuentes
- Descriptores MCER: https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors
- Consejo de Europa, manual para vincular exámenes: https://www.coe.int/en/web/common-european-framework-reference-languages/relating-examinations-to-the-cefr
- Goethe A1 (cuatro habilidades): https://www.goethe.de/ins/de/de/prf/gzsd1.cfm
- JLPT y competencias realmente evaluadas: https://www.jlpt.jp/e/about/cefr_reference.html
