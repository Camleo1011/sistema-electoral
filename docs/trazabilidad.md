# Historias y trazabilidad

Alcance propuesto: bienvenida, menú de resultados y resultados presidenciales. Pendiente de confirmar con el instructor. Las demás categorías se muestran en el menú para conservar su estructura.

| Historia de usuario | Criterio de aceptación |
| --- | --- |
| Como visitante, quiero entrar desde la bienvenida para elegir qué resultados consultar. | Desde la portada llego a Presidencia con dos activaciones y puedo volver al menú. |
| Como visitante, quiero seleccionar período y vuelta para consultar la elección y su fecha. | Los períodos 2022–2026 y 2026–2030 se pueden consultar en ambas vueltas. El período 2030–2034 aparece deshabilitado. Cambiar período o vuelta actualiza la fecha y la tabla. |
| Como visitante, quiero elegir un territorio y su subdivisión para comparar la votación con el total nacional. | La selección de Boyacá ofrece Tunja, Bogotá ofrece localidades de muestra y Consulados ofrece países. Cada selección actualiza los encabezados y las cifras. |
| Como visitante, quiero buscar y ordenar las fórmulas para localizar la información que me interesa. | La búsqueda acepta nombres sin tildes y siglas. La tabla ordena por votación nacional, votación territorial o nombre. Una búsqueda sin coincidencias muestra un mensaje. |
| Como visitante, quiero ver la fórmula ganadora y los totales para interpretar la tabla. | La segunda vuelta identifica con un rótulo y un fondo amarillo a la fórmula con mayor votación nacional. El pie distingue votos en blanco, nulos, no marcados, total y potencial. Una búsqueda conserva los totales de la elección. |
| Como visitante, quiero saber si las cifras son de ejemplo y poder recuperarme de un error de carga. | La página identifica los datos como no oficiales. Si falla la carga se muestra un mensaje y un botón para reintentar. |

| Requerimiento | Pantalla | Componente | Prueba |
| --- | --- | --- | --- |
| Diseño, pp. 1–2. Portada y menú de resultados. | Bienvenida y menú | Portada, enlace «Bienvenidos», navegación | TC-01, TC-02 |
| Requerimientos, p. 1, I.1. Períodos y fechas. | Presidencia | Período, vuelta y encabezado de tabla | TC-03 |
| Requerimientos, p. 1, I.2. Departamentos, capitales, distritos y consulados. | Presidencia | Selectores de territorio y subdivisión | TC-04, TC-05 |
| Requerimientos, pp. 1–2, I.3. Fórmulas, partidos, votos, potencial y regreso. | Presidencia | Tabla, resumen y enlace de regreso | TC-02, TC-06 |
| Diseño, p. 3. Barra de búsqueda. Taller, ciclo 2. Búsqueda, filtros, orden y estados. | Presidencia | Formulario y estado de carga, vacío y error | TC-07, TC-08 |
| Taller, verificación de calidad. Teclado y tamaños de pantalla. | Las tres | Foco visible, rejilla adaptable y región desplazable | TC-01, TC-02, TC-07, TC-09, TC-10 |

## Ciclos de trabajo

1. Construir la estructura semántica y aplicar los tokens visuales a la portada, el menú y los resultados.
2. Implementar navegación, archivos JSON, filtros, búsqueda, orden, resumen y estados de la tabla.
3. Consolidar la accesibilidad de la tabla, verificar los casos y documentar la decisión sobre dependencias.
