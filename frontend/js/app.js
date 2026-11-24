'use strict';

const routes = ['bienvenida', 'resultados', 'presidencia'];
const screens = routes.map((route) => document.getElementById(route));
const filters = document.getElementById('filtros');
const period = document.getElementById('periodo');
const round = document.getElementById('vuelta');
const territory = document.getElementById('territorio');
const subdivision = document.getElementById('subdivision');
const search = document.getElementById('buscar');
const sort = document.getElementById('orden');
const status = document.getElementById('estado');
const retry = document.getElementById('reintentar');
const table = document.getElementById('tabla-contenedor');
const caption = document.getElementById('tabla-titulo');
const candidateColumn = document.getElementById('col-candidatos');
const nationalColumn = document.getElementById('col-nacional');
const territoryColumn = document.getElementById('col-territorio');
const subdivisionColumn = document.getElementById('col-subdivision');
const candidates = document.getElementById('candidatos');
const summary = document.getElementById('resumen');

const alphabet = new Intl.Collator('es-CO');
const integer = new Intl.NumberFormat('es-CO');
const date = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'UTC' });
const summaryLabels = [
  ['Votos en Blanco', 'blanco'],
  ['Votos Nulos', 'nulos'],
  ['Votos No Marcados', 'noMarcados'],
];
const disabledWhileLoading = [period, round, territory, subdivision, search, sort];

let data;
let attemptedLoad = false;

function normalize(text) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es-CO').trim();
}

function namesInOrder(items) {
  return [...items].sort((a, b) => alphabet.compare(a.nombre, b.nombre));
}

function setOptions(select, items, prompt, preferred) {
  select.replaceChildren(new Option(prompt, ''));
  for (const item of items) {
    select.add(new Option(item.nombre, item.id));
  }
  if (items.some((item) => item.id === preferred)) select.value = preferred;
}

function currentTerritory() {
  return data.territorios.find((item) => item.id === territory.value);
}

function updateSubdivisions(preferred) {
  const region = currentTerritory();
  const choices = region?.subdivisiones ?? [];
  const prompt = region?.id === 'consulados' ? 'Todos los países' : 'Todas las subdivisiones';
  setOptions(subdivision, choices, prompt, preferred);
  subdivision.disabled = choices.length === 0;
}

function setView(shouldFocus) {
  const hash = location.hash.slice(1);
  const route = routes.includes(hash) ? hash : 'bienvenida';
  const index = routes.indexOf(route);
  for (const screen of screens) screen.hidden = screen.id !== route;

  const heading = screens[index].querySelector('h1');
  document.title = index === 0 ? heading.textContent : `${heading.textContent} | Guía Electoral de Colombia`;
  if (shouldFocus) {
    window.scrollTo(0, 0);
    heading.focus({ preventScroll: true });
  }
  if (route === 'presidencia' && !attemptedLoad) loadData();
}

function winnerOf(election) {
  const first = [...election.candidatos].sort((a, b) => b.votos.nacional - a.votos.nacional);
  if (first.length === 0 || (first[1]?.votos.nacional === first[0].votos.nacional)) return null;
  return first[0].id;
}

function displayCandidates(election, mode, field, query) {
  const matching = election.candidatos.filter((candidate) => {
    return normalize(`${candidate.formula} ${candidate.partido}`).includes(query);
  });
  if (mode === 'name') {
    return matching.sort((a, b) => alphabet.compare(a.formula, b.formula));
  }
  const key = mode === 'territory' ? field : 'nacional';
  return matching.sort((a, b) => b.votos[key] - a.votos[key] || alphabet.compare(a.formula, b.formula));
}

function totalFor(election, key) {
  const candidateVotes = election.candidatos.reduce((total, candidate) => total + candidate.votos[key], 0);
  return summaryLabels.reduce((total, [, field]) => total + election[field][key], candidateVotes);
}

function row(target, label, party, numbers, className, winner) {
  const tr = target.insertRow();
  if (className) tr.className = className;
  const header = document.createElement('th');
  header.scope = 'row';
  header.textContent = label;
  if (winner) {
    const badge = document.createElement('strong');
    badge.textContent = 'Fórmula ganadora';
    header.append(badge);
  }
  tr.append(header);
  for (const value of [party, ...numbers]) {
    const cell = tr.insertCell();
    cell.textContent = value;
  }
}

function render() {
  if (!data) return;
  const election = data.periodos[period.value][round.value];
  const region = currentTerritory();
  const place = region?.subdivisiones.find((item) => item.id === subdivision.value);
  const fields = ['nacional', region?.id, place?.id];
  const numbers = (getValue) => fields.map((key) => key ? integer.format(getValue(key)) : '—');
  const visible = displayCandidates(election, sort.value, place?.id ?? region?.id ?? 'nacional', normalize(search.value));
  const winner = round.value === '2' ? winnerOf(election) : null;
  const roundName = round.value === '1' ? 'Primera vuelta' : 'Segunda vuelta';
  const dateLabel = date.format(new Date(election.fecha));

  territoryColumn.textContent = region?.nombre ?? 'Departamento / consulado';
  subdivisionColumn.textContent = place?.nombre ?? 'Capital / localidad / país';
  const columnsByOrder = {
    name: candidateColumn,
    national: nationalColumn,
    territory: (place && subdivisionColumn) || (region && territoryColumn) || nationalColumn,
  };
  for (const column of [candidateColumn, nationalColumn, territoryColumn, subdivisionColumn]) {
    column.removeAttribute('aria-sort');
  }
  columnsByOrder[sort.value].setAttribute('aria-sort', sort.value === 'name' ? 'ascending' : 'descending');
  caption.textContent = `${roundName} · ${dateLabel}`;

  status.textContent = visible.length
    ? `${visible.length} de ${election.candidatos.length} fórmulas`
    : 'No hay fórmulas que coincidan con la búsqueda.';
  table.hidden = false;
  candidates.replaceChildren();
  summary.replaceChildren();

  for (const candidate of visible) {
    const elected = candidate.id === winner;
    row(candidates, candidate.formula, candidate.partido, numbers((key) => candidate.votos[key]), elected ? 'winner' : '', elected);
  }
  for (const [label, field] of summaryLabels) {
    row(summary, label, '', numbers((key) => election[field][key]));
  }
  row(summary, 'Votación total', '', numbers((key) => totalFor(election, key)), 'total');
  row(summary, 'Potencial de sufragantes', '', numbers((key) => election.potencial[key]));
}

function validateData(input) {
  if (!Array.isArray(input?.territorios) || input.territorios.length === 0) throw new Error('Faltan territorios');
  const ids = ['nacional', ...input.territorios.flatMap((region) => [region.id, ...region.subdivisiones.map((place) => place.id)])];
  for (const year of ['2022', '2026']) {
    for (const stage of ['1', '2']) {
      const election = input.periodos?.[year]?.[stage];
      if (!election?.candidatos?.length || Number.isNaN(Date.parse(election.fecha))) throw new Error('Falta una elección');
      const maps = [...election.candidatos.map((candidate) => candidate.votos), election.potencial];
      for (const [, field] of summaryLabels) maps.push(election[field]);
      for (const map of maps) {
        if (!ids.every((id) => Number.isSafeInteger(map?.[id]) && map[id] >= 0)) throw new Error('Faltan cifras');
      }
    }
  }
  return input;
}

async function loadData() {
  attemptedLoad = true;
  const focusWasOnRetry = document.activeElement === retry;
  table.hidden = true;
  retry.hidden = true;
  status.textContent = 'Cargando datos de ejemplo…';
  for (const control of disabledWhileLoading) control.disabled = true;

  try {
    let payload;
    if (location.protocol === 'file:') {
      payload = window.datosElectoralesLocales;
    } else {
      const response = await fetch('data/ejemplo.json');
      if (!response.ok) throw new Error('El archivo de datos no está disponible');
      payload = await response.json();
    }
    data = validateData(payload);
    setOptions(territory, namesInOrder(data.territorios), 'Total nacional', 'boyaca');
    for (const control of disabledWhileLoading) control.disabled = false;
    updateSubdivisions('tunja');
    render();
    if (focusWasOnRetry && !screens[2].hidden) period.focus();
  } catch {
    data = undefined;
    table.hidden = true;
    for (const control of disabledWhileLoading) control.disabled = true;
    status.textContent = 'No se pudieron cargar los resultados de ejemplo. Intente nuevamente.';
    retry.hidden = false;
    if (focusWasOnRetry && !screens[2].hidden) retry.focus();
  }
}

document.querySelector('.skip-link').addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector('main section:not([hidden]) h1').focus();
});
filters.addEventListener('submit', (event) => event.preventDefault());
filters.addEventListener('change', (event) => {
  if (!data) return;
  if (event.target === territory) updateSubdivisions();
  render();
});
search.addEventListener('input', render);
retry.addEventListener('click', loadData);
window.addEventListener('hashchange', () => setView(true));
setView(false);
