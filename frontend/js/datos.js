'use strict';

const Datos = (() => {
  let datos;
  let partidosPorSigla = new Map();
  let nombrePorClave = new Map();

  const ordenarPorNombre = (a, b) => a.nombre.localeCompare(b.nombre, 'es-CO');
  const esObjeto = (valor) => valor !== null && typeof valor === 'object' && !Array.isArray(valor);
  const tieneNombre = (valor) => esObjeto(valor) && typeof valor.nombre === 'string';
  const esTerritorio = (valor) => tieneNombre(valor) && typeof valor.id === 'string';
  const esPartido = (valor) => tieneNombre(valor) && typeof valor.sigla === 'string';

  function esElegido(valor) {
    if (!esPartido(valor) || !Number.isSafeInteger(valor.total)) return false;
    if (valor.mayores === undefined) return true;
    return Array.isArray(valor.mayores) && valor.mayores.every((mayor) =>
      esObjeto(mayor) && typeof mayor.territorio === 'string' && Number.isSafeInteger(mayor.votos),
    );
  }

  function validarNodo(nodo) {
    if (!esObjeto(nodo)) return false;
    if (nodo.fecha !== undefined &&
        (typeof nodo.fecha !== 'string' || !Number.isFinite(Date.parse(nodo.fecha)))) {
      return false;
    }
    if (nodo.elegidos !== undefined &&
        (!Array.isArray(nodo.elegidos) || !nodo.elegidos.every(esElegido))) {
      return false;
    }
    if (nodo.territorios !== undefined) {
      if (!esObjeto(nodo.territorios)) return false;
      const territorios = Object.values(nodo.territorios);
      return territorios.length > 0 && territorios.every(validarNodo);
    }
    if (!esObjeto(nodo.totales)) return false;
    const esCandidato = (candidato) => tieneNombre(candidato) && esObjeto(candidato.votos);
    if (Array.isArray(nodo.candidatos)) return nodo.candidatos.every(esCandidato);
    return Array.isArray(nodo.listas) && nodo.listas.every((lista) =>
      esObjeto(lista) && typeof lista.sigla === 'string' && esObjeto(lista.votos) &&
      Array.isArray(lista.candidatos) && lista.candidatos.every(esCandidato),
    );
  }

  function validar(entrada) {
    if (!esObjeto(entrada)) throw new Error('Datos vacíos');
    if (!Array.isArray(entrada.territorios) || entrada.territorios.length === 0 ||
        !entrada.territorios.every((territorio) => esTerritorio(territorio) &&
          typeof territorio.tipo === 'string' &&
          [territorio.municipios, territorio.localidades, territorio.paises].every((subdivisiones) =>
            subdivisiones === undefined ||
            (Array.isArray(subdivisiones) && subdivisiones.every(esTerritorio)),
          ) &&
          (territorio.capital === undefined || esTerritorio(territorio.capital)))) {
      throw new Error('Territorios inválidos');
    }
    if (!Array.isArray(entrada.partidos) || entrada.partidos.length === 0 ||
        !entrada.partidos.every(esPartido)) throw new Error('Partidos inválidos');
    if (entrada.cortesPartidos !== undefined && (!esObjeto(entrada.cortesPartidos) ||
        !['2022', '2026'].every((corte) => Array.isArray(entrada.cortesPartidos[corte]) &&
          entrada.cortesPartidos[corte].length > 0 && entrada.cortesPartidos[corte].every(esPartido)))) {
      throw new Error('Cortes de partidos inválidos');
    }
    if (!esObjeto(entrada.resultados) || !esObjeto(entrada.dignidades)) {
      throw new Error('Faltan resultados o dignidades');
    }
    const elecciones = ['presidencia', 'senado', 'camara', 'gobernacion', 'asamblea',
      'alcaldia', 'concejo', 'jal'];
    for (const dignidad of elecciones) {
      const periodos = entrada.dignidades[dignidad]?.periodos;
      if (!Array.isArray(periodos) || periodos.length === 0 || !periodos.every((periodo) =>
        esObjeto(periodo) && typeof periodo.id === 'string' && typeof periodo.label === 'string',
      )) throw new Error('Períodos inválidos');
      for (const periodo of periodos.filter((item) => !item.disabled)) {
        const variantes = entrada.resultados[dignidad]?.[periodo.id];
        if (!esObjeto(variantes) || Object.keys(variantes).length === 0 ||
            !Object.values(variantes).every(validarNodo)) {
          throw new Error('Resultados inválidos');
        }
      }
    }
  }

  function indexar(entrada) {
    partidosPorSigla = new Map(entrada.partidos.map((partido) => [partido.sigla, partido.nombre]));
    nombrePorClave = new Map([['nacional', 'Total nacional']]);
    for (const territorio of entrada.territorios) {
      nombrePorClave.set(territorio.id, territorio.nombre);
      for (const sub of territorio.municipios ?? []) nombrePorClave.set(sub.id, sub.nombre);
      for (const sub of territorio.localidades ?? []) nombrePorClave.set(sub.id, sub.nombre);
      for (const sub of territorio.paises ?? []) nombrePorClave.set(sub.id, sub.nombre);
      if (territorio.capital) nombrePorClave.set(territorio.capital.id, territorio.capital.nombre);
    }
  }

  function cargarCopiaLocal() {
    if (window.datosElectoralesLocales) return Promise.resolve(window.datosElectoralesLocales);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'data/ejemplo-local.js';
      script.onload = () => {
        if (window.datosElectoralesLocales) resolve(window.datosElectoralesLocales);
        else reject(new Error('La copia local no definió los datos'));
      };
      script.onerror = () => reject(new Error('No se pudo cargar la copia local de los datos'));
      document.head.append(script);
    });
  }

  async function cargar() {
    if (datos) return datos;
    let entrada;
    if (location.protocol === 'file:') {
      entrada = await cargarCopiaLocal();
    } else {
      const respuesta = await fetch('data/ejemplo.json');
      if (!respuesta.ok) throw new Error('El archivo de datos no está disponible');
      entrada = await respuesta.json();
    }
    try {
      validar(entrada);
      indexar(entrada);
    } catch (error) {
      if (location.protocol === 'file:') delete window.datosElectoralesLocales;
      throw error;
    }
    datos = entrada;
    return datos;
  }

  function estaCargado() {
    return Boolean(datos);
  }

  function territorios(tipos) {
    if (!datos) return [];
    return datos.territorios
      .filter((territorio) => !tipos || tipos.includes(territorio.tipo))
      .slice()
      .sort(ordenarPorNombre);
  }

  function subdivisiones(territorio, fuente) {
    if (!territorio) return [];
    const esDistrito = territorio.tipo === 'distrito';
    const esConsular = territorio.tipo === 'consulados';
    if (fuente === 'auto') {
      if (esDistrito) return territorio.localidades ?? [];
      if (esConsular) return (territorio.paises ?? []).slice().sort(ordenarPorNombre);
      return territorio.capital ? [territorio.capital] : [];
    }
    if (fuente === 'municipios') {
      if (esDistrito) return territorio.localidades ?? [];
      if (esConsular) return (territorio.paises ?? []).slice().sort(ordenarPorNombre);
      return (territorio.municipios ?? []).slice().sort(ordenarPorNombre);
    }
    if (fuente === 'localidades') return territorio.localidades ?? [];
    if (fuente === 'paises') return (territorio.paises ?? []).slice().sort(ordenarPorNombre);
    return [];
  }

  function nombrePartido(sigla) {
    return partidosPorSigla.get(sigla) ?? sigla;
  }

  function nombreClave(clave) {
    return nombrePorClave.get(clave) ?? clave;
  }

  function datosActuales() {
    return datos;
  }

  return {
    cargar,
    estaCargado,
    territorios,
    subdivisiones,
    nombrePartido,
    nombreClave,
    datosActuales,
  };
})();
