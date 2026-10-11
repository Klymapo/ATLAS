# Currículo y evaluación real — contrato v0.6

**Garantía realista:** no podemos garantizar aprendizaje humano, pero sí impedir que ATLAS marque una habilidad como aprendida cuando no hay demostración.

## Cadena de evidencia
**Expuesto** (vio/oyó palabra) → **Reconoce** (identifica forma o significado) → **Recuerda con pista** → **Recuerda sin pista** → **Usa en contexto nuevo** → **Recuerda después de días**.
Solo dos fases finales, con rúbricas apropiadas, apoyan la etiqueta de dominio funcional. El algoritmo no atribuye fluidez oral por oír síntesis.

## Unidad de estudio
Concepto + sentido semántico (English KEY = llave, no clave de respuesta), cuatro fichas FR/DE/RU/JA, cada una con gramática propia y fuentes auditadas. La misma idea se presenta comparada, pero la escritura y recuperación se puntúan por separado **por idioma**.
Un modo simultáneo muestra los cuatro; para no sobrecargar, un idioma focal de producción + otro de repaso por sesión, rotando según progreso o elección.

### Muestra (aún pendiente de lingüistas)
| English | Español | Francés | Alemán | Ruso | Japonés |
| --- | --- | --- | --- | --- | --- |
| key | llave | la clé | der Schlüssel | ключ | 鍵（かぎ） |
| book | libro | le livre | das Buch | книга | 本（ほん） |
| letter | carta | la lettre | der Brief | письмо | 手紙（てがみ） |
| map | mapa | la carte | die Karte | карта | 地図（ちず） |

**Alemán:** enseñar **der Schlüssel / das Buch / der Brief / die Karte**, no sustantivo sin artículo. Registrar acierto de «Buch» y artículo «das» por separado; enseñar plural cuando corresponda y los casos de manera progresiva.
**Francés:** género, artículo, elisión/liaison y conjugación graduales.
**Ruso:** cirílico, lectura, acento verificable, género y casos; no exigir escribir cirílico antes de enseñarlo.
**Japonés:** hiragana y katakana primero, kanji como vocabulario con lectura específica, partículas y cortesía; no confundir reconocimiento de kanji con saber su lectura.

## Ejemplo de prueba bien diseñada
1. Presentar una ilustración de un libro en un expediente.
2. Enseñar «book → das Buch» y la explicación de **das** neutro.
3. Reconocimiento con distractores: elige objeto correcto. Registrar SOLO reconocimiento.
4. Esconder texto y preguntar «English: book → Deutsch, con artículo: ____». Respuesta sin ayuda: «das Buch».
5. Si escribe «Buch»: sentido correcto, artículo incompleto, feedback y práctica adicional sin falsear dominio.
6. Reabrir caso distinto con texto nuevo que requiera «das Buch» y una oración simple ya enseñada.
7. Programar control al día siguiente, luego más tarde según desempeño; si olvida, repaso y reprogramar.

### Registro de dato
Unidad atómica: language + concept_id + sense_id + skill. Guardar intentos, tipo de pregunta, si hubo pista, corrección semántica, forma morfológica, contexto nuevo, revisiones y fecha de próximo intento. Habilidades: reconocimiento, lectura, escucha, gramática, escritura, habla (sin evaluar hasta soporte confiable).

### Repetición
Plan inicial provisional: volver dentro de sesión, al día siguiente, a los 3/7/14 días con adaptación. Puede utilizarse FSRS MIT en web; los intervalos no garantizan recordatorio perfecto. El progreso es una estimación basada en evidencia, no un examen oficial.

## Cursos extensibles
La malla no es un vocabulario finito: alfabeto/sonidos -> frases y rutinas Pre-A1/A1 -> interacción A2 -> narración B1 -> lectura/argumentación B2+.
Unidades contienen vocabulario, estructuras, ejemplos auditados, ejercicios de comprensión, producción y transferencia, casos narrativos opcionales. Cada idioma progresa a su velocidad.
- FR: género, artículos, negación, preguntas, tiempos.
- DE: artículos/género, plurales, V2, acusativo, dativo, etc.
- RU: cirílico, acento, caso, aspecto verbal.
- JA: kana, kanji en vocabulario, partículas, cortesía, contadores.
El usuario puede estudiar en «Academia» sin jugar y jugar sin completar evaluaciones, pero ello no genera placas de dominio.

## Medición
Mostrar «Vistas: 4; reconocidas: 3; recuerdo independiente: 2; utilizadas: 1; revisión diferida: pendiente», siempre por idioma. Pruebas de transferencia usan contextos y preguntas inéditas; ayudas y reintentos inmediatos no cuentan como recuperación independiente.

Las tarjetas y audios que el usuario ya aprobó se mantienen. Nuevas pantallas usan el mismo estilo vectorial minimalista.
Fuentes: https://doi.org/10.1126/science.1152408 ; https://pubmed.ncbi.nlm.nih.gov/16719566/ ; https://doi.org/10.1080/10508406.2010.508029 ; https://book.coe.int/en/education-and-modern-languages/8152-common-european-framework-of-reference-for-languages-learning-teaching-assessment-companion-volume.html ; https://www.jfstandard.jpf.go.jp/top/ja/render.do
