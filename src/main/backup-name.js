'use strict';

/** Nama file backup mengikuti kelas, rombel, semester, dan tahun ajaran aktif. */
function namaFileCadangan(pengaturan = {}) {
  const aman = (nilai, fallback) => String(nilai || fallback).trim()
    .replace(/[\\/:*?"<>|\s]+/g, '-').replace(/^-+|-+$/g, '');
  const kelas = aman(pengaturan.kelas, 'kelas');
  const rombel = aman(pengaturan.rombel, '');
  const identitasKelas = rombel ? `${kelas}.${rombel}` : kelas;
  const rawSemester = String(pengaturan.semester || '1').trim();
  const semester = /^(2|genap)$/i.test(rawSemester) ? 'Genap'
    : /^(1|ganjil)$/i.test(rawSemester) ? 'Ganjil' : aman(rawSemester, 'semester');
  const tahun = aman(pengaturan.tahun_pelajaran, 'tahun-ajaran').replace(/-/g, '-');
  return `db_${identitasKelas}_${semester}_${tahun}.json`;
}

module.exports = { namaFileCadangan };
