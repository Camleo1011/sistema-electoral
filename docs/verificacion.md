# Verificación del prototipo

## Chequeos realizados

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

## Revisión pendiente en navegador

Los chequeos automáticos no sustituyen una prueba humana completa.

- [ ] Completar el flujo principal en tres clics o menos y revisar la consola de inicio a fin.
- [ ] Recorrer con Tab, Mayús+Tab y Enter todas las rutas; verificar el desplazamiento de la tabla con teclado.
- [ ] Revisar a 768 px y al 200 % de zoom.
- [ ] Ejecutar Lighthouse y anotar rendimiento y accesibilidad (meta superior a 80).
- [ ] Abrir la versión desde otro computador y comparar con las páginas 1–12 del diseño.
- [ ] Medir el tiempo de carga con red lenta: el JSON de ejemplo pesa ~2,9 MB.

## Decisiones de interfaz

La portada reutiliza la gráfica del PDF. Los colores del menú y las tablas parten de la paleta del diseño. Las tablas usan un único renderizador con tres modos (simple, listas por partido y elegidos) para que todas las pantallas mantengan la misma estructura y comportamiento. Los filtros y la búsqueda se colocan antes de la tabla para operarlos sin recorrer las filas.
