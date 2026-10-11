# Investigación pedagógica y motor de aprendizaje · ATLAS v0.5

**Objetivo:** aprendizaje de francés, alemán, ruso y japonés desde conceptos pivote en inglés, instrucciones en español. El inglés es referencia práctica, **no** un traductor perfecto. Estado: diseño, no evaluación de alumnos ni validación científica del producto.

## 1. Diagnóstico
Leer cuatro equivalencias + oír TTS => **exposición**, no evidencia de dominio. Un Memory EN↔X evalúa principalmente reconocimiento. Necesitamos recuperación activa, feedback, práctica espaciada, pruebas con transferencias y seguimiento por habilidad.

## 2. Ciclo completo de una palabra nueva
1. **Contexto comprensible**: Nora enseña palabra, significado concreto, imagen, ejemplo, audio opcional, usos y registro. No confundir un sentido de *key* (llave) con *key* (clave de solución).
2. **Noticing / forma**: ortografía, categoría, género/artículo si procede, pronunciación, lectura; diferencia entre lenguas.
3. **Reconocimiento** con distractores razonables y sin trampas: asociar objeto y palabra.
4. **Recuperación asistida**: escucha y selecciona palabra, luego EN→idioma con apoyo opcional.
5. **Recuperación libre**: escribir en idioma destino **sin opciones ni palabra visible**; evaluar errores ortográficos y de morfología aparte.
6. **Aplicación**: completar o producir una frase nueva con la palabra. Dar feedback significativo.
7. **Repaso espaciado**: revisión futura por concepto, idioma, modalidad y dificultad; fallos reprograman.
8. **Transferencia**: usar palabra en un documento distinto o nuevo caso antes de declarar dominio funcional.

Ejemplo concreto (*book*):
- EN book → DE **das Buch** (guardar artículo como parte de la ficha y pregunta independiente). Pronunciación TTS; plural **die Bücher** como expansión, NO exigirlo en primera lección si aún no se enseñó.
- EN book → FR **le livre**.
- EN book → RU **книга** (registro separado de acento y flexión al ser revisado).
- EN book → JA **本（ほん）** (kanji, lectura kana y sentido de 'libro'; kanji aislado puede tener otras lecturas en compuestos).
Tener género de *Buch* aprendido no significa poder declinar *dem Buch* o *des Buches*.

## 3. Datos necesarios por ficha
Comunes: \`concept_id\`, \`english_pivot\`, \`meaning_es\`, \`sense_id\`, \`part_of_speech\`, \`level\`, \`usage_contexts\`, \`example_ids\`, \`license\`, \`sources\`, \`review_status\`, \`audio_reference\`.
- FR: género, artículo, elisión/contracción cuando aplique, plural, pronunciación, registros, ejemplo verificado.
- DE: género \`m/f/n\`, artículo definido \`der/die/das\`, plural, caso de la forma de ejemplo, declinación y verbo de régimen cuando corresponda.
- RU: cirílico, lema, género, acento tónico, aspecto verbal cuando aplique, paradigma de casos/flexión, transliteración auxiliar opcional.
- JA: superficie kanji, lectura kana, vocabulario en kana, registro, partícula y estructura, contadores cuando aplique, variación de lecturas según contexto.
- Por destreza: \`recognition\`, \`listening\`, \`typing\`, \`sentence\`, \`production\`, \`review_due\`, \`last_tested\`, \`hints_used\`. **No colapsar todo en un único booleano learned.**
- Variantes ortográficas equivalentes se declaran explícitamente; no tolerar automáticamente errores que cambien género/tiempo/lectura.

## 4. Evaluación válida
**Escalera de dificultad:** vista y escuchada → reconocida → recordada con pista → recordada sin pista → escrita correctamente → aplicada en contexto → recordada después de varios días.
Una única asociación correcta no equivale a nivel adquirido. Puntos y coleccionables narrativos sí pueden darse al completar tareas, pero no certifican competencia lingüística.

**Tipos de prueba:** elección múltiple; audio→respuesta; producción EN→FR/DE/RU/JA; artículos alemanes; completar frases; ordenar oraciones con distractores; dictado cuando audio esté aprobado; traducir contexto; pregunta de comprensión con respuesta nueva; microdiálogos. Alternar preguntas y ejemplos para evitar aprendizaje de opciones.

**Feedback:** inmediatamente después de responder, explicar naturaleza del error y volver a evaluar de modo distinto. No revelar respuesta en pantalla antes de recuperación activa.
**Accesibilidad:** teclado móvil multilingüe; hiragana/katakana antes de exigir kanji manuscrito; no usar limitación del teclado como indicador de ignorancia.
**Habilidades que todavía NO podemos medir objetivamente:** pronunciación hablada con un TTS unidireccional, conversación natural espontánea y entonación humana; indicar \`not_assessed\` hasta implementar prueba confiable.

## 5. Repaso espaciado
Integrar \`ts-fsrs\` (MIT) para agenda de revisiones, con perfiles separados por idioma y unidad de conocimiento. El algoritmo estima cuándo revisar: **NO es una prueba pedagógica autónoma** y no se confundirá con nivel MCER.
Registrar \`card_id = language + concept + sense + modality\`, \`date\`, \`answer_correct\`, \`response_time\`, \`hints\`, \`review_log\`, \`scheduler_version\`.
La primera versión de scoring solo usa datos fiables de respuestas corregibles. Modificar dificultad y tasas meta tras pilotos, no tomar 90 % de aciertos como ciencia.

**Presupuesto:** bundle JS estático compilado por GitHub Actions; ningún backend ni token. Almacenar en IndexedDB/localStorage con exportar/importar datos. No se sincroniza automáticamente entre dispositivos.

## 6. Mezcla de los cuatro idiomas
Comparar conceptos **mejora conexiones, pero puede causar interferencia**. Enseñar por la misma idea, cambiar claramente bandera/etiqueta, presentar después ejemplos propios de cada idioma. Ensayar traducción desde inglés, entre idiomas y desde imagen solo donde la equivalencia esté validada.
NO aplicar "artículo" japonés o inventar correspondencias uno-a-uno. Cada idioma evoluciona a su ritmo.
El inglés actúa como pivote; las explicaciones en español y las equivalencias de sentido evitan falsos amigos.

## 7. Evidencia e investigación
- Karpicke y Roediger (2008), aprendizaje por recuperación: https://doi.org/10.1126/science.1152408
- Cepeda et al. (2006), práctica espaciada, revisión de 317 experimentos: https://pubmed.ncbi.nlm.nih.gov/16719566/
- Habgood & Ainsworth (2011), integración intrínseca del juego y aprendizaje: https://eric.ed.gov/?id=EJ922627
- Shaofeng Li (2010), meta-análisis de feedback correctivo L2: https://doi.org/10.1111/j.1467-9922.2010.00561.x
- Li & Sun (2024), meta-análisis de instrucción explícita: https://onlinelibrary.wiley.com/doi/10.1111/flan.12726
- Consejo de Europa (2020), CEFR Companion: https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions
- CEFR plurilingüismo: https://www.coe.int/en/web/common-european-framework-reference-languages/plurilingualism-and-pluriculturalism
- FSRS licencia y uso: https://github.com/open-spaced-repetition/ts-fsrs
