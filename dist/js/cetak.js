/* =========================================================
   RAPOR DIGITAL SD — Cetak rapor & leger (PDF / printer)
   ========================================================= */
function kelasHal() { return (S.cetakKertas || P('kertas') || 'A4') === 'F4' ? 'f4' : ''; }
function idt(rows) { return '<table class="idt">' + rows.map(r => `<tr><td style="width:${r[2] || '34%'}">${r[0]}</td><td class="c">:</td><td>${r[1] == null || r[1] === '' ? '-' : r[1]}</td></tr>`).join('') + '</table>'; }
function alamatSekolah() { var lokasi = []; if (P('desa')) lokasi.push('Desa ' + P('desa')); if (P('kecamatan')) lokasi.push('Kec.\u00a0' + P('kecamatan')); if (P('kabupaten')) lokasi.push('Kab. ' + P('kabupaten')); if (P('provinsi')) lokasi.push(P('provinsi')); return [P('alamat_sekolah'), lokasi.join(', ')].filter(Boolean).join(', '); }
function ttlMurid(m) { return [m.tempat_lahir, tglIndo(m.tanggal_lahir)].filter(Boolean).join(', '); }
function hari(n) { n = num(n); return n ? n + ' hari' : '-'; }
function nipBaris(nip, key) {
  var show = key ? P(key) !== 'Tidak' : true;
  return (show && String(nip || '').trim()) ? 'NIP. ' + esc(String(nip).trim()) : '';
}

/* Pengaturan khusus tiga lembar identitas — tersimpan lokal dan terpisah dari layout tabel rapor */
var KUNCI_IDENTITAS_CETAK = 'raporDigital.identitasCetak.v1';
function identitasCetakDefault() {
  return {sampul:{font:'Arial',size:11,line:1.35,logo:120},sekolah:{font:'Arial',size:12,line:1.8,logo:48},identitas:{font:'Arial',size:11,line:1.55,logo:42},tanggal:P('tanggal_rapor')||new Date().toISOString().slice(0,10)};
}
function identitasCetakBaca() {
  var d=identitasCetakDefault();
  try { var x=JSON.parse(localStorage.getItem(KUNCI_IDENTITAS_CETAK)||'{}'); return {sampul:Object.assign(d.sampul,x.sampul||{}),sekolah:Object.assign(d.sekolah,x.sekolah||{}),identitas:Object.assign(d.identitas,x.identitas||{}),tanggal:x.tanggal||d.tanggal}; } catch(e) { return d; }
}
function identitasCetakSimpan(x) { try { localStorage.setItem(KUNCI_IDENTITAS_CETAK,JSON.stringify(x)); } catch(e) { toast('Pengaturan identitas tidak dapat disimpan.','err'); } }
function styleIdentitas(k) { var x=identitasCetakBaca()[k]; return `font-family:${esc(x.font)},Arial,sans-serif;font-size:${Math.max(7,Math.min(24,Number(x.size)||10))}pt;line-height:${Math.max(1,Math.min(2.5,Number(x.line)||1.4))}`; }
function tanggalIdentitasMurid() { var x=identitasCetakBaca(); return esc((P('tempat_rapor')||P('kabupaten')||'…………')+', '+(tglIndo(x.tanggal)||'………………')); }
function tempatTanggal() { return esc((P('tempat_rapor') || P('kabupaten') || '…………') + ', ' + (tglIndo(P('tanggal_rapor')) || '……………… ' + new Date().getFullYear())); }

function halamanSampul(m) {
  // Sampul mengikuti PDF acuan sekolah; identitas murid selalu dibaca langsung dari record database.
  var logo = P('logo') || 'assets/school-logo.png';
  var nama = String(m && m.nama || '').trim().toUpperCase();
  var nisn = String(m && m.nisn || '-').trim() || '-';
  var nis = String(m && m.nis || '-').trim() || '-';
  return `<div class="page ${kelasHal()} identity-cover"><div class="cover cover-acuan">
    <div class="cover-heading">
      <div class="cover-title">LAPORAN</div>
      <div class="cover-subtitle">HASIL CAPAIAN KOMPETENSI MURID</div>
      <div class="cover-school">SDS ISLAM TERPADU SULTHONIYAH</div>
    </div>
    <img class="cover-logo" src="${esc(logo)}" alt="Logo SDS Islam Terpadu Sulthoniyah">
    <div class="cover-student">
      <div class="cover-label">NAMA MURID</div>
      <div class="cover-student-name">${esc(nama)}</div>
      <div class="cover-label cover-id-label">NISN / NIS</div>
      <div class="cover-student-id">${esc(nisn)} / ${esc(nis)}</div>
    </div>
    <div class="cover-foundation">YAYASAN RUMAH BINA DA'I INDONESIA</div>
  </div></div>`;
}
function halamanIdentitasSekolah() {
  var cfg=identitasCetakBaca().sekolah;
  return `<div class="page ${kelasHal()} identity-school" style="${styleIdentitas('sekolah')}">
    <h2 class="pt" style="margin-top:10mm">IDENTITAS SEKOLAH<br>${esc(teksJenjang())}</h2><div style="height:14mm"></div>
    ${idt([['Nama Sekolah', esc(P('nama_sekolah'))], ['NPSN', esc(P('npsn'))], ['NIS/NSS/NDS', esc(P('nss'))], ['Alamat Sekolah', esc(P('alamat_sekolah'))],
      ['Kode Pos', esc(P('kode_pos'))], ['Telepon', esc(P('telepon'))], ['Kelurahan/Desa', esc(P('desa'))], ['Kecamatan', esc(P('kecamatan'))],
      ['Kabupaten/Kota', esc(P('kabupaten'))], ['Provinsi', esc(P('provinsi'))], ['Website', esc(P('website'))], ['E-mail', esc(P('email'))]].map(r => [r[0], r[1], '32%']))}
  </div>`.replace('<table class="idt">', `<table class="idt" style="font-size:${Math.max(7,Math.min(24,Number(cfg.size)||11))}pt;line-height:${Math.max(1,Math.min(2.5,Number(cfg.line)||1.8))}">`);
}
function halamanIdentitasMurid(m) {
  var cfg=identitasCetakBaca().identitas;
  var n = 0, no = () => (++n) + '.';
  var rows = [
    [no() + ' Nama ' + sebutan() + ' (lengkap)', esc(namaCetak(m))], [no() + ' NISN / NIS', esc((m.nisn || '-') + ' / ' + (m.nis || '-'))],
    [no() + ' Tempat, Tanggal Lahir', esc(ttlMurid(m))], [no() + ' Jenis Kelamin', /^p/i.test(m.jk) ? 'Perempuan' : /^l/i.test(m.jk) ? 'Laki-laki' : ''],
    [no() + ' Agama', esc(normAgama(m.agama))], [no() + ' Pendidikan Sebelumnya', esc(m.pendidikan_sebelumnya)], [no() + ' Alamat ' + sebutan(), esc(m.alamat)],
    [no() + ' Nama Orang Tua', ''], ['&nbsp;&nbsp;&nbsp;&nbsp;a. Ayah', esc(m.nama_ayah)], ['&nbsp;&nbsp;&nbsp;&nbsp;b. Ibu', esc(m.nama_ibu)],
    [no() + ' Pekerjaan Orang Tua', ''], ['&nbsp;&nbsp;&nbsp;&nbsp;a. Ayah', esc(m.pekerjaan_ayah)], ['&nbsp;&nbsp;&nbsp;&nbsp;b. Ibu', esc(m.pekerjaan_ibu)],
    [no() + ' Alamat Orang Tua', esc(m.alamat_ortu)],
    [no() + ' Wali ' + sebutan(), ''], ['&nbsp;&nbsp;&nbsp;&nbsp;a. Nama', esc(m.nama_wali)], ['&nbsp;&nbsp;&nbsp;&nbsp;b. Pekerjaan', esc(m.pekerjaan_wali)], ['&nbsp;&nbsp;&nbsp;&nbsp;c. Alamat', esc(m.alamat_wali)]
  ].map(r => [r[0], r[1] === '' && /^\d+\. (Nama Orang|Pekerjaan Orang|Wali)/.test(r[0]) ? '&nbsp;' : r[1], '38%']);
  return `<div class="page ${kelasHal()} identity-student" style="${styleIdentitas('identitas')}"><h2 class="pt">IDENTITAS ${esc(sebutan().toUpperCase())}</h2><div style="height:4mm"></div>
    ${idt(rows).replace('<table class="idt">', `<table class="idt" style="font-size:${Math.max(7,Math.min(24,Number(cfg.size)||10))}pt;line-height:${Math.max(1,Math.min(2.5,Number(cfg.line)||1.55))}">`).replace(/<td class="c">:<\/td><td>&nbsp;<\/td>/g, '<td></td><td></td>')}
    <div class="identitas-ttd-row" style="width:100%;display:grid;grid-template-columns:30mm 70mm;column-gap:16mm;justify-content:end;align-items:end;margin-top:14mm">
      <div class="identitas-foto" style="box-sizing:border-box;width:30mm;height:40mm;border:0.8pt solid #000;display:flex;align-items:center;justify-content:center;text-align:center;font-size:9pt;color:#555">Pas foto<br>3 × 4</div>
      <div class="identitas-ttd" style="box-sizing:border-box;width:70mm;min-width:70mm;display:flex;flex-direction:column;align-items:center;text-align:center;font-size:10pt">
        <div style="width:100%;text-align:center">${tanggalIdentitasMurid()}</div>
        <div style="width:100%;text-align:center">Kepala Sekolah,</div>
        <div style="height:58pt;width:100%"></div>
        <div style="width:100%;text-align:center"><b><u>${esc(P('kepala_sekolah') || '………………………………')}</u></b></div>
        <div style="width:100%;text-align:center">${nipBaris(P('nip_kepala'), 'tampilkan_nip_kepala')}</div>
      </div>
    </div></div>`;
}
function kepalaRapor(m) {
  var L = [['Nama ' + sebutan(), '<b>' + esc(namaCetak(m)) + '</b>'], ['NISN / NIS', esc((m.nisn || '-') + ' / ' + (m.nis || '-'))], ['Nama Sekolah', esc(P('nama_sekolah'))], ['Alamat', esc(alamatSekolah())]];
  var R = [['Kelas', esc(namaKelas())], ['Fase', fase(P('kelas'))], ['Semester', esc(teksSemester())], ['Tahun Pelajaran', esc(P('tahun_pelajaran'))]];
  return `<table style="margin-bottom:4pt"><tr><td style="width:60%;vertical-align:top">${idt(L.map(r => [r[0], r[1], '30%']))}</td><td style="vertical-align:top">${idt(R.map(r => [r[0], r[1], '45%']))}</td></tr></table><div class="hdr-line"></div>`;
}
function barisIntra(m) {
  var mp = mapelMurid(m), out = [], no = 0, i = 0;
  while (i < mp.length) {
    var x = mp[i], grp = (x.kelompok === 'Seni dan Budaya' || x.kelompok === 'Muatan Lokal') ? x.kelompok : null;
    if (grp) {
      var anggota = []; while (i < mp.length && mp[i].kelompok === grp) { anggota.push(mp[i]); i++; }
      if (anggota.length > 1) {
        no++; out.push(`<tr><td class="c">${no}</td><td class="grp" colspan="3">${grp === 'Seni dan Budaya' ? 'Seni dan Budaya' : 'Muatan Lokal'}</td></tr>`);
        anggota.forEach((a, k) => out.push(barisMapel(m, a, '', String.fromCharCode(97 + k) + '. ')));
      } else { no++; out.push(barisMapel(m, anggota[0], no, '')); }
    } else { no++; out.push(barisMapel(m, x, no, '')); i++; }
  }
  return out.join('');
}
function barisMapel(m, x, no, sub) {
  var h = hitung(m, x);
  return `<tr><td class="c">${no}</td><td style="width:30%">${sub ? '<span style="padding-left:8pt">' + sub + '</span>' : ''}${esc(namaMapelUntuk(x, m))}</td><td class="na" style="width:11%">${h.na == null ? '-' : h.na}</td><td class="desc">${esc(deskripsi(m, x, h) || '-')}</td></tr>`;
}
function halamanRapor(m) {
  var h = S.hadir[m.id] || {}, eks = ekskulMurid(m), smt2 = P('semester') === '2';
  return `<div class="page ${kelasHal()}">
    <h2 class="pt">LAPORAN HASIL BELAJAR</h2>${kepalaRapor(m)}
    <div class="sect">A. Intrakurikuler</div>
    <table class="rt rt-intra"><thead><tr><th style="width:6%">No</th><th>Mata Pelajaran</th><th>Nilai Akhir</th><th>Capaian Kompetensi</th></tr></thead><tbody>${barisIntra(m)}</tbody></table>
    <div class="avoid"><div class="sect">B. Kokurikuler</div><div class="box">${esc(deskripsiKoko(m) || '-')}</div></div>
    <div class="avoid"><div class="sect">C. Ekstrakurikuler</div>
    <table class="rt rt-ekskul"><thead><tr><th style="width:6%">No</th><th>Ekstrakurikuler</th><th>Keterangan</th></tr></thead><tbody>
      ${eks.length ? eks.map((e, i) => `<tr><td class="c">${i + 1}</td><td>${esc(e.nama)}</td><td>${esc(e.ket)}</td></tr>`).join('') : '<tr><td class="c">1</td><td>-</td><td>-</td></tr>'}</tbody></table></div>
    <div class="avoid" style="display:grid;grid-template-columns:42% 1fr;gap:10pt;margin-top:0;align-items:stretch">
      <div style="display:flex;flex-direction:column"><div class="sect">D. Ketidakhadiran</div><table class="rt rt-hadir" style="margin-top:8pt"><tbody>
        <tr><td>Sakit</td><td class="c" style="width:38%">${hari(h.sakit)}</td></tr><tr><td>Izin</td><td class="c">${hari(h.izin)}</td></tr><tr><td>Tanpa Keterangan</td><td class="c">${hari(h.alpa)}</td></tr></tbody></table></div>
      <div style="display:flex;flex-direction:column"><div class="sect">E. Catatan Guru Kelas</div><div class="box" style="flex:1;margin-top:8pt;min-height:0;box-sizing:border-box">${esc(h.catatan || '-')}</div></div>
    </div>
    <div class="avoid">${P('rapor_tanggapan') === 'Ya' ? `<div class="avoid"><div class="sect">F. Tanggapan Orang Tua/Wali</div><div class="box" style="min-height:40pt"></div></div>` : ''}
    ${smt2 ? `<div class="avoid"><div class="box" style="margin-top:10pt"><b>Keputusan:</b> Berdasarkan pencapaian seluruh kompetensi, ${esc(sebutan().toLowerCase())} dinyatakan:<br><b style="font-size:11pt">${esc(h.keputusan || '……………………………………')}</b></div></div>` : ''}
    ${P('ttd_posisi') === 'Sejajar' ? `
    <div class="ttd" style="grid-template-columns:1fr 1fr 1.3fr;row-gap:0;align-items:end">
      <div></div><div>Mengetahui,</div><div>${tempatTanggal()}</div>
      <div style="align-self:start">Orang Tua/Wali,</div><div style="align-self:start">Kepala Sekolah,</div><div style="align-self:start">Guru Kelas,</div>
      <div class="sp"></div><div class="sp"></div><div class="sp"></div>
      <div><b>………………………………</b></div><div><b><u>${esc(P('kepala_sekolah') || '………………………………')}</u></b></div><div><b><u>${esc(P('wali_kelas') || '………………………………')}</u></b></div>
      <div></div><div style="align-self:start">${nipBaris(P('nip_kepala'), 'tampilkan_nip_kepala')}</div><div style="align-self:start">${nipBaris(P('nip_wali'), 'tampilkan_nip_wali')}</div>
    </div>` : `
    <div class="ttd" style="grid-template-columns:1fr 1fr;column-gap:24pt;row-gap:0;align-items:end;margin-top:10pt">
      <div></div><div>${tempatTanggal()}</div>
      <div style="align-self:start">Orang Tua/Wali,</div><div style="align-self:start">Guru Kelas,</div>
      <div class="sp" style="height:46pt"></div><div class="sp" style="height:46pt"></div>
      <div><b>………………………………</b></div><div><b><u>${esc(P('wali_kelas') || '………………………………')}</u></b></div>
      <div></div><div style="align-self:start">${nipBaris(P('nip_wali'), 'tampilkan_nip_wali')}</div>
    </div>
    <div class="ttd" style="grid-template-columns:1fr;width:62%;margin:4pt auto 0;row-gap:0">
      <div>Mengetahui,<br>Kepala Sekolah,</div>
      <div class="sp" style="height:50pt"></div>
      <div><b><u>${esc(P('kepala_sekolah') || '………………………………')}</u></b></div>
      <div>${nipBaris(P('nip_kepala'), 'tampilkan_nip_kepala')}</div>
    </div>`}
    </div></div>`;
}
function halamanGrafik(m, jobs) {
  var mp = mapelMurid(m), dd = mp.map(x => ({ m: x, na: hitung(m, x).na, k: rataKelasMapel(x).rata })).filter(o => o.na != null);
  var id = 'g' + Math.random().toString(36).slice(2, 8);
  var kuat = dd.slice().sort((a, b) => b.na - a.na).slice(0, 2).map(o => namaMapelUntuk(o.m, m));
  var perlu = dd.filter(o => o.na < kktp(o.m) || o.na < o.k - 5).sort((a, b) => (a.na - a.k) - (b.na - b.k)).slice(0, 2).map(o => namaMapelUntuk(o.m, m));
  jobs.push({ id: id + 'a', w: 640, h: 300, cfg: {
    type: 'bar', data: { labels: dd.map(o => o.m.singkatan || o.m.nama), datasets: [
      { label: 'Nilai ' + panggilan(m), data: dd.map(o => o.na), backgroundColor: brand(), borderRadius: 3, maxBarThickness: 26 },
      { label: 'Rata-rata kelas', data: dd.map(o => Math.round(o.k * 10) / 10), backgroundColor: '#BFC6D4', borderRadius: 3, maxBarThickness: 26 }] },
    options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, color: '#000', font: { size: 11 } } } },
      scales: { y: { min: 0, max: 100, ticks: { color: '#000' } }, x: { grid: { display: false }, ticks: { color: '#000', font: { weight: 'bold' } } } } } } });
  jobs.push({ id: id + 'b', w: 330, h: 300, cfg: {
    type: 'radar', data: { labels: dd.map(o => o.m.singkatan || o.m.nama), datasets: [
      { label: panggilan(m), data: dd.map(o => o.na), borderColor: brand(), backgroundColor: mix(brand(), '#ffffff', .75), borderWidth: 2, pointRadius: 2 },
      { label: 'Kelas', data: dd.map(o => Math.round(o.k)), borderColor: '#888', borderDash: [4, 3], borderWidth: 1.2, pointRadius: 0, backgroundColor: 'transparent' }] },
    options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, color: '#000', font: { size: 10 } } } }, scales: { r: { min: 40, max: 100, ticks: { stepSize: 20, backdropColor: 'transparent', font: { size: 8 } }, pointLabels: { color: '#000', font: { size: 9, weight: 'bold' } } } } } } });
  return `<div class="page ${kelasHal()}">
    <h2 class="pt">GRAFIK CAPAIAN BELAJAR</h2>${kepalaRapor(m)}
    <div class="gbox"><div class="gtitle">Nilai akhir dibanding rata-rata kelas</div><img data-job="${id}a" style="width:100%;height:auto"></div>
    <div style="display:grid;grid-template-columns:48% 1fr;gap:10pt">
      <div class="gbox"><div class="gtitle">Profil capaian</div><img data-job="${id}b" style="width:100%;height:auto"></div>
      <div class="gbox"><div class="gtitle">Ringkasan</div><table class="ana"><tr><td><b>Mapel</b></td><td style="text-align:center"><b>Nilai</b></td><td style="text-align:center"><b>Kelas</b></td></tr>
        ${dd.map(o => `<tr><td>${esc(o.m.singkatan || o.m.nama)}</td><td style="text-align:center;font-weight:bold">${o.na}</td><td style="text-align:center">${f1(o.k)}</td></tr>`).join('')}</table></div>
    </div>
    <div class="box" style="margin-top:10pt"><b>Catatan capaian:</b> ${kuat.length ? `Capaian paling menonjol pada ${esc(gabung(kuat))}. ` : ''}${perlu.length ? `Perlu pendampingan lebih pada ${esc(gabung(perlu))}.` : 'Capaian pada semua mata pelajaran sudah merata dan baik.'} Rata-rata nilai akhir ${f1(rataMurid(m).rata)}.</div>
  </div>`;
}

/* ---------- mesin cetak ---------- */
function layoutRaporDefault() { return { atas: 12, kanan: 14, bawah: 12, kiri: 17, mapel: 27, nilai: 9, eksNama: 30, hadirLabel: 62 }; }
function layoutRaporBaca() {
  try { return Object.assign(layoutRaporDefault(), JSON.parse(localStorage.getItem('raporDigital.layoutCetak') || '{}')); }
  catch (_) { return layoutRaporDefault(); }
}
function layoutRaporSimpan(x) { try { localStorage.setItem('raporDigital.layoutCetak', JSON.stringify(x)); } catch (_) {} }
function layoutRaporTerapkan() {
  var x = layoutRaporBaca();
  var st = $('#report-layout-preview-style');
  if (!st) { st = document.createElement('style'); st.id = 'report-layout-preview-style'; document.head.appendChild(st); }
  st.textContent = `#prev .page{padding:${x.atas}mm ${x.kanan}mm ${x.bawah}mm ${x.kiri}mm!important;box-sizing:border-box}
  #prev .rt-intra{table-layout:fixed;width:100%}
  #prev .rt-intra th:nth-child(1),#prev .rt-intra td:nth-child(1){width:6%}
  #prev .rt-intra th:nth-child(2),#prev .rt-intra td:nth-child(2){width:${x.mapel}%}
  #prev .rt-intra th:nth-child(3),#prev .rt-intra td:nth-child(3){width:${x.nilai}%}
  #prev .rt-intra th:nth-child(4),#prev .rt-intra td:nth-child(4){width:${100-6-x.mapel-x.nilai}%}
  #prev .rt-ekskul{table-layout:fixed;width:100%}
  #prev .rt-ekskul th:nth-child(1),#prev .rt-ekskul td:nth-child(1){width:6%}
  #prev .rt-ekskul th:nth-child(2),#prev .rt-ekskul td:nth-child(2){width:${x.eksNama}%}
  #prev .rt-ekskul th:nth-child(3),#prev .rt-ekskul td:nth-child(3){width:${94-x.eksNama}%}
  #prev .rt-hadir{table-layout:fixed;width:100%}
  #prev .rt-hadir td:nth-child(1){width:${x.hadirLabel}%}
  #prev .rt-hadir td:nth-child(2){width:${100-x.hadirLabel}%}`;
}
function aturHalaman(land) {
  var k = S.cetakKertas || P('kertas') || 'A4', x = layoutRaporBaca();
  var size = k === 'F4' ? (land ? '330mm 215mm' : '215mm 330mm') : (land ? 'A4 landscape' : 'A4 portrait');
  var margin = S.legerCetakAktif ? '8mm' : `${x.atas}mm ${x.kanan}mm ${x.bawah}mm ${x.kiri}mm`;
  $('#page-style').textContent = `@page{size:${size};margin:${margin}}
  .lgr{width:100%;border-collapse:collapse;table-layout:auto;font-size:${land?'7.5':'6.5'}pt}
  .lgr th,.lgr td{border:1px solid #333;padding:3px 4px;text-align:center;white-space:normal;overflow-wrap:anywhere}
  .lgr td.nama-siswa{min-width:30mm;text-align:left;white-space:normal}
  .rt-intra{table-layout:fixed;width:100%}
  .rt-intra th:nth-child(1),.rt-intra td:nth-child(1){width:6%}
  .rt-intra th:nth-child(2),.rt-intra td:nth-child(2){width:${x.mapel}%}
  .rt-intra th:nth-child(3),.rt-intra td:nth-child(3){width:${x.nilai}%}
  .rt-intra th:nth-child(4),.rt-intra td:nth-child(4){width:${100-6-x.mapel-x.nilai}%}
  .rt-ekskul{table-layout:fixed;width:100%}
  .rt-ekskul th:nth-child(1),.rt-ekskul td:nth-child(1){width:6%}
  .rt-ekskul th:nth-child(2),.rt-ekskul td:nth-child(2){width:${x.eksNama}%}
  .rt-ekskul th:nth-child(3),.rt-ekskul td:nth-child(3){width:${94-x.eksNama}%}
  .rt-hadir{table-layout:fixed;width:100%}
  .rt-hadir td:nth-child(1){width:${x.hadirLabel}%}
  .rt-hadir td:nth-child(2){width:${100-x.hadirLabel}%}`;
}
function kontrolLayoutCetak() {
  var x = layoutRaporBaca();
  return `<div class="card mt"><div class="card-h"><h3>Pengaturan tata letak cetak</h3></div><div class="card-b"><div class="grid g2" style="gap:8px">
    ${[['atas','Margin atas (mm)'],['kanan','Margin kanan (mm)'],['bawah','Margin bawah (mm)'],['kiri','Margin kiri (mm)'],['mapel','Tabel mapel: lebar kolom mapel (%)'],['nilai','Tabel mapel: lebar kolom nilai (%)'],['eksNama','Tabel ekstrakurikuler: lebar nama (%)'],['hadirLabel','Tabel kehadiran: lebar label (%)']].map(([k,l])=>`<label class="small">${l}<input class="inp" type="number" min="0" max="80" step="1" data-layout="${k}" value="${x[k]}"></label>`).join('')}
    </div><div class="small muted" style="margin-top:8px">Lebar deskripsi intrakurikuler, kolom keterangan ekstrakurikuler, dan kolom jumlah kehadiran mengikuti sisa lebar tabel masing-masing. Ketiga tabel memiliki pengaturan terpisah.</div><button class="btn ghost sm mt-s" id="resetLayout">Kembalikan pengaturan awal</button></div></div>`;
}
function jalankanJob(root, jobs) {
  jobs.forEach(j => {
    var img = $(`img[data-job="${j.id}"]`, root); if (!img || !window.Chart) { if (img) img.remove(); return; }
    var c = document.createElement('canvas'); c.width = j.w; c.height = j.h;
    c.style.cssText = `position:fixed;left:-9999px;top:0;width:${j.w}px;height:${j.h}px`;
    document.body.appendChild(c);
    var cfg = j.cfg; cfg.options = Object.assign({ responsive: false, animation: false, devicePixelRatio: 3 }, cfg.options);
    Chart.defaults.font.family = 'Arial, sans-serif';
    var ch = new Chart(c, cfg);
    img.src = ch.toBase64Image('image/png', 1);
    ch.destroy(); c.remove();
  });
  Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
}
/** Siapkan halaman cetak di #print-root (gambar & grafik dirender dulu) */
function siapkanCetak(html, jobs, land) {
  var pr = $('#print-root');
  pr.innerHTML = html;
  jalankanJob(pr, jobs || []);
  aturHalaman(land);
  var imgs = $$('img', pr).map(i => i.decode ? i.decode().catch(() => {}) : Promise.resolve());
  return Promise.all(imgs).then(() => new Promise(r => setTimeout(r, 200)));
}
/** mode 'pdf' = simpan PDF, 'print' = dialog printer */
function cetakHTML(html, jobs, land, opsi) {
  opsi = opsi || {};
  busy(true, opsi.mode === 'print' ? 'Menyiapkan cetakan…' : 'Membuat PDF…');
  return siapkanCetak(html, jobs, land).then(() => {
    busy(false);
    if (opsi.mode === 'print') return window.desktop.cetak();
    return window.desktop.simpanPdf({ namaFile: opsi.namaFile || 'Rapor' }).then(r => { if (r && r.ok) toastFile('PDF tersimpan', r.path); });
  }).catch(gagal).finally(() => { busy(false); $('#print-root').innerHTML = ''; });
}
function namaFileRapor() { return 'Rapor Kelas ' + namaKelas() + ' Semester ' + P('semester') + ' ' + String(P('tahun_pelajaran')).replace('/', '-'); }
/** Satu file PDF per murid ke folder pilihan (siap dikirim ke orang tua) */
function pdfPerMurid(ids, bag) {
  return window.desktop.pilihFolder().then(f => {
    if (!f.ok) return;
    var n = 0, i = 0;
    var lanjut = () => {
      if (i >= ids.length) { busy(false); $('#print-root').innerHTML = ''; toastFile(n + ' file PDF tersimpan', f.folder); return; }
      var mu = muridById(ids[i++]); busy(true, 'Membuat PDF ' + i + ' dari ' + ids.length + '…');
      var r = susunRapor([mu.id], bag);
      return siapkanCetak(r.html, r.jobs, false)
        .then(() => window.desktop.pdfKeFolder({ namaFile: 'Rapor ' + String(i).padStart(2, '0') + ' ' + mu.nama }))
        .then(x => { if (x && x.ok) n++; busy(false); return lanjut(); });
    };
    return lanjut();
  }).catch(e => { busy(false); gagal(e); });
}

function susunRapor(ids, bag) {
  var html = '', jobs = [];
  // urutan buku rapor tiap murid: sampul → identitas sekolah → identitas murid → laporan → grafik
  var perMurid = bag.sampul || bag.identitas || bag.rapor || bag.grafik;
  if (bag.sekolah && !perMurid) html += halamanIdentitasSekolah();
  ids.forEach(id => {
    var m = muridById(id); if (!m) return;
    if (bag.sampul) html += halamanSampul(m);
    if (bag.sekolah && perMurid) html += halamanIdentitasSekolah();
    if (bag.identitas) html += halamanIdentitasMurid(m);
    if (bag.rapor) html += halamanRapor(m);
    if (bag.grafik) html += halamanGrafik(m, jobs);
  });
  return { html: html, jobs: jobs };
}


function kontrolIdentitasCetak() {
  var x=identitasCetakBaca(), fonts=['Arial','Calibri','Times New Roman','Georgia','Verdana','Tahoma'];
  var parts=[['sekolah','Identitas Sekolah'],['identitas','Identitas Murid']];
  return `<div class="card mt"><div class="card-h"><h3>Pengaturan tampilan identitas</h3><span class="sub">Tersimpan otomatis</span></div><div class="card-b">
    ${parts.map(([k,label])=>`<div style="border-bottom:1px solid var(--line);padding:8px 0"><b>${label}</b><div class="grid g2" style="gap:8px;margin-top:8px">
      <label class="small">Jenis font<select class="inp" data-ident-font="${k}">${fonts.map(f=>`<option value="${f}" ${x[k].font===f?'selected':''}>${f}</option>`).join('')}</select></label>
      <label class="small">Ukuran huruf (pt)<input class="inp" type="number" min="7" max="24" step=".5" data-ident-size="${k}" value="${x[k].size}"></label>
      <label class="small">Jarak antarbaris<input class="inp" type="number" min="1" max="2.5" step=".05" data-ident-line="${k}" value="${x[k].line}"></label>
      <label class="small">Ukuran logo (pt)<input class="inp" type="number" min="20" max="220" step="2" data-ident-logo="${k}" value="${x[k].logo}"></label>
    </div></div>`).join('')}
    <label class="field mt-s">Tanggal pada lembar Identitas Murid<input class="inp" type="date" id="tanggalIdentitas" value="${esc(x.tanggal)}"></label>
    <div class="small muted">Tanggal ini hanya berlaku untuk lembar Identitas Murid. Tanggal rapor dan tanda tangan laporan hasil belajar tidak berubah.</div>
    <button class="btn ghost sm mt-s" id="resetIdentitasCetak" type="button">Kembalikan pengaturan identitas</button>
  </div></div>`;
}
/* ---------- halaman Cetak Rapor ---------- */
VIEWS.cetak = function (v) {
  if (perluMurid(v)) return;
  S.cetakKertas = S.cetakKertas || P('kertas') || 'A4';
  var pilih = {}; (S.cetakPilih && S.cetakPilih.length ? S.cetakPilih : MA().map(m => m.id)).forEach(id => pilih[id] = true);
  S.cetakPilih = null;
  var bag = S.cetakBag || { sampul: false, sekolah: false, identitas: false, rapor: true, grafik: P('rapor_grafik') === 'Ya' };
  S.cetakBag = bag;
  var lihat = MA().find(m => pilih[m.id]) || MA()[0];
  var ks = kesiapan();
  v.innerHTML = `<div class="grid cetak-split-scroll" style="grid-template-columns:minmax(0,340px) minmax(0,1fr)" id="gridCetak">
    <div id="cetakSettingsPane" class="cetak-settings-pane">
      <div class="card"><div class="card-h"><h3>Bagian yang dicetak</h3></div><div class="card-b check-list" style="border:0;max-height:none;padding:6px 10px">
        <div class="small b muted" style="padding:4px 8px">IDENTITAS RAPOR</div>
        ${[['sampul', 'Sampul rapor'], ['sekolah', 'Identitas sekolah'], ['identitas', 'Identitas ' + sebutan().toLowerCase()]].map(x => `<label><input type="checkbox" data-bag="${x[0]}" ${bag[x[0]] ? 'checked' : ''}> ${x[1]}</label>`).join('')}
        <div class="small b muted" style="padding:10px 8px 4px;border-top:1px solid var(--line);margin-top:6px">HASIL BELAJAR</div>
        ${[['rapor', 'Laporan hasil belajar'], ['grafik', 'Grafik capaian']].map(x => `<label><input type="checkbox" data-bag="${x[0]}" ${bag[x[0]] ? 'checked' : ''}> ${x[1]}</label>`).join('')}
        <div class="row" style="justify-content:space-between;padding:8px"><span class="b small">Kertas</span><div class="seg" id="segK">${['A4', 'F4'].map(k => `<button data-val="${k}" class="${S.cetakKertas === k ? 'on' : ''}">${k}</button>`).join('')}</div></div>
      </div></div>
      ${kontrolIdentitasCetak()}\n      ${kontrolLayoutCetak()}
      <div class="card mt"><div class="card-h"><h3>${sebutan()}</h3><span class="act"><button class="btn ghost sm" id="semua">Semua</button><button class="btn ghost sm" id="nol">Kosongkan</button></span></div>
        <div class="card-b"><div class="check-list" id="daftarM">${MA().map((m, i) => `<label><input type="checkbox" data-id="${m.id}" ${pilih[m.id] ? 'checked' : ''}> <span class="muted" style="width:20px">${i + 1}</span> ${esc(m.nama)} <span class="sp"></span><button class="btn ghost icon sm" data-lihat="${m.id}" title="Pratinjau">${ic('eye')}</button></label>`).join('')}</div></div></div>
      ${ks.total < 100 ? `<div class="preview-desk mt small" style="background:var(--warn-bg);border-color:#F1D9A2;color:#7A4E07">${ic('alert')} Kesiapan rapor ${ks.total}%. Masih ada data yang belum lengkap — cek di Beranda.</div>` : ''}
      <button class="btn mt" style="width:100%;padding:12px" id="btnPdfSatu">${ic('download')} <span id="lbCetak"></span></button>
      <div class="grid g2 mt-s" style="gap:8px"><button class="btn soft" id="btnPdfPisah">${ic('users')} PDF per ${sebutan().toLowerCase()}</button><button class="btn ghost" id="btnPrint">${ic('printer')} Cetak printer</button></div>
      <p class="small muted"><b>PDF per ${sebutan().toLowerCase()}</b> membuat satu file untuk tiap ${sebutan().toLowerCase()} di folder pilihan — praktis dikirim ke orang tua. Ukuran kertas ${esc(S.cetakKertas)}.</p>
    </div>
    <div class="card cetak-preview-pane" id="cetakPreviewPane"><div class="card-h"><h3>Pratinjau</h3><span class="sub" id="nmPrev"></span><span class="act" style="gap:6px"><button class="btn ghost sm" id="prevMurid" title="Murid sebelumnya">‹</button><select id="pilihPreviewMurid" class="inp" style="max-width:190px">${MA().map(m=>`<option value="${m.id}" ${lihat.id===m.id?'selected':''}>${esc(m.nama)}</option>`).join('')}</select><button class="btn ghost sm" id="nextMurid" title="Murid berikutnya">›</button><div class="seg" id="zoom"><button data-z=".5">50%</button><button data-z=".7" class="on">70%</button><button data-z="1">100%</button></div></span></div>
      <div class="card-b"><div class="preview-sheet"><div id="prev" style="zoom:.7"></div></div></div></div>
  </div>`;
  if (window.innerWidth < 900) $('#gridCetak').style.gridTemplateColumns = 'minmax(0,1fr)';
  var label = () => { var n = Object.keys(pilih).filter(k => pilih[k]).length; $('#lbCetak').textContent = 'Simpan PDF gabungan (' + n + ' ' + sebutan().toLowerCase() + ')'; ['#btnPdfSatu', '#btnPdfPisah', '#btnPrint'].forEach(s => $(s).disabled = !n); };
  var pratinjau = () => {
    var r = susunRapor([lihat.id], bag);
    if (!r.html) r.html = '<div class="muted" style="padding:40px;text-align:center">Pilih minimal satu bagian.</div>';
    $('#prev').innerHTML = r.html; jalankanJob($('#prev'), r.jobs); layoutRaporTerapkan(); var pages = $$('#prev .page'); pages.forEach((pg, i) => { var tag = document.createElement('div'); tag.className = 'preview-page-label'; tag.textContent = 'Halaman ' + (i + 1) + ' dari ' + pages.length; pg.insertBefore(tag, pg.firstChild); }); $('#nmPrev').textContent = lihat.nama + ' · ' + pages.length + ' halaman';
  };
  label(); pratinjau();
  var previewSelect = $('#pilihPreviewMurid');
  if (previewSelect) previewSelect.addEventListener('change', function () {
    var muridTerpilih = muridById(this.value);
    if (!muridTerpilih || statusMurid(muridTerpilih) !== 'Aktif') return;
    lihat = muridTerpilih;
    pratinjau();
  });
  v.onchange = e => {
    var x = e.target;
    if (x.dataset.identFont || x.dataset.identSize || x.dataset.identLine || x.dataset.identLogo || x.id === 'tanggalIdentitas') {
      var cfg=identitasCetakBaca(), key=x.dataset.identFont||x.dataset.identSize||x.dataset.identLine||x.dataset.identLogo;
      if (x.id === 'tanggalIdentitas') cfg.tanggal=x.value;
      else if (x.dataset.identFont) cfg[key].font=x.value;
      else if (x.dataset.identSize) cfg[key].size=Math.max(7,Math.min(24,Number(x.value)||10));
      else if (x.dataset.identLine) cfg[key].line=Math.max(1,Math.min(2.5,Number(x.value)||1.4));
      else if (x.dataset.identLogo) cfg[key].logo=Math.max(20,Math.min(220,Number(x.value)||42));
      identitasCetakSimpan(cfg); pratinjau();
    }
    if (x.dataset.bag) { bag[x.dataset.bag] = x.checked; pratinjau(); }
    if (x.dataset.layout) { var lay = layoutRaporBaca(); lay[x.dataset.layout] = Math.max(0, Math.min(80, Number(x.value) || 0)); if (lay.mapel + lay.nilai > 88) { lay.nilai = Math.max(5, 88 - lay.mapel); $('[data-layout=nilai]').value = lay.nilai; } layoutRaporSimpan(lay); layoutRaporTerapkan(); }
    if (x.dataset.id) { pilih[x.dataset.id] = x.checked; label(); }
  };
  v.onclick = e => {
    var b;
    if (e.target.closest('#prevMurid') || e.target.closest('#nextMurid')) {
      var list = MA(), at = list.findIndex(m => m.id === lihat.id), delta = e.target.closest('#nextMurid') ? 1 : -1;
      lihat = list[(at + delta + list.length) % list.length]; $('#pilihPreviewMurid').value = lihat.id; pratinjau();
    }
    else if (e.target.closest('#resetIdentitasCetak')) { identitasCetakSimpan(identitasCetakDefault()); VIEWS.cetak(v); }
    else if (e.target.closest('#resetLayout')) { var d = layoutRaporDefault(); layoutRaporSimpan(d); $$('[data-layout]').forEach(i => i.value = d[i.dataset.layout]); layoutRaporTerapkan(); pratinjau(); }
    else if ((b = e.target.closest('[data-lihat]'))) { e.preventDefault(); lihat = muridById(b.dataset.lihat); pratinjau(); }
    else if ((b = e.target.closest('#segK button'))) { S.cetakKertas = b.dataset.val; $$('#segK button').forEach(x => x.classList.toggle('on', x === b)); pratinjau(); }
    else if ((b = e.target.closest('#zoom button'))) { $('#prev').style.zoom = b.dataset.z; $$('#zoom button').forEach(x => x.classList.toggle('on', x === b)); }
    else if (e.target.closest('#semua')) { $$('#daftarM [data-id]').forEach(c => { c.checked = true; pilih[c.dataset.id] = true; }); label(); }
    else if (e.target.closest('#nol')) { $$('#daftarM [data-id]').forEach(c => { c.checked = false; pilih[c.dataset.id] = false; }); label(); }
    else if (e.target.closest('#btnPdfSatu') || e.target.closest('#btnPrint') || e.target.closest('#btnPdfPisah')) {
      var ids = MA().filter(m => pilih[m.id]).map(m => m.id);
      if (!Object.keys(bag).some(k => bag[k])) return toast('Pilih minimal satu bagian rapor.', 'err');
      if (e.target.closest('#btnPdfPisah')) return pdfPerMurid(ids, bag);
      var r = susunRapor(ids, bag);
      if (!r.html) return toast('Pilih minimal satu bagian rapor.', 'err');
      var satu = ids.length === 1 ? ' - ' + muridById(ids[0]).nama : '';
      cetakHTML(r.html, r.jobs, false, { mode: e.target.closest('#btnPrint') ? 'print' : 'pdf', namaFile: namaFileRapor() + satu });
    }
  };
};

function konfigurasiKopLeger() {
  var p=S.d.pengaturan||{};
  var defs=[
    {text:'YAYASAN / DINAS PENDIDIKAN',font:'Arial',size:11,bold:true},
    {text:P('nama_sekolah')||'NAMA SEKOLAH',font:'Arial',size:14,bold:true},
    {text:P('alamat_sekolah')||'',font:'Arial',size:9,bold:false},
    {text:[P('desa')&&'Desa '+P('desa'),P('kecamatan')&&'Kec. '+P('kecamatan'),P('kabupaten')&&'Kab. '+P('kabupaten'),P('provinsi')].filter(Boolean).join(', '),font:'Arial',size:9,bold:false}
  ];
  return {
    kiri:p.leger_logo_kiri||'',kanan:p.leger_logo_kanan||'',
    lebarLogo:Number(p.leger_logo_lebar||24),tinggiLogo:Number(p.leger_logo_tinggi||24),
    baris:defs.map((d,i)=>{var n=i+1;return {
      text:p['leger_kop_baris'+n]==null?d.text:p['leger_kop_baris'+n],
      font:p['leger_kop_font'+n]||d.font,size:Number(p['leger_kop_size'+n]||d.size),
      bold:p['leger_kop_bold'+n]==null?d.bold:p['leger_kop_bold'+n]==='Ya',
      italic:p['leger_kop_italic'+n]==='Ya',underline:p['leger_kop_underline'+n]==='Ya'
    };})
  };
}
function bangunHTMLKopLeger(k) {
  var lines=k.baris.map(r=>r.text?`<div style="font-family:${esc(r.font)};font-size:${Math.max(6,Math.min(30,r.size))}pt;font-weight:${r.bold?'700':'400'};font-style:${r.italic?'italic':'normal'};text-decoration:${r.underline?'underline':'none'};line-height:1.25">${esc(r.text)}</div>`:'').join('');
  var logo=(src,alt)=>src?`<img src="${src}" alt="${alt}" style="width:${k.lebarLogo}mm;height:${k.tinggiLogo}mm;object-fit:contain;display:block">`:'';
  return `<div class="leger-kop" style="display:grid;grid-template-columns:${k.lebarLogo}mm minmax(0,1fr) ${k.lebarLogo}mm;align-items:center;gap:4mm;text-align:center;margin-bottom:8pt;padding-bottom:5pt;border-bottom:2px solid #111">${logo(k.kiri,'Logo kiri')}<div>${lines}</div>${logo(k.kanan,'Logo kanan')}</div>`;
}
function bangunHTMLLeger(denganRank, opts) {
  opts=opts||{};
  var L=dataLeger(),mp=L.mp,st=mp.map(rataKelasMapel);
  var landscape=opts.orientasi==='landscape',kertas=opts.kertas||'F4';
  var kelasKertas=(kertas==='F4'?'f4':'a4')+(landscape?' land':'');
  var kopCfg=opts.kopConfig||konfigurasiKopLeger();
  return `<div class="page ${kelasKertas}" id="leger-page">
    ${bangunHTMLKopLeger(kopCfg)}
    <div style="text-align:center;font-weight:bold;font-size:12pt">LEGER NILAI ${esc(sebutan().toUpperCase())}</div>
    <div style="text-align:center;font-size:10pt;margin-bottom:8pt">Kelas ${esc(namaKelas())} · Semester ${esc(teksSemester())} · Tahun Pelajaran ${esc(P('tahun_pelajaran'))}</div>
    <table class="lgr leger-table"><thead><tr><th>No</th><th>Nama Peserta Didik</th><th>NIS</th>${mp.map(m=>`<th>${esc(m.singkatan||m.nama)}</th>`).join('')}<th>Jml</th><th>Rata²</th>${denganRank?'<th>Rank</th>':''}<th>S</th><th>I</th><th>A</th></tr></thead><tbody>
    ${L.rows.map(r=>`<tr><td>${r[0]}</td><td class="l nama-siswa">${esc(r[1])}</td><td>${esc(r[2])}</td>${mp.map((m,j)=>`<td>${r[3+j]===''?'–':r[3+j]}</td>`).join('')}<td><b>${r[3+mp.length]}</b></td><td>${r[4+mp.length]===''?'':f1(r[4+mp.length])}</td>${denganRank?`<td>${r[5+mp.length]}</td>`:''}<td>${r[6+mp.length]}</td><td>${r[7+mp.length]}</td><td>${r[8+mp.length]}</td></tr>`).join('')}
    ${[['Rata-rata','rata'],['Tertinggi','max'],['Terendah','min']].map(f=>`<tr><td></td><td class="l"><b>${f[0]}</b></td><td></td>${st.map(s=>`<td><b>${f[1]==='rata'?f1(s.rata):f0(s[f[1]])}</b></td>`).join('')}<td colspan="${denganRank?6:5}"></td></tr>`).join('')}
    </tbody></table>
    <div style="display:flex;justify-content:space-between;margin-top:14pt;font-size:9.5pt;text-align:center" class="avoid">
      <div>Mengetahui,<br>Kepala Sekolah,<div style="height:44pt"></div><b><u>${esc(P('kepala_sekolah')||'………………')}</u></b><br>${nipBaris(P('nip_kepala'),'tampilkan_nip_kepala')}</div>
      <div><span style="white-space:nowrap">${tempatTanggal()}</span><br>Guru Kelas,<div style="height:44pt"></div><b><u>${esc(P('wali_kelas')||'………………')}</u></b><br>${nipBaris(P('nip_wali'),'tampilkan_nip_wali')}</div></div>
  </div>`;
}
function cetakLeger(denganRank, mode) {
  S.legerKertas=S.legerKertas||'F4';S.legerOrientasi=S.legerOrientasi||'landscape';
  var v=$('#view');if(!v)return;
  var kopCfg=konfigurasiKopLeger();
  var fonts=['Arial','Times New Roman','Calibri','Georgia','Verdana','Tahoma'];
  var draw=()=>{
    var html=bangunHTMLLeger(denganRank,{kertas:S.legerKertas,orientasi:S.legerOrientasi,kopConfig:kopCfg});
    var rows=kopCfg.baris.map((r,i)=>`<div class="card" style="padding:10px;margin:8px 0"><b>Baris ${i+1}</b>
      <label class="field">Teks<input class="inp" data-kop-text="${i}" value="${esc(r.text)}" placeholder="${['Nama yayasan / dinas','Nama sekolah','Alamat baris 1','Alamat / keterangan lain'][i]}"></label>
      <div class="form-grid">
        <label class="field">Jenis font<select class="inp" data-kop-font="${i}">${fonts.map(f=>`<option value="${f}" ${r.font===f?'selected':''}>${f}</option>`).join('')}</select></label>
        <label class="field">Ukuran font (pt)<input class="inp" type="number" min="6" max="30" data-kop-size="${i}" value="${r.size}"></label>
      </div>
      <div class="row" style="gap:12px;flex-wrap:wrap">
        <label><input type="checkbox" data-kop-bold="${i}" ${r.bold?'checked':''}> Bold</label>
        <label><input type="checkbox" data-kop-italic="${i}" ${r.italic?'checked':''}> Italic</label>
        <label><input type="checkbox" data-kop-underline="${i}" ${r.underline?'checked':''}> Underline</label>
      </div></div>`).join('');
    v.innerHTML=`<div class="grid g2" style="grid-template-columns:minmax(300px,390px) minmax(0,1fr);gap:14px">
      <div class="card"><div class="card-h"><h3>Pengaturan cetak leger</h3></div><div class="card-b">
        <label class="field">Ukuran kertas<select id="legerKertas" class="inp"><option value="A4" ${S.legerKertas==='A4'?'selected':''}>A4</option><option value="F4" ${S.legerKertas==='F4'?'selected':''}>F4</option></select></label>
        <label class="field">Orientasi<select id="legerOrientasi" class="inp"><option value="portrait" ${S.legerOrientasi==='portrait'?'selected':''}>Portrait</option><option value="landscape" ${S.legerOrientasi==='landscape'?'selected':''}>Landscape</option></select></label>
        <h4>Logo KOP</h4><div class="form-grid">
          <label class="field">Logo kiri<input class="inp" type="file" id="legerLogoKiri" accept="image/png,image/jpeg,image/webp"></label>
          <label class="field">Logo kanan<input class="inp" type="file" id="legerLogoKanan" accept="image/png,image/jpeg,image/webp"></label>
          <label class="field">Lebar logo (mm)<input class="inp" type="number" id="legerLogoLebar" min="8" max="60" value="${kopCfg.lebarLogo}"></label>
          <label class="field">Tinggi logo (mm)<input class="inp" type="number" id="legerLogoTinggi" min="8" max="60" value="${kopCfg.tinggiLogo}"></label>
        </div><h4>Pengaturan teks KOP</h4>${rows}
        <div class="row"><button class="btn" id="legerSimpanKop" type="button">Simpan pengaturan KOP</button></div>
        <div class="row mt"><button class="btn" id="legerPdf" type="button">Simpan PDF</button><button class="btn ghost" id="legerPrint" type="button">Cetak</button></div>
      </div></div>
      <div class="card"><div class="card-h"><h3>Pratinjau Leger Nilai ${denganRank?'· Dengan Ranking':'· Tanpa Ranking'}</h3></div><div class="card-b"><div class="preview-sheet" style="overflow:auto"><div id="legerPreview" style="background:#fff;color:#111;padding:8px">${html}</div></div></div></div></div>`;
    var css=document.getElementById('leger-preview-style');if(!css){css=document.createElement('style');css.id='leger-preview-style';document.head.appendChild(css);}
    var wide=S.legerOrientasi==='landscape',w=S.legerKertas==='F4'?(wide?'330mm':'215mm'):(wide?'297mm':'210mm'),h=S.legerKertas==='F4'?(wide?'215mm':'330mm'):(wide?'210mm':'297mm');
    css.textContent=`#legerPreview .page{box-sizing:border-box;background:#fff;color:#111;padding:10mm;min-height:${h};width:${w};margin:0 auto;box-shadow:0 2px 12px #0002}
      #legerPreview .lgr{width:100%;border-collapse:collapse;table-layout:auto;font-size:${wide?'7.5':'6.5'}pt}
      #legerPreview .lgr th,#legerPreview .lgr td{border:1px solid #333;padding:3px 4px;text-align:center;white-space:normal;overflow-wrap:anywhere}
      #legerPreview .lgr th:nth-child(2),#legerPreview .lgr td:nth-child(2){min-width:125px;text-align:left}
      #legerPreview .lgr td.nama-siswa{white-space:normal;min-width:125px;overflow-wrap:anywhere}`;
  };
  draw();
  var refresh=()=>{var el=$('#legerPreview .leger-kop');if(el)el.outerHTML=bangunHTMLKopLeger(kopCfg);};
  var update=el=>{
    var d=el.dataset;
    if(d.kopText!==undefined)kopCfg.baris[+d.kopText].text=el.value;
    if(d.kopFont!==undefined)kopCfg.baris[+d.kopFont].font=el.value;
    if(d.kopSize!==undefined)kopCfg.baris[+d.kopSize].size=Math.max(6,Math.min(30,+el.value||9));
    ['bold','italic','underline'].forEach(k=>{var key='kop'+k[0].toUpperCase()+k.slice(1);if(d[key]!==undefined)kopCfg.baris[+d[key]][k]=el.checked;});
    if(el.id==='legerLogoLebar')kopCfg.lebarLogo=Math.max(8,Math.min(60,+el.value||24));
    if(el.id==='legerLogoTinggi')kopCfg.tinggiLogo=Math.max(8,Math.min(60,+el.value||24));
    refresh();
  };
  v.oninput=e=>{var el=e.target;if(el.dataset&&Object.keys(el.dataset).some(k=>k.indexOf('kop')===0)||el.id==='legerLogoLebar'||el.id==='legerLogoTinggi')update(el);};
  v.onchange=e=>{
    var el=e.target;
    if(el.id==='legerKertas'){S.legerKertas=el.value;draw();}
    if(el.id==='legerOrientasi'){S.legerOrientasi=el.value;draw();}
    if(el.id==='legerLogoKiri'||el.id==='legerLogoKanan'){
      var file=el.files&&el.files[0];if(!file)return;
      var rd=new FileReader();rd.onload=()=>{var im=new Image();im.onload=()=>{var sc=Math.min(1,500/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*sc);cv.height=Math.round(im.height*sc);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);var url=cv.toDataURL('image/png');if(url.length>180000){toast('Ukuran logo terlalu besar. Pilih gambar yang lebih kecil.','err');return;}kopCfg[el.id==='legerLogoKiri'?'kiri':'kanan']=url;refresh();};im.onerror=()=>toast('Logo tidak dapat dibaca.','err');im.src=rd.result;};rd.readAsDataURL(file);
    }
  };
  v.onclick=e=>{
    var btn=e.target.closest('button');if(!btn)return;
    if(btn.id==='legerSimpanKop'){
      var data=Object.assign({},S.d.pengaturan);
      data.leger_logo_kiri=kopCfg.kiri;data.leger_logo_kanan=kopCfg.kanan;
      data.leger_logo_lebar=String(kopCfg.lebarLogo);data.leger_logo_tinggi=String(kopCfg.tinggiLogo);
      kopCfg.baris.forEach((r,i)=>{var n=i+1;data['leger_kop_baris'+n]=r.text;data['leger_kop_font'+n]=r.font;data['leger_kop_size'+n]=String(r.size);data['leger_kop_bold'+n]=r.bold?'Ya':'Tidak';data['leger_kop_italic'+n]=r.italic?'Ya':'Tidak';data['leger_kop_underline'+n]=r.underline?'Ya':'Tidak';});
      call('simpanPengaturan',{data}).then(s=>{S.d.pengaturan=s;toast('Pengaturan KOP Leger tersimpan');}).catch(gagal);
    }
    if(btn.id==='legerPdf'||btn.id==='legerPrint'){
      var land=S.legerOrientasi==='landscape';
      var html=bangunHTMLLeger(denganRank,{kertas:S.legerKertas,orientasi:S.legerOrientasi,kopConfig:kopCfg});
      S.cetakKertas=S.legerKertas;S.legerCetakAktif=true;
      cetakHTML(html,[],land,{mode:btn.id==='legerPrint'?'print':'pdf',namaFile:'Leger Nilai '+namaKelas()}).finally(()=>{S.legerCetakAktif=false;});
    }
  };
}
