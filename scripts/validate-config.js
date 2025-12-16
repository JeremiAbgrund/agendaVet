#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function fail(msg) {
  console.error('✖', msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log('✔', msg);
}

const root = process.cwd();
const capConfigPath = path.join(root, 'capacitor.config.ts');
const configXmlPath = path.join(root, 'config.xml');
const exampleXmlPath = path.join(root, 'config.xml.example');

let criticalError = false;

// Check capacitor.config.ts for appId and appName
if (fs.existsSync(capConfigPath)) {
  const cap = fs.readFileSync(capConfigPath, 'utf8');
  const idMatch = cap.match(/appId\s*:\s*['\"]([^'\"]+)['\"]/);
  const nameMatch = cap.match(/appName\s*:\s*['\"]([^'\"]+)['\"]/);
  if (idMatch && idMatch[1]) {
    ok(`Found appId in capacitor.config.ts: ${idMatch[1]}`);
  } else {
    fail('appId not found in capacitor.config.ts');
    criticalError = true;
  }
  if (nameMatch && nameMatch[1]) {
    ok(`Found appName in capacitor.config.ts: ${nameMatch[1]}`);
  } else {
    fail('appName not found in capacitor.config.ts');
    criticalError = true;
  }
} else {
  fail('capacitor.config.ts not found. Ensure Capacitor is configured.');
  criticalError = true;
}

// If config.xml exists, parse common values
if (fs.existsSync(configXmlPath)) {
  const xml = fs.readFileSync(configXmlPath, 'utf8');
  const idMatch = xml.match(/<widget[^>]*id=['\"]([^'\"]+)['\"]/);
  const nameMatch = xml.match(/<name>([^<]+)<\/name>/);
  const versionMatch = xml.match(/<widget[^>]*version=['\"]([^'\"]+)['\"]/);
  const authorMatch = xml.match(/<author[^>]*email=['\"]([^'\"]+)['\"]/);
  const minSdk = xml.match(/<preference[^>]*name=['\"]android-minSdkVersion['\"][^>]*value=['\"]([^'\"]+)['\"]/);
  const targetSdk = xml.match(/<preference[^>]*name=['\"]android-targetSdkVersion['\"][^>]*value=['\"]([^'\"]+)['\"]/);

  if (idMatch) ok(`Found package id in config.xml: ${idMatch[1]}`); else fail('Package id not found in config.xml');
  if (nameMatch) ok(`Found app name in config.xml: ${nameMatch[1]}`); else fail('App name not found in config.xml');
  if (versionMatch) ok(`Found app version in config.xml: ${versionMatch[1]}`); else fail('App version not found in config.xml');
  if (authorMatch) ok(`Found developer email in config.xml: ${authorMatch[1]}`); else fail('Developer email not found in config.xml');
  if (minSdk) ok(`Found android-minSdkVersion: ${minSdk[1]}`); else console.warn('⚠ android-minSdkVersion not found in config.xml');
  if (targetSdk) ok(`Found android-targetSdkVersion: ${targetSdk[1]}`); else console.warn('⚠ android-targetSdkVersion not found in config.xml');
} else {
  console.log('⚠ config.xml not found. You can create one from config.xml.example or rely on Capacitor settings.');
}

if (criticalError) {
  fail('\nResultado: Falta información crítica en la configuración. Corrige y vuelve a ejecutar `npm run validate:config`.');
  process.exit(1);
}

console.log('\nResultado: Validación de configuración completada (revisar avisos si los hay).');
process.exit(0);
