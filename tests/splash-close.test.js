const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('splashTimer berada pada lingkup utama dan dibersihkan saat aplikasi ditutup', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'main', 'main.js'), 'utf8');
  assert.match(source, /^let splashTimer = null;$/m);
  assert.doesNotMatch(source, /function buatJendela\(\)\s*\{[\s\S]*?\n\s*let splashTimer = null;/);
  assert.match(source, /app\.on\('before-quit',[\s\S]*?if \(splashTimer\) \{ clearTimeout\(splashTimer\); splashTimer = null; \}/);
  assert.match(source, /app\.on\('window-all-closed',[\s\S]*?if \(splashTimer\) \{ clearTimeout\(splashTimer\); splashTimer = null; \}/);
});
