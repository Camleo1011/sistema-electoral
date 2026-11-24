# Guía Electoral de Colombia

Prototipo frontend del taller ADSO. El recorrido propuesto es **Bienvenida → Menú de resultados → Presidente y vicepresidente**. El alcance está pendiente de confirmación con el instructor.

## Abrir el prototipo

Abre `index.html` en el navegador y elige **Bienvenidos** y luego **Presidente**. Para probar el flujo HTTP, ejecuta `python3 -m http.server 8000` desde esta carpeta y abre `http://localhost:8000`.

La interfaz consulta `data/ejemplo.json` por HTTP. Cuando se abre directamente desde el disco, lee una copia generada del mismo JSON. Si modificas los datos, regenera la copia con `node data/sincronizar-local.cjs` antes de confirmar el cambio.

Los nombres, partidos y cifras son datos de ejemplo. La muestra territorial cubre una selección de departamentos, capitales, localidades y consulados. La interfaz identifica los resultados como no oficiales.

## Evidencias del taller

- [Historias, criterios y trazabilidad](docs/trazabilidad.md)
- [Bitácora de trabajo con IA](docs/bitacora.md)
- [Verificación del prototipo](docs/verificacion.md)
- [Casos y formato del informe de prueba cruzada](docs/informe-prueba-emitido.md)
- [Plan de mejoras](docs/plan-mejoras.md)
- [Conclusiones y guion de demostración](docs/conclusiones.md)

## Archivos clave

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Contiene las tres pantallas, la navegación, los controles y la tabla semántica. |
| `css/tokens.css` | Define los colores, la tipografía, el espaciado y los radios reutilizables. |
| `css/estilos.css` | Aplica los tokens y adapta el menú, los filtros y la tabla al ancho disponible. |
| `js/app.js` | Gestiona las rutas, carga los datos, calcula los totales y actualiza la tabla según los filtros. |
| `data/ejemplo.json` | Guarda las elecciones, los territorios y las cifras de muestra. |

Fuentes del taller: `GuiaElectoral-Requerimientos-24112026.pdf` y `GuiaElectoral-DiseñoInterfazDefinitivo.pdf`.
