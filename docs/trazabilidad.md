# Historias y trazabilidad

Alcance implementado: las ocho dignidades del documento de requerimientos en trece pantallas conectadas. Los datos son de ejemplo y no oficiales.

## Historias de usuario

| Historia de usuario | Criterio de aceptación |
| --- | --- |
| Como visitante, quiero entrar desde la bienvenida para elegir qué resultados consultar. | Desde la portada llego al menú con dos activaciones y vuelvo a la portada desde cualquier pantalla. |
| Como visitante, quiero consultar Presidente y Vicepresidente por período y vuelta. | Cambiar período o vuelta actualiza fecha y tabla; 2030–2034 aparece deshabilitado; la segunda vuelta resalta la fórmula ganadora. |
| Como visitante, quiero consultar Senado nacional e indígena con sus listas y elegidos. | Las pestañas cambian de circunscripción; las listas se ordenan de mayor a menor; los elegidos van en amarillo; existe lista de elegidos con tres mayores votaciones. |
| Como visitante, quiero consultar Cámara en sus cinco circunscripciones. | Puedo alternar Regional, Afrodescendientes, Indígenas, Exterior y CITREP; en Exterior el territorio pasa a consulados y el país a subdivisión. |
| Como visitante, quiero consultar Gobernación y Asamblea por departamento y municipio. | Las pestañas cambian de dignidad; el departamento y el municipio actualizan encabezados y cifras; se muestra el potencial de sufragantes. |
| Como visitante, quiero consultar Alcaldía y Concejo por municipio. | El departamento filtra los municipios; la tabla muestra la votación municipal; el candidato ganador se resalta. |
| Como visitante, quiero consultar Bogotá D. C. por localidad. | Alcalde, Concejo y JAL son pestañas; la localidad actualiza las cifras; la JAL resalta elegidos y permite abrir el listado de la localidad. |
| Como visitante, quiero consultar los partidos y movimientos políticos. | Se pueden consultar los cortes de ejemplo de 2022 y 2026. La tabla muestra número, sigla, nombre y aviso de datos no oficiales. |
| Como visitante, quiero buscar y ordenar para localizar información. | La búsqueda acepta nombres sin tildes, listas y siglas; el orden por votación nacional, territorial o nombre conserva totales; una búsqueda vacía muestra mensaje. |
| Como visitante, quiero saber que las cifras son de ejemplo y recuperarme de un error. | El aviso «Datos de ejemplo — no oficiales» permanece visible; si falla la carga aparece un botón para reintentar. |

## Trazabilidad requisito · pantalla · componente · prueba

| Requerimiento | Pantalla | Componente | Prueba |
| --- | --- | --- | --- |
| Diseño pp. 1–2. Portada y menú. | Bienvenida, Resultados | Portada, tarjetas de acceso | TC-01, TC-02 |
| Requerimientos I.1–I.3. Períodos, territorios y fórmulas. | Presidencia | Pestañas de vuelta, período, selectores y tabla | TC-03, TC-04, TC-06 |
| Requerimientos II.1–II.4. Senado nacional e indígena. | Senado | Pestañas, listas por partido, elegidos | TC-11, TC-12 |
| Requerimientos II.4. Lista de elegidos. | Senado · elegidos | Tabla de elegidos y tres mayores votaciones | TC-13 |
| Requerimientos III.1–III.4. Cámara y circunscripciones. | Cámara | Selector de circunscripción, territorio y municipio | TC-14 |
| Requerimientos III.3–III.4. Cámara exterior. | Cámara · Exterior | Territorio consular y país | TC-15 |
| Requerimientos IV.1–IV.5. Gobernación y Asamblea. | Gobernaciones | Pestañas, tabla simple y tabla de listas | TC-16 |
| Requerimientos V. Alcaldías y Concejos. | Alcaldías | Pestañas, municipio, ganador y potencial | TC-17 |
| Requerimientos VI. Bogotá Alcalde, Concejo y JAL. | Bogotá | Pestañas, localidades y elegidos | TC-18 |
| Requerimientos VII. Partidos y movimientos. | Partidos | Tabla de organizaciones | TC-19 |
| Diseño p. 12. Nosotros y Artículo 21. | Nosotros | Contenido estático | TC-20 |
| Taller. Búsqueda, filtros, orden y estados. | Todas las de resultados | Filtros, buscador, orden y estados | TC-07, TC-08 |
| Taller. Teclado, contraste y anchos. | Todas | Foco visible, pestañas accesibles, rejilla adaptable | TC-01, TC-02, TC-09, TC-10 |

## Casos del SRS vinculados con la auditoría

| Requisito | Historia y caso de uso | Pantalla | Componentes | Casos |
| --- | --- | --- | --- | --- |
| RF-014 | HU-003, CU-003 | PAN-005 | Generador electoral y render de elegidos | CP-014, TC-13 |
| RF-019 | HU-004, CU-004 | PAN-006 y lista de elegidos de Cámara | Navegación, configuración de Cámara y datos por ámbito | CP-019, TC-14, TC-15 |
| RF-031 | HU-007, CU-007 | PAN-009 | Vista de Bogotá y listado por localidad | CP-031, TC-18 |
| RF-032 | HU-008, CU-008 | PAN-010 | Datos de los cortes y render del catálogo | CP-032, TC-19 |
| RF-037 | HU-010, CU-010 | PAN-003 y otras con ganador o elegidos | Generador electoral y render de candidaturas | CP-037, TC-06, TC-07 |
| RF-039 | HU-010, CU-010 | PAN-010 y pantallas con datos electorales | Aviso en los resultados y el catálogo | CP-039, TC-19 |
| RF-042 | HU-010, CU-010 | Pantallas alimentadas por JSON | Cargador de datos y botón de reintento | CP-042 |
| RF-043 | HU-010, CU-010 | Pantallas con filtros territoriales | Selectores y orden territorial | CP-043, TC-04, TC-16 |
| RNF-002 y RNF-003 | Transversales | Todas | Navegación, pestañas, foco y estilos adaptables | CP-045, CP-046, TC-01, TC-02, TC-09, TC-10 |

Los resultados de ejecución se registran en [Verificación del prototipo](verificacion.md).

## Ciclos de trabajo

1. **Estructura y estilos.** Tokens, secciones semánticas, pestañas, tablas agrupadas y adaptación móvil.
2. **Comportamiento.** Modelo de datos único, router por hash, filtros dependientes, búsqueda, orden, elegidos y estados.
3. **Ajuste y verificación.** Tabla accesible, contraste, generador y verificador de datos, pruebas de rutas y decisión de mantener JavaScript nativo sin bibliotecas.
