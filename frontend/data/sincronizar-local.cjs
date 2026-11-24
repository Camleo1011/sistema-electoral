const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const source = readFileSync(join(__dirname, 'ejemplo.json'), 'utf8');
const data = JSON.parse(source);
writeFileSync(
  join(__dirname, 'ejemplo-local.js'),
  `// Generado desde ejemplo.json mediante sincronizar-local.cjs.\nwindow.datosElectoralesLocales = ${JSON.stringify(data)};\n`,
);
