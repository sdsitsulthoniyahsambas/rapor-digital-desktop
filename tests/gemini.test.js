'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createGemini } = require('../src/main/gemini');
function fixture(fetchImpl) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rapor-gemini-'));
  const safeStorage = {
    isEncryptionAvailable: () => true,
    encryptString: s => Buffer.from(s).toString('base64'),
    decryptString: b => Buffer.from(b).toString('base64')
  };
  return { dir, safeStorage, gemini: createGemini({ app: { getPath: () => dir }, safeStorage, fetchImpl }) };
}
test('API key disimpan terenkripsi dan status hanya menampilkan keberadaan key', t => {
  const f = fixture(); t.after(() => fs.rmSync(f.dir, { recursive: true, force: true }));
  assert.equal(f.gemini.status().configured, false);
  f.gemini.setKey('AIza' + 'x'.repeat(30));
  assert.equal(f.gemini.status().configured, true);
  const stored = fs.readFileSync(path.join(f.dir, 'gemini-key.enc'), 'utf8');
  assert.equal(stored.includes('AIza'), false);
});
test('Gemini menerima hanya deskripsi sumber dan mengembalikan saran teks', async t => {
  let sent = '';
  const f = fixture(async (_url, options) => {
    sent = options.body;
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: 'Saran deskripsi yang lebih jelas.' }] } }] }) };
  });
  t.after(() => fs.rmSync(f.dir, { recursive: true, force: true }));
  f.gemini.setKey('AIza' + 'x'.repeat(30));
  const result = await f.gemini.generate({ sourceText: 'Ananda mampu menjelaskan pecahan sederhana.' });
  assert.equal(result.text, 'Saran deskripsi yang lebih jelas.');
  assert.match(sent, /Ananda mampu menjelaskan pecahan sederhana/);
  assert.doesNotMatch(sent, /NIS|siswa_id|nama murid/i);
});
test('Gemini menolak membuat saran jika API key belum diatur', async t => {
  const f = fixture(); t.after(() => fs.rmSync(f.dir, { recursive: true, force: true }));
  await assert.rejects(() => f.gemini.generate({ sourceText: 'Deskripsi capaian.' }), /API key Gemini belum diatur/);
});
