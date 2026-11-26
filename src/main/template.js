/**
 * Template Excel untuk impor massal Rapor Digital:
 *  - Template data murid
 *  - Template tujuan pembelajaran (TP) semua mapel
 *  - Template penilaian satu semester (nilai TP & SAS per mapel, kokurikuler, ekstrakurikuler, kehadiran & catatan)
 *  - Template guru mapel (satu file per mapel untuk dibagikan ke guru mapel)
 * Serta pembaca file Excel hasil isian.
 *
 * Setiap lembar penilaian punya baris 1 tersembunyi berisi kunci kolom (mis. "tp:<id>", "sts", "sas"),
 * sehingga file tetap terbaca walaupun urutan murid diubah. Kolom A (tersembunyi) berisi ID murid.
 */
const ExcelJS = require('exceljs');

const BIRU = 'FF1F56D6';
const garis = { style: 'thin', color: { argb: 'FFCBD2E0' } };
const kotak = { top: garis, left: garis, bottom: garis, right: garis };
const AGAMA = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu', 'Kepercayaan'];

function judulKolom(ws, baris, nilai, warna, mulai) {
  const r = ws.getRow(baris);
  nilai.forEach((v, i) => {
    const c = r.getCell((mulai || 1) + i);
    c.value = v;
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: warna || BIRU } };
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    c.border = kotak;
  });
}
function catatan(ws, baris, teks, lebar) {
  ws.mergeCells(baris, 1, baris, Math.max(2, lebar));
  const c = ws.getCell(baris, 1);
  c.value = teks;
  c.font = { italic: true, color: { argb: 'FF7A4E07' } };
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF4D6' } };
  c.alignment = { wrapText: true, vertical: 'middle' };
  ws.getRow(baris).height = 44;
}
function daftar(ws, rentang, isi, pesan) {
  ws.dataValidations.add(rentang, { type: 'list', allowBlank: true, formulae: ['"' + isi.join(',') + '"'], showErrorMessage: true, errorTitle: 'Isian tidak dikenal', error: pesan || 'Pilih dari daftar.' });
}
/** baris kunci tersembunyi */
function kunci(ws, keys) {
  const r = ws.getRow(1);
  keys.forEach((k, i) => { r.getCell(i + 1).value = k; });
  r.hidden = true;
}
function namaLembar(nama, dipakai) {
  let n = String(nama).replace(/[\\/?*[\]:]/g, '-').slice(0, 31), i = 2;
  while (dipakai.has(n.toLowerCase())) n = String(nama).slice(0, 27) + ' (' + i++ + ')';
  dipakai.add(n.toLowerCase());
  return n;
}
function isiMurid(ws, murid, mulai) {
  murid.forEach((m, i) => {
    const r = ws.getRow(mulai + i);
    r.getCell(1).value = m.id; r.getCell(1).font = { color: { argb: 'FFAAAAAA' }, size: 8 };
    r.getCell(2).value = i + 1; r.getCell(2).alignment = { horizontal: 'center' };
    r.getCell(3).value = m.nama;
    [1, 2, 3].forEach((c) => { r.getCell(c).border = kotak; });
  });
}
function lebarDasar(ws) { ws.getColumn(1).width = 4; ws.getColumn(2).width = 5; ws.getColumn(3).width = 30; ws.getColumn(1).hidden = true; }

/* ---------------- TEMPLATE MURID ---------------- */
const KOLOM_MURID = ['Nama', 'NIS', 'NISN', 'L/P', 'Agama', 'Tempat lahir', 'Tanggal lahir', 'Panggilan', 'Pendidikan sebelumnya', 'Alamat',
  'Nama ayah', 'Nama ibu', 'Pekerjaan ayah', 'Pekerjaan ibu', 'Alamat orang tua', 'Nama wali', 'Pekerjaan wali', 'Alamat wali'];
async function templateMurid(file) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Data Murid', { views: [{ state: 'frozen', ySplit: 2 }] });
  catatan(ws, 1, 'Isi mulai baris 3, satu baris per murid. Kolom Nama wajib, lainnya boleh kosong. NIS/NISN sudah berformat teks agar angka 0 di depan tidak hilang. Tanggal lahir boleh format 15/03/2017. Simpan, lalu unggah di aplikasi: Data Murid → Impor dari Excel → Unggah file.', KOLOM_MURID.length);
  judulKolom(ws, 2, KOLOM_MURID);
  [32, 10, 14, 7, 12, 15, 14, 13, 20, 30, 22, 22, 18, 18, 28, 20, 18, 26].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  for (let r = 3; r <= 102; r++) {
    [2, 3].forEach((c) => { ws.getCell(r, c).numFmt = '@'; });
    for (let c = 1; c <= KOLOM_MURID.length; c++) ws.getCell(r, c).border = kotak;
  }
  daftar(ws, 'D3:D102', ['L', 'P'], 'Isi L atau P.');
  daftar(ws, 'E3:E102', AGAMA);
  await wb.xlsx.writeFile(file);
  return file;
}

/* ---------------- TEMPLATE TP ---------------- */
/** o = { mapel:[{id,singkatan,nama,agama:bool}], tp:[{mapel_id,agama,kode,lingkup_materi,tujuan}] } */
async function templateTP(file, o) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Tujuan Pembelajaran', { views: [{ state: 'frozen', ySplit: 3 }] });
  kunci(ws, ['mapel', 'agama', 'kode', 'lingkup', 'tujuan']);
  catatan(ws, 2, 'Satu baris = satu TP. Kolom Mapel pakai singkatan dari daftar. Kolom Agama hanya untuk Pendidikan Agama (PABP). Tulis tujuan dengan huruf kecil, diawali kata kerja (menjelaskan, menyelesaikan …). Saat diunggah, TP mapel yang ada di file ini akan menggantikan TP lama mapel tersebut.', 5);
  judulKolom(ws, 3, ['Mapel', 'Agama (PABP)', 'Kode TP', 'Lingkup materi', 'Tujuan pembelajaran']);
  [14, 14, 10, 32, 80].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  const sing = {}; o.mapel.forEach((m) => { sing[m.id] = m.singkatan || m.nama; });
  const rows = (o.tp || []).filter((t) => sing[t.mapel_id]);
  rows.forEach((t, i) => {
    const r = ws.getRow(4 + i);
    r.values = [sing[t.mapel_id], t.agama || '', t.kode || '', t.lingkup_materi || '', t.tujuan || ''];
    for (let c = 1; c <= 5; c++) { r.getCell(c).border = kotak; r.getCell(c).alignment = { wrapText: c >= 4, vertical: 'top' }; }
  });
  const akhir = Math.max(4 + rows.length + 60, 120);
  for (let r = 4 + rows.length; r <= akhir; r++) for (let c = 1; c <= 5; c++) ws.getCell(r, c).border = kotak;
  daftar(ws, `A4:A${akhir}`, Object.values(sing), 'Pilih singkatan mapel dari daftar.');
  daftar(ws, `B4:B${akhir}`, AGAMA);
  await wb.xlsx.writeFile(file);
  return file;
}

/* ---------------- TEMPLATE PENILAIAN SEMESTER ---------------- */
/**
 * o = { judul, sebutan, murid:[{id,nama,agama}],
 *       mapel:[{key, judul, singkatan, kktp, tps:[{id,kode,lingkup}], murid:[{id,nama}], nilai:{sid:{tp:{tid:v}, sts, sas}}}],
 *       koko:{ kegiatan:[{id,nama,dim:[]}], level:[], cap:{sid:{kid:{dim:lv}}} },
 *       ekskul:{ list:[{id,nama}], predikat:[], data:{sid:{eid:pred}} },
 *       hadir:{ smt2, opsi:[], data:{sid:{sakit,izin,alpa,catatan,keputusan}} } }
 */
async function templateSemester(file, o) {
  const wb = new ExcelJS.Workbook();
  const dipakai = new Set();

  // 1. satu lembar per mapel (PABP dipisah per agama)
  o.mapel.forEach((mp) => {
    const ws = wb.addWorksheet(namaLembar(mp.singkatan, dipakai), { views: [{ state: 'frozen', xSplit: 3, ySplit: 4 }] });
    const nT = mp.tps.length, lebar = 3 + nT + 2;
    kunci(ws, ['map:' + mp.key, 'no', 'nama'].concat(mp.tps.map((t) => 'tp:' + t.id), ['sts', 'sas']));
    catatan(ws, 2, `${mp.judul} · KKTP ${mp.kktp}. Isi nilai tiap TP (sumatif lingkup materi), STS, dan SAS (0–100). Nilai akhir & deskripsi dihitung otomatis di aplikasi. Kolom ID jangan diubah; sel kosong tidak menimpa nilai lama.`, lebar);
    judulKolom(ws, 3, ['ID', 'No', 'Nama ' + o.sebutan].concat(mp.tps.map((t) => t.kode), ['STS', 'SAS']));
    const r4 = ws.getRow(4);
    r4.getCell(3).value = 'Lingkup materi →';
    mp.tps.forEach((t, j) => { const c = r4.getCell(4 + j); c.value = t.lingkup || null; });
    r4.getCell(4 + nT).value = 'Tengah semester';
    r4.getCell(5 + nT).value = 'Akhir semester';
    for (let c = 3; c <= lebar; c++) { const x = r4.getCell(c); x.font = { italic: true, size: 9, color: { argb: 'FF4A556E' } }; x.alignment = { wrapText: true, vertical: 'top', horizontal: c === 3 ? 'right' : 'center' }; x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F5FA' } }; x.border = kotak; }
    r4.height = 42;
    isiMurid(ws, mp.murid, 5);
    mp.murid.forEach((m, i) => {
      const nv = (mp.nilai || {})[m.id] || {};
      mp.tps.forEach((t, j) => { const v = (nv.tp || {})[t.id]; const c = ws.getCell(5 + i, 4 + j); c.value = v === undefined || v === '' || v === null ? null : Number(v); c.alignment = { horizontal: 'center' }; c.border = kotak; });
      [['sts', 4 + nT], ['sas', 5 + nT]].forEach(([k, col]) => {
        const c = ws.getCell(5 + i, col); c.value = nv[k] === undefined || nv[k] === '' || nv[k] === null ? null : Number(nv[k]); c.alignment = { horizontal: 'center' }; c.border = kotak;
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF3FF' } };
      });
    });
    if (mp.murid.length) ws.dataValidations.add(`D5:${ws.getColumn(lebar).letter}${4 + mp.murid.length}`, { type: 'decimal', operator: 'between', allowBlank: true, formulae: [0, 100], showErrorMessage: true, error: 'Nilai harus 0–100.' });
    lebarDasar(ws);
    for (let j = 0; j <= nT + 1; j++) ws.getColumn(4 + j).width = 12;
    ws.getRow(3).height = 30;
  });

  // 2. kokurikuler
  const kg = (o.koko && o.koko.kegiatan || []).filter((k) => k.dim.length);
  if (kg.length) {
    const ws = wb.addWorksheet(namaLembar('Kokurikuler', dipakai), { views: [{ state: 'frozen', xSplit: 3, ySplit: 4 }] });
    const keys = ['koko', 'no', 'nama'], kol = [];
    kg.forEach((k) => k.dim.forEach((d) => { keys.push('kk:' + k.id + '|' + d); kol.push({ k, d }); }));
    kunci(ws, keys);
    catatan(ws, 2, `Kokurikuler: isi capaian tiap dimensi dengan ${o.koko.level.join(' / ')} (boleh huruf B / C / M). Kosongkan bila belum dinilai.`, 3 + kol.length);
    judulKolom(ws, 3, ['', '', '']); judulKolom(ws, 4, ['ID', 'No', 'Nama ' + o.sebutan].concat(kol.map((x) => x.d)), 'FF5B6578');
    let c0 = 4;
    kg.forEach((k) => {
      if (k.dim.length > 1) ws.mergeCells(3, c0, 3, c0 + k.dim.length - 1);
      const c = ws.getCell(3, c0); c.value = k.nama; c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BIRU } }; c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      c0 += k.dim.length;
    });
    ws.getRow(3).height = 34; ws.getRow(4).height = 46;
    isiMurid(ws, o.murid, 5);
    o.murid.forEach((m, i) => kol.forEach((x, j) => {
      const v = ((((o.koko.cap || {})[m.id] || {})[x.k.id]) || {})[x.d];
      const c = ws.getCell(5 + i, 4 + j); c.value = v || null; c.alignment = { horizontal: 'center' }; c.border = kotak;
    }));
    if (o.murid.length) daftar(ws, `D5:${ws.getColumn(3 + kol.length).letter}${4 + o.murid.length}`, o.koko.level, 'Pilih ' + o.koko.level.join(' / '));
    lebarDasar(ws);
    kol.forEach((_, j) => { ws.getColumn(4 + j).width = 15; });
  }

  // 3. ekstrakurikuler
  const ek = (o.ekskul && o.ekskul.list) || [];
  if (ek.length) {
    const ws = wb.addWorksheet(namaLembar('Ekstrakurikuler', dipakai), { views: [{ state: 'frozen', xSplit: 3, ySplit: 3 }] });
    kunci(ws, ['eks', 'no', 'nama'].concat(ek.map((e) => 'ek:' + e.id)));
    catatan(ws, 2, `Ekstrakurikuler: isi predikat (${o.ekskul.predikat.join(' / ')}) pada kolom ekskul yang diikuti. Kosongkan bila tidak ikut. Maksimal 4 ekskul per ${o.sebutan.toLowerCase()} yang tampil di rapor.`, 3 + ek.length);
    judulKolom(ws, 3, ['ID', 'No', 'Nama ' + o.sebutan].concat(ek.map((e) => e.nama)));
    isiMurid(ws, o.murid, 4);
    o.murid.forEach((m, i) => ek.forEach((e, j) => {
      const c = ws.getCell(4 + i, 4 + j); c.value = ((o.ekskul.data || {})[m.id] || {})[e.id] || null; c.alignment = { horizontal: 'center' }; c.border = kotak;
    }));
    if (o.murid.length) daftar(ws, `D4:${ws.getColumn(3 + ek.length).letter}${3 + o.murid.length}`, o.ekskul.predikat, 'Pilih ' + o.ekskul.predikat.join(' / '));
    lebarDasar(ws);
    ek.forEach((_, j) => { ws.getColumn(4 + j).width = 16; });
    ws.getRow(3).height = 32;
  }

  // 4. kehadiran & catatan
  {
    const smt2 = o.hadir && o.hadir.smt2;
    const ws = wb.addWorksheet(namaLembar('Kehadiran & Catatan', dipakai), { views: [{ state: 'frozen', xSplit: 3, ySplit: 3 }] });
    const keys = ['hadir', 'no', 'nama', 'sakit', 'izin', 'alpa', 'catatan'].concat(smt2 ? ['keputusan'] : []);
    kunci(ws, keys);
    catatan(ws, 2, `Ketidakhadiran (jumlah hari) dan catatan wali kelas. Catatan boleh dikosongkan lalu dibuat otomatis di aplikasi.${smt2 ? ' Semester genap: pilih juga keputusan kenaikan kelas.' : ''}`, keys.length);
    judulKolom(ws, 3, ['ID', 'No', 'Nama ' + o.sebutan, 'Sakit', 'Izin', 'Tanpa ket.', 'Catatan wali kelas'].concat(smt2 ? ['Keputusan'] : []));
    isiMurid(ws, o.murid, 4);
    o.murid.forEach((m, i) => {
      const h = ((o.hadir && o.hadir.data) || {})[m.id] || {};
      ['sakit', 'izin', 'alpa'].forEach((k, j) => { const c = ws.getCell(4 + i, 4 + j); c.value = h[k] === undefined || h[k] === '' ? null : Number(h[k]); c.alignment = { horizontal: 'center' }; c.border = kotak; });
      const c = ws.getCell(4 + i, 7); c.value = h.catatan || null; c.alignment = { wrapText: true, vertical: 'top' }; c.border = kotak;
      if (smt2) { const k = ws.getCell(4 + i, 8); k.value = h.keputusan || null; k.border = kotak; }
    });
    if (o.murid.length) {
      ws.dataValidations.add(`D4:F${3 + o.murid.length}`, { type: 'whole', operator: 'between', allowBlank: true, formulae: [0, 200], showErrorMessage: true, error: 'Isi jumlah hari (angka).' });
      if (smt2) daftar(ws, `H4:H${3 + o.murid.length}`, o.hadir.opsi);
    }
    lebarDasar(ws);
    [4, 5, 6].forEach((c) => { ws.getColumn(c).width = 10; }); ws.getColumn(7).width = 70; if (smt2) ws.getColumn(8).width = 30;
  }

  wb.views = [{ activeTab: 0 }];
  await wb.xlsx.writeFile(file);
  return file;
}

/* ---------------- TEMPLATE GURU MAPEL (satu file per mapel) ---------------- */
/**
 * File yang dibagikan wali kelas ke guru mapel. Isinya hanya satu mapel:
 *  - lembar "Isi Nilai": nilai tiap TP, SAS, pratinjau nilai akhir, deskripsi opsional, nama guru
 *  - lembar "Tujuan Pembelajaran": daftar TP yang boleh diubah/ditambah guru; judul kolom nilai mengikuti lembar ini
 * Kolom nilai dipetakan ke BARIS TP (kunci "tp:1", "tp:2", …), jadi TP baru tulisan guru langsung tersambung.
 *
 * o = { key, judul, singkatan, kktp, bobotLm, bobotSas, teksBobot, sebutan, kelas, semester, tahun, sekolah, wali,
 *       tps:[{id,kode,lingkup,tujuan}], murid:[{id,nama}], nilai:{sid:{tp:{tid:v}, sts, sas, desk}} }
 */
const LBR_TP = 'Tujuan Pembelajaran';
const BARIS_TP = 4;      // TP ke-k ada di baris BARIS_TP + k pada lembar TP
const BARIS_MURID = 8;   // murid pertama di lembar Isi Nilai
function hurufKolom(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
function bulat(n) { return Math.round(n); }

async function templateGuruMapel(file, o) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Rapor Digital';
  wb.calcProperties = { fullCalcOnLoad: true };
  const tps = o.tps || [];
  const N = tps.length ? Math.max(tps.length + 2, 6) : 8;
  const lms = o.lms || [];
  const ref = (kol, k) => `'${LBR_TP}'!$${kol}$${BARIS_TP + k}`;

  /* ----- lembar 1: Isi Nilai ----- */
  const ws = wb.addWorksheet('Isi Nilai', { views: [{ state: 'frozen', xSplit: 3, ySplit: BARIS_MURID - 1 }] });
  const cLmAwal = 4 + N, cSts = cLmAwal + lms.length, cSas = cSts + 1, cNa = cSas + 1, cDesk = cNa + 1, lebar = cDesk;
  const info = { kelas: o.kelas, semester: o.semester, tahun: o.tahun };
  kunci(ws, ['gm:' + o.key, 'no', 'nama'].concat(Array.from({ length: N }, (_, k) => 'tp:' + (k + 1)), lms.map(g => 'lm:' + g.id), ['sts', 'sas', 'na', 'desk', 'info:' + JSON.stringify(info)]));
  ws.getCell(1, lebar + 1).font = { color: { argb: 'FFFFFFFF' } };

  ws.mergeCells(2, 2, 2, lebar);
  ws.getCell(2, 2).value = 'NILAI ' + String(o.judul).toUpperCase();
  ws.getCell(2, 2).font = { bold: true, size: 14, color: { argb: BIRU } };
  ws.getRow(2).height = 24;
  ws.mergeCells(3, 2, 3, lebar);
  ws.getCell(3, 2).value = ['Kelas ' + o.kelas, 'Semester ' + o.semesterTeks, 'Tahun Pelajaran ' + o.tahun, o.sekolah, 'KKTP ' + o.kktp].filter(Boolean).join('  ·  ');
  ws.getCell(3, 2).font = { size: 10, color: { argb: 'FF4A556E' } };

  ws.mergeCells(4, 2, 4, 3);
  ws.getCell(4, 2).value = 'Nama guru mapel ✎';
  ws.getCell(4, 2).font = { bold: true }; ws.getCell(4, 2).alignment = { horizontal: 'right', vertical: 'middle' };
  ws.mergeCells(4, 4, 4, Math.min(lebar, 4 + Math.max(N, 4)));
  const cg = ws.getCell(4, 4);
  cg.value = o.guru || null;
  cg.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9DB' } }; cg.border = kotak; cg.font = { bold: true };
  ws.getRow(4).height = 22;

  ws.mergeCells(5, 2, 5, lebar);
  const cp = ws.getCell(5, 2);
  cp.value = `Cara mengisi: (1) cek/isi daftar TP di lembar "${LBR_TP}"; (2) isi nilai setiap TP dan nilai LM secara langsung pada kolom LM${lms.length ? ' yang tersedia' : ' setelah LM dibuat pada data TP'}, serta STS dan SAS (0–100); ` +
    `(3) nilai LM bukan rata-rata TP; semua LM berbobot sama dalam rata-rata LM; (4) deskripsi boleh dikosongkan agar dibuat otomatis dari capaian TP; ` +
    `(5) simpan, lalu kirim file ini ke wali kelas${o.wali ? ' (' + o.wali + ')' : ''}. Nilai akhir hanya pratinjau (${o.teksBobot || 'LM ' + o.bobotLm + '% + SAS ' + o.bobotSas + '%'}). Jangan menghapus atau menyisipkan kolom.`;
  cp.font = { italic: true, size: 10, color: { argb: 'FF7A4E07' } };
  cp.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF4D6' } };
  cp.alignment = { wrapText: true, vertical: 'middle' };
  ws.getRow(5).height = 58;

  // baris 6: judul kolom; baris 7: keterangan TP dan LM
  judulKolom(ws, 6, ['ID', 'No', 'Nama ' + o.sebutan]);
  const r6 = ws.getRow(6), r7 = ws.getRow(7);
  for (let k = 1; k <= N; k++) {
    const t = tps[k - 1], c = r6.getCell(3 + k);
    c.value = { formula: `IF(TRIM(${ref('A', k)})="","TP ${k}",${ref('A', k)})`, result: (t && t.kode) || 'TP ' + k };
    const l = r7.getCell(3 + k);
    l.value = { formula: `IF(TRIM(${ref('B', k)})<>"",${ref('B', k)},IF(TRIM(${ref('C', k)})<>"",${ref('C', k)},"(cadangan)"))`, result: t ? (t.lingkup || t.tujuan || '(cadangan)') : '(cadangan)' };
  }
  lms.forEach((g, j) => { const c = r6.getCell(cLmAwal + j); c.value = 'LM ' + (j + 1) + ' — ' + g.nama; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16836B' } }; c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; c.border = kotak; });
  judulKolom(ws, 6, ['STS', 'SAS', 'Nilai akhir', 'Deskripsi rapor (opsional)'], null, cSts);
  for (let k = 1; k <= N; k++) {
    const c = r6.getCell(3 + k);
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BIRU } };
    c.alignment = { vertical: 'middle', horizontal: 'center' }; c.border = kotak;
  }
  r6.getCell(cNa).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B6578' } };
  r6.getCell(cDesk).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B6578' } };
  r6.height = 26;
  r7.getCell(3).value = 'Lingkup materi →';
  lms.forEach((g, j) => { r7.getCell(cLmAwal + j).value = 'Input nilai LM langsung'; });
  r7.getCell(cSts).value = 'Tengah semester';
  r7.getCell(cSas).value = 'Akhir semester';
  r7.getCell(cNa).value = 'otomatis';
  r7.getCell(cDesk).value = 'kosongkan = dibuat otomatis oleh aplikasi';
  for (let c = 3; c <= lebar; c++) {
    const x = r7.getCell(c);
    x.font = { italic: true, size: 9, color: { argb: 'FF4A556E' } };
    x.alignment = { wrapText: true, vertical: 'top', horizontal: c === 3 ? 'right' : c === cDesk ? 'left' : 'center' };
    x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F5FA' } }; x.border = kotak;
  }
  r7.height = 54;

  // murid
  const murid = o.murid || [];
  isiMurid(ws, murid, BARIS_MURID);
  const wlm = Number(o.bobotLm) || 0, wsas = Number(o.bobotSas) || 0;
  const L1 = hurufKolom(4), LT = hurufKolom(cSts), LS = hurufKolom(cSas);
  const angka = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
  murid.forEach((m, i) => {
    const r = BARIS_MURID + i, nv = (o.nilai || {})[m.id] || {};
    for (let k = 1; k <= N; k++) {
      const t = tps[k - 1], v = t ? (nv.tp || {})[t.id] : undefined;
      const c = ws.getCell(r, 3 + k), n = angka(v);
      c.value = n; c.alignment = { horizontal: 'center' }; c.border = kotak;
    }
    const nilaiLm = nv.lm || {};
    lms.forEach((g, j) => {
      const c = ws.getCell(r, cLmAwal + j), v = angka(nilaiLm[g.id]);
      c.value = v; c.alignment = { horizontal: 'center' }; c.border = kotak;
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAF7F3' } };
    });
    const sts = angka(nv.sts), sas = angka(nv.sas);
    [[cSts, sts], [cSas, sas]].forEach(([col, val]) => {
      const cs = ws.getCell(r, col); cs.value = val; cs.alignment = { horizontal: 'center' }; cs.border = kotak;
      cs.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF3FF' } };
    });
    const lmCells = lms.map((_, j) => `${hurufKolom(cLmAwal + j)}${r}`);
    const adaLM = lmCells.length ? `COUNT(${lmCells.join(',')})>0` : 'FALSE';
    const rataLM = lmCells.length ? `AVERAGE(${lmCells.join(',')})` : '0';
    const adaSas = `ISNUMBER(${LS}${r})`, nilaiSas = `${LS}${r}`;
    const penyebut = `(${adaLM}*${wlm}+${adaSas}*${wsas})`;
    const pembilang = `(IF(${adaLM},${rataLM},0)*${wlm}+IF(${adaSas},${nilaiSas},0)*${wsas})`;
    const hasilNA = !lms.length ? `IF(${adaSas},${nilaiSas},"")` : `IF(AND(NOT(${adaLM}),NOT(${adaSas})),"",IF(${penyebut}=0,"",ROUND(${pembilang}/${penyebut},0)))`;
    const cn = ws.getCell(r, cNa);
    const vals = lms.map(g => angka(nilaiLm[g.id])).filter(v => v !== null);
    const rata = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
    const komponen = [[rata, wlm], [sas, wsas]].filter(x => x[0] !== null), den = komponen.reduce((a,x)=>a+x[1],0);
    const na = !komponen.length || !den ? '' : bulat(komponen.reduce((a,x)=>a+x[0]*x[1],0)/den);
    cn.value = { formula: hasilNA, result: na };
    cn.alignment = { horizontal: 'center' }; cn.border = kotak; cn.font = { bold: true };
    cn.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F5FA' } };
    const cd = ws.getCell(r, cDesk); cd.value = nv.desk || null; cd.alignment = { wrapText: true, vertical: 'top' }; cd.border = kotak;
  });
  if (murid.length) {
    const akhir = BARIS_MURID + murid.length - 1;
    ws.dataValidations.add(`${L1}${BARIS_MURID}:${LS}${akhir}`, { type: 'decimal', operator: 'between', allowBlank: true, formulae: [0, 100], showErrorMessage: true, errorTitle: 'Nilai tidak valid', error: 'Nilai harus angka 0–100.' });
    ws.addConditionalFormatting({ ref: `${L1}${BARIS_MURID}:${hurufKolom(cNa)}${akhir}`,
      rules: [{ type: 'expression', formulae: [`AND(ISNUMBER(${L1}${BARIS_MURID}),${L1}${BARIS_MURID}<${Number(o.kktp) || 75})`], style: { font: { color: { argb: 'FFC0392B' }, bold: true } } }] });
  }
  lebarDasar(ws);
  for (let k = 1; k <= N; k++) ws.getColumn(3 + k).width = 11;
  lms.forEach((g,j) => { ws.getColumn(cLmAwal+j).width = 22; });
  ws.getColumn(cSts).width = 11; ws.getColumn(cSas).width = 11; ws.getColumn(cNa).width = 11; ws.getColumn(cDesk).width = 60;
  ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };

  /* ----- lembar 2: Tujuan Pembelajaran ----- */
  const wt2 = wb.addWorksheet(LBR_TP, { views: [{ state: 'frozen', ySplit: BARIS_TP }] });
  kunci(wt2, ['tpgm:' + o.key, 'lingkup', 'tujuan']);
  wt2.mergeCells(2, 1, 2, 3);
  wt2.getCell(2, 1).value = 'TUJUAN PEMBELAJARAN — ' + String(o.judul).toUpperCase() + ' · KELAS ' + o.kelas + ' · SEMESTER ' + o.semesterTeks;
  wt2.getCell(2, 1).font = { bold: true, size: 12, color: { argb: BIRU } };
  wt2.mergeCells(3, 1, 3, 3);
  const ct = wt2.getCell(3, 1);
  ct.value = `Satu baris = satu TP (maksimal ${N}). Boleh mengubah, menambah, atau mengosongkan baris. Tulis tujuan dengan huruf kecil diawali kata kerja ` +
    `(menjelaskan, menyelesaikan, membandingkan …) — kalimat ini dipakai untuk menyusun deskripsi rapor. Baris yang lingkup dan tujuannya kosong diabaikan.`;
  ct.font = { italic: true, size: 10, color: { argb: 'FF7A4E07' } };
  ct.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF4D6' } };
  ct.alignment = { wrapText: true, vertical: 'middle' };
  wt2.getRow(3).height = 46;
  judulKolom(wt2, BARIS_TP, ['Kode TP', 'Lingkup materi', 'Tujuan pembelajaran']);
  for (let k = 1; k <= N; k++) {
    const t = tps[k - 1] || {}, r = wt2.getRow(BARIS_TP + k);
    r.getCell(1).value = t.kode || 'TP ' + k;
    r.getCell(2).value = t.lingkup || null;
    r.getCell(3).value = t.tujuan || null;
    for (let c = 1; c <= 3; c++) { r.getCell(c).border = kotak; r.getCell(c).alignment = { wrapText: c > 1, vertical: 'top' }; }
    if (!tps[k - 1]) for (let c = 1; c <= 3; c++) r.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFBFD' } };
  }
  [12, 34, 90].forEach((w, i) => { wt2.getColumn(i + 1).width = w; });
  wt2.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };

  wb.views = [{ activeTab: 0 }];
  await wb.xlsx.writeFile(file);
  return file;
}

/* ---------------- BACA FILE EXCEL ---------------- */
function teksSel(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) { const p = (n) => String(n).padStart(2, '0'); return v.getUTCFullYear() + '-' + p(v.getUTCMonth() + 1) + '-' + p(v.getUTCDate()); }
  if (typeof v === 'object') {
    if (v.richText) return v.richText.map((x) => x.text).join('');
    if (v.text !== undefined) return String(v.text);
    if (v.result !== undefined) return teksSel(v.result);
    return '';
  }
  return String(v);
}
/** → { namaLembar: [[sel...], ...] } (sel gabungan selain sel utama = kosong) */
async function bacaExcel(file) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  const hasil = {}, urutan = [];
  wb.eachSheet((ws) => {
    const rows = [];
    ws.eachRow({ includeEmpty: true }, (row, n) => {
      const arr = [];
      for (let c = 1; c <= ws.columnCount; c++) {
        const cell = row.getCell(c);
        arr.push(cell.isMerged && cell.master && cell.master.address !== cell.address ? '' : teksSel(cell.value).trim());
      }
      rows[n - 1] = arr;
    });
    hasil[ws.name] = Array.from(rows, (r) => r || []);
    urutan.push(ws.name);
  });
  return hasil;
}

module.exports = { templateMurid, templateTP, templateSemester, templateGuruMapel, bacaExcel };
