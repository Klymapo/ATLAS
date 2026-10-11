# Mecánicas de juego y UI — contrato v0.6

**Género:** aventura detectivesca narrativa con puzzles y cursos adaptativos. Público: aprendizaje de 4 lenguas desde inglés pivote e interfaz española. Nada de anime. Nube exclusiva y coste cero.

**Navegación:** Oficina (Nora + mapa + misión), Academia (cursos), Casos (escenas), Fichas (estudio), Expediente (pruebas y contradicciones), Perfil (niveles/placas).

## Dos progresiones que no se confunden
**Investigación:** puntos de observación, hipótesis revisadas y expedientes resueltos → rango narrativo.
**Lenguas:** registros FR, DE, RU, JA independientes por habilidad, palabra y sentido → objetivos pedagógicos internos. Jamás recompensa narrativa = dominio de un idioma.

## Bucle de sesión
1. Reentrada: resumen de caso y repasos debidos; un botón para saltar narración.
2. Una conversación con decisión que cambia una reacción o acceso a pistas.
3. Enseñanza de conceptos relevantes en una escena concreta.
4. Práctica de recuperación sin respuesta visible y con feedback.
5. Investigación: examinar evidencia y aplicar el idioma.
6. Deducción e informe con pruebas.
7. Repaso agendado; cerrar caso no significa dominar todas las palabras.

## Minijuegos con propósito
- **Zoom a evidencia:** documentos e imágenes, no solo etiquetas de vocabulario.
- **Tablero de contradicciones:** arrastrar versiones, etiquetar hecho/inferencia/hipótesis.
- **Entrevista ramificada:** escoger preguntas relevantes, reexaminar testigos.
- **Memory:** calentamiento de reconocimiento, nunca examen de dominio.
- **Dictado:** solo cuando audio y grafía tienen calidad verificada.
- **Artículo perdido (alemán):** identificar der/die/das con palabra y contexto.
- **Cifrados/orden de frases:** reconstruir enunciados auténticos ya enseñados, sin falsas correspondencias.
- **Informes:** escribir una palabra o una oración en una pista nueva. Con ayudas se registra como práctica guiada.
- **Repaso adaptativo:** 5 minutos opcionales entre casos; las visitas no obligan a seguir la historia.

## Sonido
Música ambiental instrumental y FX suaves (papel, sello, deducción); ambos opt-in, no autoplay. Voz sintética siempre al pulsar, botón junto a palabra. Bajar música mientras habla el TTS, restaurar después. Volúmenes separados y modo silencioso.

## Recompensa
Rango narrativo independiente; placas PDF internas por idioma solo después de prueba independiente + uso en contexto nuevo + repaso diferido, con desglose de destrezas y aviso «No constituye certificación oficial». No afirmar A1 oficial ni JLPT por XP.

## Navegador
HTML/CSS/JS estáticos, Google Pages/Pages GitHub ya conectado, localStorage o IndexedDB con export/import, sin backend. Se deben preservar progreso v0.4 y rutas existentes con migración aditiva. Móvil primero; teclado FR/DE/RU/JA y alternativa visual para principiantes.

## Ensayos que bloquean merge
Primero contexto → luego enseñar → después prueba. Prohibido pregunta sin haber enseñado un concepto o glosarlo. Las pistas existen antes de su deducción; las tres rutas son resolubles; ayuda visible no acredita recuerdo libre; memoria acertada no acredita escritura; género alemán separado de significado; sin música automática; estado de auditoría del contenido siempre visible.
