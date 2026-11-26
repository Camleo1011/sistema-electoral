'use strict';

const Datos = (() => {
  let datos;
  let partidosPorSigla = new Map();
  let nombrePorClave = new Map();

  function validar(entrada) {
    if (!entrada || typeof entrada !== 'object') throw new Error('Datos vacíos');
    if (!Array.isArray(entrada.territorios) || entrada.territorios.length === 0) throw new Error('Faltan territorios');
    if (!Array.isArray(entrada.partidos) || entrada.partidos.length === 0) throw new Error('Faltan partidos');
    if (!entrada.resultados || typeof entrada.resultados !== 'object') throw new Error('Faltan resultados');
    if (!entrada.dignidades || typeof entrada.dignidades !== 'object') throw new Error('Faltan dignidades');
    return entrada;
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
    datos = validar(entrada);
    indexar(datos);
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
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es-CO'));
  }

  function subdivisiones(territorio, fuente) {
    if (!territorio) return [];
    const esDistrito = territorio.tipo === 'distrito';
    const esConsular = territorio.tipo === 'consulados';
    if (fuente === 'auto') {
      if (esDistrito) return territorio.localidades ?? [];
      if (esConsular) return territorio.paises ?? [];
      return territorio.capital ? [territorio.capital] : [];
    }
    if (fuente === 'municipios') {
      if (esDistrito) return territorio.localidades ?? [];
      if (esConsular) return territorio.paises ?? [];
      return territorio.municipios ?? [];
    }
    if (fuente === 'localidades') return territorio.localidades ?? [];
    if (fuente === 'paises') return territorio.paises ?? [];
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
