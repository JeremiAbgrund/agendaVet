#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const fileArg = process.argv[2];
const metaPath = fileArg ? path.resolve(process.cwd(), fileArg) : path.resolve(process.cwd(), 'playstore-metadata.json');

function fail(msg) {
  console.error('✖', msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log('✔', msg);
}

if (!fs.existsSync(metaPath)) {
  fail(`No se encontró el archivo de metadata en: ${metaPath}. Usa el ejemplo: playstore-metadata.json.example`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
} catch (e) {
  fail(`Error parseando JSON: ${e.message}`);
  process.exit(1);
}

const rules = {
  appName: { required: true, max: 50, label: 'Nombre de la app' },
  shortDescription: { required: true, max: 80, label: 'Descripción corta' },
  fullDescription: { required: true, max: 4000, label: 'Descripción completa' }
};

let hasError = false;
for (const key of Object.keys(rules)) {
  const { required, max, label } = rules[key];
  const value = (data[key] ?? '').toString();
  if (required && !value.trim()) {
    console.error(`✖ ${label} (${key}) está vacío.`);
    hasError = true;
    continue;
  }
  if (value.length > max) {
    console.error(`✖ ${label} (${key}) excede el máximo de ${max} caracteres (actual: ${value.length}).`);
    hasError = true;
  } else {
    console.log(`✔ ${label} (${key}) — ${value.length}/${max} caracteres`);
  }
}

if (hasError) {
  console.error('\nResultado: Falló la validación. Corrige los campos indicados y vuelve a ejecutar `npm run validate:metadata`');
  process.exit(1);
}

console.log('\nResultado: Validación correcta. Archivo listo para usar en la ficha de Play Store.');
process.exit(0);
