# Conclusiones

1. **Interfaz.** El prototipo conecta trece pantallas y permite consultar las ocho dignidades del documento de requerimientos: Presidencia, Senado, Cámara, Gobernaciones y Asambleas, Alcaldías y Concejos, Bogotá (Alcalde, Concejo y JAL), Partidos Políticos y Nosotros. Las tablas comparten un renderizador con tres modos: candidaturas simples, listas agrupadas por partido y listas de elegidos. El aviso de cifras no oficiales permanece visible en todos los resultados.
2. **Datos.** La muestra cubre 32 departamentos con capital y municipios de muestra, Bogotá con sus localidades, Corferias y Cárceles, y consulados por país. Un generador determinista y un verificador automático garantizan que los totales cuadren y que no haya referencias rotas.
3. **Prueba cruzada.** Pendiente de completar con lo que observe el equipo evaluador durante la prueba real. Los veinte casos del informe ya cubren todas las pantallas.
4. **Trabajo con IA.** La transcripción de los PDF permitió extraer requisitos y columnas; el equipo decidió ampliar el alcance a todas las dignidades y mantener JavaScript nativo. Las correcciones de alineación de totales, `aria-controls` y nombre de regiones salieron de la verificación automática.

## Demostración de tres minutos

| Tiempo | Acción |
| --- | --- |
| 0:00–0:30 | Abrir la bienvenida, entrar al menú y mostrar que están activas todas las dignidades. |
| 0:30–1:10 | Presidencia: cambiar de vuelta, elegir Boyacá/Tunja y mostrar el ganador en segunda vuelta. |
| 1:10–1:50 | Senado: alternar circunscripción, mostrar listas por partido y elegidos; abrir la lista de elegidos. |
| 1:50–2:20 | Cámara: cambiar a circunscripción Exterior y mostrar cómo los filtros pasan a consulados y países. |
| 2:20–2:40 | Bogotá: alternar Alcalde, Concejo y JAL; buscar un nombre. |
| 2:40–3:00 | Explicar por qué se usó JavaScript sin bibliotecas y mencionar el verificador de datos y la auditoría axe. |
