'use strict';

const RUTAS = ['bienvenida', 'resultados', ...Object.keys(VISTAS), 'nosotros'];

const secciones = new Map();
for (const id of RUTAS) {
  const seccion = document.getElementById(id);
  if (seccion) secciones.set(id, seccion);
}

const refs = new Map();
const estados = new Map();

let cargando = false;
let errorCarga = false;

function crear(tag, propiedades = {}, hijos = []) {
  const elemento = document.createElement(tag);
  for (const [clave, valor] of Object.entries(propiedades)) {
    if (clave === 'class') elemento.className = valor;
    else if (clave === 'text') elemento.textContent = valor;
    else if (clave === 'dataset') Object.assign(elemento.dataset, valor);
    else if (valor === true) elemento.setAttribute(clave, '');
    else if (valor !== false && valor != null) elemento.setAttribute(clave, valor);
  }
  for (const hijo of [].concat(hijos)) {
    if (hijo) elemento.append(hijo);
  }
  return elemento;
}

function refsDe(id) {
  if (refs.has(id)) return refs.get(id);
  const seccion = secciones.get(id);
  const mapa = {
    seccion,
    tabs: seccion.querySelector('[data-tabs]'),
    filtros: seccion.querySelector('[data-filtros]'),
    estado: seccion.querySelector('[data-estado]'),
    reintentar: seccion.querySelector('[data-reintentar]'),
    tabla: seccion.querySelector('[data-tabla]'),
    caption: seccion.querySelector('[data-caption]'),
    head: seccion.querySelector('[data-head]'),
    body: seccion.querySelector('[data-body]'),
    foot: seccion.querySelector('[data-foot]'),
    intro: seccion.querySelector('[data-intro]'),
    links: seccion.querySelector('[data-links]'),
  };
  refs.set(id, mapa);
  return mapa;
}

function estadoInicial(id) {
  const vista = VISTAS[id];
  const variante = vista.variantes?.[0];
  return {
    periodo: vista.defecto?.periodo ?? '',
    variante: variante?.id,
    territorio: vista.defecto?.territorio,
    subdivision: vista.defecto?.subdivision,
    buscar: '',
    orden: variante?.modo === 'elegidos' ? 'nombre' : variante?.columnas?.[0] ?? 'nombre',
  };
}

function estadoDe(id) {
  if (!estados.has(id)) estados.set(id, estadoInicial(id));
  return estados.get(id);
}

function configTerritorio(vista, variante) {
  return variante?.territorio ?? vista.territorio ?? null;
}

function normalizarEstado(vista, variante, estado) {
  const config = configTerritorio(vista, variante);
  if (!config) return;
  const opciones = Datos.territorios(config.tipos);
  if (!opciones.some((territorio) => territorio.id === estado.territorio)) {
    const preferido = vista.defecto?.territorio;
    estado.territorio = opciones.some((territorio) => territorio.id === preferido) ? preferido : opciones[0]?.id;
  }
  const territorio = opciones.find((item) => item.id === estado.territorio) ?? null;
  const subdivisions = Datos.subdivisiones(territorio, config.subdivision);
  if (!subdivisions.some((item) => item.id === estado.subdivision)) {
    const preferido = vista.defecto?.subdivision;
    estado.subdivision = subdivisions.some((item) => item.id === preferido) ? preferido : subdivisions[0]?.id;
  }
  estado.territorioNombre = territorio?.nombre ?? '';
  estado.subdivisionNombre = subdivisions.find((item) => item.id === estado.subdivision)?.nombre ?? '';
}

function opcionesOrden(variante, estado) {
  if (variante.modo === 'elegidos') {
    return [
      { value: 'nombre', label: 'Nombre (A–Z)' },
      { value: 'total', label: 'Votación (mayor a menor)' },
    ];
  }
  const opciones = [];
  for (const scope of variante.columnas) {
    if (scope === 'nacional') opciones.push({ value: 'nacional', label: 'Votación nacional (mayor a menor)' });
    else if (scope === 'territorio') opciones.push({ value: 'territorio', label: `Votación en ${estado.territorioNombre} (mayor a menor)` });
    else opciones.push({ value: 'subdivision', label: `Votación en ${estado.subdivisionNombre} (mayor a menor)` });
  }
  opciones.push({ value: 'nombre', label: 'Nombre o lista (A–Z)' });
  return opciones;
}

function llenarSelect(select, opciones, valor, deshabilitadas = new Set()) {
  select.replaceChildren();
  for (const opcion of opciones) {
    const option = new Option(opcion.label, opcion.value);
    if (deshabilitadas.has(opcion.value)) option.disabled = true;
    select.add(option);
  }
  if (opciones.some((opcion) => opcion.value === valor)) select.value = valor;
}

function construirTabs(id) {
  const vista = VISTAS[id];
  const mapa = refsDe(id);
  if (!mapa.tabs) return;
  if (mapa.tabla && !mapa.tabla.id) mapa.tabla.id = `${id}-panel`;
  const variantes = vista.variantes ?? [];
  if (variantes.length <= 1) {
    mapa.tabs.hidden = true;
    mapa.tabs.replaceChildren();
    return;
  }
  const estado = estadoDe(id);
  mapa.tabs.hidden = false;
  mapa.tabs.setAttribute('role', 'tablist');
  mapa.tabs.setAttribute('aria-label', vista.tabsLabel ?? 'Variantes');
  mapa.tabs.replaceChildren();
  const botones = variantes.map((variante) => {
    const boton = crear('button', {
      type: 'button',
      role: 'tab',
      class: 'tab',
      id: `${id}-tab-${variante.id}`,
      'aria-controls': `${id}-panel`,
    });
    boton.textContent = variante.label;
    const activa = variante.id === estado.variante;
    boton.setAttribute('aria-selected', String(activa));
    boton.tabIndex = activa ? 0 : -1;
    boton.addEventListener('click', () => {
      if (estado.variante === variante.id) return;
      estado.variante = variante.id;
      estado.orden = variante.modo === 'elegidos' ? 'nombre' : variante.columnas[0];
      construirTabs(id);
      construirFiltros(id);
      pintar(id);
    });
    boton.addEventListener('keydown', (evento) => {
      const indice = variantes.findIndex((item) => item.id === variante.id);
      let destino = null;
      if (evento.key === 'ArrowRight') destino = (indice + 1) % variantes.length;
      else if (evento.key === 'ArrowLeft') destino = (indice - 1 + variantes.length) % variantes.length;
      else if (evento.key === 'Home') destino = 0;
      else if (evento.key === 'End') destino = variantes.length - 1;
      if (destino === null) return;
      evento.preventDefault();
      const siguiente = variantes[destino];
      estado.variante = siguiente.id;
      estado.orden = siguiente.modo === 'elegidos' ? 'nombre' : siguiente.columnas[0];
      construirTabs(id);
      construirFiltros(id);
      pintar(id);
      document.getElementById(`${id}-tab-${siguiente.id}`)?.focus();
    });
    return boton;
  });
  mapa.tabs.append(...botones);
}

function construirFiltros(id) {
  const vista = VISTAS[id];
  const mapa = refsDe(id);
  const estado = estadoDe(id);
  const variante = vista.variantes.find((item) => item.id === estado.variante) ?? vista.variantes[0];
  estado.variante = variante.id;
  normalizarEstado(vista, variante, estado);

  mapa.filtros.replaceChildren();
  const form = crear('form', { class: 'filters', role: 'search', 'aria-label': `Filtros de ${vista.titulo}` });
  form.addEventListener('submit', (evento) => evento.preventDefault());

  const nuevoSelect = (nombre, etiqueta, valor, opciones, deshabilitadas) => {
    const select = crear('select', { id: `${id}-${nombre}`, name: nombre });
    llenarSelect(select, opciones, valor, deshabilitadas);
    const label = crear('label', { for: `${id}-${nombre}`, text: etiqueta }, [select]);
    form.append(label);
    return select;
  };

  const periodoSelect = nuevoSelect(
    'periodo',
    'Período',
    estado.periodo,
    Datos.datosActuales().dignidades[vista.periodosDe].periodos.map((periodo) => ({
      value: periodo.id,
      label: periodo.disabled ? `${periodo.label} (no activado)` : periodo.label,
    })),
    new Set(
      Datos.datosActuales().dignidades[vista.periodosDe].periodos
        .filter((periodo) => periodo.disabled)
        .map((periodo) => periodo.id),
    ),
  );

  const config = configTerritorio(vista, variante);
  let territorioSelect = null;
  let subdivisionSelect = null;
  if (config && !vista.sinTerritorio) {
    const territorios = Datos.territorios(config.tipos);
    territorioSelect = nuevoSelect(
      'territorio',
      config.label,
      estado.territorio,
      territorios.map((territorio) => ({ value: territorio.id, label: territorio.nombre })),
      new Set(),
    );
    const territorio = territorios.find((item) => item.id === estado.territorio) ?? null;
    const subdivisions = Datos.subdivisiones(territorio, config.subdivision);
    subdivisionSelect = nuevoSelect(
      'subdivision',
      config.subLabel,
      estado.subdivision,
      subdivisions.map((sub) => ({ value: sub.id, label: sub.nombre })),
      new Set(),
    );
    subdivisionSelect.disabled = subdivisions.length <= 1;
  }

  const buscar = crear('input', {
    id: `${id}-buscar`,
    name: 'buscar',
    type: 'search',
    placeholder: 'Nombre, lista o sigla',
    autocomplete: 'off',
  });
  buscar.value = estado.buscar;
  form.append(crear('label', { for: `${id}-buscar`, text: 'Buscar' }, [buscar]));

  const ordenSelect = crear('select', { id: `${id}-orden`, name: 'orden' });
  const ordenes = opcionesOrden(variante, estado);
  llenarSelect(ordenSelect, ordenes, estado.orden, new Set());
  form.append(crear('label', { for: `${id}-orden`, text: 'Ordenar por' }, [ordenSelect]));

  mapa.filtros.append(form);

  periodoSelect.addEventListener('change', () => {
    estado.periodo = periodoSelect.value;
    pintar(id);
  });

  if (territorioSelect) {
    territorioSelect.addEventListener('change', () => {
      estado.territorio = territorioSelect.value;
      const territorio = Datos.territorios(config.tipos).find((item) => item.id === estado.territorio);
      const subdivisions = Datos.subdivisiones(territorio, config.subdivision);
      estado.subdivision = subdivisions[0]?.id;
      subdivisionSelect.replaceChildren();
      for (const sub of subdivisions) subdivisionSelect.add(new Option(sub.nombre, sub.id));
      if (subdivisions[0]) subdivisionSelect.value = subdivisions[0].id;
      subdivisionSelect.disabled = subdivisions.length <= 1;
      normalizarEstado(vista, variante, estado);
      const ordenActual = estado.orden;
      llenarSelect(ordenSelect, opcionesOrden(variante, estado), ordenActual, new Set());
      pintar(id);
    });
  }

  if (subdivisionSelect) {
    subdivisionSelect.addEventListener('change', () => {
      estado.subdivision = subdivisionSelect.value;
      normalizarEstado(vista, variante, estado);
      llenarSelect(ordenSelect, opcionesOrden(variante, estado), estado.orden, new Set());
      pintar(id);
    });
  }

  buscar.addEventListener('input', () => {
    estado.buscar = buscar.value;
    pintar(id);
  });

  ordenSelect.addEventListener('change', () => {
    estado.orden = ordenSelect.value;
    pintar(id);
  });

}

function nodoDe(variante, periodo) {
  return Datos.datosActuales().resultados?.[variante.dignidad]?.[periodo]?.[variante.key] ?? null;
}

function nodoResuelto(variante, periodo, estado) {
  const raiz = nodoDe(variante, periodo);
  if (!raiz) return null;
  if (variante.modo === 'elegidos' || variante.alcance === 'nacional') return raiz;
  if (raiz.candidatos || raiz.listas) return raiz;
  if (variante.alcance === 'regional') return raiz.territorios?.[estado.territorio] ?? null;
  return raiz.territorios?.[estado.subdivision] ?? null;
}

function pintar(id) {
  const vista = VISTAS[id];
  const mapa = refsDe(id);
  const estado = estadoDe(id);
  if (!Datos.estaCargado()) return;

  if (vista.modo === 'partidos') {
    const resultado = Tabla.renderPartidos(mapa, Datos.datosActuales());
    mapa.estado.textContent = resultado.estado;
    mapa.tabla.hidden = false;
    if (mapa.reintentar) mapa.reintentar.hidden = true;
    return;
  }

  const variante = vista.variantes.find((item) => item.id === estado.variante) ?? vista.variantes[0];
  normalizarEstado(vista, variante, estado);
  const nodo = nodoResuelto(variante, estado.periodo, estado);
  const resultado = Tabla.render(mapa, vista, variante, nodo, estado);
  mapa.estado.textContent = resultado.estado;
  mapa.tabla.hidden = !nodo;

  if (mapa.links) {
    mapa.links.replaceChildren();
    if (vista.enlaceElegidos) {
      const enlace = crear('a', { href: `#${vista.enlaceElegidos.vista}`, class: 'link-destacado', text: vista.enlaceElegidos.label });
      mapa.links.append(enlace);
    }
  }
  if (mapa.reintentar) mapa.reintentar.hidden = true;
}

function construirVista(id) {
  const vista = VISTAS[id];
  const mapa = refsDe(id);
  if (mapa.intro && vista.intro) mapa.intro.textContent = vista.intro;
  construirTabs(id);
  if (vista.modo === 'partidos' || !Datos.estaCargado()) {
    if (mapa.estado) {
      mapa.estado.textContent = Datos.estaCargado()
        ? ''
        : errorCarga
          ? 'No se pudieron cargar los resultados de ejemplo. Intente nuevamente.'
          : 'Cargando datos de ejemplo…';
    }
    if (mapa.reintentar) {
      mapa.reintentar.hidden = !errorCarga;
      mapa.reintentar.onclick = errorCarga ? cargarDatos : null;
    }
    return;
  }
  construirFiltros(id);
}

function mensajeCarga(texto, esError) {
  for (const [id, vista] of Object.entries(VISTAS)) {
    const mapa = refs.get(id);
    if (!mapa) continue;
    if (mapa.estado) mapa.estado.textContent = texto;
    if (mapa.tabla && esError) mapa.tabla.hidden = true;
    if (mapa.reintentar) {
      mapa.reintentar.hidden = !esError;
      mapa.reintentar.onclick = esError ? cargarDatos : null;
    }
    if (mapa.filtros) {
      for (const control of mapa.filtros.querySelectorAll('select, input')) control.disabled = true;
    }
    if (vista.modo === 'partidos' && mapa.tabla && esError) mapa.tabla.hidden = true;
  }
}

async function cargarDatos() {
  if (cargando) return;
  cargando = true;
  errorCarga = false;
  mensajeCarga('Cargando datos de ejemplo…', false);
  try {
    await Datos.cargar();
    for (const id of Object.keys(VISTAS)) {
      const mapa = refs.get(id);
      if (!mapa) continue;
      if (mapa.reintentar) mapa.reintentar.hidden = true;
      construirVista(id);
    }
    const ruta = rutaActual();
    if (VISTAS[ruta]) pintar(ruta);
  } catch (error) {
    errorCarga = true;
    mensajeCarga('No se pudieron cargar los resultados de ejemplo. Intente nuevamente.', true);
  } finally {
    cargando = false;
  }
}

function rutaActual() {
  const hash = location.hash.slice(1);
  return RUTAS.includes(hash) ? hash : 'bienvenida';
}

function setView(enfoque) {
  const ruta = rutaActual();
  for (const [id, seccion] of secciones) seccion.hidden = id !== ruta;
  const seccion = secciones.get(ruta);
  if (!seccion) return;
  const titulo = seccion.querySelector('h1');
  document.title = ruta === 'bienvenida' ? titulo.textContent : `${titulo.textContent} | Guía Electoral de Colombia`;
  if (enfoque) {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    titulo.focus({ preventScroll: true });
  }
  if (VISTAS[ruta]) {
    if (!refs.has(ruta)) construirVista(ruta);
    if (Datos.estaCargado()) pintar(ruta);
  }
}

document.querySelector('.skip-link')?.addEventListener('click', (evento) => {
  evento.preventDefault();
  seccionActual()?.querySelector('h1')?.focus();
});

function seccionActual() {
  return secciones.get(rutaActual());
}

window.addEventListener('hashchange', () => setView(true));
setView(false);
cargarDatos();
