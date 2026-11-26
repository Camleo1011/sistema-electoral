# Bitácora de trabajo con IA

Este registro documenta lo trabajado en la conversación y las decisiones aplicadas en el prototipo. El equipo debe añadir sus integrantes, la rotación real de piloto y copiloto y su revisión de estas decisiones. En la ampliación se mantuvo la regla de que el agente propone y el equipo ejecuta y verifica.

| Qué pedimos | Qué entregó el agente | Qué se aplicó | Por qué |
| --- | --- | --- | --- |
| Convertir el PDF de requerimientos a Markdown. | Transcripción de ocho páginas escaneadas. | Se usaron los apartados I.1–I.3 como base de Presidencia. | Permite consultar períodos, cobertura y columnas con facilidad. |
| Convertir el PDF de diseño a Markdown. | Doce secciones con tablas y enlaces a páginas del PDF. | Se contrastaron las páginas 1–3 con la estructura del prototipo. | Esas páginas muestran el flujo de bienvenida, menú y Presidencia. |
| Identificar el trabajo y el entregable del taller. | Resumen del alcance mínimo y las evidencias. | Se propuso el recorrido de Presidencia, sujeto a validación del instructor. | Permite cerrar un flujo completo en el tiempo previsto. |
| Avanzar con el taller, ciclo de estructura. | HTML semántico, hoja de tokens y estilos adaptables. | Se reutilizó la gráfica de portada del PDF y se aplicó la paleta del diseño. | Conserva la identidad visual del material de origen. |
| Avanzar con el taller, ciclo de comportamiento. | Rutas, carga del JSON, controles y estados. | Se usó una navegación por anclas y se añadió copia generada para apertura desde disco. | Permite la demo con servidor local o al abrir `index.html`. |
| Mostrar resultados de ejemplo. | Cuatro elecciones de muestra y cálculo de los totales. | Se usaron fórmulas ficticias, una muestra territorial y un aviso visible. | Los usuarios pueden probar el flujo sin confundir las cifras con resultados oficiales. |
| Completar el ajuste de la tabla y decidir la biblioteca. | Encabezados dinámicos, `aria-sort`, foco y tabla desplazable. | Se mantuvo JavaScript nativo. | El volumen y la interacción son pequeños y el grupo puede explicar el código sin dependencias. |
| Preparar calidad y prueba cruzada. | Verificación técnica y diez casos con formato para evidencias. | Se dejó preparada la prueba humana y se registraron los chequeos realizados y pendientes. | Cada hallazgo del informe debe salir de una prueba real. |
| Completar todas las dignidades del documento de requerimientos. | Propuesta de alcance para ocho dignidades y doce pantallas. | Se aceptó cubrir Senado, Cámara, Gobernaciones/Asambleas, Alcaldías/Concejos, Bogotá y Partidos. | El taller pide convertir los dos PDF, no solo una muestra. |
| Modelar datos de ejemplo para todas las elecciones. | Estructura `dignidades → resultados → período → variante → territorios`. | Se adoptó un esquema único con alcance nacional, regional y local. | Permite reutilizar un solo renderizador y explicar el código con facilidad. |
| Generar cientos de cifras sin inconsistencias. | Script `generar-ejemplo.cjs` con semilla y reparto de votos. | Se generaron 34 territorios, 29 partidos y 850 nodos; el espejo local se regenera. | Evita errores manuales y hace reproducible la muestra. |
| Verificar que los totales cuadren. | `verificar.cjs` con 3.594 sumas y referencias. | Se corrigió el generador hasta dejar los 850 nodos válidos. | La tabla no debe mostrar totales que no sumen. |
| Habilitar el menú y las pestañas. | Router hash con doce rutas, pestañas y filtros dependientes. | Se reemplazó la tabla presidencial por `vistas.js`, `datos.js`, `tabla.js` y `app.js`. | Cada pantalla nueva se configura sin duplicar lógica. |
| Revisar accesibilidad de las pantallas nuevas. | Auditoría axe con 0 violaciones y pruebas de teclado. | Se corrigieron columnas de totales con `colSpan`, `aria-controls` y el nombre duplicado de regiones. | Los totales quedaban corridos y las pestañas apuntaban a un panel inexistente. |

Los archivos se explican en el [mapa del repositorio](../frontend/README.md#archivos-clave). El equipo puede añadir su propia explicación antes de la entrega.
