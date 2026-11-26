'use strict';

const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const data = JSON.parse(readFileSync(join(__dirname, 'ejemplo.json'), 'utf8'));
const errors = [];
const warnings = [];
const check = (condition, message) => {
  if (!condition) errors.push(message);
};

check(Array.isArray(data.partidos) && data.partidos.length >= 27, 'Faltan partidos políticos');
check(Array.isArray(data.territorios) && data.territorios.length >= 34, 'Faltan territorios');

const partidos = new Map(data.partidos.map(({ sigla, nombre }) => [sigla, nombre]));
const siglas = new Set(partidos.keys());
for (const corte of ['2022', '2026']) {
  const catalogo = data.cortesPartidos?.[corte];
  check(Array.isArray(catalogo) && catalogo.length > 0, `Corte de partidos ${corte} vacío o inválido`);
  if (!Array.isArray(catalogo)) continue;
  check(catalogo.every(({ sigla, nombre }) => partidos.has(sigla) && partidos.get(sigla) === nombre),
    `Corte ${corte}: organización no reconocida`);
  check(new Set(catalogo.map(({ sigla }) => sigla)).size === catalogo.length,
    `Corte ${corte}: siglas repetidas`);
}
const territorioIds = new Set(['nacional']);
for (const territorio of data.territorios) {
  territorioIds.add(territorio.id);
  for (const sub of territorio.municipios ?? []) territorioIds.add(sub.id);
  for (const sub of territorio.localidades ?? []) territorioIds.add(sub.id);
  for (const sub of territorio.paises ?? []) territorioIds.add(sub.id);
}

let nodes = 0;
let candidates = 0;
let rows = 0;
let sumas = 0;

function verifyTotals(node, label) {
  const { totales } = node;
  check(totales && totales.blanco && totales.nulos && totales.noMarcados && totales.potencial && totales.total, `${label}: faltan totales`);
  if (!totales) return;
  const keys = Object.keys(totales.total);
  check(keys.length > 0, `${label}: total vacío`);
  for (const key of keys) {
    check(territorioIds.has(key), `${label}: nivel desconocido ${key}`);
    const rowsFor = node.listas
      ? node.listas.reduce((acc, lista) => acc + lista.votos[key], 0)
      : node.candidatos.reduce((acc, candidato) => acc + candidato.votos[key], 0);
    const expected = rowsFor + totales.blanco[key] + totales.nulos[key] + totales.noMarcados[key];
    check(totales.total[key] === expected, `${label}: total no cuadra en ${key} (${totales.total[key]} != ${expected})`);
    check(totales.potencial[key] >= totales.total[key], `${label}: potencial menor que total en ${key}`);
    sumas += 1;
  }
  for (const lista of node.listas ?? []) {
    check(siglas.has(lista.sigla), `${label}: sigla desconocida ${lista.sigla}`);
    for (const key of keys) {
      check(Number.isSafeInteger(lista.votos[key]) && lista.votos[key] >= 0, `${label}: voto inválido`);
      const candidatosTotal = lista.candidatos.reduce((acc, candidato) => acc + candidato.votos[key], 0);
      check(
        lista.votos[key] === candidatosTotal + lista.porLaLista[key],
        `${label}: lista ${lista.sigla} no cuadra en ${key}`,
      );
      candidates += lista.candidatos.length;
      rows += 1;
    }
  }
  for (const candidato of node.candidatos ?? []) {
    check(siglas.has(candidato.sigla), `${label}: sigla desconocida ${candidato.sigla}`);
    for (const key of keys) {
      check(Number.isSafeInteger(candidato.votos[key]) && candidato.votos[key] >= 0, `${label}: voto inválido en ${candidato.nombre}`);
    }
    candidates += 1;
    rows += 1;
  }
  nodes += 1;
}

function verifyElegidos(node, label, primary) {
  const { elegidos, listas } = node;
  if (!listas && elegidos === undefined) return;
  const valid = Array.isArray(elegidos) && elegidos.length > 0;
  check(valid, `${label}: elegidos vacío o inválido`);
  if (!valid) return;
  for (const elegido of elegidos) {
    check(typeof elegido.nombre === 'string' && elegido.nombre.length > 3, `${label}: elegido sin nombre`);
    check(siglas.has(elegido.sigla), `${label}: elegido con sigla desconocida`);
    check(Number.isSafeInteger(elegido.total), `${label}: elegido sin total`);
    check(Array.isArray(elegido.mayores) && elegido.mayores.length <= 3, `${label}: elegido sin mayores`);
  }
  if (listas) {
    const clave = ({ nombre, sigla, total }) => JSON.stringify([nombre, sigla, total]);
    const esperados = listas.flatMap(({ candidatos, sigla }) => candidatos
      .filter((candidato) => candidato.elegido)
      .map(({ nombre, votos }) => clave({ nombre, sigla, total: votos[primary] })));
    const actuales = elegidos.map(clave).sort();
    check(JSON.stringify(actuales) === JSON.stringify(esperados.sort()),
      `${label}: elegidos fuera del ámbito de la consulta o votación incorrecta`);
  }
}

function verifyGanador(node, label, primary) {
  const candidatos = node.candidatos ?? [];
  const ganadores = candidatos.filter((candidato) => candidato.ganador === true);
  check(candidatos.every((candidato) => typeof candidato.ganador === 'boolean'),
    `${label}: falta indicador de ganador`);
  check(ganadores.length === 1, `${label}: la elección debe tener un ganador`);
  if (ganadores.length === 1) {
    check(candidatos.every((candidato) => candidato.votos[primary] <= ganadores[0].votos[primary]),
      `${label}: el ganador no tiene la mayor votación`);
  }
}

const periodos = {
  presidencia: ['2022', '2026'],
  senado: ['2022', '2026'],
  camara: ['2022', '2026'],
  gobernacion: ['2020', '2024'],
  asamblea: ['2020', '2024'],
  alcaldia: ['2020', '2024'],
  concejo: ['2020', '2024'],
  jal: ['2020', '2024'],
};

for (const [dignidad, años] of Object.entries(periodos)) {
  check(data.dignidades[dignidad], `Falta configuración de ${dignidad}`);
  for (const año of años) {
    check(data.resultados[dignidad]?.[año], `Falta ${dignidad} ${año}`);
    for (const [variante, node] of Object.entries(data.resultados[dignidad][año])) {
      const label = `${dignidad}/${año}/${variante}`;
      check(node.fecha && !Number.isNaN(Date.parse(node.fecha)), `${label}: fecha inválida`);
      check(Array.isArray(node.niveles) && node.niveles.length >= 1, `${label}: sin niveles`);
      if (node.territorios) {
        check(Object.keys(node.territorios).length > 0, `${label}: sin territorios`);
        for (const [territorio, subnode] of Object.entries(node.territorios)) {
          check(territorioIds.has(territorio), `${label}: territorio desconocido ${territorio}`);
          const sublabel = `${label}[${territorio}]`;
          verifyTotals(subnode, sublabel);
          verifyElegidos(subnode, sublabel, territorio);
          if (node.tipoResaltado === 'ganador') verifyGanador(subnode, sublabel, territorio);
        }
        verifyElegidos(node, label);
      } else {
        const primary = variante === 'bogota' ? 'bogota' : 'nacional';
        verifyTotals(node, label);
        verifyElegidos(node, label, primary);
        if (node.tipoResaltado === 'ganador') verifyGanador(node, label, primary);
      }
    }
  }
}

const enabled = (dignidad) => data.dignidades[dignidad].periodos.filter((periodo) => !periodo.disabled).map((periodo) => periodo.id);
const allPeriodsHaveData = Object.entries(periodos).every(([dignidad, años]) =>
  años.every((año) => enabled(dignidad).includes(año)),
);
check(allPeriodsHaveData, 'Hay períodos activos sin datos');

if (errors.length) {
  console.error(`❌ ${errors.length} errores:`);
  for (const error of errors.slice(0, 30)) console.error(` - ${error}`);
  process.exit(1);
}

console.log('✅ Datos válidos');
console.log(`   Nodos verificados: ${nodes}`);
console.log(`   Filas/candidatos: ${rows} (${candidates} referencias)`);
console.log(`   Sumas comprobadas: ${sumas}`);
console.log(`   Partidos: ${siglas.size}; territorios: ${territorioIds.size}`);
if (warnings.length) for (const warning of warnings) console.warn(`⚠️  ${warning}`);
