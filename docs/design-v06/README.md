# ATLAS v0.6 — Diseño integral de historia, juego y aprendizaje

**Entrega:** DOCUMENTACIÓN Y CONTRATOS DE DISEÑO. No se altera todavía la versión pública de GitHub Pages. La historia y las mecánicas aquí descritas aún requieren implementación, pruebas de experiencia, revisión de calidad artística y lingüistas independientes.

1. [Biblia del universo](WORLD_BIBLE.md) — Puerto Umbral, Nora, motivación del protagonista, mundo persistente y arco sin desenlace global.
2. [Prólogo con diálogo y decisiones](PROLOGUE_SCRIPT.md) — invitación fechada mañana, llegada, presentación, identidad, cuatro palabras y un primer misterio.
3. [Caso 001 reconstruido](CASE_001.md) — llave 21, registro 12, evidencia física, inferencias válidas y falsas conclusiones.
4. [Mecánicas](GAME_SYSTEMS.md) — oficina, academia, tablero, interrogatorio, tarjetas, niveles, placas y música.
5. [Aprendizaje](LEARNING_SYSTEM.md) — EN pivote → FR/DE/RU/JA con gramática particular, práctica activa, retención y evaluación honesta.
6. [Contrato máquina](../../specs/atlas-story-learning-v06.json) — invariantes verificables por CI.

## Objetivo del siguiente PR implementador
Crear **primero el prólogo funcional y la evaluación progresiva de una sola microlección** en la web. Completar el ciclo de aprendizaje real (no únicamente Memory) antes de añadir más vocabulario o episodios. Calibrar y revisar el contenido existente antes de llamarlo curso verificado.

La CI solo demuestra que este diseño documenta prioridades e invariantes; **no prueba que el alumnado aprenda** ni que la narración sea irresistible. Se requiere piloto y evaluación real. Mantener $0, ejecución cloud y estilo vectorial minimalista sin anime/chibi.
