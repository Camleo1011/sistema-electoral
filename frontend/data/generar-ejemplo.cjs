'use strict';

const { writeFileSync } = require('node:fs');
const { join } = require('node:path');

const PARTIDOS = [
  ['PL', 'Partido Liberal Colombiano'],
  ['PC', 'Partido Conservador Colombiano'],
  ['CR', 'Partido Cambio Radical'],
  ['PAV', 'Partido Alianza Verde'],
  ['AICO', 'Movimiento Autoridades Indígenas de Colombia'],
  ['ASI', 'Partido Alianza Social Independiente'],
  ['MIRA', 'Partido Político MIRA'],
  ['PU', 'Partido de la Unión por la Gente'],
  ['CD', 'Partido Centro Democrático'],
  ['MAIS', 'Movimiento Alternativo Indígena y Social'],
  ['CJL', 'Partido Colombia Justa Libres'],
  ['CRen', 'Partido Colombia Renaciente'],
  ['ADA', 'Movimiento Alianza Democrática Amplia'],
  ['D&C', 'Partido Político Dignidad & Compromiso'],
  ['NL', 'Partido Nuevo Liberalismo'],
  ['MSN', 'Movimiento Salvación Nacional'],
  ['PO', 'Partido Político Oxígeno'],
  ['PR', 'Partido Republicano'],
  ['PDC', 'Partido Polo Demócrata Colombiano'],
  ['PEC', 'Partido Ecologista Colombiano'],
  ['PPF', 'Partido Político la Fuerza'],
  ['PED', 'Partido Político Esperanza Democrática'],
  ['EM', 'Partido Político en Marcha'],
  ['PH', 'Movimiento Político Pacto Histórico'],
  ['PDP', 'Partido Defensores de la Patria'],
  ['CCN', 'Consejo Comunitario El Naranjo'],
  ['UMC', 'Movimiento Unidad en Minga por Colombia'],
  ['MCr', 'Movimientos Creemos'],
  ['CITREP', 'Circunscripciones Transitorias Especiales de Paz'],
].map(([sigla, nombre]) => ({ sigla, nombre }));

const DEPARTAMENTOS = [
  ['Amazonas', 55000, ['Leticia', 'Puerto Nariño', 'La Chorrera']],
  ['Antioquia', 4100000, ['Medellín', 'Bello', 'Envigado', 'Rionegro', 'Apartadó']],
  ['Arauca', 220000, ['Arauca', 'Saravena', 'Tame']],
  ['Atlántico', 1900000, ['Barranquilla', 'Soledad', 'Malambo']],
  ['Bolívar', 1600000, ['Cartagena', 'Magangué', 'Turbaco']],
  ['Boyacá', 1050000, ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá']],
  ['Caldas', 800000, ['Manizales', 'La Dorada', 'Chinchiná']],
  ['Caquetá', 380000, ['Florencia', 'San Vicente del Caguán', 'Puerto Rico']],
  ['Casanare', 350000, ['Yopal', 'Aguazul', 'Villanueva']],
  ['Cauca', 1100000, ['Popayán', 'Santander de Quilichao', 'Puerto Tejada']],
  ['Cesar', 950000, ['Valledupar', 'Aguachica', 'Agustín Codazzi']],
  ['Chocó', 400000, ['Quibdó', 'Istmina', 'Tadó']],
  ['Córdoba', 1300000, ['Montería', 'Cereté', 'Sahagún']],
  ['Cundinamarca', 2100000, ['Soacha', 'Zipaquirá', 'Fusagasugá', 'Chía']],
  ['Guainía', 40000, ['Inírida', 'Barranco Minas', 'Mapiripana']],
  ['Guaviare', 90000, ['San José del Guaviare', 'Miraflores', 'Calamar']],
  ['Huila', 900000, ['Neiva', 'Pitalito', 'Garzón']],
  ['La Guajira', 700000, ['Riohacha', 'Maicao', 'Uribia']],
  ['Magdalena', 1000000, ['Santa Marta', 'Ciénaga', 'Fundación']],
  ['Meta', 800000, ['Villavicencio', 'Acacías', 'Granada']],
  ['Nariño', 1300000, ['Pasto', 'Tumaco', 'Ipiales']],
  ['Norte de Santander', 1200000, ['Cúcuta', 'Ocaña', 'Villa del Rosario']],
  ['Putumayo', 300000, ['Mocoa', 'Puerto Asís', 'Orito']],
  ['Quindío', 500000, ['Armenia', 'Calarcá', 'Quimbaya']],
  ['Risaralda', 800000, ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal']],
  ['San Andrés y Providencia', 60000, ['San Andrés', 'Providencia']],
  ['Santander', 1800000, ['Bucaramanga', 'Floridablanca', 'Barrancabermeja']],
  ['Sucre', 700000, ['Sincelejo', 'Corozal', 'San Marcos']],
  ['Tolima', 1200000, ['Ibagué', 'Espinal', 'Melgar']],
  ['Valle del Cauca', 3600000, ['Cali', 'Buenaventura', 'Palmira', 'Tuluá']],
  ['Vaupés', 30000, ['Mitú', 'Carurú', 'Taraira']],
  ['Vichada', 60000, ['Puerto Carreño', 'La Primavera', 'Cumaribo']],
];

const LOCALIDADES = [
  'Usaquén', 'Chapinero', 'Santa Fe', 'San Cristóbal', 'Usme', 'Tunjuelito',
  'Bosa', 'Kennedy', 'Fontibón', 'Engativá', 'Suba', 'Barrios Unidos',
  'Teusaquillo', 'Los Mártires', 'Antonio Nariño', 'Puente Aranda', 'La Candelaria',
  'Rafael Uribe Uribe', 'Ciudad Bolívar', 'Sumapaz', 'Corferias', 'Cárceles',
];

const PAISES = [
  'Alemania', 'Argentina', 'Brasil', 'Canadá', 'Chile', 'Costa Rica', 'Ecuador',
  'España', 'Estados Unidos', 'Francia', 'Italia', 'México', 'Países Bajos',
  'Panamá', 'Perú', 'Reino Unido', 'República Dominicana', 'Venezuela',
];

const NOMBRES = [
  'Ana', 'Andrés', 'Ángela', 'Beatriz', 'Carlos', 'Camila', 'Claudia', 'Daniel',
  'Diana', 'Eduardo', 'Elena', 'Felipe', 'Fernanda', 'Gustavo', 'Gloria', 'Héctor',
  'Iván', 'Isabel', 'Javier', 'Jorge', 'José', 'Juan', 'Juliana', 'Laura',
  'Luis', 'Lucía', 'Marcela', 'María', 'Mario', 'Mauricio', 'Natalia', 'Nicolás',
  'Óscar', 'Patricia', 'Pedro', 'Rafael', 'Ricardo', 'Rodrigo', 'Sandra', 'Sergio',
  'Sofía', 'Tatiana', 'Tomás', 'Valentina', 'Víctor', 'Viviana', 'Wilmer', 'Yesica',
];

const APELLIDOS = [
  'Acosta', 'Amaya', 'Ávila', 'Barrios', 'Becerra', 'Beltrán', 'Bohórquez', 'Cabal',
  'Cárdenas', 'Castaño', 'Castillo', 'Cepeda', 'Contreras', 'Cortés', 'Cuéllar',
  'Duarte', 'Escobar', 'Estrada', 'Fajardo', 'García', 'Gómez', 'González', 'Gutiérrez',
  'Hernández', 'Jiménez', 'López', 'Martínez', 'Medina', 'Mendoza', 'Mesa', 'Moreno',
  'Muñoz', 'Navarro', 'Nieves', 'Ortiz', 'Osorio', 'Parra', 'Peralta', 'Pinzón',
  'Quintero', 'Ramírez', 'Restrepo', 'Rincón', 'Ríos', 'Rodríguez', 'Rojas', 'Romero',
  'Salazar', 'Sánchez', 'Suárez', 'Torres', 'Uribe', 'Valencia', 'Vargas', 'Velasco',
];

function slug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function distribute(total, weights) {
  const sum = weights.reduce((acc, value) => acc + value, 0) || 1;
  const raw = weights.map((value) => (total * value) / sum);
  const parts = raw.map(Math.floor);
  let remainder = total - parts.reduce((acc, value) => acc + value, 0);
  const order = raw
    .map((value, index) => ({ fraction: value - Math.floor(value), index }))
    .sort((a, b) => b.fraction - a.fraction);
  let cursor = 0;
  while (remainder > 0) {
    parts[order[cursor % order.length].index] += 1;
    remainder -= 1;
    cursor += 1;
  }
  return parts;
}

function makeNames(count, seed) {
  const random = rng(seed);
  const used = new Set();
  const names = [];
  while (names.length < count) {
    const name = `${NOMBRES[Math.floor(random() * NOMBRES.length)]} ${
      APELLIDOS[Math.floor(random() * APELLIDOS.length)]
    } ${APELLIDOS[Math.floor(random() * APELLIDOS.length)]}`;
    if (used.has(name)) continue;
    used.add(name);
    names.push(name);
  }
  return names;
}

function pickParties(count, seed) {
  const random = rng(seed);
  const pool = [...PARTIDOS];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }
  return pool.slice(0, count);
}

const territorios = [];
const padrones = {};
const nombresPorClave = { nacional: 'Total nacional' };
const claveDepartamentos = [];
const claveCapitales = [];
const claveMunicipiosPorDepto = {};
const claveLocalidades = [];
const clavePaises = [];

for (const [nombre, padron, municipios] of DEPARTAMENTOS) {
  const id = slug(nombre);
  const subdivisiones = municipios.map((municipio, index) => ({
    id: `${id}-${slug(municipio)}`,
    nombre: municipio,
    peso: index === 0 ? 0.45 : 0.35 / (municipios.length - 1),
  }));
  const capital = subdivisiones[0];
  territorios.push({
    id,
    nombre,
    tipo: 'departamento',
    capital: { id: capital.id, nombre: capital.nombre },
    municipios: subdivisiones.map(({ id: subId, nombre: subName }) => ({ id: subId, nombre: subName })),
    padron,
  });
  padrones[id] = padron;
  nombresPorClave[id] = nombre;
  claveDepartamentos.push(id);
  claveCapitales.push(capital.id);
  padrones[capital.id] = Math.round(padron * (0.34 + (padron % 7) * 0.02));
  nombresPorClave[capital.id] = capital.nombre;
  claveMunicipiosPorDepto[id] = [];
  for (const sub of subdivisiones) {
    padrones[sub.id] = Math.round(padron * sub.peso);
    nombresPorClave[sub.id] = `${sub.nombre} (${nombre})`;
    claveMunicipiosPorDepto[id].push(sub.id);
  }
}

const bogotaLocalidades = LOCALIDADES.map((nombre, index) => ({
  id: `bogota-${slug(nombre)}`,
  nombre,
}));
territorios.push({
  id: 'bogota',
  nombre: 'Bogotá D. C.',
  tipo: 'distrito',
  capital: { id: 'bogota', nombre: 'Bogotá D. C.' },
  localidades: bogotaLocalidades,
  padron: 6000000,
});
padrones.bogota = 6000000;
nombresPorClave.bogota = 'Bogotá D. C.';
for (const [index, localidad] of bogotaLocalidades.entries()) {
  padrones[localidad.id] = Math.round(6000000 * (index === 0 ? 0.09 : 0.7 / bogotaLocalidades.length));
  nombresPorClave[localidad.id] = localidad.nombre;
  claveLocalidades.push(localidad.id);
}

const paises = PAISES.map((nombre) => ({ id: `consulados-${slug(nombre)}`, nombre }));
territorios.push({
  id: 'consulados',
  nombre: 'Consulados',
  tipo: 'consulados',
  capital: { id: 'consulados', nombre: 'Consulados' },
  paises,
  padron: 2500000,
});
padrones.consulados = 2500000;
nombresPorClave.consulados = 'Consulados';
for (const [index, pais] of paises.entries()) {
  padrones[pais.id] = Math.round(2500000 * (0.35 / paises.length + (index % 3) * 0.01));
  nombresPorClave[pais.id] = pais.nombre;
  clavePaises.push(pais.id);
}

padrones.nacional = Object.keys(padrones)
  .filter((key) => claveDepartamentos.includes(key) || key === 'bogota' || key === 'consulados')
  .reduce((total, key) => total + padrones[key], 0);

const GLOBAL_KEYS = [
  'nacional',
  ...claveDepartamentos,
  ...claveCapitales,
  'bogota',
  ...claveLocalidades,
  'consulados',
  ...clavePaises,
];
const REGIONAL_KEYS = ['nacional', ...claveDepartamentos, 'bogota', 'consulados'];

const partidoPorSigla = new Map(PARTIDOS.map((partido) => [partido.sigla, partido]));

function totalsFor(keys, amounts) {
  return {
    blanco: amounts.blanco,
    nulos: amounts.nulos,
    noMarcados: amounts.noMarcados,
    potencial: Object.fromEntries(keys.map((key) => [key, padrones[key] ?? 0])),
    total: amounts.total,
  };
}

function emptyAmounts(keys) {
  return {
    blanco: {},
    nulos: {},
    noMarcados: {},
    total: {},
  };
}

function splitTurnout(key, random) {
  const potencial = padrones[key] ?? 0;
  const total = Math.round(potencial * (0.52 + random() * 0.2));
  const blanco = Math.round(total * (0.02 + random() * 0.02));
  const nulos = Math.round(total * (0.025 + random() * 0.02));
  const noMarcados = Math.round(total * (0.02 + random() * 0.03));
  return { potencial, total, blanco, nulos, noMarcados, votable: total - blanco - nulos - noMarcados };
}

function buildSimple(keys, entries, seed) {
  const random = rng(seed);
  const baseWeights = entries.map((entry) => entry.peso ?? (0.5 + random()));
  const candidatos = entries.map((entry) => ({
    nombre: entry.nombre,
    sigla: entry.sigla,
    votos: {},
  }));
  const amounts = emptyAmounts(keys);
  for (const key of keys) {
    const turnout = splitTurnout(key, random);
    const weights = baseWeights.map((weight) => weight * (0.55 + random() * 0.9));
    const shares = distribute(turnout.votable, weights);
    candidatos.forEach((candidato, index) => {
      candidato.votos[key] = shares[index];
    });
    amounts.blanco[key] = turnout.blanco;
    amounts.nulos[key] = turnout.nulos;
    amounts.noMarcados[key] = turnout.noMarcados;
    amounts.total[key] = turnout.total;
  }
  return { candidatos, totales: totalsFor(keys, amounts) };
}

function buildListas(keys, listasMeta, seed) {
  const random = rng(seed);
  const partyWeights = listasMeta.map(() => 0.4 + random() * 1.6);
  const listas = listasMeta.map((meta) => ({
    sigla: meta.sigla,
    votos: {},
    porLaLista: {},
    candidatos: meta.candidatos.map((candidato) => ({
      nombre: candidato.nombre,
      votos: {},
    })),
  }));
  const amounts = emptyAmounts(keys);
  const candidateWeights = listas.map((lista) => lista.candidatos.map(() => 0.35 + random() * 1.5));

  for (const key of keys) {
    const turnout = splitTurnout(key, random);
    const partyShares = distribute(turnout.votable, partyWeights.map((weight) => weight * (0.6 + random() * 0.8)));
    listas.forEach((lista, index) => {
      const partyTotal = partyShares[index];
      const listShare = Math.round(partyTotal * (0.1 + random() * 0.12));
      const candidateTotal = partyTotal - listShare;
      const shares = distribute(candidateTotal, candidateWeights[index].map((weight) => weight * (0.5 + random() * 1.1)));
      lista.votos[key] = partyTotal;
      lista.porLaLista[key] = listShare;
      lista.candidatos.forEach((candidato, candidateIndex) => {
        candidato.votos[key] = shares[candidateIndex];
      });
    });
    amounts.blanco[key] = turnout.blanco;
    amounts.nulos[key] = turnout.nulos;
    amounts.noMarcados[key] = turnout.noMarcados;
    amounts.total[key] = turnout.total;
  }
  return { listas, totales: totalsFor(keys, amounts) };
}

function markElectedFromListas(listas, key, seats) {
  const flat = [];
  for (const lista of listas) {
    for (const candidato of lista.candidatos) {
      flat.push({ lista, candidato });
    }
  }
  flat.sort((a, b) => b.candidato.votos[key] - a.candidato.votos[key]);
  for (const item of flat.slice(0, seats)) item.candidato.elegido = true;
}

function makeListasMeta({ count, candidatesPerList, seed, prefix }) {
  const parties = pickParties(count, seed);
  const names = makeNames(count * candidatesPerList, seed + 77);
  return parties.map((partido, index) => ({
    sigla: partido.sigla,
    candidatos: Array.from({ length: candidatesPerList }, (_, position) => ({
      nombre: names[index * candidatesPerList + position],
    })),
  }));
}

function makeSimpleMeta({ count, seed, prefix }) {
  const parties = pickParties(count, seed);
  const names = makeNames(count, seed + 31);
  return parties.map((partido, index) => ({
    nombre: names[index],
    sigla: partido.sigla,
  }));
}

function buildRegional({ territories, seats, mode, listCount, candidatesPerList, seed, prefix }) {
  const container = {};
  const elegidos = [];
  territories.forEach((territoryId, index) => {
    const keys = territoryId === 'consulados'
      ? ['consulados', ...clavePaises]
      : ['nacional', territoryId, ...(territoryId === 'bogota' ? claveLocalidades : claveMunicipiosPorDepto[territoryId])];
    const node = mode === 'listas'
      ? buildListas(keys, makeListasMeta({ count: listCount, candidatesPerList, seed: seed + index * 13, prefix: `${prefix}-${territoryId}` }), seed + index * 97)
      : buildSimple(keys, makeSimpleMeta({ count: candidatesPerList, seed: seed + index * 13, prefix: `${prefix}-${territoryId}` }), seed + index * 97);
    if (mode === 'listas') {
      const primary = territoryId === 'consulados' ? 'consulados' : territoryId;
      markElectedFromListas(node.listas, primary, seats);
      for (const lista of node.listas) {
        for (const candidato of lista.candidatos) {
          if (!candidato.elegido) continue;
          elegidos.push({
            nombre: candidato.nombre,
            sigla: lista.sigla,

            total: candidato.votos[primary],
            mayores: territoryId === 'consulados'
              ? clavePaises.map((key) => ({ territorio: nombresPorClave[key], votos: candidato.votos[key] })).sort((a, b) => b.votos - a.votos).slice(0, 3)
              : claveMunicipiosPorDepto[territoryId]
                ? claveMunicipiosPorDepto[territoryId].map((key) => ({ territorio: nombresPorClave[key], votos: candidato.votos[key] })).sort((a, b) => b.votos - a.votos).slice(0, 3)
                : [],
          });
        }
      }
    }
    container[territoryId] = node;
  });
  return { territorios: container, elegidos: elegidos.length ? elegidos : undefined };
}

function buildLocal({ territories, seats, mode, listCount, candidatesPerList, seed, prefix }) {
  const container = {};
  territories.forEach((territoryId, index) => {
    const node = mode === 'listas'
      ? buildListas([territoryId], makeListasMeta({ count: listCount, candidatesPerList, seed: seed + index * 17, prefix: `${prefix}-${territoryId}` }), seed + index * 53)
      : buildSimple([territoryId], makeSimpleMeta({ count: candidatesPerList, seed: seed + index * 17, prefix: `${prefix}-${territoryId}` }), seed + index * 53);
    if (mode === 'listas') markElectedFromListas(node.listas, territoryId, seats);
    container[territoryId] = node;
  });
  return { territorios: container };
}

function elegidosFromRegional(regional) {
  return regional.elegidos ?? [];
}

const resultados = {
  presidencia: {},
  senado: {},
  camara: {},
  gobernacion: {},
  asamblea: {},
  alcaldia: {},
  concejo: {},
  jal: {},
};

const nivelNacional = [
  { scope: 'nacional', label: 'Total nacional' },
  { scope: 'territorio', label: 'Departamento' },
  { scope: 'subdivision', label: 'Capital / localidad / país' },
];

function buildPresidencia(year, round, seed) {
  const meta = makeSimpleMeta({ count: round === '1' ? 7 : 2, seed, prefix: `pres-${year}-${round}` }).map((entry) => ({
    ...entry,
    nombre: `${entry.nombre} / ${makeNames(1, seed + entry.nombre.length)[0]}`,
  }));
  const node = buildSimple(GLOBAL_KEYS, meta, seed + 3);
  return {
    fecha: year === '2022' ? (round === '1' ? '2022-05-29' : '2022-06-19') : (round === '1' ? '2026-05-31' : '2026-06-21'),
    niveles: nivelNacional,
    tipoResaltado: round === '2' ? 'ganador' : null,
    ...node,
  };
}

for (const year of ['2022', '2026']) {
  resultados.presidencia[year] = {
    1: buildPresidencia(year, '1', Number(year) + 11),
    2: buildPresidencia(year, '2', Number(year) + 29),
  };
}

for (const year of ['2022', '2026']) {
  const fecha = year === '2022' ? '2022-03-13' : '2026-03-08';
  const nacionalMeta = makeListasMeta({ count: 10, candidatesPerList: 4, seed: Number(year) + 101, prefix: `sen-${year}-nal` });
  const nacional = buildListas(GLOBAL_KEYS, nacionalMeta, Number(year) + 151);
  markElectedFromListas(nacional.listas, 'nacional', 10);
  const indigenaMeta = makeListasMeta({ count: 4, candidatesPerList: 3, seed: Number(year) + 211, prefix: `sen-${year}-ind` });
  const indigena = buildListas(GLOBAL_KEYS, indigenaMeta, Number(year) + 257);
  markElectedFromListas(indigena.listas, 'nacional', 2);

  const elegidos = [];
  for (const [circunstancia, node] of [['Nacional', nacional], ['Indígena', indigena]]) {
    const flat = [];
    for (const lista of node.listas) {
      for (const candidato of lista.candidatos) {
        flat.push({ lista, candidato });
      }
    }
    flat
      .filter((item) => item.candidato.elegido)
      .sort((a, b) => b.candidato.votos.nacional - a.candidato.votos.nacional)
      .forEach((item) => {
        elegidos.push({
          circunscripcion: circunstancia,
          nombre: item.candidato.nombre,
          sigla: item.lista.sigla,

          total: item.candidato.votos.nacional,
          mayores: [...claveDepartamentos, 'bogota', 'consulados']
            .map((key) => ({ territorio: nombresPorClave[key], votos: item.candidato.votos[key] }))
            .sort((a, b) => b.votos - a.votos)
            .slice(0, 3),
        });
      });
  }

  resultados.senado[year] = {
    nacional: { fecha, niveles: nivelNacional, tipoResaltado: 'elegido', ...nacional, elegidos },
    indigena: { fecha, niveles: nivelNacional, tipoResaltado: 'elegido', ...indigena, elegidos },
  };
}

const circunscripcionesCamara = [
  { id: 'regional', label: 'Regional', counts: { listCount: 6, candidatesPerList: 3 }, seats: 4 },
  { id: 'afro', label: 'Afrodescendientes', counts: { listCount: 4, candidatesPerList: 3 }, seats: 2 },
  { id: 'indigena', label: 'Comunidades indígenas', counts: { listCount: 4, candidatesPerList: 3 }, seats: 2 },
  { id: 'exterior', label: 'Colombianos en el exterior', counts: { listCount: 4, candidatesPerList: 3 }, seats: 1 },
  { id: 'citrep', label: 'CITREP', counts: { listCount: 4, candidatesPerList: 3 }, seats: 2 },
];

for (const year of ['2022', '2026']) {
  const fecha = year === '2022' ? '2022-03-13' : '2026-03-08';
  resultados.camara[year] = {};
  circunscripcionesCamara.forEach((circunstancia, index) => {
    const territories = circunstancia.id === 'exterior'
      ? ['consulados']
      : [...claveDepartamentos, 'bogota'];
    const node = buildRegional({
      territories,
      seats: circunstancia.seats,
      mode: 'listas',
      listCount: circunstancia.counts.listCount,
      candidatesPerList: circunstancia.counts.candidatesPerList,
      seed: Number(year) + index * 331,
      prefix: `cam-${year}-${circunstancia.id}`,
    });
    resultados.camara[year][circunstancia.id] = {
      fecha,
      niveles: [
        { scope: 'territorio', label: 'Departamento / consulado' },
        { scope: 'subdivision', label: 'Municipio / localidad / país' },
      ],
      tipoResaltado: 'elegido',
      ...node,
    };
  });
}

const territoriosDepartamento = [...claveDepartamentos];

for (const year of ['2020', '2024']) {
  const fecha = year === '2020' ? '2019-10-27' : '2023-10-29';
  const seed = Number(year) + 401;
  resultados.gobernacion[year] = {
    unica: {
      fecha,
      niveles: [
        { scope: 'territorio', label: 'Departamento' },
        { scope: 'subdivision', label: 'Municipio' },
      ],
      tipoResaltado: 'ganador',
      ...buildRegional({
        territories: territoriosDepartamento,
        seats: 1,
        mode: 'simple',
        listCount: 0,
        candidatesPerList: 4,
        seed,
        prefix: `gob-${year}`,
      }),
      elegidos: undefined,
    },
  };
  resultados.asamblea[year] = {
    unica: {
      fecha,
      niveles: [
        { scope: 'territorio', label: 'Departamento' },
        { scope: 'subdivision', label: 'Municipio' },
      ],
      tipoResaltado: 'elegido',
      ...buildRegional({
        territories: territoriosDepartamento,
        seats: 5,
        mode: 'listas',
        listCount: 4,
        candidatesPerList: 3,
        seed: seed + 17,
        prefix: `asm-${year}`,
      }),
    },
  };
}

const municipiosTodos = [];
for (const deptoId of claveDepartamentos) {
  const depto = territorios.find((territory) => territory.id === deptoId);
  for (const municipio of depto.municipios) {
    municipiosTodos.push({ id: municipio.id, nombre: municipio.nombre, departamento: deptoId });
  }
}

const municipiosSinCapital = municipiosTodos.filter((municipio) => {
  const depto = territorios.find((territory) => territory.id === municipio.departamento);
  return depto.capital.id !== municipio.id;
});

for (const year of ['2020', '2024']) {
  const fecha = year === '2020' ? '2019-10-27' : '2023-10-29';
  const seed = Number(year) + 601;
  resultados.alcaldia[year] = {
    unica: {
      fecha,
      niveles: [{ scope: 'subdivision', label: 'Municipio' }],
      tipoResaltado: 'ganador',
      ...buildLocal({
        territories: municipiosTodos.map((municipio) => municipio.id),
        seats: 1,
        mode: 'simple',
        listCount: 0,
        candidatesPerList: 4,
        seed,
        prefix: `alc-${year}`,
      }),
    },
  };
  resultados.concejo[year] = {
    unica: {
      fecha,
      niveles: [{ scope: 'subdivision', label: 'Municipio' }],
      tipoResaltado: 'elegido',
      ...buildLocal({
        territories: municipiosTodos.map((municipio) => municipio.id),
        seats: 5,
        mode: 'listas',
        listCount: 4,
        candidatesPerList: 3,
        seed: seed + 19,
        prefix: `con-${year}`,
      }),
    },
  };
}

for (const year of ['2020', '2024']) {
  const fecha = year === '2020' ? '2019-10-27' : '2023-10-29';
  const seed = Number(year) + 701;
  resultados.alcaldia[year].bogota = {
    fecha,
    niveles: [
      { scope: 'territorio', label: 'Total distrito' },
      { scope: 'subdivision', label: 'Localidad' },
    ],
    tipoResaltado: 'ganador',
    ...buildRegional({
      territories: ['bogota'],
      seats: 1,
      mode: 'simple',
      listCount: 0,
      candidatesPerList: 6,
      seed,
      prefix: `alc-bog-${year}`,
    }).territorios.bogota,
  };
  resultados.concejo[year].bogota = {
    fecha,
    niveles: [
      { scope: 'territorio', label: 'Total distrito' },
      { scope: 'subdivision', label: 'Localidad' },
    ],
    tipoResaltado: 'elegido',
    ...buildRegional({
      territories: ['bogota'],
      seats: 8,
      mode: 'listas',
      listCount: 6,
      candidatesPerList: 3,
      seed: seed + 23,
      prefix: `con-bog-${year}`,
    }).territorios.bogota,
  };
  resultados.jal[year] = {
    unica: {
      fecha,
      niveles: [{ scope: 'subdivision', label: 'Localidad' }],
      tipoResaltado: 'elegido',
      ...buildLocal({
        territories: claveLocalidades,
        seats: 3,
        mode: 'listas',
        listCount: 4,
        candidatesPerList: 3,
        seed: seed + 41,
        prefix: `jal-${year}`,
      }),
    },
  };
}

const dignidades = {
  presidencia: {
    titulo: 'Presidente y vicepresidente',
    variantes: [
      { id: '1', label: 'Primera vuelta' },
      { id: '2', label: 'Segunda vuelta' },
    ],
    periodos: [
      { id: '2022', label: '2022 – 2026' },
      { id: '2026', label: '2026 – 2030' },
      { id: '2030', label: '2030 – 2034', disabled: true },
    ],
  },
  senado: {
    titulo: 'Senado',
    variantes: [
      { id: 'nacional', label: 'Circunscripción nacional' },
      { id: 'indigena', label: 'Circunscripción indígena' },
    ],
    periodos: [
      { id: '2022', label: '2022 – 2026' },
      { id: '2026', label: '2026 – 2030' },
      { id: '2030', label: '2030 – 2034', disabled: true },
    ],
  },
  camara: {
    titulo: 'Cámara de Representantes',
    variantes: circunscripcionesCamara.map(({ id, label }) => ({ id, label })),
    periodos: [
      { id: '2022', label: '2022 – 2026' },
      { id: '2026', label: '2026 – 2030' },
      { id: '2030', label: '2030 – 2034', disabled: true },
    ],
  },
  gobernacion: {
    titulo: 'Gobernaciones',
    variantes: [{ id: 'unica', label: 'Gobernación' }],
    periodos: [
      { id: '2020', label: '2020 – 2023' },
      { id: '2024', label: '2024 – 2027' },
      { id: '2028', label: '2028 – 2031', disabled: true },
      { id: '2032', label: '2032 – 2035', disabled: true },
    ],
  },
  asamblea: {
    titulo: 'Asambleas departamentales',
    variantes: [{ id: 'unica', label: 'Asamblea' }],
    periodos: [
      { id: '2020', label: '2020 – 2023' },
      { id: '2024', label: '2024 – 2027' },
      { id: '2028', label: '2028 – 2031', disabled: true },
      { id: '2032', label: '2032 – 2035', disabled: true },
    ],
  },
  alcaldia: {
    titulo: 'Alcaldías',
    variantes: [{ id: 'unica', label: 'Alcaldía' }],
    periodos: [
      { id: '2020', label: '2020 – 2023' },
      { id: '2024', label: '2024 – 2027' },
      { id: '2028', label: '2028 – 2031', disabled: true },
      { id: '2032', label: '2032 – 2035', disabled: true },
    ],
  },
  concejo: {
    titulo: 'Concejos municipales',
    variantes: [{ id: 'unica', label: 'Concejo' }],
    periodos: [
      { id: '2020', label: '2020 – 2023' },
      { id: '2024', label: '2024 – 2027' },
      { id: '2028', label: '2028 – 2031', disabled: true },
      { id: '2032', label: '2032 – 2035', disabled: true },
    ],
  },
  jal: {
    titulo: 'Juntas Administradoras Locales',
    variantes: [{ id: 'unica', label: 'JAL' }],
    periodos: [
      { id: '2020', label: '2020 – 2023' },
      { id: '2024', label: '2024 – 2027' },
      { id: '2028', label: '2028 – 2031', disabled: true },
      { id: '2032', label: '2032 – 2035', disabled: true },
    ],
  },
};

const output = {
  meta: {
    titulo: 'Guía Electoral de Colombia',
    aviso: 'Datos de ejemplo — no oficiales',
    generado: 'data/generar-ejemplo.cjs',
    nota: 'Cifras ficticias con fines académicos. No corresponden a resultados oficiales.',
  },
  partidos: PARTIDOS,
  territorios,
  dignidades,
  resultados,
};

const serialized = `${JSON.stringify(output)}\n`;
writeFileSync(join(__dirname, 'ejemplo.json'), serialized);
const candidatos = (function count(value) {
  if (!value || typeof value !== 'object') return 0;
  let total = Array.isArray(value.candidatos) ? value.candidatos.length : 0;
  for (const child of Object.values(value)) total += count(child);
  return total;
})(resultados);
console.log(`ejemplo.json generado: ${(serialized.length / 1024).toFixed(1)} KB, ${candidatos} candidatos/listas.`);
console.log(`Territorios: ${territorios.length}; partidos: ${PARTIDOS.length}; municipios: ${municipiosTodos.length}.`);
console.log(`Municipios sin capital: ${municipiosSinCapital.length}.`);
