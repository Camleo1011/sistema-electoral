# Convenciones — Guía Electoral de Colombia (frontend)

- Documentación en español. Código: identificadores en inglés, textos de interfaz en español.
- IDs: RF-001, RNF-001, HU-001, BR-001, CU-001, CP-001, PAN-001, EP-001, ADR-001. Nunca se borra un ID: se marca "Obsoleto".
- Diagramas en PlantUML (.puml). Cada artefacto lleva tabla de control de versiones (versión, fecha, autor, cambio).
- Fuentes de verdad (raíz): PDF de requerimientos, PDF de diseño definitivo y HTML de la guía del taller.
- Los PDF de requerimientos están escaneados (sin texto): leer como imagen.
- Solo frontend: HTML semántico, CSS con variables (tokens), JavaScript sin dependencias; datos en `frontend/data/*.json`.
- Todo dato de ejemplo debe estar marcado como NO OFICIAL. Nunca presentar cifras inventadas como reales.
- Accesibilidad: WCAG 2.1 AA (contraste 4,5:1, teclado, foco visible). Responsive desde móvil (375/768/1280 px).
- Estructura: docs/ (trazabilidad, bitacora, verificacion, 01-…05-), frontend/ (index.html, css/, js/, data/).
