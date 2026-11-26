# Verificación del prototipo

## Chequeos históricos

| Chequeo | Resultado |
| --- | --- |
| Datos de ejemplo | `node data/verificar.cjs` valida 850 nodos, 3.594 sumas y 175 claves territoriales. Todos los totales cuadran y `potencial >= total`. |
| Rutas y navegación | Recorrido automatizado de las 12 rutas en DOM real (jsdom): todas visibles, con título de documento y encabezado enfocado al cambiar de ruta. |
| Presidencia | Cambio de vuelta, período y departamento; la subdivisión y los encabezados se actualizan; el ganador solo se resalta en segunda vuelta; el período futuro está deshabilitado. |
| Senado | Pestañas nacional/indígena, filas agrupadas por partido, elegidos en amarillo, enlace a la lista de elegidos y orden alfabético de la lista. |
| Cámara | Cinco circunscripciones; al elegir Exterior el territorio pasa a Consulados y la subdivisión a países. |
| Gobernaciones y Alcaldías | Pestañas Gobernación/Asamblea y Alcaldía/Concejo; encabezados de departamento y municipio correctos; el potencial aparece cuando el requerimiento lo pide. |
| Bogotá | Pestañas Alcalde/Concejo/JAL; columna de localidad; JAL con listas y elegidos. |
| Búsqueda y orden | Búsqueda sin tildes por nombre, lista y sigla; estado vacío; orden por votación y por nombre conservando totales. |
| Datos y carga | Funciona por HTTP (`fetch` de `ejemplo.json`) y desde disco (`file://`, carga dinámica de `ejemplo-local.js`). Se simuló error y reintento. |
| Accesibilidad automática | axe-core sobre las 12 rutas con las reglas WCAG 2.0/2.1 A y AA y buenas prácticas: **0 violaciones**. |
| Teclado | Foco al encabezado en cada ruta; pestañas con flechas, Home y End; `aria-controls` apunta a un panel existente; enlace «Saltar al contenido» funcional. |
| Semántica | Encabezados, etiquetas de formulario, `caption`, `scope`, `aria-sort` y región desplazable con `tabindex`. |
| Contraste y layout | Revisión visual en Firefox a 375 y 1280 px: cabeceras, pestañas, filtros y tablas sin desbordes de página. |
| Aritmética visual | Se corrigió la alineación de las filas de resumen con `colSpan` en tablas simples (Part. + Candidatos). |

## Revalidación de las correcciones de auditoría

Ejecutada sobre el árbol de trabajo de la corrección, basado en `4578223`, con Node 24.22.1 y Chrome 158.0.8127.36.

| Comando | Resultado | Casos vinculados |
| --- | --- | --- |
| `node frontend/data/verificar.cjs` | Pasó. 850 nodos, 3.594 sumas y 175 claves territoriales. Comprueba ganadores, pertenencia de elegidos y cortes del catálogo. | CP-014, CP-019, CP-031, CP-032, CP-037, CP-038 |
| `node frontend/tests/navegador.cjs` | Pasó. 13 rutas por HTTP y desde disco, ganador estable al filtrar, elegidos por ámbito, ambos cortes identificados, municipios en orden y reintento tras HTTP 404 o JSON inválido. | CP-014, CP-019, CP-031, CP-032, CP-037, CP-039, CP-042, CP-043 |
| Mismo comando en Chrome | Pasó. Foco al entrar y activar pestañas, flecha y Tab en Presidencia, sin desbordamiento horizontal de página a 375, 768 y 1280 px. También se probó el reflujo a 384 px como aproximación a 768 px al 200 %. | CP-045, CP-046 (cobertura parcial) |

Los casos restantes del SRS conservan su estado hasta ejecutar su procedimiento completo. La prueba automatizada por navegador cubre escenarios dirigidos de accesibilidad.

## Revisión pendiente en navegador

Los chequeos automáticos no sustituyen una prueba humana completa.

- [ ] Revisar la consola durante la demostración manual.
- [ ] Recorrer con Tab, Mayús+Tab y Enter todas las rutas; verificar el desplazamiento de la tabla con teclado.
- [ ] Revisar manualmente al 200 % de zoom.
- [ ] Ejecutar Lighthouse y anotar rendimiento y accesibilidad (meta superior a 80).
- [ ] Abrir la versión desde otro computador y comparar con las páginas 1–12 del diseño.
- [ ] Medir el tiempo de carga con red lenta: el JSON de ejemplo pesa ~2,9 MB.

## Decisiones de interfaz

La portada reutiliza la gráfica del PDF. Los colores del menú y las tablas parten de la paleta del diseño. Las tablas usan un único renderizador con tres modos (simple, listas por partido y elegidos) para que todas las pantallas mantengan la misma estructura y comportamiento. Los filtros y la búsqueda se colocan antes de la tabla para operarlos sin recorrer las filas.
