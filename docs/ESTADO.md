# ESTADO DEL PROYECTO — Guía Electoral de Colombia (Frontend)

**Versión:** 0.3 · **Fecha:** 2026-11-26

## Fase actual
Fase 5 — Frontend implementado para las 8 dignidades. La prueba cruzada del taller está pendiente.

## Fases
| # | Fase | Estado |
|---|---|---|
| 1 | Análisis (SRS) | en curso (SRS inicial versionado) |
| 2 | Modelado | omitida (solo frontend, sin base de datos propia) — ver deuda |
| 3 | Planificación | completado (stack HTML/CSS/JS puros y modelo de datos JSON) |
| 4 | Diseño UI/UX | aplicado (tokens y componentes tomados del PDF de diseño) |
| 5 | Frontend | completado (13 pantallas, 8 dignidades, datos de ejemplo) |
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

## Decisiones (2026-11-26)
- Alcance ampliado: las 8 dignidades del documento de requerimientos en 12 pantallas (Presidencia, Senado, Cámara, Gobernaciones/Asambleas, Alcaldías/Concejos, Bogotá Alcalde/Concejo/JAL, Partidos y Nosotros).
- Modelo de datos único: `dignidades → resultados → período → variante` con alcance nacional, regional y local.
- Datos reproducibles: `data/generar-ejemplo.cjs` (semilla fija) y `data/verificar.cjs` (850 nodos y 3.594 sumas comprobadas).
- Código reutilizable: `js/vistas.js` (configuración), `js/datos.js` (carga), `js/tabla.js` (render) y `js/app.js` (router/filtros).
- Excepción a la convención de idioma: los identificadores nuevos están en español (Datos, Tabla, VISTAS) para mantener continuidad con el prototipo; se acepta como deuda y se revisará si el equipo lo requiere.

## Preguntas abiertas
- En Cámara, el SRS usa «CIPREP» y el diseño definitivo usa «CITREP». El prototipo conserva el rótulo del diseño hasta resolver la diferencia entre fuentes.

## Deuda técnica/documental
- Fase 2 (modelado de datos) y backend omitidos: los datos son JSON de ejemplo.
- El JSON de ejemplo pesa ~2,9 MB y su espejo local otro tanto; si la demo se hace con red lenta, reducir la muestra o cargar por dignidad.
- Prueba cruzada con otro equipo, Lighthouse y revisión manual al 200 % pendientes.
- Identificadores nuevos en español (ver decisión 2026-11-26).

## Historial de cambios
| Versión | Fecha | Cambio |
|---|---|---|
| 0.1 | 2026-11-24 | Creación de estructura y tablero |
| 0.2 | 2026-11-26 | Frontend para las 8 dignidades y verificación aritmética de los datos |
| 0.3 | 2026-11-26 | Correcciones de ganador, listados de elegidos, catálogo, carga y orden territorial |
