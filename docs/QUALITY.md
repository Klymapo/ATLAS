# Constitución del tribunal ATLAS

**Regla principal: AUSENTE = PENDIENTE = BLOQUEADO para publicación.**

## Filtros
- Director visual: estilo chibi, 2–2.5 cabezas como principio artístico, proporciones y comparativa contra máster inmutable.
- Anatomía/escenario: siluetas, expresiones, perspectiva, composición, luz, escala.
- Árbitro multilingüe + 4 lingüistas (FR, DE, RU, JA): sentido, grafía, naturalidad y fuentes fiables por idioma. El algoritmo solo comprueba integridad y presencia de evidencia, no verdad semántica.
- Pedagogo: prerrequisitos, recuperación activa, espaciado, feedback, transferencia y evaluación.
- Narrador: caso con pistas y solución, sin final global.
- Audio y legal: archivos, licencia, transcripción y atribuciones.

## Política visual
Un asset `identity` (variante del mismo objeto/personaje) requiere similitud de silueta y paleta. El modo `style` admite siluetas nuevas pero nunca autoriza automáticamente la apariencia final. Ambos modos requieren revisión externa y evidencia comparativa real. El umbral de 96/100 es provisional, se debe calibrar con ejemplos aprobados y rechazados.

## Atestaciones
Cada elemento publicado tiene `sha256`, `creator`, `approvals` y enlaces a archivos de evidencia. La atestación `decision: approved` debe indicar `reviewer`, `reviewed_sha256`, `reason`, `evidence` (rutas verificables). GitHub debe imponer los revisores reales mediante protección de rama.

**Nunca** usar autoaprobación, confianza inventada o cambiar una referencia maestra al mismo tiempo que se evalúa un candidato sin nueva aprobación.

## Costos
Validadores: Python estándar, Pillow, runners GitHub Actions gratuitos en repos públicos, sujetos a las condiciones actuales de GitHub. No se ejecutan modelos de IA por defecto; su disponibilidad gratuita no está garantizada.
