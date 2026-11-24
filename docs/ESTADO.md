# ESTADO DEL PROYECTO — Guía Electoral de Colombia (Frontend)

**Versión:** 0.1 · **Fecha:** 2026-11-24

## Fase actual
Fase 1 — Análisis (SRS), en curso.

## Fases
| # | Fase | Estado |
|---|---|---|
| 1 | Análisis (SRS) | en curso |
| 2 | Modelado | omitida (solo frontend, sin base de datos propia) — ver deuda |
| 3 | Planificación | pendiente (stack ya decidido: HTML/CSS/JS puros) |
| 4 | Diseño UI/UX | pendiente (base: PDF de diseño definitivo) |
| 5 | Frontend | pendiente |
| 6 | Backend | no aplica (datos de ejemplo en JSON local) |

## Fuentes de verdad (raíz del repo)
1. `GuiaElectoral-Requerimientos-24112026.pdf` (escaneado, sin texto; 8 págs.)
2. `GuiaElectoral-DiseñoInterfazDefinitivo.pdf` (12 págs.)
3. `Taller-InterfacesCasoGuíaElectoral-24112026.html` (guía de la actividad, ADSO/SENA)

## Decisiones (2026-11-24)
- Alcance del SRS: todo el sitio (7 secciones + Bienvenida, Menú, Nosotros); se marca MVP para 5 h (Bienvenida, Menú, 1 página de resultados con tabla/filtros/búsqueda).
- Estructura: código en `frontend/`; docs en `docs/` incluyendo `trazabilidad.md`, `bitacora.md`, `verificacion.md`.
- Tecnología: HTML+CSS+JS puros, datos en JSON local marcados "no oficiales"; biblioteca solo si se justifica.
- Trazabilidad: RF↔HU↔CU↔CP↔PAN, con columnas Requerimiento/Pantalla/Componente/Prueba. EP = N/A.
- Contexto: académico (SENA ADSO, RAP3). Evaluación: fidelidad, funcionamiento, usabilidad, accesibilidad (WCAG 2.1 AA), coherencia visual.

## Preguntas abiertas
(ninguna aún)

## Deuda técnica/documental
- Fase 2 (modelado de datos) y backend omitidos: los datos son JSON de ejemplo. El esquema JSON se definirá en planificación.

## Historial de cambios
| Versión | Fecha | Cambio |
|---|---|---|
| 0.1 | 2026-11-24 | Creación de estructura y tablero |
