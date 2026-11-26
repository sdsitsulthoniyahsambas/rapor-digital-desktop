'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

function normalizeLM(name) {
  return String(name || '').normalize('NFKC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('id-ID');
}
function groupLM(tpRows) {
  const groups = new Map();
  for (const tp of tpRows) {
    const name = String(tp.lingkup_materi || '').normalize('NFKC').trim().replace(/\s+/gu, ' ');
    const key = normalizeLM(name);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, { key, name, tpIds: [] });
    groups.get(key).tpIds.push(tp.id);
  }
  return [...groups.values()];
}
function calculateFinal(averageLM, sas, weightLM, weightSAS) {
  const bLM = Number(weightLM), bSAS = Number(weightSAS);
  if (!Number.isFinite(bLM) || !Number.isFinite(bSAS) || bLM < 0 || bSAS < 0 || bLM + bSAS !== 100) {
    throw new RangeError('Bobot LM dan SAS harus berjumlah 100%');
  }
  const available = [];
  if (averageLM !== null && averageLM !== undefined && averageLM !== '') available.push([Number(averageLM), bLM]);
  if (sas !== null && sas !== undefined && sas !== '') available.push([Number(sas), bSAS]);
  if (!available.length) return null;
  const totalWeight = available.reduce((s, x) => s + x[1], 0);
  if (totalWeight === 0) return null;
  return available.reduce((s, x) => s + x[0] * x[1], 0) / totalWeight;
}

test('normalisasi mengabaikan kapitalisasi, spasi awal/akhir dan spasi berulang', () => {
  assert.equal(normalizeLM('  BILANGAN   Cacah  '), normalizeLM('Bilangan Cacah'));
});
test('TP dengan LM yang sama digabung dan LM kosong diabaikan', () => {
  const groups = groupLM([
    { id: 'TP1', lingkup_materi: 'Bilangan Cacah' },
    { id: 'TP2', lingkup_materi: ' bilangan   CACAH ' },
    { id: 'TP3', lingkup_materi: 'Pecahan' },
    { id: 'TP4', lingkup_materi: '' }
  ]);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups[0].tpIds, ['TP1', 'TP2']);
  assert.deepEqual(groups[1].tpIds, ['TP3']);
});
test('nilai akhir hanya menggunakan rata-rata LM dan SAS', () => {
  assert.equal(calculateFinal(80, 90, 60, 40), 84);
  // Tidak ada parameter TP atau STS; perubahan nilainya tidak dapat memengaruhi hasil.
});
test('komponen kosong dinormalisasi pada bobot yang tersedia', () => {
  assert.equal(calculateFinal(80, null, 60, 40), 80);
  assert.equal(calculateFinal(null, 90, 60, 40), 90);
  assert.equal(calculateFinal(null, null, 60, 40), null);
});
test('bobot wajib nonnegatif dan total 100%', () => {
  assert.throws(() => calculateFinal(80, 90, 50, 40), /berjumlah 100/);
  assert.throws(() => calculateFinal(80, 90, -10, 110), /berjumlah 100/);
});
test('perubahan nama substantif membentuk kelompok berbeda', () => {
  const groups = groupLM([
    { id: 'TP1', lingkup_materi: 'Bilangan Cacah' },
    { id: 'TP2', lingkup_materi: 'Bilangan Cacah dan Operasi Hitung' }
  ]);
  assert.equal(groups.length, 2);
});
