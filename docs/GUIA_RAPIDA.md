# ATLAS · Guía para orientarse

ATLAS es **una aventura detectivesca para estudiar idiomas**, todavía experimental. La interfaz está en español; el inglés sirve de puente para aprender francés, alemán, ruso y japonés. Puedes terminar un caso, pero no hay un final definitivo de toda la plataforma.

## Para entrar al proyecto

- **Jugar la demostración:** consulta la página del repositorio en GitHub Pages cuando el despliegue esté habilitado. La versión web vive en `site/`.
- **Ver cómo aprende:** abre `docs/design-v07/` y `docs/research/` para consultar la explicación del sistema, sin tener que leer código.
- **Seguir la evolución:** los experimentos nuevos se prueban en ramas aparte. No se convierten automáticamente en material aprobado.

## Las carpetas, sin jerga

| Carpeta | Qué contiene |
|---|---|
| `site/` | La aventura que ve el estudiante |
| `candidates/` | Vocabulario e ilustraciones por revisar |
| `docs/` | Diseño, pruebas de aprendizaje y decisiones |
| `tests/` | Comprobaciones para evitar errores |
| `published/` | Registro del material expresamente aprobado |
| `atlas/`, `engine/`, `tools/` | Funcionamiento interno y preparación del sitio |

## Lo que todavía no conviene dar por hecho

Los materiales de demostración no equivalen a traducciones o audios certificados. El progreso de un navegador no se sincroniza automáticamente con otro dominio: **exporta tu progreso antes de cambiar de alojamiento**. Las herramientas de prueba disponibles en GitHub no requieren tener tu computadora encendida, aunque consumen minutos sujetos a límites de la plataforma.

**Rama que se conserva:** `feat/review-queue-per-language-20261012` contiene cinco commits y cambios de lecciones/tests aún no fusionados. [Mapa de ramas](RAMAS_2026-10-12.md).

[Detalles sobre Cloudflare](CLOUDFLARE.md) · [Auditoría](AUDITORIA_REPOS_2026-10-12.md) · [Historial técnico del README anterior](history/README-tecnico-2026-10-12.md)
