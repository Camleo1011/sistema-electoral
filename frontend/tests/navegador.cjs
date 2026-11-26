const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const { createServer } = require('node:http');

const frontend = path.resolve(__dirname, '..');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'electoral-browser-'));
const browser = spawn(process.env.CHROME_BIN || 'google-chrome-stable', [
  '--headless', '--disable-gpu', '--disable-background-networking',
  '--disable-breakpad', '--disable-extensions', '--no-first-run',
  '--remote-debugging-pipe', '--user-data-dir=' + profile, 'about:blank',
], {stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe']});

let server;
let serial = 0;
let pending = '';
const requests = new Map();
const errors = [];
let browserLog = '';
browser.stderr.setEncoding('utf8');
browser.stderr.on('data', chunk => { browserLog = (browserLog + chunk).slice(-3000); });
for (const pipe of [browser.stdio[3], browser.stdio[4]]) pipe.on('error', () => {
  // The browser exit handler reports failures with Chrome's diagnostics.
});

browser.stdio[4].on('data', bytes => {
  pending += bytes.toString('utf8');
  let boundary;
  while ((boundary = pending.indexOf('\0')) !== -1) {
    const message = JSON.parse(pending.slice(0, boundary));
    pending = pending.slice(boundary + 1);
    if (message.method === 'Runtime.exceptionThrown') {
      errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    }
    const waiter = requests.get(message.id);
    if (!waiter) continue;
    requests.delete(message.id);
    clearTimeout(waiter.timer);
    if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
    else waiter.resolve(message.result);
  }
});
browser.on('error', error => {
  console.error('No se pudo iniciar Chrome:', error.message);
});
browser.on('exit', (code, signal) => {
  for (const { timer, reject } of requests.values()) {
    clearTimeout(timer);
    reject(new Error(`Chrome terminó (${signal || code}). ${browserLog.trim()}`));
  }
  requests.clear();
});
function rpc(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++serial;
    const timer = setTimeout(() => {
      requests.delete(id);
      reject(new Error('Tiempo agotado: ' + method));
    }, 10000);
    requests.set(id, { timer, resolve, reject });
    browser.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + '\0', (error) => {
      if (error) {
        clearTimeout(timer);
        requests.delete(id);
        reject(error);
      }
    });
  });
}
function log(name, value) {
  console.log(name, JSON.stringify(value));
}
async function run() {
  const version = await rpc('Browser.getVersion');
  log('Navegador', version.product);
  const { targetId } = await rpc('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await rpc('Target.attachToTarget', { targetId, flatten: true });
  function call(method, params) { return rpc(method, params, sessionId); }
  async function evaluate(expression) {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  }
  await call('Runtime.enable');
  await call('Page.enable');
  async function eventually(expression) {
    for (let n = 0; n < 65; n++) {
      const value = await evaluate(expression);
      if (value) return value;
      await new Promise(resolve => setTimeout(resolve, 60));
    }
    throw new Error('Condición no satisfecha: ' + expression);
  }
  let responseMode = 'valid';
  const types = {'.js':'text/javascript', '.html':'text/html', '.css':'text/css', '.json':'application/json', '.jpg':'image/jpeg'};
  server = createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/data/ejemplo.json') {
      if (responseMode === 'missing') { res.writeHead(404).end(); return; }
      if (responseMode === 'malformed') { res.writeHead(200).end('{'); return; }
      if (responseMode === 'invalid') {
        const invalid = JSON.parse(fs.readFileSync(path.join(frontend, pathname), 'utf8'));
        invalid.territorios = [null];
        res.writeHead(200, { 'Content-Type': types['.json'], 'Cache-Control': 'no-store' }).end(JSON.stringify(invalid));
        return;
      }
    }
    const filename = path.join(frontend, pathname);
    if (!filename.startsWith(frontend + path.sep)) { res.writeHead(404).end(); return; }
    fs.readFile(filename, (error, data) => {
      if (error) res.writeHead(404).end();
      else res.writeHead(200, { 'Content-Type':types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control':'no-store' }).end(data);
    });
  });
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject));
  const httpUrl = 'http://127.0.0.1:' + server.address().port + '/index.html';
  const fileUrl = pathToFileURL(path.join(frontend, 'index.html')).href;
  const routes = ['bienvenida', 'resultados', 'presidencia', 'senado', 'senado-elegidos',
    'camara', 'camara-elegidos', 'gobernaciones', 'alcaldias', 'bogota', 'bogota-elegidos', 'partidos', 'nosotros'];

  async function navigate(route) {
    await evaluate('location.hash = ' + JSON.stringify(route));
    await eventually('document.getElementById(' + JSON.stringify(route) + ')?.hidden === false');
  }
  async function click(selector) {
    await evaluate('document.querySelector(' + JSON.stringify(selector) + ').click()');
  }
  async function select(selector, value) {
    await evaluate(`(() => {
      const select = document.querySelector(${JSON.stringify(selector)});
      select.value = ${JSON.stringify(value)};
      if (!select.value) throw Error('Opción no encontrada: ' + select.id);
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
  }
  async function checkRoutes(url) {
    await call('Page.navigate', { url });
    await eventually(`location.href === ${JSON.stringify(url)} && document.readyState === 'complete' && typeof Datos !== 'undefined' && Datos.estaCargado()`);
    await click('#bienvenida a[href="#resultados"]');
    await eventually("!document.querySelector('#resultados').hidden");
    await click('#resultados a[href="#presidencia"]');
    await eventually("!document.querySelector('#presidencia').hidden");
    assert.equal(await evaluate('document.activeElement.id'), 'titulo-presidencia');
    for (const route of routes) {
      await navigate(route);
      if (['bienvenida', 'resultados', 'nosotros'].includes(route)) continue;
      assert.ok(await evaluate(`document.querySelector('#${route} tbody tr') !== null`), route);
    }
    log('Rutas y foco', new URL(url).protocol);
  }
  await checkRoutes(httpUrl);
  await checkRoutes(fileUrl);

  await navigate('presidencia');
  const winner = await evaluate(`(() => {
    const tab = document.querySelector('#presidencia-tab-2');
    tab.focus();
    tab.click();
    const section = document.querySelector('#presidencia');
    const before = section.querySelector('tbody .winner th').firstChild.textContent;
    const loser = section.querySelector('tbody tr:not(.winner) th').textContent;
    const search = section.querySelector('input[type=search]');
    function setSearch(value) {
      search.value = value;
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }
    setSearch(loser);
    const shown = section.querySelector('tbody th')?.textContent;
    const after = section.querySelector('tbody .winner') !== null;
    setSearch('');
    const restored = section.querySelector('tbody .winner th').firstChild.textContent;
    return { before, loser, shown, after, restored, focus: document.activeElement.id };
  })()`);
  assert.notEqual(winner.before, winner.loser);
  assert.equal(winner.shown, winner.loser);
  assert.equal(winner.after, false);
  assert.equal(winner.restored, winner.before);
  assert.equal(winner.focus, 'presidencia-tab-2');
  await select('#presidencia-orden', 'nombre');
  assert.equal(await evaluate("document.querySelector('#presidencia tbody .winner th').firstChild.textContent"), winner.before);
  log('RF-037', 'El ganador persiste al ordenar y no pasa a la candidatura filtrada');

  async function press(key, code, virtualKey) {
    const params = { key, code, windowsVirtualKeyCode: virtualKey };
    await call('Input.dispatchKeyEvent', { ...params, type: 'keyDown' });
    await call('Input.dispatchKeyEvent', { ...params, type: 'keyUp' });
  }
  await press('ArrowLeft', 'ArrowLeft', 37);
  assert.equal(await evaluate('document.activeElement.id'), 'presidencia-tab-1');
  assert.equal(await evaluate("document.activeElement.getAttribute('aria-selected')"), 'true');
  await press('Tab', 'Tab', 9);
  assert.equal(await evaluate('document.activeElement.id'), 'presidencia-periodo');
  log('RNF-002', 'Flecha activa la pestaña anterior y Tab avanza al período');

  await navigate('senado-elegidos');
  for (const period of ['2022', '2026']) {
    await select('#senado-elegidos-periodo', period);
    for (const variant of ['nacional', 'indigena']) {
      await click('#senado-elegidos-tab-' + variant);
      const result = await evaluate(`(() => {
        const { listas } = Datos.datosActuales().resultados.senado[${JSON.stringify(period)}][${JSON.stringify(variant)}];
        const expected = listas.flatMap(list => list.candidatos.filter(c => c.elegido).map(c => c.nombre));
        const shown = Array.from(document.querySelectorAll('#senado-elegidos tbody th'), cell => cell.textContent);
        return { expected, shown };
      })()`);
      assert.ok(result.expected.length, 'el fixture debe contener elegidos');
      assert.deepEqual(result.shown.sort(), result.expected.sort());
    }
  }
  log('RF-014', 'Elegidos por circunscripción y período');


  async function electedNames(route) {
    return evaluate(`Array.from(document.querySelectorAll('#${route} tbody th'), cell => cell.textContent).sort()`);
  }

  await navigate('camara');
  await select('#camara-periodo', '2022');
  await click('#camara-tab-exterior');
  const chamber = await evaluate(`(() => {
    const territory = document.querySelector('#camara-territorio').value;
    const subdivision = document.querySelector('#camara-subdivision').value;
    const { listas } = Datos.datosActuales().resultados.camara['2022'].exterior.territorios[territory];
    const expected = listas.flatMap(list => list.candidatos.filter(c => c.elegido).map(c => c.nombre)).sort();
    return { territory, subdivision, expected };
  })()`);
  assert.ok(chamber.expected.length);
  await click('#camara a[href="#camara-elegidos"]');
  await eventually("!document.querySelector('#camara-elegidos').hidden");
  assert.equal(await evaluate("document.querySelector('#camara-elegidos-periodo').value"), '2022');
  assert.equal(await evaluate("document.querySelector('#camara-elegidos-tab-exterior').getAttribute('aria-selected')"), 'true');
  assert.equal(await evaluate("document.querySelector('#camara-elegidos-territorio').value"), chamber.territory);
  assert.equal(await evaluate("document.querySelector('#camara-elegidos-subdivision').value"), chamber.subdivision);
  assert.deepEqual(await electedNames('camara-elegidos'), chamber.expected);
  log('RF-019', 'Cámara conserva período, circunscripción y ámbito de origen');

  await navigate('bogota');
  await click('#bogota-tab-jal');
  const locality = await evaluate("document.querySelector('#bogota-subdivision').options[1].value");
  await select('#bogota-subdivision', locality);
  const bogotaExpected = await evaluate(`Datos.datosActuales().resultados.jal['2024'].unica.territorios[${JSON.stringify(locality)}].listas.flatMap(list => list.candidatos.filter(c => c.elegido).map(c => c.nombre)).sort()`);
  assert.ok(bogotaExpected.length);
  await click('#bogota a[href="#bogota-elegidos"]');
  await eventually("!document.querySelector('#bogota-elegidos').hidden");
  assert.equal(await evaluate("document.querySelector('#bogota-elegidos-subdivision').value"), locality);
  assert.deepEqual(await electedNames('bogota-elegidos'), bogotaExpected);
  await navigate('bogota');
  await click('#bogota-tab-concejo');
  const councilExpected = await evaluate("Datos.datosActuales().resultados.concejo['2024'].bogota.listas.flatMap(list => list.candidatos.filter(c => c.elegido).map(c => c.nombre)).sort()");
  assert.ok(councilExpected.length);
  await click('#bogota a[href="#bogota-elegidos"]');
  await eventually("!document.querySelector('#bogota-elegidos').hidden");
  assert.deepEqual(await electedNames('bogota-elegidos'), councilExpected);
  log('RF-031', 'Elegidos por localidad en JAL y del distrito en Concejo');

  await navigate('partidos');
  assert.match(await evaluate("document.querySelector('#partidos .notice').textContent"), /no oficiales/i);
  for (const year of ['2022', '2026']) {
    await select('#partidos-corte', year);
    const parties = await evaluate(`(() => {
      const expected = Datos.datosActuales().cortesPartidos[${JSON.stringify(year)}].map(partido => partido.sigla);
      const shown = Array.from(document.querySelectorAll('#partidos tbody tr'), row => row.cells[1].textContent);
      return { expected, shown, caption: document.querySelector('#partidos caption').textContent };
    })()`);
    assert.ok(parties.expected.length);
    assert.deepEqual(parties.shown, parties.expected);
    assert.match(parties.caption, new RegExp(year));
  }
  log('RF-032 y RF-039', 'Cortes de 2022 y 2026 identificados como datos de ejemplo');

  await navigate('gobernaciones');
  const options = await evaluate("Array.from(document.querySelector('#gobernaciones-subdivision').options, option => option.text)");
  assert.ok(options.length > 1);
  assert.deepEqual(options, [...options].sort((a, b) => a.localeCompare(b, 'es-CO')));
  log('RF-043', options);

  for (const width of [375, 384, 768, 1280]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const route of routes) {
      await navigate(route);
      const [viewport, page] = await evaluate('[document.documentElement.clientWidth, document.documentElement.scrollWidth]');
      assert.ok(page <= viewport, route + ' desborda la página a ' + width + ' px');
    }
  }
  log('RNF-003', '375, 768 y 1280 px; reflujo a 384 px (equivalente geométrico a 768 px al 200 %)');

  for (const mode of ['missing', 'malformed', 'invalid']) {
    responseMode = mode;
    await call('Page.navigate', { url: httpUrl + '?prueba=' + mode + '#presidencia' });
    await eventually("document.querySelector('#presidencia [data-estado]')?.textContent.includes('No se pudieron')");
    assert.equal(await evaluate("document.querySelector('#presidencia [data-tabla]').hidden"), true);
    assert.equal(await evaluate("document.querySelector('#presidencia [data-reintentar]').hidden"), false);
    responseMode = 'valid';
    await click('#presidencia [data-reintentar]');
    await eventually("!document.querySelector('#presidencia [data-tabla]').hidden && document.querySelectorAll('#presidencia tbody tr').length > 0");
  }
  log('RF-042', 'Reintentos tras HTTP 404, sintaxis inválida y estructura inválida');
  assert.deepEqual(errors, []);
}

run().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => {
  if (browser.pid && browser.exitCode === null && browser.signalCode === null) {
    browser.once('exit', () => fs.rmSync(profile, { recursive: true, force: true }));
    browser.kill();
  } else {
    fs.rmSync(profile, { recursive: true, force: true });
  }
  server?.close();
});
