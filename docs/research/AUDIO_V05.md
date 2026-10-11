# Sonido, música y ambientación · ATLAS v0.5

## 1. Dos canales independientes
1. **Voz educativa**: máxima prioridad; palabras y diálogos TTS opcionales cuando no exista grabación licenciada y validada.
2. **Ambientación del juego**: música instrumental, páginas, reloj, pasos suaves, campanillas de acierto y efectos de papel; jamás tapar consonantes, acentos o sílabas del idioma.

## 2. Control de volumen/UX
- Primer inicio en **silencio**, invitar a activar sonido con una interacción (nunca autoplay invasivo).
- Controles separados: \`voz\`, \`musica\`, \`efectos\`, \`silenciar_todo\`; ajustes guardados localmente; modo reducido de estímulos.
- Al pedir pronunciación: aplicar **ducking** de música hasta ~10–20 % del nivel fijado mientras se reproduce la voz; luego recuperar con fundido breve. Valores provisionales.
- No iniciar un efecto de acierto hasta que la pronunciación se termine, salvo que sea intencional y no la tape.
- Si SpeechSynthesis no informa fin o falla, restaurar volumen tras una contingencia controlada; evitar música silenciada eternamente.
- Música discreta por espacio (oficina, caso nocturno, deducción, resolución). Priorizar dinámica con cambios leves al descubrir pistas, no loops de alto impacto.
- Móvil: al entrar en segundo plano, pausar música; conservar preferencia; ahorrar batería y banda.

## 3. Solución técnica a costo cero
- Audio ambiental y efectos: HTMLAudioElement / Web Audio API; Web Audio requiere interacción para activar audio en navegadores modernos.
- Para el primer lote, se puede **componer un loop procedural simple original** offline con herramientas gratuitas o ejecutar sintetizador local en el navegador. No es imprescindible añadir librerías comerciales ni streaming.
- Alternativa: archivos **Kenney CC0** con procedencia y licencia en \`assets/audio/manifest.json\`; no asumir que las piezas de 'Music Jingles' son música ambiental completa.
- Audio lingüístico: sintetizado por navegador según locale del sistema; disponibilidad real de voces variable. Mantener etiqueta \`VOZ SINTÉTICA\` y abstenerse de certificar pronunciación humana.
- Rendimiento: sonidos UI ligeros (caché), música en bucle opcional, nada descargado al abrir si el usuario no activó música.

## 4. Fuentes verificadas para estudiar integración
- Kenney UI Audio, CC0, 50 archivos: https://kenney.nl/assets/ui-audio
- Kenney Interface Sounds, CC0, 100 archivos: https://kenney.nl/assets/interface-sounds
- Kenney Music Jingles, CC0, 85 piezas: https://kenney.nl/assets/music-jingles
- Kenney FAQ, requisitos CC0: https://kenney.nl/support
- MDN prácticas y restricciones de autoplay: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
- MDN guía de autoplay: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay

## 5. QA de audio (ATLAS)
Rechazar cualquier sonido sin manifest de autor/licencia/archivo/hash; cualquier archivo más fuerte que voz; cualquier reproductor que inicie automáticamente sin consentimiento; ausencia de botón para desactivar; falta de prueba en Android con TTS y efectos simultáneos. Definir luego límites concretos de sonoridad y pruebas; no se ha validado aún el resultado audible.
