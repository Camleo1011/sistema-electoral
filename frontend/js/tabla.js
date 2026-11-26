'use strict';

const Tabla = (() => {
  const numeros = new Intl.NumberFormat('es-CO');
  const fechas = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'UTC' });
  const alfabetico = new Intl.Collator('es-CO', { sensitivity: 'base' });

  function normalizar(texto) {
    return String(texto)
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('es-CO')
      .trim();
  }

  function numero(valor) {
    return Number.isFinite(valor) ? numeros.format(valor) : '—';
  }

  function claveDe(scope, estado) {
    if (scope === 'nacional') return 'nacional';
    if (scope === 'territorio') return estado.territorio;
    return estado.subdivision;
  }

  function valor(item, scope, estado) {
    if (!item || !item.votos) return 0;
    return item.votos[claveDe(scope, estado)] ?? 0;
  }

  function etiquetaColumna(scope, estado) {
    if (scope === 'nacional') return 'Total nacional';
    if (scope === 'territorio') return estado.territorioNombre ?? 'Departamento';
    return estado.subdivisionNombre ?? 'Territorio';
  }

  function columnasDe(variante, estado) {
    return variante.columnas.map((scope) => ({ scope, label: etiquetaColumna(scope, estado) }));
  }

  function celda(texto, etiqueta) {
    const td = document.createElement('td');
    td.textContent = texto;
    if (etiqueta) td.dataset.etiqueta = etiqueta;
    return td;
  }

  function encabezado(texto, scope, orden) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = texto;
    if (scope && scope === orden) th.setAttribute('aria-sort', 'descending');
    if (scope === 'nombre' && orden === 'nombre') th.setAttribute('aria-sort', 'ascending');
    return th;
  }

  function insignia(texto, clase = 'badge') {
    const strong = document.createElement('strong');
    strong.className = clase;
    strong.textContent = texto;
    return strong;
  }

  function limpiar(partes) {
    partes.head.replaceChildren();
    partes.body.replaceChildren();
    partes.foot.replaceChildren();
  }

  function resumen(partes, nodo, variante, estado, desfase = 1) {
    const cols = columnasDe(variante, estado);
    const totales = nodo.totales ?? {};
    const sumaFila = (etiqueta, mapa, clase) => {
      const tr = document.createElement('tr');
      if (clase) tr.className = clase;
      const th = document.createElement('th');
      th.scope = 'row';
      th.colSpan = desfase;
      th.textContent = etiqueta;
      tr.append(th);
      for (const col of cols) {
        tr.append(celda(numero(mapa?.[claveDe(col.scope, estado)]), col.label));
      }
      partes.foot.append(tr);
    };
    sumaFila('Votos en blanco', totales.blanco);
    sumaFila('Votos nulos', totales.nulos);
    sumaFila('Votos no marcados', totales.noMarcados);
    sumaFila('Votación total', totales.total, 'total');
    if (variante.potencial) sumaFila('Potencial de sufragantes', totales.potencial);
  }

  function ordenar(items, variante, estado, nombreDe) {
    const scope = estado.orden;
    if (scope === 'nombre') {
      return items.sort((a, b) => alfabetico.compare(nombreDe(a), nombreDe(b)));
    }
    return items.sort((a, b) => valor(b, scope, estado) - valor(a, scope, estado) || alfabetico.compare(nombreDe(a), nombreDe(b)));
  }

  function renderSimple(partes, variante, nodo, estado) {
    const cols = columnasDe(variante, estado);
    const consulta = normalizar(estado.buscar ?? '');
    const candidatos = nodo.candidatos ?? [];
    const filas = candidatos.filter((candidato) => {
      if (!consulta) return true;
      const texto = `${candidato.nombre} ${candidato.sigla} ${Datos.nombrePartido(candidato.sigla)}`;
      return normalizar(texto).includes(consulta);
    });
    ordenar(filas, variante, estado, (candidato) => candidato.nombre);

    const primario = variante.columnas[0];
    let ganador = null;
    if (variante.tipoResaltado === 'ganador' && candidatos.length) {
      if (candidatos.some((candidato) => typeof candidato.ganador === 'boolean')) {
        ganador = candidatos.find((candidato) => candidato.ganador === true);
      } else {
        ganador = candidatos.reduce((mejor, candidato) =>
          valor(candidato, primario, estado) > valor(mejor, primario, estado) ? candidato : mejor,
        );
      }
    }

    const encabezadoCandidatos = encabezado('Candidatos', 'nombre', estado.orden);
    const encabezadoPartido = encabezado('Part.', null, null);
    partes.head.append(...(variante.partidoPrimero
      ? [encabezadoPartido, encabezadoCandidatos]
      : [encabezadoCandidatos, encabezadoPartido]));
    for (const col of cols) partes.head.append(encabezado(col.label, col.scope, estado.orden));

    for (const candidato of filas) {
      const tr = document.createElement('tr');
      const esGanador = ganador && candidato === ganador;
      if (esGanador) tr.className = 'winner';
      const nombre = document.createElement('th');
      nombre.scope = 'row';
      nombre.textContent = candidato.nombre;
      if (esGanador) nombre.append(insignia('Ganador'));
      const partido = celda(candidato.sigla);
      if (variante.partidoPrimero) tr.append(partido, nombre);
      else tr.append(nombre, partido);
      for (const col of cols) tr.append(celda(numero(valor(candidato, col.scope, estado)), col.label));
      partes.body.append(tr);
    }

    resumen(partes, nodo, variante, estado, 2);
    const total = candidatos.length;
    return {
      estado: filas.length
        ? `${filas.length} de ${total} candidaturas`
        : 'No hay candidaturas que coincidan con la búsqueda.',
      vacio: filas.length === 0,
    };
  }

  function renderListas(partes, variante, nodo, estado) {
    const cols = columnasDe(variante, estado);
    const consulta = normalizar(estado.buscar ?? '');
    const visibles = [];

    for (const lista of nodo.listas ?? []) {
      const nombrePartido = Datos.nombrePartido(lista.sigla);
      const coincidePartido = consulta && normalizar(`${nombrePartido} ${lista.sigla}`).includes(consulta);
      let candidatos = lista.candidatos ?? [];
      if (consulta && !coincidePartido) {
        candidatos = candidatos.filter((candidato) => normalizar(candidato.nombre).includes(consulta));
      }
      if (consulta && !coincidePartido && candidatos.length === 0) continue;
      visibles.push({ lista, nombrePartido, candidatos: candidatos.slice() });
    }

    if (estado.orden === 'nombre') {
      visibles.sort((a, b) => alfabetico.compare(a.nombrePartido, b.nombrePartido));
    } else {
      const scope = estado.orden;
      visibles.sort(
        (a, b) =>
          valor(b.lista, scope, estado) - valor(a.lista, scope, estado) ||
          alfabetico.compare(a.nombrePartido, b.nombrePartido),
      );
    }
    for (const grupo of visibles) ordenar(grupo.candidatos, variante, estado, (candidato) => candidato.nombre);

    partes.head.append(encabezado('Listas / candidaturas', 'nombre', estado.orden));
    for (const col of cols) partes.head.append(encabezado(col.label, col.scope, estado.orden));

    let totalCandidaturas = 0;
    for (const grupo of visibles) {
      const trPartido = document.createElement('tr');
      trPartido.className = 'party-row';
      const thPartido = document.createElement('th');
      thPartido.scope = 'rowgroup';
      thPartido.textContent = grupo.nombrePartido;
      const sigla = document.createElement('span');
      sigla.className = 'party-sigla';
      sigla.textContent = grupo.lista.sigla;
      thPartido.append(sigla);
      trPartido.append(thPartido);
      for (const col of cols) trPartido.append(celda(numero(valor(grupo.lista, col.scope, estado)), col.label));
      partes.body.append(trPartido);

      if (grupo.lista.porLaLista && Object.keys(grupo.lista.porLaLista).length) {
        const trLista = document.createElement('tr');
        trLista.className = 'list-row';
        const thLista = document.createElement('th');
        thLista.scope = 'row';
        thLista.textContent = 'Por la lista';
        trLista.append(thLista);
        for (const col of cols) {
          const clave = claveDe(col.scope, estado);
          trLista.append(celda(numero(grupo.lista.porLaLista[clave] ?? 0), col.label));
        }
        partes.body.append(trLista);
      }

      for (const candidato of grupo.candidatos) {
        const tr = document.createElement('tr');
        const elegido = variante.tipoResaltado === 'elegido' && candidato.elegido;
        if (elegido) tr.className = 'winner';
        const nombre = document.createElement('th');
        nombre.scope = 'row';
        nombre.textContent = candidato.nombre;
        if (elegido) nombre.append(insignia('Elegido'));
        tr.append(nombre);
        for (const col of cols) tr.append(celda(numero(valor(candidato, col.scope, estado)), col.label));
        partes.body.append(tr);
        totalCandidaturas += 1;
      }
    }

    resumen(partes, nodo, variante, estado);
    const totalListas = nodo.listas?.length ?? 0;
    return {
      estado: visibles.length
        ? `${visibles.length} de ${totalListas} listas · ${totalCandidaturas} candidaturas`
        : 'No hay listas ni candidaturas que coincidan con la búsqueda.',
      vacio: visibles.length === 0,
    };
  }

  function renderElegidos(partes, variante, nodo, estado) {
    const consulta = normalizar(estado.buscar ?? '');
    const filas = (nodo.elegidos ?? []).filter((elegido) => {
      if (!consulta) return true;
      return normalizar(`${elegido.nombre} ${elegido.sigla} ${Datos.nombrePartido(elegido.sigla)}`).includes(consulta);
    });
    if (estado.orden === 'total') {
      filas.sort((a, b) => b.total - a.total || alfabetico.compare(a.nombre, b.nombre));
    } else {
      filas.sort((a, b) => alfabetico.compare(a.nombre, b.nombre));
    }

    const columnas = [
      { texto: 'Nombres', scope: 'nombre' },
      { texto: 'Part.', scope: null },
      { texto: variante.totalLabel ?? 'Total nacional', scope: 'total' },
      { texto: 'Mayor votación 1', scope: null },
      { texto: 'Mayor votación 2', scope: null },
      { texto: 'Mayor votación 3', scope: null },
    ];
    for (const columna of columnas) partes.head.append(encabezado(columna.texto, columna.scope, estado.orden));

    for (const elegido of filas) {
      const tr = document.createElement('tr');
      const nombre = document.createElement('th');
      nombre.scope = 'row';
      nombre.textContent = elegido.nombre;
      tr.append(nombre, celda(elegido.sigla), celda(numero(elegido.total)));
      for (const mayor of elegido.mayores ?? []) {
        tr.append(celda(`${mayor.territorio} · ${numero(mayor.votos)}`));
      }
      for (let index = (elegido.mayores ?? []).length; index < 3; index += 1) tr.append(celda('—'));
      partes.body.append(tr);
    }

    return {
      estado: filas.length ? `${filas.length} elegidos` : 'No hay elegidos que coincidan con la búsqueda.',
      vacio: filas.length === 0,
    };
  }

  function render(partes, vista, variante, nodo, estado) {
    limpiar(partes);
    const fecha = nodo?.fecha ? fechas.format(new Date(nodo.fecha)) : '';
    partes.caption.textContent = `${vista.titulo} · ${variante.label}${fecha ? ` · ${fecha}` : ''}`;
    if (!nodo) {
      return { estado: 'No hay datos de ejemplo para la selección.', vacio: true };
    }
    if (variante.modo === 'elegidos') return renderElegidos(partes, variante, nodo, estado);
    if (variante.modo === 'listas') return renderListas(partes, variante, nodo, estado);
    return renderSimple(partes, variante, nodo, estado);
  }

  function renderPartidos(partes, data) {
    partes.caption.textContent = 'Organizaciones políticas registradas';
    partes.head.replaceChildren();
    partes.body.replaceChildren();
    if (partes.foot) partes.foot.replaceChildren();
    for (const texto of ['N.º', 'Sigla', 'Organización']) partes.head.append(encabezado(texto, null, null));
    data.partidos.forEach((partido, index) => {
      const tr = document.createElement('tr');
      const numeroCelda = celda(String(index + 1));
      numeroCelda.className = 'num';
      const sigla = celda(partido.sigla);
      const organizacion = celda(partido.nombre);
      sigla.className = 'text';
      organizacion.className = 'text';
      tr.append(numeroCelda, sigla, organizacion);
      partes.body.append(tr);
    });
    return { estado: `${data.partidos.length} organizaciones políticas`, vacio: false };
  }

  return { render, renderPartidos, normalizar };
})();
