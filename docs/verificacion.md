# Verificación del prototipo

## Chequeos realizados

| Chequeo | Resultado |
| --- | --- |
| Navegación y destino del foco | Verificado en un entorno de JavaScript con DOM simulado. Se recorrieron bienvenida, menú y Presidencia, además del regreso y el salto al contenido. |
| Formulario y tabla | Verificado en DOM simulado. Se cambiaron período, vuelta, territorio y subdivisión. Se probaron búsqueda por nombre sin tilde, búsqueda por sigla, resultado vacío y orden nacional, territorial y por nombre. |
| Datos de ejemplo | El JSON es válido y la copia para apertura desde disco coincide con él. Se comprobaron los totales, el potencial y la identificación de la fórmula ganadora aunque cambie el orden. |
| Estados de carga | Con HTTP simulado se comprobó carga, error y recuperación al reintentar. |
| Estructura de HTML | Se comprobaron los seis campos con etiquetas, el idioma, el texto alternativo, los identificadores de destino y las rutas de los archivos. |
| Contraste en la paleta | Las combinaciones de texto sobre fondos sólidos revisadas alcanzan al menos 6,38:1. Comprobar en navegador los estados interactivos y el texto sobre la portada. |

## Revisión pendiente en navegador

El entorno de trabajo impidió iniciar el navegador con conexión gráfica y el servidor local. Los chequeos de JavaScript y estructura no sustituyen la ejecución visual.

- [ ] Completar el flujo principal en tres clics o menos, y revisar la consola de inicio a fin.
- [ ] Recorrer con Tab, Mayús+Tab y Enter. Verificar el indicador de foco, el orden y el desplazamiento del contenedor de tabla con teclado.
- [ ] Abrir a **375, 768 y 1280 px**. Verificar encabezados, filtros y el desplazamiento de la tabla dentro de su contenedor.
- [ ] Ampliar al 200 %. Revisar cortes, superposición y desplazamiento del documento.
- [ ] Ejecutar Lighthouse y anotar las puntuaciones de rendimiento y accesibilidad, con una meta superior a 80 en ambas.
- [ ] Abrir la versión desde otro computador y comparar la interfaz con las páginas 1–3 del diseño.

## Decisiones de interfaz

La portada reutiliza la gráfica del PDF. Los colores del menú y las tablas parten de la paleta del diseño. Se usó una tipografía local y se adaptaron las proporciones y el espaciado a pantallas pequeñas. Los filtros y la búsqueda se colocaron antes de la tabla para que se puedan encontrar y operar sin recorrer todas las filas.
