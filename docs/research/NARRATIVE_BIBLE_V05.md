# Biblia narrativa inicial · ATLAS / v0.5

**Estado: propuesta de canon.** Nada de lo siguiente se publica como hecho histórico del universo hasta aprobación narrativa. Narrador: tercera persona limitada o segunda persona discreta. Tono: misterio acogedor, inteligente, noir suave, humor discreto; sin anime.

## 1. Responder desde la primera pantalla
**¿Quién soy?** Una persona recientemente aceptada como **investigador/a auxiliar del Archivo**. El nombre o alias se elige. No implica profesión, origen étnico, género o pasado impuestos. Se ofrecen tres maneras de expresar un enfoque inicial: Observador (análisis de pruebas), Lingüista (contrastes culturales), Entrevistador (preguntas). Todas acceden al mismo currículo; cambia el texto y los caminos, no su capacidad de aprobar idiomas.

**¿Dónde estoy?** Biblioteca convertida en oficina principal del Archivo, una red civil de expertos que estudia mensajes, archivos, testimonios y errores de traducción con consecuencias reales. **No decidir todavía** ciudad exacta, fecha del calendario, jurisdicción o escala política: se fijarán en la biblia narrativa antes de crear referencias geográficas.

**¿Por qué vine?** Recibí una invitación breve después de resolver o notar una contradicción lingüística en un documento; mi decisión de presentarme fue voluntaria. El jugador no tiene amnesia ni un pasado misterioso obligatorio. Puede preguntar "¿Por qué yo?" y obtener una respuesta concreta.

**¿Quién es Nora Vale?** Archivista de campo y responsable de orientar a reclutas, custodia expedientes, está habituada a contrastar versiones de una misma historia. Personalidad: precisa, reservada, cordial en los detalles, irónica con diplomacia; nunca explica por completo una pista que el jugador aún puede deducir.

**¿Cuál es el objetivo?** Resolver un primer documento falseado, demostrar una metodología de investigación y abrir acceso a misiones; el arco de la organización no tiene desenlace definitivo.

## 2. Prólogo recomendado: 2–4 min con controles de avanzar/saltar
**Plano 1 – Sobre sellado:** la invitación presenta el nombre de la institución y fecha. Pregunta dramática: "¿Qué detalle de esta carta hizo que me buscaran?".
**Plano 2 – Pasillo / plano de la sede:** rótulo de ubicación, estanterías, sonido de lluvia opcional; tres objetos interactivos se introducen sin examen. Entrega contexto espacial sin monólogo excesivo.
**Plano 3 – Nora:** identidad y rol; habla como persona, no como menú. Se presenta y explica por qué llamó al protagonista.
**Plano 4 – Elección de método:** elijo observar, entrevistar o traducir primero. Nora reacciona y el cuaderno registra la decisión.
**Plano 5 – Primera pista incompleta:** aparece una carta breve en inglés con huecos; se introduce un concepto con ejemplo y recuperación inicial; se abre caso.

### Extracto de diálogo propuesto, no definitivo
- **Nora:** "Llegaste. Supongo que viste la diferencia entre lo que decía el sobre y lo que realmente contenía."
- **Jugador (opciones):** "Vi una fecha imposible" / "Vi dos traducciones diferentes" / "No estoy seguro; por eso vine".
- **Nora:** "Mejor una duda bien formulada que una respuesta inventada. Soy Nora Vale. Custodio estos expedientes."
- **Jugador:** "¿Y qué se supone que soy yo aquí?"
- **Nora:** "Investigador auxiliar, si aceptas. No tienes que saber cuatro idiomas hoy. Tendrás que aprender a comprobar lo que lees."
- **Jugador:** "¿Dónde estamos?"
- **Nora:** "En la sede del Archivo. Aquí reunimos declaraciones que cambian de sentido cuando atraviesan una frontera."
- **Nora:** "Tu primera tarea es sencilla: identifica una palabra, demuestra que puedes recordarla y úsala para localizar la pista correcta."

Este diálogo introduce conflicto, identidad, rol y objetivo. La información sobre la fecha del sobre es **gancho de ficción**, no solución del caso de la llave.

## 3. Principios de misterio justo
- Pista existe antes de la deducción; se puede revisar en cualquier momento.
- Distinguir en el registro de pruebas \`fact\`, \`inference\`, \`hypothesis\`, \`false_lead\`.
- Una pista trampa es plausible y comprobable, no una traducción incorrecta sembrada por el sistema pedagógico.
- El culpable y el mecanismo se conocen en el documento de autor, NO en el dossier del jugador.
- Testigos tienen conocimiento acotado; nunca hablan con datos que aún no pueden saber.
- La investigación permite rectificar deducciones incorrectas sin penalizar el aprendizaje.

## 4. Modelo de historia persistente
\`Series -> temporada (opcional) -> expediente -> escenas -> diálogos -> evidencias -> resolución\`.
Al acabar el expediente: conclusión propia, consecuencias de elecciones, cambio de estado de personaje, siguiente mensaje. No se cierra el Archivo.
Cada episodio introduce un reto lingüístico y una trama **realmente independiente del nivel de memoria**: si alguien ya sabe la palabra, deberá demostrar habilidades de nivel apropiado para no aburrirse.

## 5. Motor de narrativa
Primera iteración: **JSON estructurado + máquina de estados + validadores propios**, ya compatible con web estática. Para ramas más numerosas evaluar **ink + inkjs** (MIT) sin servidor ni tokens. No introducir motor narrativo hasta que su ventaja compense complejidad: control de versión y pruebas del grafo son obligatorios.
Referencia: https://github.com/inkle/ink y https://github.com/y-lohse/inkjs

## 6. Auditor de guion
Rechazar si no quedan claros el protagonista, ubicación, motivo de llegada y misión antes del primer examen; si el contenido adelanta solución; si una rama termina sin salida o bucle intencional; si el caso concluye el universo global; o si el vocabulario requerido no tiene previo aprendizaje/glosa.
