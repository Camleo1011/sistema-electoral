# Guía Electoral de Colombia

Prototipo frontend del taller ADSO. Ahora cubre **todas las dignidades del documento de requerimientos**: Presidencia, Senado (nacional e indígena), Cámara (cinco circunscripciones), Gobernaciones y Asambleas, Alcaldías y Concejos, Bogotá D. C. (Alcalde, Concejo y JAL) y Partidos Políticos, además de Bienvenida, Menú de resultados y Nosotros.

Los datos son **de ejemplo y no oficiales**: las cifras se generan de forma determinista y están marcadas como tales en cada pantalla.

## Abrir el prototipo

Abre `index.html` en el navegador y elige **Bienvenidos**. Para probar el flujo HTTP:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

- Con servidor local la interfaz consulta `data/ejemplo.json` por HTTP.
- Abierto desde el disco (`file://`) carga `data/ejemplo-local.js`, una copia generada del mismo JSON.

## Datos de ejemplo

```bash
node data/generar-ejemplo.cjs    # regenera ejemplo.json (34 territorios, 29 partidos)
node data/sincronizar-local.cjs  # regenera ejemplo-local.js para file://
node data/verificar.cjs          # valida totales, referencias y períodos
```

`generar-ejemplo.cjs` usa una semilla fija, así que dos ejecuciones producen el mismo resultado. `verificar.cjs` comprueba que en cada nodo `votación total = candidatos + blanco + nulos + no marcados` y que `potencial >= total`.

Cobertura: 32 departamentos con capital y municipios de muestra, Bogotá D. C. con sus 20 localidades + Corferias + Cárceles, y consulados por país. Las cifras son ficticias.

La regresión en navegador se ejecuta desde la raíz con `node frontend/tests/navegador.cjs`. Requiere Chrome o Chromium. Usa `CHROME_BIN` para indicar la ruta al ejecutable si no está en el PATH.

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `#bienvenida` | Portada |
| `#resultados` | Menú de resultados |
| `#presidencia` | Presidente y vicepresidente (1.ª y 2.ª vuelta) |
| `#senado` / `#senado-elegidos` | Senado nacional e indígena / lista de elegidos |
| `#camara` / `#camara-elegidos` | Cámara, cinco circunscripciones / lista de elegidos |
| `#gobernaciones` | Gobernación y Asamblea |
| `#alcaldias` | Alcaldía y Concejo |
| `#bogota` / `#bogota-elegidos` | Bogotá: Alcalde, Concejo y JAL / elegidos del Concejo o de la JAL consultada |
| `#partidos` | Partidos y movimientos políticos, con cortes de ejemplo de 2022 y 2026 |
| `#nosotros` | Historia, contacto y Artículo 21 |

## Archivos clave

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Secciones semánticas de las pantallas y navegación. |
| `css/tokens.css` | Colores, tipografía, espaciado y radios reutilizables. |
| `css/estilos.css` | Menú, pestañas, filtros, tablas agrupadas, estados y diseño adaptable. |
| `js/vistas.js` | Configuración de cada pantalla: períodos, variantes, columnas y alcance. |
| `js/datos.js` | Carga HTTP/local, validación e índices de territorios y partidos. |
| `js/tabla.js` | Renderizador único para tablas simples, listas por partido y elegidos. |
| `js/app.js` | Router por hash, pestañas, filtros dependientes, búsqueda, orden y foco. |
| `data/ejemplo.json` | Datos de ejemplo de las ocho dignidades. |
| `data/generar-ejemplo.cjs` | Generador determinista del JSON. |
| `data/verificar.cjs` | Verificación aritmética y de referencias. |
| `data/sincronizar-local.cjs` | Copia para abrir sin servidor. |

Fuentes del taller: `GuiaElectoral-Requerimientos-24112026.pdf` y `GuiaElectoral-DiseñoInterfazDefinitivo.pdf`.

## Evidencias del taller

- [Historias y trazabilidad](../docs/trazabilidad.md)
- [Bitácora de trabajo con IA](../docs/bitacora.md)
- [Verificación del prototipo](../docs/verificacion.md)
- [Casos y formato del informe de prueba cruzada](../docs/informe-prueba-emitido.md)
- [Plan de mejoras](../docs/plan-mejoras.md)
- [Conclusiones y guion de demostración](../docs/conclusiones.md)
