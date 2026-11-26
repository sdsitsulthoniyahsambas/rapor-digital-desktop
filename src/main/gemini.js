'use strict';
const fs = require('node:fs');
const path = require('node:path');

function createGemini({ app, safeStorage, fetchImpl = globalThis.fetch }) {
  const keyFile = () => path.join(app.getPath('userData'), 'gemini-key.enc');
  function setKey(key) {
    const value = String(key || '').trim();
    if (!/^AIza[\w-]{20,}$/.test(value)) throw new Error('Format API key Gemini tidak valid.');
    if (!safeStorage.isEncryptionAvailable()) throw new Error('Penyimpanan terenkripsi Windows tidak tersedia.');
    fs.writeFileSync(keyFile(), safeStorage.encryptString(value), { mode: 0o600 });
    return { ok: true };
  }
  function getKey() {
    if (!fs.existsSync(keyFile())) return '';
    if (!safeStorage.isEncryptionAvailable()) throw new Error('Penyimpanan terenkripsi tidak tersedia pada perangkat ini.');
    return safeStorage.decryptString(fs.readFileSync(keyFile()));
  }
  function status() { return { configured: !!getKey(), encryptionAvailable: safeStorage.isEncryptionAvailable() }; }
  async function generate({ sourceText, model }) {
    const source = String(sourceText || '').trim();
    if (!source) throw new Error('Deskripsi capaian TP masih kosong.');
    if (source.length > 5000) throw new Error('Deskripsi sumber terlalu panjang (maksimal 5.000 karakter).');
    const key = getKey();
    if (!key) throw new Error('API key Gemini belum diatur.');
    const modelName = String(model || 'gemini-2.5-flash').trim();
    if (!/^[a-zA-Z0-9._-]{2,80}$/.test(modelName)) throw new Error('Nama model Gemini tidak valid.');
    const prompt = [
      'Anda membantu guru menyunting deskripsi capaian pembelajaran siswa sekolah.',
      'Tulis ulang deskripsi berikut menjadi bahasa Indonesia yang jelas, positif, objektif, ringkas, dan mudah dipahami orang tua.',
      'Pertahankan seluruh fakta dan batasan yang ada. Jangan menambahkan kemampuan, materi, nilai, nama, identitas, atau informasi baru.',
      'Jangan mengubah makna capaian. Kembalikan hanya paragraf deskripsi, tanpa judul atau catatan.',
      '', 'DESKRIPSI SUMBER:', source
    ].join('\n');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(key)}`;
    const response = await fetchImpl(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 500 } }),
      signal: AbortSignal.timeout(45000)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error((data.error && data.error.message) || `Gemini API gagal (HTTP ${response.status}).`);
    const text = (data.candidates || []).flatMap(c => c.content && c.content.parts || []).map(p => p.text || '').join('').trim();
    if (!text) throw new Error('Gemini tidak mengembalikan deskripsi.');
    return { ok: true, text };
  }
  return { setKey, status, generate };
}
module.exports = { createGemini };
