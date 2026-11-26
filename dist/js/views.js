/* =========================================================
   RAPOR DIGITAL SD (aplikasi laptop) — Halaman-halaman aplikasi
   ========================================================= */
var VIEWS = {};

function savebar(label, id) {
  return `<div class="savebar clean"><span class="msg">Semua perubahan sudah tersimpan</span><span class="sp"></span>
    <button class="btn" id="${id || 'btnSimpan'}">${ic('save')} ${label || 'Simpan'}</button></div>`;
}
function kosong(icon, judul, teks, tombol) {
  return `<div class="card"><div class="empty"><div class="art">${ic(icon)}</div><h3>${judul}</h3><p>${teks}</p>${tombol || ''}</div></div>`;
}
function perluMurid(v) {
  if (MA().length) return false;
  if (S.d.murid.length) { v.innerHTML = kosong('users', 'Tidak ada ' + sebutan().toLowerCase() + ' aktif', 'Semua ' + sebutan().toLowerCase() + ' berstatus pindah/keluar. Aktifkan kembali di menu Data ' + sebutan() + '.', `<button class="btn" data-go="murid">${ic('users')} Data ${sebutan()}</button>`); return true; }
  v.innerHTML = kosong('users', 'Belum ada data ' + sebutan().toLowerCase(), 'Tambahkan data ' + sebutan().toLowerCase() + ' terlebih dahulu sebelum mengisi penilaian.',
    `<button class="btn" data-go="murid">${ic('plus')} Tambah ${sebutan()}</button>`);
  return true;
}

/* =========================================================
   BERANDA
   ========================================================= */
VIEWS.beranda = function (v) {
  var d = S.d;
  if (!d.murid.length) {
    v.innerHTML = `<div class="hero"><div style="position:relative;z-index:1;flex:1">
        <h1>Selamat datang di ${esc(judulApp())}</h1>
        <p>Aplikasi rapor Kurikulum Merdeka untuk SD, SMP, SMA, dan SMK — format terbaru dengan intrakurikuler, kokurikuler, dan ekstrakurikuler dalam satu rapor.</p>
        <div class="row"><button class="btn" data-go="sekolah">${ic('school')} Isi profil sekolah</button>
        <button class="btn ghost" data-go="murid">${ic('users')} Tambah ${sebutan().toLowerCase()}</button>
        <button class="btn ghost" id="btnContoh">${ic('sparkle')} Coba dengan data contoh</button></div></div></div>
      <div class="grid g3 mt">${[['school', '1. Lengkapi profil', 'Nama sekolah, kepala sekolah, wali kelas, kelas, semester, dan logo.'],
        ['book', '2. Siapkan TP', 'Tulis tujuan pembelajaran tiap mapel. Deskripsi rapor dibuat otomatis dari sini.'],
        ['edit', '3. Input nilai', 'Isi nilai per TP dan sumatif akhir semester, bisa tempel langsung dari Excel.']]
        .map(x => `<div class="card kpi"><div class="ic">${ic(x[0])}</div><div><div class="b">${x[1]}</div><div class="small muted">${x[2]}</div></div></div>`).join('')}</div>`;
    $('#btnContoh').onclick = () => konfirmasi('Isi data contoh?', 'Aplikasi akan diisi 16 murid contoh beserta TP dan nilainya untuk uji coba. Data contoh bisa dihapus kapan saja dari menu Data Murid.', 'Isi data contoh')
      .then(ok => { if (!ok) return; call('dataContoh', {}, 'Mengisi data contoh…').then(dd => { setData(dd); renderChrome(); go('beranda', true); toast('Data contoh berhasil diisi'); }).catch(gagal); });
    return;
  }
  var ks = kesiapan();
  var L = MA().filter(m => String(m.jk).toUpperCase().indexOf('L') === 0).length, Pr = MA().length - L;
  var mp = mapelAktif();
  var rk = peringkat();
  var rataK = avg(rk.list.map(x => x.rata));
  var nilaiSt = ks.langkah[3];
  var circ = 2 * Math.PI * 50, off = circ * (1 - ks.total / 100);
  var next = ks.langkah.find(s => s.p < 100);
  var sapa = P('wali_kelas') ? 'Halo, ' + esc(P('wali_kelas').split(',')[0]) : 'Halo, Bapak/Ibu Guru';

  v.innerHTML = `
  <div class="hero">
    <div style="position:relative;z-index:1;flex:1;min-width:0">
      <h1>${sapa}</h1>
      <p>Kelas ${esc(namaKelas())} · Fase ${fase(P('kelas'))} · Semester ${esc(teksSemester())} · Tahun Pelajaran ${esc(P('tahun_pelajaran'))}</p>
      <div class="row">${next ? `<button class="btn" data-go="${next.v}">${ic('right')} Lanjut: ${esc(next.t)}</button>` : `<button class="btn" data-go="cetak">${ic('printer')} Rapor siap dicetak</button>`}
      <button class="btn ghost" data-go="leger">${ic('table')} Lihat leger</button></div>
    </div>
    <div class="ring"><svg width="118" height="118" viewBox="0 0 118 118"><circle cx="59" cy="59" r="50" stroke="rgba(255,255,255,.22)" stroke-width="10" fill="none"/>
      <circle cx="59" cy="59" r="50" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${off}"/></svg>
      <b>${ks.total}%<small>kesiapan</small></b></div>
  </div>

  <div class="grid g4 mt">
    <div class="card kpi"><div class="ic">${ic('users')}</div><div><div class="l">${sebutan()}</div><div class="v">${MA().length}</div><div class="s">${L} laki-laki · ${Pr} perempuan</div></div></div>
    <div class="card kpi"><div class="ic">${ic('book')}</div><div><div class="l">Mapel aktif</div><div class="v">${mp.length}</div><div class="s">${d.tp.length} tujuan pembelajaran</div></div></div>
    <div class="card kpi"><div class="ic">${ic('target')}</div><div><div class="l">Rata-rata kelas</div><div class="v">${f1(rataK)}</div><div class="s">KKTP bawaan ${esc(P('kktp') || 75)}</div></div></div>
    <div class="card kpi"><div class="ic">${ic('edit')}</div><div><div class="l">Nilai terisi</div><div class="v">${nilaiSt.p}%</div><div class="s">${esc(nilaiSt.d)}</div></div></div>
  </div>

  <div class="grid g-73 mt">
    <div class="card"><div class="card-h"><h3>Rata-rata nilai akhir per mapel</h3><span class="act"><span class="pill"><span style="width:9px;height:9px;border-radius:2px;background:#E07A3F;display:inline-block"></span> di bawah KKTP</span></span></div>
      <div class="card-b"><div class="chart-box"><canvas id="chMapel"></canvas></div></div></div>
    <div class="card"><div class="card-h"><h3>Sebaran capaian</h3><span class="sub">semua nilai akhir</span></div>
      <div class="card-b"><div class="chart-box xs"><canvas id="chSebar"></canvas></div><div class="legend mt" id="lgSebar"></div></div></div>
  </div>

  <div class="grid g3 mt">
    <div class="card"><div class="card-h"><h3>Kelengkapan nilai</h3><span class="act"><button class="btn soft sm" data-go="nilai">Input</button></span></div>
      <div class="card-b bars">${mp.map(m => {
        var tot = 0, isi = 0; MA().forEach(mu => { if (mapelMurid(mu).indexOf(m) >= 0) { tot++; if (hitung(mu, m).na != null) isi++; } });
        var p = pct(isi, tot);
        return `<div class="it"><div class="n" title="${esc(m.nama)}">${esc(m.singkatan || m.nama)}</div><div class="track"><div class="fill ${p === 100 ? 'ok' : ''}" style="width:${p}%"></div></div><div class="p">${isi}/${tot}</div></div>`;
      }).join('')}</div></div>
    <div class="card"><div class="card-h"><h3>Capaian tertinggi</h3><span class="sub">rata-rata semua mapel</span></div>
      <div class="card-b">${rk.list.slice(0, 5).map(x => `<div class="rank-it"><span class="medal">${x.rank}</span><span class="av">${esc(inisial(x.m.nama))}</span>
        <div style="min-width:0"><div class="b" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.m.nama)}</div><div class="small muted">Jumlah ${f0(x.jumlah)}</div></div><span class="score">${f1(x.rata)}</span></div>`).join('') || '<div class="muted small">Belum ada nilai.</div>'}</div></div>
    <div class="card"><div class="card-h"><h3>Ketidakhadiran</h3><span class="act"><button class="btn soft sm" data-go="hadir">Isi</button></span></div>
      <div class="card-b">${(function () {
        var s = 0, i = 0, a = 0, top = [];
        MA().forEach(mu => { var h = S.hadir[mu.id] || {}; var x = num(h.sakit), y = num(h.izin), z = num(h.alpa); s += x; i += y; a += z; if (x + y + z) top.push([mu, x + y + z]); });
        top.sort((p, q) => q[1] - p[1]);
        return `<div class="stat3"><div><b>${s}</b><span>Sakit</span></div><div><b>${i}</b><span>Izin</span></div><div><b>${a}</b><span>Tanpa ket.</span></div></div>
          <div class="sec-title" style="margin-top:14px">Paling sering tidak hadir</div>
          ${top.slice(0, 3).map(t => `<div class="row" style="padding:5px 0"><span class="av" style="width:28px;height:28px;font-size:11px">${esc(inisial(t[0].nama))}</span><span class="b small">${esc(t[0].nama)}</span><span class="sp"></span><span class="chip c-0">${t[1]} hari</span></div>`).join('') || '<div class="small muted">Semua hadir penuh.</div>'}`;
      })()}</div></div>
  </div>

  <div class="card mt"><div class="card-h"><h3>Langkah menuju rapor siap cetak</h3><span class="sub">${ks.total}% selesai</span></div>
    <div class="card-b steps">${ks.langkah.map(s => `<div class="st"><span class="ck ${s.p >= 100 ? 'done' : s.p > 0 ? 'part' : ''}">${s.p >= 100 ? ic('check') : ''}</span>
      <div><div class="t">${esc(s.t)}</div><div class="d">${esc(s.d)}</div></div><button class="btn ghost sm go" data-go="${s.v}">${s.p >= 100 ? 'Lihat' : 'Lengkapi'}</button></div>`).join('')}</div></div>`;

  // grafik rata-rata per mapel
  var lab = [], val = [], col = [], full = [];
  mp.forEach(m => { var r = rataKelasMapel(m); if (r.rata == null) return; lab.push(m.singkatan || m.nama); full.push(m.nama); val.push(Math.round(r.rata * 10) / 10); col.push(r.rata >= kktp(m) ? brand() : '#E07A3F'); });
  grafik($('#chMapel'), {
    type: 'bar', data: { labels: lab, datasets: [{ label: 'Rata-rata', data: val, backgroundColor: col, borderRadius: 4, borderSkipped: 'start', barThickness: 16, maxBarThickness: 18 }] },
    options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: Object.assign({}, TOOLTIP, { callbacks: { title: c => full[c[0].dataIndex], label: c => ' Rata-rata ' + f1(c.raw) } }) },
      scales: { x: { min: 0, max: 100, grid: { color: '#EEF1F6' }, border: { display: false } }, y: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: '600' } } } } }
  });
  // sebaran capaian
  var kat = ['sangat baik', 'baik', 'cukup', 'perlu bimbingan'], cnt = [0, 0, 0, 0];
  MA().forEach(mu => mapelMurid(mu).forEach(m => { var h = hitung(mu, m); if (h.na != null) cnt[kat.indexOf(predikat(h.na, m))]++; }));
  var tot = cnt.reduce((a, b) => a + b, 0);
  var warna = [brand(), mix(brand(), '#ffffff', .38), mix(brand(), '#ffffff', .64), '#E07A3F'];
  grafik($('#chSebar'), {
    type: 'doughnut', data: { labels: kat.map(kap), datasets: [{ data: cnt, backgroundColor: warna, borderColor: '#fff', borderWidth: 2, hoverOffset: 4 }] },
    options: { maintainAspectRatio: false, cutout: '66%', plugins: { legend: { display: false }, tooltip: Object.assign({}, TOOLTIP, { callbacks: { label: c => ' ' + c.raw + ' nilai (' + pct(c.raw, tot) + '%)' } }) } }
  });
  $('#lgSebar').innerHTML = kat.map((k, i) => `<div class="lg"><span class="sw" style="background:${warna[i]}"></span>${kap(k)}<b>${cnt[i]} <span class="muted small">(${pct(cnt[i], tot)}%)</span></b></div>`).join('');
  pengingatCadangan(v);
};

/* =========================================================
   PROFIL SEKOLAH & PENGATURAN
   ========================================================= */
VIEWS.sekolah = function (v) {
  var f = clone(S.d.pengaturan);
  if (f.tampilkan_nip_kepala == null) f.tampilkan_nip_kepala = 'Ya';
  if (f.tampilkan_nip_wali == null) f.tampilkan_nip_wali = 'Ya';
  var inp = (k, label, ph, type, cls) => `<label class="field ${cls || ''}"><span>${label}</span><input class="inp" data-k="${k}" type="${type || 'text'}" value="${esc(f[k])}" placeholder="${esc(ph || '')}"></label>`;
  var sel = (k, label, opts, cls) => `<label class="field ${cls || ''}"><span>${label}</span><select class="inp" data-k="${k}">${opts.map(o => `<option value="${esc(o[0])}" ${String(f[k]) === String(o[0]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select></label>`;
  var sw = (k, label, sub) => `<label class="row" style="justify-content:space-between;padding:6px 0;cursor:pointer"><span><span class="b">${label}</span><br><span class="small muted">${sub || ''}</span></span><span class="switch"><input type="checkbox" data-k="${k}" data-sw ${f[k] === 'Ya' ? 'checked' : ''}><i></i></span></label>`;
  var WARNA = ['#1F56D6', '#0E7C86', '#0F8A5F', '#6D3FD1', '#B42345', '#C2571A', '#1E3A8A', '#334155'];

  v.innerHTML = `<div class="grid g2">
    <div class="card"><div class="card-h"><h3>Identitas sekolah</h3></div><div class="card-b form-grid">
      ${inp('nama_sekolah', 'Nama sekolah', 'mis. SD Negeri 1 … / SMP Negeri 2 …', '', 'full')}
      ${inp('npsn', 'NPSN')}${inp('nss', 'NIS/NSS/NDS')}
      ${inp('alamat_sekolah', 'Alamat (jalan)', '', '', 'full')}
      ${inp('desa', 'Kelurahan/Desa')}${inp('kecamatan', 'Kecamatan')}
      ${inp('kabupaten', 'Kabupaten/Kota')}${inp('provinsi', 'Provinsi')}
      ${inp('kode_pos', 'Kode pos')}${inp('telepon', 'Telepon')}
      ${inp('email', 'E-mail')}${inp('website', 'Website')}
    </div></div>

    <div>
      <div class="card"><div class="card-h"><h3>Nama aplikasi, logo & warna</h3><span class="sub">menyesuaikan identitas sekolah</span></div><div class="card-b">
        <div class="row" style="gap:14px;align-items:flex-start">
          <div class="logo-prev" id="logoPrev"></div>
          <div style="flex:1;min-width:200px">
            <div class="b small">Logo sekolah</div><div class="small muted" style="margin-bottom:8px">PNG/JPG, otomatis diperkecil. Tampil di aplikasi & sampul rapor.</div>
            <div class="row"><label class="btn soft sm">${ic('upload')} Unggah logo<input type="file" accept="image/*" id="logoFile" hidden></label><button class="btn ghost sm" id="logoHapus">Hapus</button></div>
          </div>
        </div>
        <div class="form-grid mt">
          <label class="field full"><span>Nama aplikasi</span><input class="inp" data-k="nama_aplikasi" value="${esc(f.nama_aplikasi)}" placeholder="Otomatis: Rapor Digital ${esc(f.nama_sekolah || 'nama sekolah')}"><small>Kosongkan agar nama aplikasi otomatis mengikuti nama sekolah.</small></label>
          <div class="field full"><span>Warna tema aplikasi</span><div class="swatches">${WARNA.map(w => `<button class="swatch ${String(f.warna_tema).toLowerCase() === w.toLowerCase() ? 'on' : ''}" style="background:${w}" data-warna="${w}"></button>`).join('')}
            <input type="color" id="warnaBebas" value="${esc(f.warna_tema || '#1F56D6')}" style="width:40px;height:34px;border:0;background:none;cursor:pointer" title="Warna lain"></div><small>Warna langsung diterapkan pada tombol, menu aktif, grafik, dan elemen aksen aplikasi.</small></div>
          <div class="field full"><span>Background gambar sidebar</span><div class="row" style="gap:8px;flex-wrap:wrap"><label class="btn soft sm">${ic('upload')} Pilih gambar<input type="file" accept="image/png,image/jpeg,image/webp" id="sidebarBgFile" hidden></label><button class="btn ghost sm" id="sidebarBgReset">Gunakan gambar sekolah bawaan</button></div><small>Gambar disimpan di pengaturan aplikasi. PNG, JPG, atau WebP.</small></div>
          <div class="field"><span>Warna overlay sidebar</span><input type="color" id="sidebarOverlay" value="${esc(f.sidebar_overlay || '#142747')}" style="width:54px;height:36px;border:0;background:none"></div>
          <label class="field"><span>Transparansi overlay: <b id="sidebarOpacityLabel">${Number(f.sidebar_opacity || 55)}%</b></span><input class="inp" type="range" id="sidebarOpacity" min="0" max="100" value="${Number(f.sidebar_opacity || 55)}"></label>
        </div></div></div>

      <div class="card mt"><div class="card-h"><h3>Kepala sekolah & guru kelas</h3></div><div class="card-b form-grid">
        ${inp('kepala_sekolah', 'Nama kepala sekolah', 'beserta gelar')}${inp('nip_kepala', 'NIP kepala sekolah', 'kosongkan bila tidak ada')}
        ${inp('wali_kelas', 'Nama guru kelas', 'beserta gelar')}${inp('nip_wali', 'NIP guru kelas', 'kosongkan bila tidak ada')}
        <div class="full">${sw('tampilkan_nip_kepala', 'Tampilkan NIP kepala sekolah', 'Jika dinonaktifkan, NIP tidak dicetak. NIP kosong selalu disembunyikan.')}</div>
        <div class="full">${sw('tampilkan_nip_wali', 'Tampilkan NIP guru kelas', 'Jika dinonaktifkan, NIP tidak dicetak. NIP kosong selalu disembunyikan.')}</div>
      </div></div>
    </div>

    <div class="card"><div class="card-h"><h3>Periode rapor</h3><span class="sub" id="infoFase"></span></div><div class="card-b form-grid">
      <div class="full row" style="justify-content:space-between;padding:4px 0"><span class="b">Jenjang</span><div class="seg" data-seg="jenjang">${[['SD', 'SD/MI'], ['SMP', 'SMP/MTs'], ['SMA', 'SMA/MA'], ['SMK', 'SMK']].map(x => `<button data-val="${x[0]}" class="${(f.jenjang || 'SD') === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div></div>
      <label class="field"><span>Kelas</span><select class="inp" data-k="kelas" id="selKelas"></select></label>
      ${inp('rombel', 'Rombel', 'A / B / 1 / IPA 1 / Melati')}
      <div class="full">${sw('kelas_romawi', 'Tulis kelas dengan angka Romawi', 'Contoh: Kelas VIII A, Kelas X-1. Matikan untuk angka biasa (8 A, 10-1).')}</div>
      ${sel('semester', 'Semester', [['1', '1 (Ganjil)'], ['2', '2 (Genap)']])}
      ${inp('tahun_pelajaran', 'Tahun pelajaran', '2026/2027')}
      ${inp('tempat_rapor', 'Tempat pembagian rapor', 'Nama kota')}
      ${inp('tanggal_rapor', 'Tanggal rapor', '', 'date')}
    </div></div>

    <div class="card"><div class="card-h"><h3>Pengolahan nilai</h3></div><div class="card-b">
      <div class="form-grid">
        ${inp('kktp', 'KKTP bawaan', '75', 'number')}
        <div class="field"><span>Batas predikat</span><div class="row" style="flex-wrap:nowrap">
          <input class="inp" data-k="batas_sangat_baik" type="number" value="${esc(f.batas_sangat_baik)}" title="Sangat baik mulai">
          <input class="inp" data-k="batas_baik" type="number" value="${esc(f.batas_baik)}" title="Baik mulai"></div><small>Sangat baik ≥ … · Baik ≥ …</small></div>
      </div>
      <div class="sec-title" style="margin-top:14px">Bobot nilai akhir</div>
      <div class="form-grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">
        ${inp('bobot_lm', 'Lingkup Materi / LM (%)', '50', 'number')}
        ${inp('bobot_sas', 'SAS (%)', '50', 'number')}
      </div>
      <div class="row mt-s small" style="gap:6px"><span class="muted">Pola cepat:</span>
        ${[[50, 50], [60, 40], [70, 30], [40, 60]].map(b => `<button class="btn ghost sm" data-bobot="${b.join(',')}">LM ${b[0]} · SAS ${b[1]}</button>`).join('')}</div>
      <div class="preview-desk mt small" id="rumusNA"></div>
    </div></div>

    <div class="card"><div class="card-h"><h3>Kalimat deskripsi capaian</h3><span class="sub">dibuat otomatis dari nilai TP</span></div><div class="card-b">
      ${sw('desk_pakai_nama', 'Awali dengan nama panggilan', 'Contoh: “Ananda Alya menunjukkan …”')}
      <div class="row" style="justify-content:space-between;padding:6px 0"><span class="b">Jumlah TP yang disebut</span>
        <div class="seg" data-seg="desk_jumlah_tp">${['1', '2', '3'].map(x => `<button data-val="${x}" class="${String(f.desk_jumlah_tp) === x ? 'on' : ''}">${x}</button>`).join('')}</div></div>
      <div class="form-grid mt-s">
        ${inp('kalimat_kuat', 'Kalimat TP yang dikuasai', '', '', 'full')}
        ${inp('kalimat_lemah', 'Kalimat TP di bawah KKTP')}${inp('kalimat_tingkat', 'Kalimat bila semua TP tuntas')}
      </div>
      <div class="sec-title" style="margin-top:14px">Contoh hasil</div><div class="preview-desk" id="contohDesk"></div>
    </div></div>

    <div class="card"><div class="card-h"><h3>Cetak rapor</h3></div><div class="card-b">
      <div class="row" style="justify-content:space-between;padding:6px 0"><span class="b">Ukuran kertas</span><div class="seg" data-seg="kertas">${['A4', 'F4'].map(x => `<button data-val="${x}" class="${f.kertas === x ? 'on' : ''}">${x}</button>`).join('')}</div></div>
      <div class="row" style="justify-content:space-between;padding:6px 0"><span class="b">Sebutan</span><div class="seg" data-seg="sebutan_murid">${['Murid', 'Peserta Didik'].map(x => `<button data-val="${x}" class="${f.sebutan_murid === x ? 'on' : ''}">${x}</button>`).join('')}</div></div>
      ${sw('rapor_grafik', 'Lampirkan halaman grafik capaian', 'Grafik nilai murid dibanding rata-rata kelas')}
      ${sw('rapor_tanggapan', 'Kolom tanggapan orang tua/wali', 'Ruang kosong untuk diisi orang tua')}
      <div class="row" style="justify-content:space-between;padding:6px 0"><span><span class="b">Tanda tangan kepala sekolah</span><br><span class="small muted">Di bawah tengah: aman untuk nama panjang. Sejajar: lebih hemat tempat.</span></span><div class="seg" data-seg="ttd_posisi">${[['Bawah', 'Di bawah tengah'], ['Sejajar', 'Sejajar']].map(([v, t]) => `<button data-val="${v}" class="${(f.ttd_posisi === 'Sejajar' ? 'Sejajar' : 'Bawah') === v ? 'on' : ''}">${t}</button>`).join('')}</div></div>
      ${sw('nama_kapital', 'Nama ' + sebutan().toLowerCase() + ' HURUF BESAR', 'Di kepala rapor & identitas. Matikan agar sesuai penulisan di data (mis. Adinda Putri).')}
      <label class="field mt-s"><span>Tulisan jenjang di sampul</span><input class="inp" data-k="teks_jenjang" value="${esc(f.teks_jenjang)}" placeholder="Otomatis: ${esc(TEKS_JENJANG[f.jenjang || 'SD'])}" id="inpTeksJenjang"><small>Isi bila perlu, mis. MADRASAH IBTIDAIYAH (MI) atau MADRASAH TSANAWIYAH (MTs).</small></label>
      <label class="field mt-s"><span>Teks bawah sampul</span><textarea class="inp" data-k="instansi_sampul" rows="2">${esc(f.instansi_sampul)}</textarea></label>
    </div></div>

    <div class="card"><div class="card-h"><h3>Keamanan</h3></div><div class="card-b">
      <label class="field"><span>PIN masuk aplikasi</span><input class="inp" data-k="pin" type="text" inputmode="numeric" value="${esc(f.pin)}" placeholder="Kosongkan bila tanpa PIN" maxlength="12">
      <small>Bila diisi, setiap kali aplikasi dibuka wajib memasukkan PIN ini.</small></label>
    </div></div>

    <div class="card"><div class="card-h"><h3>Data & cadangan</h3></div><div class="card-b">
      <p class="small muted" style="margin-top:0">Data tersimpan di laptop ini. Cadangkan secara berkala melalui menu Cadangkan Data.</p>
      <div class="row"><button class="btn soft sm" data-go="cadangan">${ic('download')} Cadangan & pulihkan</button><button class="btn ghost sm" data-folder>${ic('ext')} Buka folder data</button></div>
    </div></div>
  </div>
  ${savebar('Simpan pengaturan')}`;

  var renderLogo = () => { $('#logoPrev').innerHTML = f.logo ? `<img src="${esc(f.logo)}">` : ic('image'); };
  var renderInfo = () => {
    $('#infoFase').textContent = 'Fase ' + fase(f.kelas);
    var blm = num(f.bobot_lm), bs = num(f.bobot_sas), tot = blm + bs;
    var cth = nilaiAkhir(80, 90, { lm: blm, sas: bs });
    $('#rumusNA').innerHTML = `<b>Nilai akhir</b> = (rata-rata LM × ${blm} + SAS × ${bs}) ÷ ${tot || 1}. STS tetap dicatat tetapi tidak dihitung. TP tetap digunakan untuk menyusun deskripsi capaian.` +
      ` Komponen yang belum diisi dinormalisasi ke bobot komponen yang tersedia.<br>Contoh: rata-rata LM 80, SAS 90 → nilai akhir <b>${cth == null ? '-' : Math.round(cth)}</b>.` +
      (tot !== 100 ? ` <span style="color:var(--bad)">Jumlah bobot ${tot}%, wajib tepat 100%.</span>` : '');
    var old = S.d.pengaturan; S.d.pengaturan = f;
    var mu = { id: 'x', nama: 'Alya Nur Rahma', panggilan: 'Alya', agama: 'Islam' };
    var m = { id: 'x', kktp: '' };
    var tps = [{ tujuan: 'menjumlahkan dan mengurangkan bilangan desimal' }, { tujuan: 'menyelesaikan masalah volume kubus dan balok' }, { tujuan: 'menjelaskan jumlah sudut pada segi banyak' }, { tujuan: 'menyelesaikan masalah KPK dan FPB' }];
    var h = { skor: [{ tp: tps[0], v: 94 }, { tp: tps[1], v: 90 }, { tp: tps[2], v: 82 }, { tp: tps[3], v: 68 }] };
    $('#contohDesk').textContent = deskripsiOtomatis(mu, m, h);
    S.d.pengaturan = old;
  };
  var jenjangAwal = f.jenjang || 'SD';
  var renderKelas = () => {
    var r = kelasJenjang(f.jenjang || 'SD');
    if (r.indexOf(num(f.kelas)) < 0) f.kelas = String(r[0]);
    $('#selKelas').innerHTML = r.map(k => `<option value="${k}" ${String(f.kelas) === String(k) ? 'selected' : ''}>Kelas ${k} (${romawi(k)}) · Fase ${fase(k)}</option>`).join('');
    $('#inpTeksJenjang').placeholder = 'Otomatis: ' + TEKS_JENJANG[f.jenjang || 'SD'];
  };
  renderLogo(); renderKelas(); renderInfo();

  $$('[data-k]', v).forEach(el => {
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', () => {
      f[el.dataset.k] = el.type === 'checkbox' ? (el.checked ? 'Ya' : 'Tidak') : el.value;
      tandaiBerubah(); renderInfo();
    });
  });
  $$('[data-bobot]', v).forEach(b => b.addEventListener('click', () => {
    var x = b.dataset.bobot.split(',');
    ['bobot_lm', 'bobot_sas'].forEach((k, i) => { f[k] = x[i]; var el = $(`[data-k="${k}"]`, v); if (el) el.value = x[i]; });
    tandaiBerubah(); renderInfo();
  }));
  $$('[data-seg]', v).forEach(g => g.addEventListener('click', e => {
    var b = e.target.closest('button'); if (!b) return;
    $$('button', g).forEach(x => x.classList.toggle('on', x === b));
    f[g.dataset.seg] = b.dataset.val; tandaiBerubah(); if (g.dataset.seg === 'jenjang') renderKelas(); renderInfo();
  }));
  var pilihWarna = w => { f.warna_tema = w; terapkanWarna(w); $$('.swatch', v).forEach(s => s.classList.toggle('on', s.dataset.warna.toLowerCase() === w.toLowerCase())); tandaiBerubah(); };
  $$('.swatch', v).forEach(s => s.onclick = () => pilihWarna(s.dataset.warna));
  $('#warnaBebas').oninput = e => pilihWarna(e.target.value);
  var updateSidebar = () => { terapkanSidebarBackground(f); tandaiBerubah(); };
  $('#sidebarOverlay').oninput = e => { f.sidebar_overlay = e.target.value; updateSidebar(); };
  $('#sidebarOpacity').oninput = e => { f.sidebar_opacity = e.target.value; $('#sidebarOpacityLabel').textContent = e.target.value + '%'; updateSidebar(); };
  $('#sidebarBgFile').onchange = e => { var file = e.target.files && e.target.files[0]; if (!file) return; var rd = new FileReader(); rd.onload = () => { var img = new Image(); img.onload = () => { var max = 1200, sc = Math.min(1, max / Math.max(img.width, img.height)); var c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc); var cx = c.getContext('2d'); cx.drawImage(img, 0, 0, c.width, c.height); var data = c.toDataURL('image/jpeg', .78); if (data.length > 650000) { toast('Gambar masih terlalu besar. Pilih gambar yang lebih kecil.', 'err'); return; } f.sidebar_bg = data; updateSidebar(); toast('Background sidebar diperbarui'); }; img.onerror = () => toast('Gambar tidak dapat dibaca.', 'err'); img.src = rd.result; }; rd.readAsDataURL(file); };
  $('#sidebarBgReset').onclick = () => { f.sidebar_bg = ''; updateSidebar(); toast('Menggunakan gambar sekolah bawaan'); };
  $('#logoHapus').onclick = () => { f.logo = ''; renderLogo(); tandaiBerubah(); };
  $('#logoFile').onchange = e => {
    var file = e.target.files[0]; if (!file) return;
    var rd = new FileReader();
    rd.onload = () => {
      var img = new Image();
      img.onload = () => {
        var max = 260, sc = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
        var x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height);
        var url = c.toDataURL('image/png');
        if (url.length > 45000) { x.globalCompositeOperation = 'destination-over'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); url = c.toDataURL('image/jpeg', .85); }
        if (url.length > 48000) { toast('Logo terlalu besar, coba gambar yang lebih sederhana.', 'err'); return; }
        f.logo = url; renderLogo(); tandaiBerubah();
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
  };
  $('#btnSimpan').onclick = () => {
    var totalBobot = num(f.bobot_lm) + num(f.bobot_sas);
    if (num(f.bobot_lm) < 0 || num(f.bobot_lm) > 100 || num(f.bobot_sas) < 0 || num(f.bobot_sas) > 100 || totalBobot !== 100) { toast('Bobot Lingkup Materi dan SAS harus berjumlah tepat 100%.', 'err'); return; }
    call('simpanPengaturan', { data: f }).then(s => {
      S.d.pengaturan = s; tandaiBerubah(false); renderChrome();
      if ((s.jenjang || 'SD') !== jenjangAwal) { jenjangAwal = s.jenjang || 'SD'; toast('Jenjang diubah. Sesuaikan mapel di Mapel & TP → Daftar mata pelajaran → Paket mapel ' + jenjangAwal + '.'); }
      else toast('Pengaturan tersimpan');
      if (String(s.pin || '').trim()) { S.pin = String(s.pin).trim(); try { sessionStorage.setItem('rapor_pin', S.pin); } catch (e) {} }
    }).catch(gagal);
  };
};

/* =========================================================
   DATA MURID
   ========================================================= */
var FIELD_MURID = [
  ['Identitas', [['nama', 'Nama lengkap *', 'full'], ['panggilan', 'Nama panggilan'], ['jk', 'Jenis kelamin', '', 'jk'], ['nis', 'NIS'], ['nisn', 'NISN'],
    ['agama', 'Agama', '', 'agama'], ['tempat_lahir', 'Tempat lahir'], ['tanggal_lahir', 'Tanggal lahir', '', 'date'], ['pendidikan_sebelumnya', 'Pendidikan sebelumnya'], ['alamat', 'Alamat', 'full']]],
  ['Orang tua', [['nama_ayah', 'Nama ayah'], ['nama_ibu', 'Nama ibu'], ['pekerjaan_ayah', 'Pekerjaan ayah'], ['pekerjaan_ibu', 'Pekerjaan ibu'], ['alamat_ortu', 'Alamat orang tua', 'full']]],
  ['Wali (bila ada)', [['nama_wali', 'Nama wali'], ['pekerjaan_wali', 'Pekerjaan wali'], ['alamat_wali', 'Alamat wali', 'full']]]
];
function chipStatus(m) {
  var s = statusMurid(m);
  if (s === 'Aktif') return '';
  return `<span class="chip c-c" title="${esc(m.keterangan_keluar || '')}">${esc(s)} ${m.tanggal_keluar ? '· ' + esc(tglIndo(m.tanggal_keluar)) : ''}</span>`;
}
VIEWS.murid = function (v) {
  var q = '', d = S.d;
  S.filterMurid = S.filterMurid || 'aktif';
  var draw = () => {
    var aktif = d.murid.filter(m => statusMurid(m) === 'Aktif'), non = d.murid.filter(m => statusMurid(m) !== 'Aktif');
    var sumber = S.filterMurid === 'aktif' ? aktif : S.filterMurid === 'keluar' ? non : d.murid;
    var list = sumber.filter(m => !q || (m.nama + ' ' + m.nis + ' ' + m.nisn + ' ' + m.panggilan).toLowerCase().indexOf(q) >= 0);
    var L = aktif.filter(m => String(m.jk).toUpperCase().indexOf('L') === 0).length;
    var ag = agamaDipakai();
    $('#ringkas').innerHTML = `<div class="seg" id="fltMurid">${[['aktif', 'Aktif (' + aktif.length + ')'], ['keluar', 'Pindah/keluar (' + non.length + ')'], ['semua', 'Semua']].map(x => `<button data-val="${x[0]}" class="${S.filterMurid === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div>
      <span class="pill">${L} L</span><span class="pill">${aktif.length - L} P</span>` +
      ag.map(a => `<span class="pill">${a}: ${aktif.filter(m => (normAgama(m.agama) || 'Islam') === a).length}</span>`).join('');
    $('#tbMurid').innerHTML = list.length ? list.map(m => { var nonaktif = statusMurid(m) !== 'Aktif'; return `<tr data-id="${m.id}" style="${nonaktif ? 'opacity:.72' : ''}">
      <td class="num muted">${d.murid.indexOf(m) + 1}</td>
      <td class="nm">${esc(m.nama)} ${chipStatus(m)}</td>
      <td><input class="inp pgl" data-pgl="${m.id}" value="${esc(m.panggilan || '')}" placeholder="${esc(panggilanOtomatis(m.nama))}" title="Nama panggilan dipakai di kalimat deskripsi rapor — ubah langsung di sini"></td>
      <td>${esc(m.nis || '–')}<br><span class="small muted">${esc(m.nisn || '')}</span></td>
      <td class="num">${esc(String(m.jk || '').charAt(0).toUpperCase())}</td>
      <td>${esc(normAgama(m.agama) || '–')}</td>
      <td style="text-align:right;white-space:nowrap"><button class="btn ghost icon sm" data-edit="${m.id}" title="Ubah data">${ic('edit')}</button>
        ${nonaktif ? `<button class="btn ghost sm" data-aktifkan="${m.id}" title="Aktifkan kembali">${ic('refresh')} Aktifkan</button>` : `<button class="btn ghost sm" data-mutasi="${m.id}" title="Tandai pindah / keluar">${ic('ext')} Pindah</button>`}
        <button class="btn ghost icon sm" data-hapus="${m.id}" title="Hapus permanen">${ic('trash')}</button></td></tr>`; }).join('')
      : `<tr><td colspan="7" class="muted" style="text-align:center;padding:30px">${d.murid.length ? (S.filterMurid === 'keluar' ? 'Belum ada ' + sebutan().toLowerCase() + ' yang pindah atau keluar.' : 'Tidak ditemukan.') : 'Belum ada data. Klik “Tambah” atau “Impor dari Excel”.'}</td></tr>`;
  };
  v.innerHTML = `<div class="row" style="margin-bottom:14px">
      <div class="search">${ic('search')}<input class="inp" id="cari" placeholder="Cari nama / panggilan / NIS / NISN"></div><span class="sp"></span>
      <button class="btn ghost" id="btnImpor">${ic('clip')} Impor dari Excel</button>
      <button class="btn" id="btnTambah">${ic('plus')} Tambah</button></div>
    <div class="row" id="ringkas" style="margin-bottom:12px"></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th class="num">No</th><th>Nama</th><th style="width:150px">Panggilan</th><th>NIS / NISN</th><th class="num">L/P</th><th>Agama</th><th></th></tr></thead><tbody id="tbMurid"></tbody></table></div>
    <p class="small muted">Nama panggilan dipakai di kalimat deskripsi rapor (“Ananda …”) — klik untuk mengubah langsung. ${sebutan()} yang <b>pindah/keluar</b> tidak muncul di input nilai, leger, dan cetak rapor, tetapi datanya tetap tersimpan.
    Urutkan sesuai abjad: <a href="#" id="urutAbjad">urutkan A–Z</a>.</p>`;
  draw();
  $('#cari').oninput = e => { q = e.target.value.toLowerCase().trim(); draw(); };
  $('#btnTambah').onclick = () => formMurid({}, draw);
  $('#ringkas').onclick = e => { var b = e.target.closest('#fltMurid button'); if (b) { S.filterMurid = b.dataset.val; draw(); } };
  // ubah panggilan langsung di tabel
  $('#tbMurid').addEventListener('change', e => {
    var x = e.target; if (!x.dataset.pgl) return;
    var m = clone(muridById(x.dataset.pgl)); m.panggilan = x.value.trim() || panggilanOtomatis(m.nama); x.value = m.panggilan;
    call('simpanMurid', { data: m }, 'Menyimpan…').then(rows => { S.d.murid = rows; reindex(); toast('Panggilan ' + m.panggilan + ' tersimpan'); }).catch(gagal);
  });
  $('#tbMurid').addEventListener('keydown', e => {
    if (!e.target.dataset.pgl || (e.key !== 'Enter' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    var all = $$('[data-pgl]', v), i = all.indexOf(e.target), t = all[i + (e.key === 'ArrowUp' ? -1 : 1)];
    e.preventDefault(); e.target.blur(); if (t) { t.focus(); t.select(); }
  });
  $('#tbMurid').onclick = e => {
    var b;
    if ((b = e.target.closest('[data-edit]'))) formMurid(clone(muridById(b.dataset.edit)), draw);
    else if ((b = e.target.closest('[data-mutasi]'))) formMutasi(clone(muridById(b.dataset.mutasi)), draw);
    else if ((b = e.target.closest('[data-aktifkan]'))) {
      var ma = clone(muridById(b.dataset.aktifkan));
      konfirmasi('Aktifkan kembali?', '<b>' + esc(ma.nama) + '</b> akan kembali muncul di input nilai dan rapor.', 'Aktifkan').then(ok => {
        if (!ok) return; ma.status = 'Aktif'; ma.tanggal_keluar = ''; ma.keterangan_keluar = '';
        call('simpanMurid', { data: ma }).then(rows => { S.d.murid = rows; reindex(); draw(); toast(ma.nama + ' aktif kembali'); }).catch(gagal);
      });
    } else if ((b = e.target.closest('[data-hapus]'))) {
      var m = muridById(b.dataset.hapus);
      konfirmasi('Hapus permanen?', '<b>' + esc(m.nama) + '</b> beserta <b>semua nilainya</b> akan dihapus.<br><br>Bila ' + sebutan().toLowerCase() + ' ini pindah sekolah, gunakan tombol <b>Pindah</b> agar datanya tetap tersimpan.', 'Tetap hapus', true).then(ok => {
        if (!ok) return;
        call('hapusMurid', { id: m.id }, 'Menghapus…').then(() => muatUlang()).then(() => { draw(); toast('Data dihapus'); }).catch(gagal);
      });
    }
  };
  $('#urutAbjad').onclick = e => {
    e.preventDefault();
    var ids = d.murid.slice().sort((a, b) => String(a.nama).localeCompare(String(b.nama), 'id')).map(m => String(m.id));
    call('urutkanMurid', { ids: ids }, 'Mengurutkan…').then(rows => { d.murid = rows; reindex(); draw(); toast('Diurutkan A–Z'); }).catch(gagal);
  };
  $('#btnImpor').onclick = () => imporMurid(draw);
};
function formMutasi(m, selesai) {
  var hari = new Date(), ini = hari.getFullYear() + '-' + ('0' + (hari.getMonth() + 1)).slice(-2) + '-' + ('0' + hari.getDate()).slice(-2);
  var md = modal({
    title: 'Pindah / keluar — ' + m.nama,
    body: `<div class="form-grid">
        <label class="field"><span>Status</span><select class="inp" id="mtS"><option>Pindah</option><option>Keluar</option></select></label>
        <label class="field"><span>Tanggal keluar</span><input class="inp" type="date" id="mtT" value="${esc(m.tanggal_keluar || ini)}"></label>
        <label class="field full"><span>Keterangan</span><input class="inp" id="mtK" value="${esc(m.keterangan_keluar || '')}" placeholder="mis. Pindah ke SDN 1 Cikoneng / ikut orang tua"></label></div>
      <div class="preview-desk small mt">${sebutan()} yang pindah/keluar tidak muncul lagi di input nilai, leger, dan cetak rapor. Nilai yang sudah ada tetap tersimpan, dan bisa diaktifkan kembali kapan saja.</div>`,
    foot: `<button class="btn ghost" data-x>Batal</button><button class="btn" data-ok>Simpan</button>`
  });
  $('[data-ok]', md.el).onclick = () => {
    m.status = $('#mtS', md.el).value; m.tanggal_keluar = $('#mtT', md.el).value; m.keterangan_keluar = $('#mtK', md.el).value.trim();
    if (!m.tanggal_keluar) return toast('Tanggal keluar wajib diisi', 'err');
    call('simpanMurid', { data: m }).then(rows => { S.d.murid = rows; reindex(); md.close(); selesai(); toast(m.nama + ' ditandai ' + m.status.toLowerCase()); }).catch(gagal);
  };
}
function formMurid(m, selesai) {
  var input = (f) => {
    var k = f[0], val = esc(m[k] || '');
    if (f[3] === 'jk') return `<select class="inp" data-f="${k}"><option value="">–</option><option value="L" ${String(m.jk).toUpperCase().charAt(0) === 'L' ? 'selected' : ''}>Laki-laki</option><option value="P" ${String(m.jk).toUpperCase().charAt(0) === 'P' ? 'selected' : ''}>Perempuan</option></select>`;
    if (f[3] === 'agama') return `<select class="inp" data-f="${k}">${AGAMA.map(a => `<option ${normAgama(m.agama || 'Islam') === a ? 'selected' : ''}>${a}</option>`).join('')}</select>`;
    return `<input class="inp" data-f="${k}" type="${f[3] === 'date' ? 'date' : 'text'}" value="${val}">`;
  };
  var md = modal({
    title: m.id ? 'Ubah data ' + sebutan().toLowerCase() : 'Tambah ' + sebutan().toLowerCase(),
    body: FIELD_MURID.map(g => `<div class="sec-title">${g[0]}</div><div class="form-grid">${g[1].map(f => `<label class="field ${f[2] || ''}"><span>${f[1]}</span>${input(f)}</label>`).join('')}</div>`).join('') +
      (m.id && statusMurid(m) !== 'Aktif' ? `<div class="sec-title">Status</div><div class="preview-desk small">${esc(statusMurid(m))} sejak ${esc(tglIndo(m.tanggal_keluar))}${m.keterangan_keluar ? ' — ' + esc(m.keterangan_keluar) : ''}. Ubah lewat tombol <b>Aktifkan</b> di daftar.</div>` : ''),
    foot: `<button class="btn ghost" data-x>Batal</button><button class="btn" data-simpan>${ic('save')} Simpan</button>`
  });
  var nf = $('[data-f=nama]', md.el); if (nf && !m.id) nf.focus();
  $('[data-simpan]', md.el).onclick = () => {
    $$('[data-f]', md.el).forEach(el => m[el.dataset.f] = el.value.trim());
    if (!m.nama) { toast('Nama wajib diisi', 'err'); return; }
    if (!m.panggilan) m.panggilan = panggilanOtomatis(m.nama);
    call('simpanMurid', { data: m }).then(rows => { S.d.murid = rows; reindex(); md.close(); selesai(); toast('Data tersimpan'); }).catch(gagal);
  };
}
function parseTanggal(s) {
  s = String(s || '').trim(); if (!s) return '';
  var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if (m) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/); if (m) { var y = m[3].length === 2 ? '20' + m[3] : m[3]; return y + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2); }
  var bl = BULAN.findIndex(b => s.toLowerCase().indexOf(b.toLowerCase()) >= 0);
  m = s.match(/(\d{1,2})\s+\w+\s+(\d{4})/);
  if (bl >= 0 && m) return m[2] + '-' + ('0' + (bl + 1)).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  return s;
}
function imporMurid(selesai) {
  var KOL = ['nama', 'nis', 'nisn', 'jk', 'agama', 'tempat_lahir', 'tanggal_lahir', 'panggilan', 'pendidikan_sebelumnya', 'alamat', 'nama_ayah', 'nama_ibu', 'pekerjaan_ayah', 'pekerjaan_ibu', 'alamat_ortu', 'nama_wali', 'pekerjaan_wali', 'alamat_wali'];
  var md = modal({
    title: 'Impor data ' + sebutan().toLowerCase() + ' dari Excel', size: 'lg',
    body: `<div class="card" style="margin-bottom:14px;box-shadow:none"><div class="card-b row" style="padding:12px 14px">
        <div style="flex:1;min-width:220px"><div class="b">Cara 1 — pakai template Excel</div><div class="small muted">Unduh template, isi data ${sebutan().toLowerCase()} di Excel, simpan, lalu unggah kembali.</div></div>
        <button class="btn ghost sm" id="tmplMurid">${ic('download')} Unduh template</button><button class="btn sm" id="unggahMurid">${ic('upload')} Unggah file Excel</button></div></div>
      <div class="b" style="margin-bottom:4px">Cara 2 — salin & tempel</div>
      <p class="small" style="margin-top:0">Salin baris data dari Excel/Google Sheet/Dapodik lalu tempel di bawah. Urutan kolom:</p>
      <div class="row small" style="margin-bottom:10px">${['Nama', 'NIS', 'NISN', 'L/P', 'Agama', 'Tempat lahir', 'Tgl lahir', 'Panggilan', 'Pendidikan sebelumnya', 'Alamat', 'Ayah', 'Ibu', 'Pekerjaan ayah', 'Pekerjaan ibu', 'Alamat ortu', 'Wali', 'Pekerjaan wali', 'Alamat wali'].map((x, i) => `<span class="pill">${i + 1}. ${x}</span>`).join('')}</div>
      <p class="small muted">Cukup kolom <b>Nama</b> saja juga bisa. Bila baris judul ikut disalin (mis. dari Dapodik: Nama, NIPD, JK, NISN, …), urutan kolom dikenali otomatis.</p>
      <textarea class="inp" id="tempel" rows="8" placeholder="Tempel di sini (Ctrl+V)"></textarea>
      <label class="row small mt-s" style="cursor:pointer;gap:8px"><input type="checkbox" id="rapikan" checked> Rapikan nama yang ditulis HURUF BESAR (ADINDA PUTRI → Adinda Putri)</label>
      <div class="row mt-s"><div class="seg" id="modeImp"><button class="on" data-val="tambah">Tambahkan ke data lama</button><button data-val="ganti">Ganti semua data</button></div><span class="sp"></span><span id="infoImp" class="small b"></span></div>
      <div class="tbl-wrap mt-s" style="max-height:220px"><table class="tbl"><tbody id="prevImp"></tbody></table></div>`,
    foot: `<button class="btn ghost" data-x>Batal</button><button class="btn" data-ok disabled>${ic('upload')} Impor</button>`
  });
  var rows = [], mode = 'tambah';
  $('#rapikan', md.el).onchange = () => $('#tempel', md.el).dispatchEvent(new Event('input'));
  $('#tmplMurid', md.el).onclick = () => window.desktop.templateMurid().then(r => { if (r.ok) toastFile('Template tersimpan — isi lalu unggah kembali', r.path); }).catch(gagal);
  $('#unggahMurid', md.el).onclick = () => window.desktop.bacaExcel().then(r => {
    if (!r.ok) { if (r.error) toast(r.error, 'err'); return; }
    var nm = Object.keys(r.sheets), rows = (r.sheets[nm.find(n => /murid|siswa|peserta/i.test(n)) || nm[0]] || []).filter(x => x.join('').trim());
    var h = rows.findIndex(x => x.map(cocok).filter(Boolean).length >= 2 && x.map(cocok).indexOf('nama') >= 0); // lewati baris petunjuk di atas judul
    if (h > 0) rows = rows.slice(h);
    $('#tempel', md.el).value = rows.map(x => x.join('\t')).join('\n');
    $('#tempel', md.el).dispatchEvent(new Event('input'));
    toast('File ' + r.nama + ' dibaca — periksa pratinjau lalu klik Impor');
  }).catch(gagal);
  $('#modeImp', md.el).onclick = e => { var b = e.target.closest('button'); if (!b) return; mode = b.dataset.val; $$('#modeImp button', md.el).forEach(x => x.classList.toggle('on', x === b)); };
  var PETA = [[/^(nama|nama lengkap|nama peserta didik|nama murid|nama siswa|nama_lengkap)$/, 'nama'], [/^(nis|nipd|no\.? ?induk|nomor induk)$/, 'nis'], [/^nisn$/, 'nisn'],
    [/^(l\/p|jk|j\.?k\.?|jenis kelamin|kelamin|gender)$/, 'jk'], [/^agama$/, 'agama'], [/^(tempat( lahir)?|tmp\.? lahir)$/, 'tempat_lahir'], [/^(tgl\.?|tanggal)( lahir)?$/, 'tanggal_lahir'],
    [/^(nama )?panggilan$/, 'panggilan'], [/^(pendidikan sebelumnya|asal sekolah|sekolah asal)$/, 'pendidikan_sebelumnya'],
    [/^pekerjaan ayah$/, 'pekerjaan_ayah'], [/^pekerjaan ibu$/, 'pekerjaan_ibu'], [/^pekerjaan wali$/, 'pekerjaan_wali'],
    [/^alamat (orang tua|ortu)$/, 'alamat_ortu'], [/^alamat wali$/, 'alamat_wali'], [/^(nama )?wali$/, 'nama_wali'],
    [/^(nama )?ayah( kandung)?$/, 'nama_ayah'], [/^(nama )?ibu( kandung)?$/, 'nama_ibu'], [/^alamat( jalan| murid| siswa)?$/, 'alamat']];
  var cocok = h => { h = String(h || '').trim().toLowerCase().replace(/\s+/g, ' '); var x = PETA.find(p => p[0].test(h)); return x ? x[1] : null; };
  $('#tempel', md.el).oninput = e => {
    var baris = e.target.value.split(/\r?\n/).map(l => l.split('\t')).filter(c => c.join('').trim());
    // deteksi baris judul (mis. hasil ekspor Dapodik) → kolom dipetakan otomatis
    var kol = KOL, mulai = 0, info = '';
    for (var i = 0; i < Math.min(5, baris.length); i++) {
      var peta = baris[i].map(cocok);
      if (peta.filter(Boolean).length >= 2 && peta.indexOf('nama') >= 0) { kol = peta; mulai = i + 1; info = 'Judul kolom terdeteksi: ' + peta.filter(Boolean).length + ' kolom dipakai otomatis.'; break; }
    }
    rows = baris.slice(mulai).filter(c => !/^(nama|no\.?|nomor)$/i.test(String(c[0]).trim()))
      .map(c => { var o = {}; KOL.forEach(k => o[k] = ''); kol.forEach((k, j) => { if (k) o[k] = String(c[j] || '').trim(); });
        if ($('#rapikan', md.el).checked) ['nama', 'tempat_lahir', 'nama_ayah', 'nama_ibu', 'nama_wali'].forEach(k => { if (o[k] && o[k] === o[k].toUpperCase() && /[A-Z]/.test(o[k])) o[k] = o[k].toLowerCase().replace(/(^|[\s.'-])([a-z])/g, (x, a, b) => a + b.toUpperCase()); }); o.jk = /^p/i.test(o.jk) ? 'P' : /^l/i.test(o.jk) ? 'L' : o.jk; o.agama = normAgama(o.agama) || 'Islam'; o.tanggal_lahir = parseTanggal(o.tanggal_lahir); if (!o.panggilan) o.panggilan = panggilanOtomatis(o.nama); return o; })
      .filter(o => o.nama && !/^\d+$/.test(o.nama));
    $('#infoImp', md.el).textContent = rows.length + ' baris siap diimpor' + (info ? ' · ' + info : '');
    $('#prevImp', md.el).innerHTML = rows.slice(0, 50).map((o, i) => `<tr><td class="num muted">${i + 1}</td><td class="nm">${esc(o.nama)}<small>${esc(o.panggilan)}</small></td><td>${esc(o.nis)}</td><td>${esc(o.nisn)}</td><td>${esc(o.jk)}</td><td>${esc(o.agama)}</td><td>${esc(o.tanggal_lahir)}</td></tr>`).join('');
    $('[data-ok]', md.el).disabled = !rows.length;
  };
  $('[data-ok]', md.el).onclick = () => {
    var go2 = () => call('imporMurid', { rows: rows, mode: mode }, 'Mengimpor…').then(r => { S.d.murid = r; reindex(); md.close(); selesai(); toast(rows.length + ' data berhasil diimpor'); }).catch(gagal);
    if (mode === 'ganti' && S.d.murid.length) konfirmasi('Ganti semua data?', 'Data ' + sebutan().toLowerCase() + ' lama akan diganti. Nilai yang terkait data lama tidak akan terbaca lagi.', 'Ganti', true).then(ok => ok && go2());
    else go2();
  };
}

/* =========================================================
   MAPEL & TP
   ========================================================= */
var MAPEL_INTI = ['AGAMA', 'PP', 'BIND', 'MTK', 'PJOK'];
VIEWS.mapel = function (v) {
  S.tabMapel = S.tabMapel || 'tp';
  v.innerHTML = `<div class="tabs"><button data-tab="tp">Tujuan Pembelajaran (TP)</button><button data-tab="mapel">Daftar Mata Pelajaran</button></div><div id="tabIsi"></div>`;
  var buka = t => {
    if (S.dirty) return konfirmasi('Perubahan belum disimpan', 'Pindah tab tanpa menyimpan?', 'Pindah', true).then(ok => { if (ok) { S.dirty = false; buka(t); } });
    S.tabMapel = t; $$('.tabs button', v).forEach(b => b.classList.toggle('on', b.dataset.tab === t));
    (t === 'tp' ? tabTP : tabMapel)($('#tabIsi'));
  };
  $('.tabs', v).onclick = e => { var b = e.target.closest('button'); if (b) buka(b.dataset.tab); };
  buka(S.tabMapel);
};
function tabMapel(el) {
  var list = clone(S.d.mapel);
  var draw = () => {
    var jj = P('jenjang') || 'SD';
    el.innerHTML = `<div class="card" style="margin-bottom:14px"><div class="card-b row">
        <div style="flex:1;min-width:220px"><div class="b">Paket mapel siap pakai</div><div class="small muted">Ganti daftar mapel dengan mapel bawaan jenjang (Kurikulum Merdeka), lalu sesuaikan. Jenjang sekarang: <b>${esc(jj)}</b>.</div></div>
        ${[['SD', 'SD/MI'], ['SMP', 'SMP/MTs'], ['SMA', 'SMA/MA'], ['SMK', 'SMK']].map(x => `<button class="btn ${x[0] === jj ? 'soft' : 'ghost'} sm" data-pmapel="${x[0]}">${ic('sparkle')} ${x[1]}</button>`).join('')}</div></div>
      <div class="card"><div class="card-h"><h3>Mata pelajaran</h3><span class="sub">aktifkan yang diajarkan di kelas ini</span>
      <span class="act"><button class="btn soft sm" id="tbhMapel">${ic('plus')} Mapel / mulok</button></span></div><div class="card-b">
      <div class="mp-row small muted b" style="border-bottom:1px solid var(--line)"><span></span><span>Aktif</span><span>Nama mapel</span><span class="hide-m">Kelompok</span><span class="hide-m">KKTP</span><span></span></div>
      ${list.map((m, i) => `<div class="mp-row">
        <div class="mv"><button data-up="${i}">${ic('up')}</button><button data-dn="${i}">${ic('down')}</button></div>
        <label class="switch"><input type="checkbox" data-i="${i}" data-f="aktif" ${m.aktif === 'Ya' ? 'checked' : ''}><i></i></label>
        <div><input class="inp" data-i="${i}" data-f="nama" value="${esc(m.nama)}" ${isAgama(m) ? 'title="Nama di rapor otomatis menyesuaikan agama murid"' : ''}>
          <div class="row mt-s" style="gap:6px"><input class="inp" style="max-width:120px;padding:5px 9px" data-i="${i}" data-f="singkatan" value="${esc(m.singkatan)}" placeholder="Singkatan">
          ${isAgama(m) ? '<span class="small muted">Nama di rapor mengikuti agama murid</span>' : ''}</div></div>
        <select class="inp hide-m" data-i="${i}" data-f="kelompok">${KELOMPOK.map(k => `<option ${m.kelompok === k ? 'selected' : ''}>${k}</option>`).join('')}</select>
        <input class="inp hide-m" type="number" data-i="${i}" data-f="kktp" value="${esc(m.kktp)}" placeholder="${esc(P('kktp') || 75)}">
        <div>${MAPEL_INTI.indexOf(m.id) < 0 ? `<button class="btn ghost icon sm" data-del="${i}" title="Hapus">${ic('trash')}</button>` : ''}</div>
      </div>`).join('')}
      <p class="small muted">KKTP kosong = memakai KKTP bawaan (${esc(P('kktp') || 75)}). Mapel seni/mulok/pilihan hanya muncul di rapor ${sebutan().toLowerCase()} yang punya nilainya.</p>
      </div></div>${savebar('Simpan mapel')}`;
    bind();
  };
  var bind = () => {
    $$('[data-f]', el).forEach(x => x.addEventListener(x.type === 'checkbox' ? 'change' : 'input', () => {
      list[x.dataset.i][x.dataset.f] = x.type === 'checkbox' ? (x.checked ? 'Ya' : 'Tidak') : x.value; tandaiBerubah();
    }));
    el.onclick = e => {
      var b;
      if ((b = e.target.closest('[data-up]')) && +b.dataset.up > 0) { var i = +b.dataset.up; list.splice(i - 1, 0, list.splice(i, 1)[0]); tandaiBerubah(); draw(); tandaiBerubah(); }
      else if ((b = e.target.closest('[data-dn]')) && +b.dataset.dn < list.length - 1) { var j = +b.dataset.dn; list.splice(j + 1, 0, list.splice(j, 1)[0]); draw(); tandaiBerubah(); }
      else if ((b = e.target.closest('[data-del]'))) { list.splice(+b.dataset.del, 1); draw(); tandaiBerubah(); }
      else if ((b = e.target.closest('[data-pmapel]'))) {
        var nmj = b.dataset.pmapel;
        konfirmasi('Pakai paket mapel ' + nmj + '?', 'Daftar mapel diganti dengan mapel bawaan ' + nmj + '. Nilai dan TP mapel yang sama (mis. Matematika, Bahasa Indonesia) tetap tersambung; mapel yang tidak ada di paket tidak tampil lagi di rapor.', 'Pakai paket', true).then(ok => {
          if (!ok) return;
          call('presetMapel', { nama: nmj }).then(rows => {
            var lama = {}; list.forEach(m => { lama[m.id] = m; });
            list = rows.map(r => ({ id: r[0], nama: r[1], singkatan: r[2], kelompok: r[3], kktp: lama[r[0]] ? lama[r[0]].kktp : '', aktif: r[4] }));
            draw(); tandaiBerubah(); toast('Paket mapel dimuat — klik Simpan untuk menerapkan');
          }).catch(gagal);
        });
      }
      else if (e.target.closest('#tbhMapel')) { list.push({ id: uid('MP'), nama: 'Muatan Lokal Baru', singkatan: 'Mulok', kelompok: 'Muatan Lokal', kktp: '', aktif: 'Ya' }); draw(); tandaiBerubah(); }
      else if (e.target.closest('#btnSimpan')) {
        call('simpanMapel', { list: list }).then(r => { S.d.mapel = r; reindex(); list = clone(S.d.mapel); tandaiBerubah(false); toast('Mapel tersimpan'); }).catch(gagal);
      }
    };
  };
  draw();
}
function tabTP(el) {
  var mp = mapelAktif();
  if (!mp.length) { el.innerHTML = kosong('book', 'Belum ada mapel aktif', 'Aktifkan mapel di tab Daftar Mata Pelajaran.', ''); return; }
  if (!S.tpMapel || !mapelById(S.tpMapel) || mp.indexOf(mapelById(S.tpMapel)) < 0) S.tpMapel = mp[0].id;
  S.tpAgama = S.tpAgama || agamaDipakai()[0] || 'Islam';
  var list = [];
  var ambil = () => { var m = mapelById(S.tpMapel); list = clone(S.d.tp.filter(t => t.mapel_id === m.id && (isAgama(m) ? normAgama(t.agama) === S.tpAgama : !t.agama))); };
  var draw = () => {
    var m = mapelById(S.tpMapel);
    el.innerHTML = `<div class="chips-scroll" style="margin-bottom:12px">${mp.map(x => {
        var n = isAgama(x) ? S.d.tp.filter(t => t.mapel_id === x.id).length : tpList(x.id).length;
        return `<button class="mchip ${x.id === m.id ? 'on' : ''}" data-mp="${x.id}"><span class="dot ${n ? 'full' : ''}"></span>${esc(x.singkatan || x.nama)} <span style="opacity:.7">${n}</span></button>`;
      }).join('')}</div>
      <div class="card"><div class="card-h"><div><h3>${esc(isAgama(m) ? NAMA_PABP[S.tpAgama] || m.nama : m.nama)}</h3><div class="sub">KKTP ${kktp(m)} · ${list.length} TP</div></div>
        <span class="act">${isAgama(m) ? `<select class="inp" id="tpAgama" style="padding:6px 9px">${AGAMA.map(a => `<option ${a === S.tpAgama ? 'selected' : ''}>${a}</option>`).join('')}</select>` : ''}</span></div>
      <div class="card-b">
        <div class="tp-row small muted b" style="border-bottom:1px solid var(--line)"><span>Kode</span><span>Lingkup materi</span><span class="tj">Tujuan pembelajaran</span><span></span></div>
        <div id="tpRows">${list.map((t, i) => `<div class="tp-row">
          <input class="inp" data-i="${i}" data-f="kode" value="${esc(t.kode || 'TP ' + (i + 1))}" style="padding:8px 6px;text-align:center">
          <input class="inp" data-i="${i}" data-f="lingkup_materi" value="${esc(t.lingkup_materi)}" placeholder="mis. Bilangan Desimal">
          <textarea class="inp tj" rows="2" data-i="${i}" data-f="tujuan" placeholder="Awali dengan kata kerja, mis. menjelaskan …" style="min-height:44px">${esc(t.tujuan)}</textarea>
          <button class="btn ghost icon sm" data-del="${i}" title="Hapus TP">${ic('trash')}</button></div>`).join('') || '<div class="muted small" style="padding:18px 0">Belum ada TP untuk mapel ini.</div>'}</div>
        <div class="row mt"><button class="btn soft sm" id="tbhTP">${ic('plus')} Tambah TP</button><button class="btn ghost sm" id="tmplTP">${ic('clip')} Tempel dari Excel</button>
          <span class="sp"></span><button class="btn ghost sm" id="unduhTP">${ic('download')} Template TP semua mapel</button><button class="btn ghost sm" id="unggahTP">${ic('upload')} Unggah template TP</button></div>
        <p class="small muted" style="margin-bottom:0">Tulis tujuan dengan huruf kecil dan diawali kata kerja (menjelaskan, menyelesaikan, membuat …). Kalimat ini otomatis dirangkai menjadi deskripsi capaian di rapor.</p>
      </div></div>${savebar('Simpan TP')}`;
    tandaiBerubah(S.dirty);
  };
  ambil(); draw();
  el.oninput = e => { var x = e.target; if (x.dataset.f) { list[x.dataset.i][x.dataset.f] = x.value; tandaiBerubah(); } };
  el.onchange = e => {
    if (e.target.id === 'tpAgama') {
      var nv = e.target.value;
      var lanjut = () => { S.tpAgama = nv; S.dirty = false; ambil(); draw(); };
      if (S.dirty) konfirmasi('Perubahan belum disimpan', 'Ganti agama tanpa menyimpan?', 'Ganti', true).then(ok => ok ? lanjut() : (e.target.value = S.tpAgama)); else lanjut();
    }
  };
  el.onclick = e => {
    var b;
    if ((b = e.target.closest('[data-mp]'))) {
      var id = b.dataset.mp;
      var lanjut = () => { S.tpMapel = id; S.dirty = false; ambil(); draw(); };
      if (S.dirty) konfirmasi('Perubahan belum disimpan', 'Pindah mapel tanpa menyimpan?', 'Pindah', true).then(ok => ok && lanjut()); else lanjut();
    } else if ((b = e.target.closest('[data-del]'))) { list.splice(+b.dataset.del, 1); list.forEach((t, i) => { if (/^TP \d+$/.test(t.kode)) t.kode = 'TP ' + (i + 1); }); draw(); tandaiBerubah(); }
    else if (e.target.closest('#unduhTP')) unduhTemplateTP();
    else if (e.target.closest('#unggahTP')) {
      if (S.dirty) return toast('Simpan dulu perubahan TP di layar.', 'err');
      unggahTemplateTP(() => { ambil(); draw(); });
    }
    else if (e.target.closest('#tbhTP')) { list.push({ kode: 'TP ' + (list.length + 1), lingkup_materi: '', tujuan: '' }); draw(); tandaiBerubah(); var t = $$('textarea', el); if (t.length) t[t.length - 1].focus(); }
    else if (e.target.closest('#tmplTP')) {
      var md = modal({
        title: 'Tempel TP dari Excel', body: `<p class="small" style="margin-top:0">Salin 2 kolom dari Excel: <span class="pill">Lingkup materi</span> <span class="pill">Tujuan pembelajaran</span>. Bila hanya 1 kolom, dianggap tujuan pembelajaran.</p><textarea class="inp" id="tmpTP" rows="9"></textarea>`,
        foot: `<button class="btn ghost" data-x>Batal</button><button class="btn" data-ok>Tambahkan</button>`
      });
      $('[data-ok]', md.el).onclick = () => {
        $('#tmpTP', md.el).value.split(/\r?\n/).map(l => l.split('\t')).filter(c => c.join('').trim()).forEach(c => {
          var lm = c.length > 1 ? c[0] : '', tj = c.length > 1 ? c[1] : c[0];
          list.push({ kode: 'TP ' + (list.length + 1), lingkup_materi: String(lm).trim(), tujuan: String(tj).trim() });
        });
        md.close(); draw(); tandaiBerubah();
      };
    } else if (e.target.closest('#btnSimpan')) {
      var m = mapelById(S.tpMapel);
      var bersih = list.filter(t => String(t.tujuan || t.lingkup_materi).trim());
      call('simpanTP', { mapel_id: m.id, agama: isAgama(m) ? S.tpAgama : '', list: bersih }).then(() => call('muat')).then(d => { setData(d); tandaiBerubah(false); ambil(); draw(); toast('TP tersimpan'); }).catch(gagal);
    }
  };
}

/* =========================================================
   INPUT NILAI
   ========================================================= */
VIEWS.nilai = function (v) {
  if (perluMurid(v)) return;
  var mp = mapelAktif();
  if (!mp.length) { v.innerHTML = kosong('book', 'Belum ada mapel aktif', 'Aktifkan mapel terlebih dahulu.', `<button class="btn" data-go="mapel">Atur mapel</button>`); return; }
  if (!S.nMapel || mp.indexOf(mapelById(S.nMapel)) < 0) S.nMapel = mp[0].id;
  var ags = agamaDipakai();
  if (!S.nAgama || ags.indexOf(S.nAgama) < 0) S.nAgama = ags[0] || 'Islam';
  var m, murid, tps, kerja;

  var siapkan = () => {
    m = mapelById(S.nMapel);
    murid = MA().filter(x => !isAgama(m) || (normAgama(x.agama) || 'Islam') === S.nAgama);
    tps = tpList(m.id, S.nAgama);
    kerja = {};
    murid.forEach(x => { var r = S.nilai[x.id + '|' + m.id]; kerja[x.id] = { _tp: clone(r ? r._tp : {}), _lm: clone(r ? r._lm : {}), sts: r ? (r.sts == null ? '' : r.sts) : '', sas: r ? r.sas : '', deskripsi_manual: r ? r.deskripsi_manual : '', deskripsi_tp: r ? r.deskripsi_tp : '', deskripsi_ai: r ? r.deskripsi_ai : '', deskripsi_final: r ? r.deskripsi_final : '' }; });
  };
  var statusMapel = x => {
    var tot = 0, isi = 0; MA().forEach(mu => { if (isAgama(x) || mapelMurid(mu).indexOf(x) >= 0) { tot++; if (hitung(mu, x).na != null) isi++; } });
    return isi === 0 ? '' : isi >= tot ? 'full' : 'part';
  };
  var hitungKerja = x => hitung(x, m, kerja[x.id]);
  var kelasNilai = (val) => { var n = nOrNull(val); if (val !== '' && val != null && (n == null || n < 0 || n > 100)) return 'bad'; return n != null && n < kktp(m) ? 'low' : ''; };

  var draw = () => {
    siapkan();
    var adaTP = tps.length > 0;
    var daftarLM = (S.d.lingkupMateri || []).filter(g => String(g.mapel_id) === String(m.id) && String(g.agama || '') === (m.id === 'AGAMA' ? (normAgama(S.nAgama) || 'Islam') : '') && g.status === 'Aktif').sort((a,b) => num(a.urut)-num(b.urut));
    v.innerHTML = kartuGuruMapel() + `<div class="chips-scroll" style="margin-bottom:12px">${mp.map(x => `<button class="mchip ${x.id === m.id ? 'on' : ''}" data-mp="${x.id}"><span class="dot ${statusMapel(x)}"></span>${esc(x.singkatan || x.nama)}</button>`).join('')}</div>
      <div class="card"><div class="card-h"><div style="min-width:0"><h3>${esc(isAgama(m) ? NAMA_PABP[S.nAgama] : m.nama)}</h3>
        <div class="sub">KKTP ${kktp(m)} · ${tps.length} TP · ${daftarLM.length} LM · ${murid.length} ${sebutan().toLowerCase()} · Nilai akhir = ${esc(teksBobot())}</div></div>
        <span class="act">${isAgama(m) ? `<select class="inp" id="nAgama" style="padding:6px 9px">${ags.map(a => `<option ${a === S.nAgama ? 'selected' : ''}>${a}</option>`).join('')}</select>` : ''}
        <button class="btn ghost sm" data-go="mapel">${ic('book')} Atur TP</button></span></div>
      <div class="card-b">
      ${!adaTP ? `<div class="preview-desk" style="background:var(--warn-bg);border-color:#F1D9A2;color:#7A4E07">${ic('alert')} Mapel ini belum punya Tujuan Pembelajaran. Nilai STS dan SAS tetap bisa diisi, tetapi deskripsi rapor dibuat dari nilai TP — <a href="#" data-go="mapel">tambahkan TP dulu</a>.</div>` : ''}
      <div class="tbl-wrap mt-s"><table class="tbl fit" id="gridN"><thead><tr>
        <th class="stick" style="min-width:170px">${sebutan()}</th>
        ${tps.map((t, j) => `<th class="th-tp th-tp-group" title="${esc(t.kode + ': ' + t.tujuan)}"><b>${esc(t.kode || 'TP ' + (j + 1))}</b><span>${esc(t.lingkup_materi || t.tujuan)}</span></th>`).join('')}
        ${daftarLM.map((g, j) => `<th class="th-tp th-lm-group" title="Nilai Lingkup Materi diinput langsung oleh guru"><b>LM${j + 1}</b><span>${esc(g.nama)}</span></th>`).join('')}
        <th class="th-tp th-sts-group" title="STS disimpan sebagai catatan dan tidak masuk nilai akhir"><b>STS</b><span>Dicatat · tidak dihitung</span></th>
        <th class="th-tp th-sas-group" title="Sumatif Akhir Semester"><b>SAS</b><span>Akhir semester</span></th>
        <th class="num">Rata-rata LM</th><th class="num">NA</th><th>Capaian</th><th>Deskripsi rapor</th></tr></thead>
        <tbody>${murid.map((x, r) => {
          var k = kerja[x.id], h = hitungKerja(x);
          return `<tr data-sid="${x.id}"><td class="stick nm">${r + 1}. ${esc(x.nama)}</td>
            ${tps.map((t, c) => `<td class="num cell-tp"><input class="gin ${kelasNilai(k._tp[t.id])}" data-r="${r}" data-c="${c}" data-tp="${t.id}" value="${esc(k._tp[t.id] == null ? '' : k._tp[t.id])}" inputmode="decimal" autocomplete="off"></td>`).join('')}
            ${daftarLM.map((g, j) => `<td class="num cell-lm"><input class="gin ${kelasNilai(k._lm[g.id])}" data-r="${r}" data-c="${tps.length + j}" data-lm-id="${g.id}" value="${esc(k._lm[g.id] == null ? '' : k._lm[g.id])}" inputmode="decimal" autocomplete="off" aria-label="${esc(g.nama)}"></td>`).join('')}
            <td class="num cell-sts"><input class="gin ${kelasNilai(k.sts)}" data-r="${r}" data-c="${tps.length + daftarLM.length}" data-sts="1" value="${esc(k.sts)}" inputmode="decimal" autocomplete="off"></td>
            <td class="num cell-sas"><input class="gin ${kelasNilai(k.sas)}" data-r="${r}" data-c="${tps.length + daftarLM.length + 1}" data-sas="1" value="${esc(k.sas)}" inputmode="decimal" autocomplete="off"></td>
            <td class="num" data-lm title="${esc(h.rincianLM.map(z => z.nama + ': ' + f1(z.nilai)).join(' | '))}">${f1(h.rataLM)}</td><td class="na-cell" data-na>${f0(h.na)}</td><td data-pr>${chipPredikat(h.na, m)}</td>
            <td><div class="desk-mini ${k.deskripsi_manual ? 'manual' : ''}" data-desk style="cursor:pointer" title="Klik untuk mengubah">${esc(deskripsi(x, m, h) || '–')}</div></td></tr>`;
        }).join('')}</tbody></table></div>
      <p class="small muted">Tips: salin nilai dari Excel lalu klik sel pertama dan tekan <span class="kbd">Ctrl+V</span>. Tekan <span class="kbd">Enter</span> untuk turun ke baris berikutnya. Sel merah = di bawah KKTP.</p>
      </div></div>
      ${savebar('Simpan nilai')}
      ${adaTP ? `<div class="grid g-73 mt"><div class="card"><div class="card-h"><h3>Ketercapaian tiap TP</h3><span class="sub">rata-rata kelas · garis = KKTP</span></div><div class="card-b"><div class="chart-box sm"><canvas id="chTP"></canvas></div></div></div>
        <div class="card"><div class="card-h"><h3>Perlu tindak lanjut</h3><span class="sub">TP dengan ketuntasan terendah</span></div><div class="card-b" id="tlTP"></div></div></div>` : ''}`;
    tandaiBerubah(S.dirty);
    grafikTP();
  };
  var grafikTP = () => {
    if (!tps.length || !$('#chTP')) return;
    bersihkanGrafik();
    var rata = [], tuntas = [];
    tps.forEach(t => {
      var a = murid.map(x => nOrNull(kerja[x.id]._tp[t.id])).filter(n => n != null);
      rata.push(a.length ? Math.round(avg(a) * 10) / 10 : null);
      tuntas.push(a.length ? pct(a.filter(n => n >= kktp(m)).length, a.length) : null);
    });
    grafik($('#chTP'), {
      data: { labels: tps.map(t => t.kode), datasets: [
        { type: 'line', label: 'KKTP', data: tps.map(() => kktp(m)), borderColor: '#8590A8', borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0, order: 0 },
        { type: 'bar', label: 'Rata-rata', data: rata, backgroundColor: rata.map(x => x != null && x < kktp(m) ? '#E07A3F' : brand()), borderRadius: 4, maxBarThickness: 34, order: 1 }] },
      options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: Object.assign({}, TOOLTIP, { callbacks: {
        title: c => tps[c[0].dataIndex].kode + ' · ' + (tps[c[0].dataIndex].lingkup_materi || ''),
        label: c => c.dataset.label === 'KKTP' ? ' KKTP ' + c.raw : ' Rata-rata ' + f1(c.raw) + ' · tuntas ' + tuntas[c.dataIndex] + '%' } }) },
        scales: { y: { min: 0, max: 100, border: { display: false } }, x: { grid: { display: false } } } }
    });
    var urutT = tps.map((t, i) => ({ t: t, p: tuntas[i], r: rata[i] })).filter(x => x.p != null).sort((a, b) => a.p - b.p).slice(0, 4);
    $('#tlTP').innerHTML = urutT.length ? urutT.map(x => `<div style="padding:8px 0;border-bottom:1px dashed var(--line)"><div class="row"><span class="b small">${esc(x.t.kode)}</span><span class="sp"></span><span class="chip ${x.p >= 85 ? 'c-sb' : x.p >= 70 ? 'c-c' : 'c-pb'}">${x.p}% tuntas</span></div>
      <div class="small muted">${esc(x.t.tujuan)}</div></div>`).join('') : '<div class="small muted">Belum ada nilai TP.</div>';
  };
  var segarkanBaris = tr => {
    var x = muridById(tr.dataset.sid), h = hitungKerja(x);
    $('[data-lm]', tr).textContent = f1(h.rataLM); $('[data-lm]', tr).title = h.rincianLM.map(z => z.nama + ': ' + f1(z.nilai)).join(' | ');
    $('[data-na]', tr).textContent = f0(h.na);
    $('[data-pr]', tr).innerHTML = chipPredikat(h.na, m);
    $('[data-desk]', tr).textContent = deskripsi(x, m, h) || '–';
  };
  var grafikLambat = debounce(grafikTP, 500);
  var setSel = (inp, val) => {
    var tr = inp.closest('tr'), k = kerja[tr.dataset.sid];
    val = String(val).trim().replace(',', '.');
    inp.value = val;
    if (inp.dataset.sas) k.sas = val; else if (inp.dataset.sts) k.sts = val; else if (inp.dataset.lmId) k._lm[inp.dataset.lmId] = val; else k._tp[inp.dataset.tp] = val;
    inp.className = 'gin ' + kelasNilai(val);
  };

  draw();
  v.oninput = e => {
    var inp = e.target;
    if (!inp.classList.contains('gin')) return;
    setSel(inp, inp.value); segarkanBaris(inp.closest('tr')); tandaiBerubah(); grafikLambat();
  };
  v.onkeydown = e => {
    var inp = e.target; if (!inp.classList.contains('gin')) return;
    var r = +inp.dataset.r, c = +inp.dataset.c, nr = r, nc = c;
    if (e.key === 'Enter' || e.key === 'ArrowDown') nr = r + 1; else if (e.key === 'ArrowUp') nr = r - 1;
    else if (e.key === 'ArrowRight' && inp.selectionStart === inp.value.length) nc = c + 1;
    else if (e.key === 'ArrowLeft' && inp.selectionStart === 0) nc = c - 1; else return;
    var t = $(`.gin[data-r="${nr}"][data-c="${nc}"]`, v);
    if (t) { e.preventDefault(); t.focus(); t.select(); }
  };
  v.addEventListener('paste', e => {
    var inp = e.target; if (!inp.classList || !inp.classList.contains('gin')) return;
    var tx = (e.clipboardData || window.clipboardData).getData('text');
    if (!/[\t\n]/.test(tx.trim())) return;
    e.preventDefault();
    var r0 = +inp.dataset.r, c0 = +inp.dataset.c, n = 0;
    tx.replace(/\r/g, '').replace(/\n$/, '').split('\n').forEach((line, i) => line.split('\t').forEach((val, j) => {
      var t = $(`.gin[data-r="${r0 + i}"][data-c="${c0 + j}"]`, v); if (t) { setSel(t, val); n++; }
    }));
    $$('#gridN tbody tr', v).forEach(segarkanBaris); tandaiBerubah(); grafikLambat();
    toast(n + ' sel ditempel');
  });
  v.onchange = e => {
    if (e.target.id !== 'nAgama') return;
    var nv = e.target.value, lanjut = () => { S.nAgama = nv; S.dirty = false; draw(); };
    if (S.dirty) konfirmasi('Perubahan belum disimpan', 'Ganti agama tanpa menyimpan?', 'Ganti', true).then(ok => ok ? lanjut() : (e.target.value = S.nAgama)); else lanjut();
  };
  v.onclick = e => {
    var b;
    if ((b = e.target.closest('[data-mp]'))) {
      var id = b.dataset.mp, lanjut = () => { S.nMapel = id; S.dirty = false; draw(); };
      if (S.dirty) konfirmasi('Perubahan belum disimpan', 'Pindah mapel tanpa menyimpan?', 'Pindah', true).then(ok => ok && lanjut()); else lanjut();
    } else if ((b = e.target.closest('[data-desk]'))) {
      var tr = b.closest('tr'), x = muridById(tr.dataset.sid), k = kerja[x.id];
      var oto = deskripsiOtomatis(x, m, hitungKerja(x));
      var md = modal({
        title: 'Deskripsi capaian — ' + x.nama,
        body: `<div class="sec-title">1. Deskripsi asli berdasarkan nilai TP</div><div class="preview-desk" id="deskAsli">${esc(oto || 'Belum ada nilai TP.')}</div>
          <div class="sec-title">2. Saran penyuntingan Gemini (opsional)</div><div class="row" style="gap:8px;align-items:center"><input class="inp" id="gemModel" value="gemini-2.5-flash" style="max-width:210px" aria-label="Model Gemini"><button class="btn soft sm" type="button" data-gem>Buat saran AI</button><button class="btn ghost sm" type="button" data-key>Atur API Key</button></div>
          <textarea class="inp" id="deskAI" rows="3" readonly placeholder="Saran AI akan tampil di sini">${esc(k.deskripsi_ai || '')}</textarea>
          <div class="sec-title">3. Deskripsi final untuk rapor (disetujui guru)</div><textarea class="inp" id="dsk" rows="4">${esc(k.deskripsi_final || k.deskripsi_manual || oto)}</textarea>
          <p class="small muted">AI hanya menyunting teks deskripsi TP. Periksa hasilnya sebelum menyetujui. Tanpa API/internet, deskripsi asli tetap dapat digunakan.</p>`,
        foot: `<button class="btn ghost" data-oto>Pakai otomatis</button><span class="sp"></span><button class="btn ghost" data-x>Batal</button><button class="btn" data-ok>Setujui & Terapkan</button>`
      });
      $('[data-key]', md.el).onclick = () => {
        var km = modal({ title: 'Pengaturan Gemini API', body: `<p class="small muted">Masukkan API key Google AI Studio. Kunci disimpan terenkripsi oleh fasilitas keamanan sistem operasi pada perangkat ini dan tidak dimasukkan ke file aplikasi.</p><input class="inp" id="gemKeyInput" type="password" autocomplete="new-password" placeholder="Gemini API key">`, foot: `<button class="btn ghost" data-x>Batal</button><button class="btn" data-save-key>Simpan key</button>` });
        $('[data-save-key]', km.el).onclick = async () => {
          var key = $('#gemKeyInput', km.el).value.trim(); if (!key) return toast('API key belum diisi.', 'err');
          try { await window.desktop.geminiSetKey(key); km.close(); toast('API key tersimpan secara terenkripsi.'); }
          catch (err) { toast(err.message || 'Gagal menyimpan API key.', 'err'); }
        };
      };
      $('[data-gem]', md.el).onclick = async () => {
        var btn = $('[data-gem]', md.el), prefixNama = 'Ananda ' + panggilan(x) + ' ', source = oto.indexOf(prefixNama) === 0 ? oto.slice(prefixNama.length) : oto;
        if (!source) return toast('Belum ada deskripsi TP untuk disunting.', 'err');
        btn.disabled = true; btn.textContent = 'Memproses…';
        try {
          var hasil = await window.desktop.geminiGenerate({ sourceText: source, model: $('#gemModel', md.el).value });
          k.deskripsi_ai = hasil.text; $('#deskAI', md.el).value = hasil.text;
          $('#dsk', md.el).value = hasil.text;
          toast('Saran Gemini berhasil dibuat. Periksa sebelum menyetujui.');
        } catch (err) { toast(err.message || 'Gemini tidak dapat dihubungi.', 'err'); }
        finally { btn.disabled = false; btn.textContent = 'Buat saran AI'; }
      };
      $('[data-oto]', md.el).onclick = () => { k.deskripsi_manual = ''; k.deskripsi_final = ''; k.deskripsi_tp = oto; segarkanBaris(tr); $('[data-desk]', tr).classList.remove('manual'); tandaiBerubah(); md.close(); };
      $('[data-ok]', md.el).onclick = () => { var t = $('#dsk', md.el).value.trim(); k.deskripsi_tp = oto; k.deskripsi_final = t; k.deskripsi_manual = ''; segarkanBaris(tr); $('[data-desk]', tr).classList.toggle('manual', !!t && t !== oto); tandaiBerubah(); md.close(); };
    } else if (e.target.closest('#btnSimpan')) {
      if ($$('.gin.bad', v).length) { toast('Ada nilai yang tidak valid (harus 0–100).', 'err'); return; }
      var rows = murid.map(x => {
        var k = kerja[x.id], o = {};
        Object.keys(k._tp).forEach(t => { if (String(k._tp[t]).trim() !== '') o[t] = num(k._tp[t]); });
        var h = hitungKerja(x);
        var nilaiLMInput = {}; Object.keys(k._lm).forEach(id => { if (String(k._lm[id]).trim() !== '') nilaiLMInput[id] = num(k._lm[id]); });
        return { siswa_id: x.id, nilai_tp: o, nilai_lm: nilaiLMInput, sts: String(k.sts).trim() === '' ? '' : num(k.sts), sas: String(k.sas).trim() === '' ? '' : num(k.sas), na: h.na == null ? '' : h.na, deskripsi_manual: k.deskripsi_manual || '', deskripsi_tp: deskripsiOtomatis(x, m, h), deskripsi_ai: k.deskripsi_ai || '', deskripsi_final: k.deskripsi_final || '' };
      });
      call('simpanNilai', { mapel_id: m.id, rows: rows }, 'Menyimpan nilai…').then(() => {
        rows.forEach(r => {
          var key = r.siswa_id + '|' + m.id, ex = S.nilai[key];
          var baru = { siswa_id: r.siswa_id, mapel_id: m.id, nilai_tp: JSON.stringify(r.nilai_tp), nilai_lm: JSON.stringify(r.nilai_lm || {}), sts: r.sts, sas: r.sas, na: r.na, deskripsi_manual: r.deskripsi_manual, deskripsi_tp: r.deskripsi_tp, deskripsi_ai: r.deskripsi_ai, deskripsi_final: r.deskripsi_final };
          if (ex) Object.assign(ex, baru); else S.d.nilai.push(baru);
        });
        reindex(); tandaiBerubah(false); toast('Nilai ' + (m.singkatan || m.nama) + ' tersimpan');
        $$('.mchip', v).forEach(c => { var d = $('.dot', c); d.className = 'dot ' + statusMapel(mapelById(c.dataset.mp)); });
      }).catch(gagal);
    }
  };
};

/* =========================================================
   KOKURIKULER
   ========================================================= */
VIEWS.koko = function (v) {
  if (perluMurid(v)) return;
  S.tabKoko = S.d.kegiatanKoko.length ? (S.tabKoko || 'nilai') : 'kegiatan';
  v.innerHTML = kartuTemplate() + `<div class="preview-desk" style="margin-bottom:14px">${ic('sparkle')} Kokurikuler menggantikan P5. Pilih kegiatan, tentukan dimensi profil lulusan yang dikembangkan, lalu beri capaian <b>Berkembang</b>, <b>Cakap</b>, atau <b>Mahir</b>. Deskripsi rapor tersusun otomatis.</div>
    <div class="tabs"><button data-tab="nilai">Penilaian</button><button data-tab="kegiatan">Kegiatan & dimensi</button></div><div id="tabIsi"></div>`;
  var buka = t => {
    if (S.dirty) return konfirmasi('Perubahan belum disimpan', 'Pindah tab tanpa menyimpan?', 'Pindah', true).then(ok => { if (ok) { S.dirty = false; buka(t); } });
    S.tabKoko = t; $$('.tabs button', v).forEach(b => b.classList.toggle('on', b.dataset.tab === t));
    (t === 'nilai' ? kokoNilai : kokoKegiatan)($('#tabIsi'));
  };
  $('.tabs', v).onclick = e => { var b = e.target.closest('button'); if (b) buka(b.dataset.tab); };
  buka(S.tabKoko);
};
function kokoKegiatan(el) {
  var list = S.d.kegiatanKoko.map(k => ({ id: k.id, nama_kegiatan: k.nama_kegiatan, dimensi: k._dim.slice() }));
  var draw = () => {
    el.innerHTML = `${list.map((k, i) => `<div class="card" style="margin-bottom:12px"><div class="card-b">
        <div class="row"><span class="av">${i + 1}</span><input class="inp" style="flex:1" data-i="${i}" value="${esc(k.nama_kegiatan)}" placeholder="Nama kegiatan / tema, mis. Gerakan Sekolah Sehat">
        <button class="btn ghost icon sm" data-del="${i}">${ic('trash')}</button></div>
        <div class="sec-title" style="margin-top:12px">Dimensi profil lulusan yang dikembangkan</div>
        <div class="dimchips">${DIMENSI.map(d => `<button class="dimchip ${k.dimensi.indexOf(d) >= 0 ? 'on' : ''}" data-i="${i}" data-dim="${esc(d)}">${esc(DIMENSI_PENDEK[d] || d)}</button>`).join('')}</div>
      </div></div>`).join('') || kosong('sparkle', 'Belum ada kegiatan kokurikuler', 'Tambahkan kegiatan yang dilaksanakan semester ini, misalnya pembelajaran kolaboratif lintas mapel atau Gerakan 7 Kebiasaan Anak Indonesia Hebat.', '')}
      <button class="btn soft" id="tbhK">${ic('plus')} Tambah kegiatan</button>${savebar('Simpan kegiatan')}`;
    tandaiBerubah(S.dirty);
  };
  draw();
  el.oninput = e => { if (e.target.dataset.i != null && e.target.tagName === 'INPUT') { list[e.target.dataset.i].nama_kegiatan = e.target.value; tandaiBerubah(); } };
  el.onclick = e => {
    var b;
    if ((b = e.target.closest('[data-dim]'))) { var k = list[b.dataset.i], d = b.dataset.dim, p = k.dimensi.indexOf(d); if (p >= 0) k.dimensi.splice(p, 1); else k.dimensi.push(d); b.classList.toggle('on'); tandaiBerubah(); }
    else if ((b = e.target.closest('[data-del]'))) { list.splice(+b.dataset.del, 1); draw(); tandaiBerubah(); }
    else if (e.target.closest('#tbhK')) { list.push({ id: '', nama_kegiatan: '', dimensi: [] }); draw(); tandaiBerubah(); }
    else if (e.target.closest('#btnSimpan')) {
      if (list.some(k => !k.nama_kegiatan.trim())) { toast('Nama kegiatan belum diisi.', 'err'); return; }
      call('simpanKegiatanKoko', { list: list }).then(r => { S.d.kegiatanKoko = r; reindex(); tandaiBerubah(false); toast('Kegiatan tersimpan'); list = S.d.kegiatanKoko.map(k => ({ id: k.id, nama_kegiatan: k.nama_kegiatan, dimensi: k._dim.slice() })); draw(); }).catch(gagal);
    }
  };
}
function kokoNilai(el) {
  var kg = S.d.kegiatanKoko;
  if (!kg.length) { el.innerHTML = kosong('sparkle', 'Belum ada kegiatan', 'Buat kegiatan kokurikuler terlebih dahulu di tab “Kegiatan & dimensi”.', ''); return; }
  if (!S.kokoKeg || !kg.find(k => k.id === S.kokoKeg)) S.kokoKeg = kg[0].id;
  var kerja = {};
  MA().forEach(m => { var r = S.koko[m.id]; kerja[m.id] = { _cap: clone(r ? r._cap : {}), deskripsi_manual: r ? r.deskripsi_manual : '' }; });
  var deskKerja = m => { var old = S.koko[m.id]; S.koko[m.id] = kerja[m.id]; var t = deskripsiKoko(m); S.koko[m.id] = old; return t; };
  var draw = () => {
    var k = kg.find(x => x.id === S.kokoKeg);
    el.innerHTML = `<div class="chips-scroll" style="margin-bottom:12px">${kg.map(x => `<button class="mchip ${x.id === k.id ? 'on' : ''}" data-kg="${x.id}">${esc(x.nama_kegiatan)}</button>`).join('')}</div>
      ${!k._dim.length ? '<div class="card card-b muted">Kegiatan ini belum memiliki dimensi. Atur di tab “Kegiatan & dimensi”.</div>' : `
      <div class="tbl-wrap"><table class="tbl fit"><thead><tr><th class="stick" style="min-width:180px">${sebutan()}</th>
        ${k._dim.map(d => `<th style="text-align:center;white-space:normal;min-width:110px">${esc(DIMENSI_PENDEK[d] || d)}<br><select class="inp" data-all="${esc(d)}" style="padding:3px 6px;font-size:11px;margin-top:4px;text-transform:none"><option value="">Isi semua…</option>${LEVEL_KOKO.map(l => `<option>${l}</option>`).join('')}</select></th>`).join('')}
        <th>Deskripsi kokurikuler di rapor</th></tr></thead>
        <tbody>${MA().map((m, r) => {
          var cap = (kerja[m.id]._cap[k.id] || {});
          return `<tr data-sid="${m.id}"><td class="stick nm">${r + 1}. ${esc(m.nama)}</td>
            ${k._dim.map(d => `<td class="num"><button class="lv ${cap[d] ? 'l-' + cap[d] : ''}" data-d="${esc(d)}">${cap[d] || '—'}</button></td>`).join('')}
            <td><div class="desk-mini ${kerja[m.id].deskripsi_manual ? 'manual' : ''}" data-desk style="cursor:pointer">${esc(deskKerja(m) || '–')}</div></td></tr>`;
        }).join('')}</tbody></table></div>
      <p class="small muted">Klik tombol capaian untuk berganti: — → Berkembang → Cakap → Mahir. Deskripsi menggabungkan semua kegiatan.</p>`}
      ${savebar('Simpan penilaian')}`;
    tandaiBerubah(S.dirty);
  };
  var setLv = (sid, d, val) => {
    var c = kerja[sid]._cap; c[S.kokoKeg] = c[S.kokoKeg] || {};
    if (val) c[S.kokoKeg][d] = val; else delete c[S.kokoKeg][d];
  };
  var segar = tr => { var m = muridById(tr.dataset.sid); $('[data-desk]', tr).textContent = deskKerja(m) || '–'; };
  draw();
  el.onchange = e => {
    var s = e.target.closest('[data-all]'); if (!s || !s.value) return;
    var d = s.dataset.all;
    $$('tbody tr', el).forEach(tr => { setLv(tr.dataset.sid, d, s.value); var b = $(`[data-d="${CSS.escape(d)}"]`, tr); b.textContent = s.value; b.className = 'lv l-' + s.value; segar(tr); });
    s.value = ''; tandaiBerubah();
  };
  el.onclick = e => {
    var b;
    if ((b = e.target.closest('[data-kg]'))) { S.kokoKeg = b.dataset.kg; draw(); }
    else if ((b = e.target.closest('.lv'))) {
      var tr = b.closest('tr'), cur = b.textContent.trim(), i = LEVEL_KOKO.indexOf(cur), nv = i < 0 ? LEVEL_KOKO[0] : LEVEL_KOKO[i + 1] || '';
      setLv(tr.dataset.sid, b.dataset.d, nv); b.textContent = nv || '—'; b.className = 'lv ' + (nv ? 'l-' + nv : ''); segar(tr); tandaiBerubah();
    } else if ((b = e.target.closest('[data-desk]'))) {
      var tr2 = b.closest('tr'), m = muridById(tr2.dataset.sid), kw = kerja[m.id];
      var old = S.koko[m.id]; S.koko[m.id] = { _cap: kw._cap, deskripsi_manual: '' }; var oto = deskripsiKokoOtomatis(m); S.koko[m.id] = old;
      var md = modal({ title: 'Deskripsi kokurikuler — ' + m.nama, body: `<div class="sec-title">Otomatis</div><div class="preview-desk">${esc(oto || '–')}</div><div class="sec-title">Dipakai di rapor</div><textarea class="inp" id="dsk" rows="5">${esc(kw.deskripsi_manual || oto)}</textarea>`,
        foot: `<button class="btn ghost" data-oto>Pakai otomatis</button><span class="sp"></span><button class="btn ghost" data-x>Batal</button><button class="btn" data-ok>Terapkan</button>` });
      $('[data-oto]', md.el).onclick = () => { kw.deskripsi_manual = ''; segar(tr2); b.classList.remove('manual'); tandaiBerubah(); md.close(); };
      $('[data-ok]', md.el).onclick = () => { var t = $('#dsk', md.el).value.trim(); kw.deskripsi_manual = t === oto ? '' : t; segar(tr2); b.classList.toggle('manual', !!kw.deskripsi_manual); tandaiBerubah(); md.close(); };
    } else if (e.target.closest('#btnSimpan')) {
      var rows = MA().map(m => ({ siswa_id: m.id, capaian: kerja[m.id]._cap, deskripsi_manual: kerja[m.id].deskripsi_manual || '' }));
      call('simpanNilaiKoko', { rows: rows }).then(() => {
        rows.forEach(r => { var ex = S.koko[r.siswa_id]; var baru = { siswa_id: r.siswa_id, capaian: JSON.stringify(r.capaian), deskripsi_manual: r.deskripsi_manual }; if (ex) Object.assign(ex, baru); else S.d.nilaiKoko.push(baru); });
        reindex(); tandaiBerubah(false); toast('Penilaian kokurikuler tersimpan');
      }).catch(gagal);
    }
  };
}

/* =========================================================
   EKSTRAKURIKULER
   ========================================================= */
VIEWS.ekskul = function (v) {
  if (perluMurid(v)) return;
  S.tabEks = S.d.ekskul.length ? (S.tabEks || 'nilai') : 'daftar';
  v.innerHTML = kartuTemplate() + `<div class="tabs"><button data-tab="nilai">Penilaian</button><button data-tab="daftar">Daftar ekstrakurikuler</button></div><div id="tabIsi"></div>`;
  var buka = t => {
    if (S.dirty) return konfirmasi('Perubahan belum disimpan', 'Pindah tab tanpa menyimpan?', 'Pindah', true).then(ok => { if (ok) { S.dirty = false; buka(t); } });
    S.tabEks = t; $$('.tabs button', v).forEach(b => b.classList.toggle('on', b.dataset.tab === t));
    (t === 'nilai' ? eksNilai : eksDaftar)($('#tabIsi'));
  };
  $('.tabs', v).onclick = e => { var b = e.target.closest('button'); if (b) buka(b.dataset.tab); };
  buka(S.tabEks);
};
function eksDaftar(el) {
  var list = clone(S.d.ekskul);
  var draw = () => {
    el.innerHTML = `<div class="card"><div class="card-b">${list.map((e, i) => `<div class="row" style="padding:6px 0;flex-wrap:nowrap"><span class="av">${i + 1}</span>
        <input class="inp" data-i="${i}" data-f="nama" value="${esc(e.nama)}" placeholder="Nama ekstrakurikuler">
        <input class="inp" data-i="${i}" data-f="pembina" value="${esc(e.pembina)}" placeholder="Pembina (opsional)">
        <button class="btn ghost icon sm" data-del="${i}">${ic('trash')}</button></div>`).join('') || '<div class="muted small">Belum ada ekstrakurikuler.</div>'}
      <button class="btn soft sm mt" id="tbhE">${ic('plus')} Tambah ekstrakurikuler</button></div></div>${savebar('Simpan daftar')}`;
    tandaiBerubah(S.dirty);
  };
  draw();
  el.oninput = e => { var x = e.target; if (x.dataset.f) { list[x.dataset.i][x.dataset.f] = x.value; tandaiBerubah(); } };
  el.onclick = e => {
    var b;
    if ((b = e.target.closest('[data-del]'))) { list.splice(+b.dataset.del, 1); draw(); tandaiBerubah(); }
    else if (e.target.closest('#tbhE')) { list.push({ id: '', nama: '', pembina: '' }); draw(); tandaiBerubah(); }
    else if (e.target.closest('#btnSimpan')) {
      call('simpanEkskul', { list: list.filter(x => x.nama.trim()) }).then(r => { S.d.ekskul = r; reindex(); list = clone(r); draw(); tandaiBerubah(false); toast('Daftar ekstrakurikuler tersimpan'); }).catch(gagal);
    }
  };
}
function eksNilai(el) {
  var E = S.d.ekskul;
  if (!E.length) { el.innerHTML = kosong('medal', 'Belum ada ekstrakurikuler', 'Isi daftar ekstrakurikuler terlebih dahulu.', ''); return; }
  var kerja = {};
  MA().forEach(m => { var r = S.eks[m.id]; var d = clone(r ? r._data : []); while (d.length < 4) d.push({ ekskul_id: '', predikat: '', keterangan: '' }); kerja[m.id] = d.slice(0, 4); });
  var ket = s => { var e = ekskulById(s.ekskul_id); return e ? (s.keterangan || ketEkskulOtomatis(e.nama, s.predikat)) : ''; };
  var slot = (m, i) => { var s = kerja[m.id][i]; return `<td><div class="row" style="flex-wrap:nowrap;gap:4px">
      <select class="inp" data-s="${i}" data-f="ekskul_id" style="padding:6px;min-width:120px"><option value="">—</option>${E.map(e => `<option value="${e.id}" ${s.ekskul_id === e.id ? 'selected' : ''}>${esc(e.nama)}</option>`).join('')}</select>
      <select class="inp" data-s="${i}" data-f="predikat" style="padding:6px;min-width:105px"><option value="">Predikat</option>${PREDIKAT_EKS.map(p => `<option ${s.predikat === p ? 'selected' : ''}>${p}</option>`).join('')}</select></div></td>`; };
  el.innerHTML = `<div class="card" style="margin-bottom:12px"><div class="card-b row">
      <span class="b small">Isi cepat:</span>
      <select class="inp" id="qE" style="width:auto">${E.map(e => `<option value="${e.id}">${esc(e.nama)}</option>`).join('')}</select>
      <select class="inp" id="qP" style="width:auto">${PREDIKAT_EKS.map(p => `<option ${p === 'Baik' ? 'selected' : ''}>${p}</option>`).join('')}</select>
      <select class="inp" id="qS" style="width:auto"><option value="0">ke kolom Ekskul 1</option><option value="1">ke kolom Ekskul 2</option><option value="2">ke kolom Ekskul 3</option><option value="3">ke kolom Ekskul 4</option></select>
      <button class="btn soft sm" id="qGo">Terapkan ke semua ${sebutan().toLowerCase()}</button></div></div>
    <div class="tbl-wrap"><table class="tbl fit"><thead><tr><th class="stick" style="min-width:180px">${sebutan()}</th><th>Ekskul 1</th><th>Ekskul 2</th><th>Ekskul 3</th><th>Ekskul 4</th><th>Keterangan di rapor</th></tr></thead>
    <tbody>${MA().map((m, r) => `<tr data-sid="${m.id}"><td class="stick nm">${r + 1}. ${esc(m.nama)}</td>${slot(m, 0)}${slot(m, 1)}${slot(m, 2)}${slot(m, 3)}<td><div class="desk-mini" data-ket style="cursor:pointer;min-width:220px" title="Klik untuk mengubah"></div></td></tr>`).join('')}</tbody></table></div>
    ${savebar('Simpan ekstrakurikuler')}`;
  var segar = tr => { $('[data-ket]', tr).innerHTML = kerja[tr.dataset.sid].filter(s => s.ekskul_id).map(s => '• ' + esc(ket(s))).join('<br>') || '–'; };
  $$('tbody tr', el).forEach(segar);
  el.onchange = e => {
    var x = e.target; if (x.dataset.s == null) return;
    var tr = x.closest('tr'), s = kerja[tr.dataset.sid][+x.dataset.s];
    s[x.dataset.f] = x.value; s.keterangan = ''; if (x.dataset.f === 'ekskul_id' && x.value && !s.predikat) { s.predikat = 'Baik'; $(`[data-s="${x.dataset.s}"][data-f=predikat]`, tr).value = 'Baik'; }
    segar(tr); tandaiBerubah();
  };
  el.onclick = e => {
    var b;
    if (e.target.closest('#qGo')) {
      var id = $('#qE').value, p = $('#qP').value, si = +$('#qS').value;
      $$('tbody tr', el).forEach(tr => { var s = kerja[tr.dataset.sid][si]; s.ekskul_id = id; s.predikat = p; s.keterangan = ''; $(`[data-s="${si}"][data-f=ekskul_id]`, tr).value = id; $(`[data-s="${si}"][data-f=predikat]`, tr).value = p; segar(tr); });
      tandaiBerubah(); toast('Diterapkan ke semua ' + sebutan().toLowerCase());
    } else if ((b = e.target.closest('[data-ket]'))) {
      var tr = b.closest('tr'), m = muridById(tr.dataset.sid), sl = kerja[m.id].filter(s => s.ekskul_id);
      if (!sl.length) return;
      var md = modal({ title: 'Keterangan ekstrakurikuler — ' + m.nama, body: sl.map((s, i) => `<label class="field" style="margin-bottom:10px"><span>${esc(ekskulById(s.ekskul_id).nama)} · ${esc(s.predikat || '-')}</span><textarea class="inp" rows="2" data-k="${i}">${esc(ket(s))}</textarea></label>`).join(''),
        foot: `<button class="btn ghost" data-x>Batal</button><button class="btn" data-ok>Terapkan</button>` });
      $('[data-ok]', md.el).onclick = () => { $$('[data-k]', md.el).forEach(t => { var s = sl[+t.dataset.k], e2 = ekskulById(s.ekskul_id); s.keterangan = t.value.trim() === ketEkskulOtomatis(e2.nama, s.predikat) ? '' : t.value.trim(); }); segar(tr); tandaiBerubah(); md.close(); };
    } else if (e.target.closest('#btnSimpan')) {
      var rows = MA().map(m => ({ siswa_id: m.id, data: kerja[m.id].filter(s => s.ekskul_id) }));
      call('simpanNilaiEkskul', { rows: rows }).then(() => {
        rows.forEach(r => { var ex = S.eks[r.siswa_id], baru = { siswa_id: r.siswa_id, data: JSON.stringify(r.data) }; if (ex) Object.assign(ex, baru); else S.d.nilaiEkskul.push(baru); });
        reindex(); tandaiBerubah(false); toast('Ekstrakurikuler tersimpan');
      }).catch(gagal);
    }
  };
}

/* =========================================================
   KEHADIRAN & CATATAN
   ========================================================= */
VIEWS.hadir = function (v) {
  if (perluMurid(v)) return;
  var smt2 = P('semester') === '2', opsi = keputusanOpsi();
  var kerja = {};
  MA().forEach(m => { var h = S.hadir[m.id] || {}; kerja[m.id] = { sakit: h.sakit || '', izin: h.izin || '', alpa: h.alpa || '', catatan: h.catatan || '', keputusan: h.keputusan || '', tanggapan: h.tanggapan || '' }; });
  v.innerHTML = kartuTemplate() + `<div class="row" style="margin-bottom:12px"><span class="small muted">Isi jumlah hari tidak hadir dan catatan wali kelas. ${smt2 ? 'Semester genap: tentukan juga keputusan kenaikan kelas.' : ''}</span><span class="sp"></span>
      <button class="btn ghost" id="otoCat">${ic('sparkle')} Isi catatan otomatis (yang kosong)</button></div>
    <div class="tbl-wrap"><table class="tbl fit"><thead><tr><th class="stick" style="min-width:170px">${sebutan()}</th><th class="num">Sakit</th><th class="num">Izin</th><th class="num">Tanpa ket.</th><th style="min-width:320px">Catatan wali kelas</th>${smt2 ? '<th>Keputusan</th>' : ''}</tr></thead>
    <tbody>${MA().map((m, r) => { var k = kerja[m.id]; return `<tr data-sid="${m.id}"><td class="stick nm">${r + 1}. ${esc(m.nama)}</td>
      ${['sakit', 'izin', 'alpa'].map((f, c) => `<td class="num"><input class="gin" data-f="${f}" data-r="${r}" data-c="${c}" value="${esc(k[f])}" inputmode="numeric"></td>`).join('')}
      <td><div class="row" style="flex-wrap:nowrap;gap:6px;align-items:flex-start"><textarea class="inp" data-f="catatan" rows="2" style="min-height:52px;font-size:12.5px">${esc(k.catatan)}</textarea><button class="btn ghost icon sm" data-oto title="Buat catatan otomatis">${ic('sparkle')}</button></div></td>
      ${smt2 ? `<td><select class="inp" data-f="keputusan" style="min-width:190px"><option value="">—</option>${opsi.map(o => `<option ${k.keputusan === o ? 'selected' : ''}>${o}</option>`).join('')}</select></td>` : ''}</tr>`; }).join('')}</tbody></table></div>
    ${smt2 ? `<button class="btn soft sm mt" id="semuaNaik">Set semua: ${esc(opsi[0])}</button>` : ''}
    ${savebar('Simpan kehadiran & catatan')}`;
  v.oninput = e => { var x = e.target, tr = x.closest('tr'); if (!tr || !x.dataset.f) return; kerja[tr.dataset.sid][x.dataset.f] = x.value; tandaiBerubah(); };
  v.onchange = v.oninput;
  v.onkeydown = e => {
    var inp = e.target; if (!inp.classList.contains('gin') || (e.key !== 'Enter' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    var t = $(`.gin[data-r="${+inp.dataset.r + (e.key === 'ArrowUp' ? -1 : 1)}"][data-c="${inp.dataset.c}"]`, v); if (t) { e.preventDefault(); t.focus(); t.select(); }
  };
  v.onclick = e => {
    var b;
    if ((b = e.target.closest('[data-oto]'))) { var tr = b.closest('tr'), m = muridById(tr.dataset.sid), t = catatanOtomatis(m); if (!t) return toast('Belum ada nilai untuk dasar catatan.', 'err'); $('[data-f=catatan]', tr).value = t; kerja[m.id].catatan = t; tandaiBerubah(); }
    else if (e.target.closest('#otoCat')) { var n = 0; $$('tbody tr', v).forEach(tr => { var m = muridById(tr.dataset.sid); if (!kerja[m.id].catatan.trim()) { var t = catatanOtomatis(m); if (t) { kerja[m.id].catatan = t; $('[data-f=catatan]', tr).value = t; n++; } } }); tandaiBerubah(); toast(n + ' catatan dibuat — silakan sesuaikan'); }
    else if (e.target.closest('#semuaNaik')) { $$('tbody tr', v).forEach(tr => { kerja[tr.dataset.sid].keputusan = opsi[0]; $('[data-f=keputusan]', tr).value = opsi[0]; }); tandaiBerubah(); }
    else if (e.target.closest('#btnSimpan')) {
      var rows = MA().map(m => Object.assign({ siswa_id: m.id }, kerja[m.id]));
      call('simpanKehadiran', { rows: rows }).then(() => {
        rows.forEach(r => { var ex = S.hadir[r.siswa_id]; if (ex) Object.assign(ex, r); else S.d.kehadiran.push(r); });
        reindex(); tandaiBerubah(false); toast('Kehadiran & catatan tersimpan');
      }).catch(gagal);
    }
  };
};

/* =========================================================
   ANALISIS MURID
   ========================================================= */
VIEWS.analisis = function (v) {
  if (perluMurid(v)) return;
  if (!S.anMurid || !muridById(S.anMurid)) S.anMurid = MA()[0].id;
  var draw = () => {
    bersihkanGrafik();
    var m = muridById(S.anMurid), idx = MA().indexOf(m), rk = peringkat(), rm = rataMurid(m), h = S.hadir[m.id] || {};
    var mp = mapelMurid(m), data = mp.map(x => ({ m: x, h: hitung(m, x), k: rataKelasMapel(x) }));
    var lemah = []; data.forEach(o => o.h.skor.filter(s => s.v < kktp(o.m)).forEach(s => lemah.push({ m: o.m, s: s })));
    lemah.sort((a, b) => a.s.v - b.s.v);
    var kuat = data.filter(o => o.h.na != null).sort((a, b) => b.h.na - a.h.na).slice(0, 3);
    var kk = S.koko[m.id], dimCap = {};
    if (kk) S.d.kegiatanKoko.forEach(k => { var c = kk._cap[k.id] || {}; k._dim.forEach(d => { if (c[d]) dimCap[d] = c[d]; }); });
    v.innerHTML = `<div class="row" style="margin-bottom:14px">
        <button class="btn ghost icon" id="prv">${ic('left')}</button>
        <select class="inp" id="pilihM" style="max-width:340px">${MA().map(x => `<option value="${x.id}" ${x.id === m.id ? 'selected' : ''}>${esc(x.nama)}</option>`).join('')}</select>
        <button class="btn ghost icon" id="nxt">${ic('right')}</button><span class="sp"></span>
        <button class="btn" id="cetakIni">${ic('printer')} Cetak rapor ${esc(panggilan(m))}</button></div>
      <div class="grid g4">
        <div class="card kpi" style="grid-column:span 2"><span class="av" style="width:52px;height:52px;font-size:17px">${esc(inisial(m.nama))}</span><div style="min-width:0">
          <div class="b" style="font-size:16px">${esc(m.nama)}</div><div class="small muted">NIS ${esc(m.nis || '–')} · NISN ${esc(m.nisn || '–')} · ${esc(normAgama(m.agama) || '')}</div>
          <div class="small muted">${sebutan()} ke-${idx + 1} dari ${MA().length}</div></div></div>
        <div class="card kpi"><div class="ic">${ic('target')}</div><div><div class="l">Rata-rata</div><div class="v">${f1(rm.rata)}</div><div class="s">Kelas: ${f1(avg(rk.list.map(x => x.rata)))}</div></div></div>
        <div class="card kpi"><div class="ic">${ic('calendar')}</div><div><div class="l">Tidak hadir</div><div class="v">${num(h.sakit) + num(h.izin) + num(h.alpa)} <span class="small muted">hari</span></div><div class="s">S ${num(h.sakit)} · I ${num(h.izin)} · A ${num(h.alpa)}</div></div></div>
      </div>
      <div class="grid g-73 mt">
        <div class="card"><div class="card-h"><h3>Nilai akhir dibanding rata-rata kelas</h3></div><div class="card-b"><div class="chart-box"><canvas id="chBand"></canvas></div></div></div>
        <div class="card"><div class="card-h"><h3>Profil capaian</h3><span class="sub">bentuk radar</span></div><div class="card-b"><div class="chart-box"><canvas id="chRadar"></canvas></div></div></div>
      </div>
      <div class="grid g3 mt">
        <div class="card"><div class="card-h"><h3>Paling menonjol</h3></div><div class="card-b">${kuat.map(o => `<div class="rank-it"><span class="ic" style="width:34px;height:34px;border-radius:10px;background:var(--ok-bg);color:var(--ok);display:grid;place-items:center">${ic('trophy')}</span><div><div class="b small">${esc(namaMapelUntuk(o.m, m))}</div>${chipPredikat(o.h.na, o.m)}</div><span class="score">${o.h.na}</span></div>`).join('') || '<div class="small muted">Belum ada nilai.</div>'}</div></div>
        <div class="card"><div class="card-h"><h3>TP yang perlu bimbingan</h3><span class="sub">${lemah.length} TP di bawah KKTP</span></div><div class="card-b" style="max-height:300px;overflow:auto">${lemah.slice(0, 8).map(o => `<div style="padding:7px 0;border-bottom:1px dashed var(--line)"><div class="row"><span class="b small">${esc(o.m.singkatan || o.m.nama)} · ${esc(o.s.tp.kode)}</span><span class="sp"></span><span class="chip c-pb">${o.s.v}</span></div><div class="small muted">${esc(o.s.tp.tujuan)}</div></div>`).join('') || '<div class="small muted">Semua TP sudah mencapai KKTP. Hebat!</div>'}</div></div>
        <div class="card"><div class="card-h"><h3>Kokurikuler & ekskul</h3></div><div class="card-b">
          ${Object.keys(dimCap).length ? Object.keys(dimCap).map(d => `<div class="row" style="padding:4px 0"><span class="small b">${esc(DIMENSI_PENDEK[d] || d)}</span><span class="sp"></span><span class="lv l-${dimCap[d]}" style="cursor:default;min-width:0">${dimCap[d]}</span></div>`).join('') : '<div class="small muted">Belum dinilai.</div>'}
          <div class="sec-title" style="margin-top:14px">Ekstrakurikuler</div>${ekskulMurid(m).map(e => `<div class="row small" style="padding:3px 0"><b>${esc(e.nama)}</b><span class="sp"></span><span class="chip c-b">${esc(e.predikat || '-')}</span></div>`).join('') || '<div class="small muted">Belum diisi.</div>'}
        </div></div>
      </div>`;
    var dd = data.filter(o => o.h.na != null);
    grafik($('#chBand'), {
      type: 'bar', data: { labels: dd.map(o => o.m.singkatan || o.m.nama), datasets: [
        { label: panggilan(m), data: dd.map(o => o.h.na), backgroundColor: brand(), borderRadius: 4, maxBarThickness: 22 },
        { label: 'Rata-rata kelas', data: dd.map(o => Math.round(o.k.rata * 10) / 10), backgroundColor: '#C3CAD9', borderRadius: 4, maxBarThickness: 22 }] },
      options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, useBorderRadius: true, borderRadius: 2 } }, tooltip: TOOLTIP },
        scales: { y: { min: 0, max: 100, border: { display: false } }, x: { grid: { display: false } } } }
    });
    grafik($('#chRadar'), {
      type: 'radar', data: { labels: dd.map(o => o.m.singkatan || o.m.nama), datasets: [
        { label: panggilan(m), data: dd.map(o => o.h.na), borderColor: brand(), backgroundColor: mix(brand(), '#ffffff', .78), borderWidth: 2, pointRadius: 3, pointBackgroundColor: brand() },
        { label: 'Kelas', data: dd.map(o => Math.round(o.k.rata)), borderColor: '#9AA3B8', backgroundColor: 'rgba(154,163,184,.08)', borderWidth: 1.5, borderDash: [4, 3], pointRadius: 0 }] },
      options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } }, tooltip: TOOLTIP },
        scales: { r: { min: 40, max: 100, ticks: { stepSize: 20, backdropColor: 'transparent', font: { size: 10 } }, pointLabels: { font: { weight: '700', size: 11 } } } } }
    });
    $('#pilihM').onchange = e => { S.anMurid = e.target.value; draw(); };
    $('#prv').onclick = () => { S.anMurid = MA()[(idx - 1 + MA().length) % MA().length].id; draw(); };
    $('#nxt').onclick = () => { S.anMurid = MA()[(idx + 1) % MA().length].id; draw(); };
    $('#cetakIni').onclick = () => { S.cetakPilih = [m.id]; go('cetak'); };
  };
  draw();
};

/* =========================================================
   LEGER
   ========================================================= */
function dataLeger() {
  var mp = mapelAktif(), rk = peringkat();
  var head = ['No', 'Nama', 'NIS'].concat(mp.map(m => m.singkatan || m.nama), ['Jumlah', 'Rata-rata', 'Peringkat', 'S', 'I', 'A']);
  var rows = MA().map((m, i) => {
    var r = rataMurid(m), h = S.hadir[m.id] || {};
    return [i + 1, m.nama, m.nis || ''].concat(mp.map(x => { var n = hitung(m, x).na; return n == null ? '' : n; }),
      [r.n ? r.jumlah : '', r.rata == null ? '' : Math.round(r.rata * 100) / 100, rk.rank[m.id] || '', num(h.sakit), num(h.izin), num(h.alpa)]);
  });
  return { mp: mp, head: head, rows: rows };
}
VIEWS.leger = function (v) {
  if (perluMurid(v)) return;
  var L = dataLeger(), mp = L.mp;
  var stat = mp.map(rataKelasMapel);
  S.legerRank = S.legerRank == null ? true : S.legerRank;
  var draw = () => {
    v.innerHTML = `<div class="row" style="margin-bottom:12px"><label class="row small b" style="cursor:pointer"><span class="switch"><input type="checkbox" id="tglRank" ${S.legerRank ? 'checked' : ''}><i></i></span> Tampilkan peringkat</label><span class="sp"></span>
        <button class="btn ghost" id="ekspor">${ic('download')} Ekspor Excel</button><button class="btn ghost" id="cetakLP">${ic('printer')} Cetak printer</button><button class="btn" id="cetakL">${ic('download')} Simpan PDF</button></div>
      <div class="tbl-wrap" style="max-height:72vh"><table class="tbl fit"><thead><tr><th class="num">No</th><th class="stick" style="min-width:180px">Nama</th>
        ${mp.map(m => `<th class="num" title="${esc(m.nama)}">${esc(m.singkatan || m.nama)}</th>`).join('')}<th class="num">Jumlah</th><th class="num">Rata²</th>${S.legerRank ? '<th class="num">Rank</th>' : ''}<th class="num">S</th><th class="num">I</th><th class="num">A</th></tr></thead>
        <tbody>${L.rows.map(r => `<tr><td class="num muted">${r[0]}</td><td class="stick nm">${esc(r[1])}</td>
          ${mp.map((m, j) => { var n = r[3 + j]; return `<td class="num" style="${n !== '' && n < kktp(m) ? 'color:var(--bad);font-weight:800;background:var(--bad-bg)' : ''}">${n === '' ? '<span class="muted">–</span>' : n}</td>`; }).join('')}
          <td class="num b">${r[3 + mp.length]}</td><td class="num b">${r[4 + mp.length] === '' ? '–' : f1(r[4 + mp.length])}</td>${S.legerRank ? `<td class="num"><span class="chip ${r[5 + mp.length] && r[5 + mp.length] <= 3 ? 'c-sb' : 'c-0'}">${r[5 + mp.length] || '–'}</span></td>` : ''}
          <td class="num">${r[6 + mp.length]}</td><td class="num">${r[7 + mp.length]}</td><td class="num">${r[8 + mp.length]}</td></tr>`).join('')}</tbody>
        <tfoot>${[['Rata-rata', 'rata'], ['Tertinggi', 'max'], ['Terendah', 'min']].map(f => `<tr><td></td><td class="stick">${f[0]}</td>${stat.map(s => `<td class="num">${f[1] === 'rata' ? f1(s.rata) : f0(s[f[1]])}</td>`).join('')}<td colspan="${S.legerRank ? 6 : 5}"></td></tr>`).join('')}</tfoot></table></div>
      <p class="small muted">Nilai merah = di bawah KKTP. Peringkat hanya untuk keperluan internal guru dan tidak dicetak di rapor.</p>`;
    $('#tglRank').onchange = e => { S.legerRank = e.target.checked; draw(); };
    $('#cetakL').onclick = () => cetakLeger(S.legerRank, 'pdf');
    $('#cetakLP').onclick = () => cetakLeger(S.legerRank, 'print');
    $('#ekspor').onclick = () => {
      var head = L.head.slice(), rows = L.rows.map(r => r.slice());
      if (!S.legerRank) { var ix = head.indexOf('Peringkat'); head.splice(ix, 1); rows.forEach(r => r.splice(ix, 1)); }
      window.desktop.eksporExcel({ header: head, rows: rows, judul: 'LEGER NILAI KELAS ' + namaKelas() + ' — SEMESTER ' + teksSemester(), lembar: 'Leger',
        subjudul: P('nama_sekolah') + ' · Tahun Pelajaran ' + P('tahun_pelajaran'), namaFile: 'Leger Nilai Kelas ' + namaKelas() + ' Semester ' + P('semester') + ' ' + P('tahun_pelajaran').replace('/', '-') })
        .then(r => { if (r.ok) toastFile('Leger Excel tersimpan', r.path); }).catch(gagal);
    };
  };
  draw();
};

/* =========================================================
   PANDUAN
   ========================================================= */
VIEWS.panduan = function (v) {
  v.innerHTML = `<div class="grid g2">
    <div class="card"><div class="card-h"><h3>Alur pengisian rapor</h3></div><div class="card-b"><ol class="guide" style="padding-left:18px;margin:0">
      <li><b>Profil & Pengaturan</b> — isi identitas sekolah, kepala sekolah, wali kelas, kelas, semester, tanggal rapor, dan unggah logo. Nama aplikasi otomatis mengikuti nama sekolah.</li>
      <li><b>Data ${sebutan()}</b> — tambah satu per satu, tempel dari Excel/Dapodik, atau pakai <b>template Excel</b>.</li>
      <li><b>Mapel & TP</b> — aktifkan mapel yang diajarkan, lalu tulis Tujuan Pembelajaran tiap mapel (bisa lewat template TP semua mapel). Untuk Pendidikan Agama, TP dibuat per agama.</li>
      <li><b>Input Nilai</b> — isi nilai per TP, Sumatif Tengah Semester (STS), dan Sumatif Akhir Semester (SAS), langsung di aplikasi atau lewat <b>template penilaian</b> (semua mapel, kokurikuler, ekskul, kehadiran dalam satu file). Nilai akhir dihitung dari bobot TP, STS, dan SAS yang diatur di <b>Profil &amp; Pengaturan → Pengolahan nilai</b>.</li>
      <li><b>Nilai dari guru mapel</b> — di Input Nilai klik <b>Buat file guru mapel</b>: tiap mapel jadi satu file Excel (daftar ${sebutan().toLowerCase()}, TP, nilai, deskripsi opsional). Bagikan ke guru mapel, lalu <b>Unggah file guru mapel</b> — pilih semua file yang kembali sekaligus.</li>
      <li><b>Kokurikuler</b> — buat kegiatan, pilih dimensi profil lulusan, lalu beri capaian Berkembang/Cakap/Mahir.</li>
      <li><b>Ekstrakurikuler</b> serta <b>Kehadiran & Catatan</b>.</li>
      <li><b>Cetak Rapor</b> — pilih ${sebutan().toLowerCase()} dan bagian yang dicetak, lalu simpan PDF (gabungan atau per ${sebutan().toLowerCase()}) atau cetak langsung ke printer.</li></ol></div></div>
    <div class="card"><div class="card-h"><h3>Tentang format rapor</h3></div><div class="card-b small" style="color:var(--ink-2)">
      <p style="margin-top:0">Rapor mengikuti struktur terbaru Kurikulum Merdeka: <b>intrakurikuler</b> (nilai akhir + capaian kompetensi), <b>kokurikuler</b> (deskripsi capaian 8 dimensi profil lulusan), <b>ekstrakurikuler</b>, <b>ketidakhadiran</b>, <b>catatan wali kelas</b>, dan <b>tanggapan orang tua/wali</b>.</p>
      <p><b>8 dimensi profil lulusan:</b> ${DIMENSI.join(', ')}.</p>
      <p style="margin-bottom:0"><b>Deskripsi capaian</b> disusun dari TP dengan nilai tertinggi (yang sudah mencapai KKTP) dan TP yang masih di bawah KKTP. Semua kalimat dapat diubah manual.</p></div></div>
    <div class="card"><div class="card-h"><h3>Tips cepat</h3></div><div class="card-b small" style="color:var(--ink-2)"><ul style="padding-left:18px;margin:0" class="guide">
      <li>Di semua tabel, pindah sel dengan tombol panah <span class="kbd">↑</span> <span class="kbd">↓</span> <span class="kbd">←</span> <span class="kbd">→</span> atau <span class="kbd">Enter</span>.</li>
      <li>Nilai bisa ditempel dari Excel: salin, klik sel pertama, tekan <span class="kbd">Ctrl+V</span>.</li>
      <li>${sebutan()} pindah: buka Data ${sebutan()} → tombol <b>Pindah</b>. Datanya tetap tersimpan, tetapi tidak muncul di rapor.</li>
      <li><b>PDF per ${sebutan().toLowerCase()}</b> membuat satu file untuk setiap anak — praktis dikirim ke orang tua.</li></ul></div></div>
    <div class="card"><div class="card-h"><h3>Semester baru & cadangan</h3></div><div class="card-b small" style="color:var(--ink-2)">
      Buka menu <b>Cadangan & Pulihkan</b>. Klik <b>Cadangkan Data</b> sebagai arsip, lalu <b>Mulai semester baru</b>: nilai, kokurikuler, ekskul, dan kehadiran dikosongkan; ${sebutan().toLowerCase()} aktif, mapel, dan TP tetap. Setelah itu ubah semester di Pengaturan.
      <div class="row mt"><button class="btn ghost sm" data-go="cadangan">${ic('download')} Cadangan & pulihkan</button><button class="btn ghost sm" data-folder>${ic('ext')} Buka folder data</button></div></div></div>
  </div>`;
};

/* =========================================================
   TEMPLATE EXCEL: TP & PENILAIAN SATU SEMESTER
   ========================================================= */
function kartuTemplate() {
  return `<div class="card" style="margin-bottom:12px"><div class="card-b row" style="padding:12px 16px">
    <div style="flex:1;min-width:240px"><span class="b small">Isi lewat Excel:</span> <span class="small muted">unduh template semester ini (nilai TP, STS & SAS semua mapel, kokurikuler, ekstrakurikuler, kehadiran & catatan dalam satu file), isi, lalu unggah.</span></div>
    <button class="btn ghost sm" data-tmpl-unduh>${ic('download')} Unduh template</button><button class="btn soft sm" data-tmpl-unggah>${ic('upload')} Unggah hasil isian</button></div></div>`;
}
document.addEventListener('click', function (e) {
  if (e.target.closest('[data-tmpl-unduh]')) unduhTemplateSemester();
  else if (e.target.closest('[data-tmpl-unggah]')) unggahTemplateSemester();
});
/** daftar lembar mapel: PABP dipisah per agama yang dipakai */
function lembarMapel() {
  var out = [], MU = MA(), ags = agamaDipakai();
  mapelAktif().forEach(m => {
    if (isAgama(m)) ags.forEach(ag => out.push({ m: m, agama: ag, key: m.id + '|' + ag, murid: MU.filter(x => (normAgama(x.agama) || 'Islam') === ag), tps: tpList(m.id, ag),
      judul: NAMA_PABP[ag] || m.nama, singkatan: (m.singkatan || 'PABP') + (ags.length > 1 ? ' ' + ag : '') }));
    else out.push({ m: m, agama: '', key: m.id + '|', murid: MU, tps: tpList(m.id), judul: m.nama, singkatan: m.singkatan || m.nama });
  });
  return out;
}
function unduhTemplateSemester() {
  var MU = MA(), go2 = () => {
    var o = {
      judul: 'Kelas ' + namaKelas() + ' Semester ' + P('semester') + ' ' + P('tahun_pelajaran').replace('/', '-'), sebutan: sebutan(),
      murid: MU.map(m => ({ id: m.id, nama: m.nama })),
      mapel: lembarMapel().map(x => ({ key: x.key, judul: x.judul, singkatan: x.singkatan, kktp: kktp(x.m), tps: x.tps.map(t => ({ id: t.id, kode: t.kode, lingkup: t.lingkup_materi })),
        murid: x.murid.map(m => ({ id: m.id, nama: m.nama })),
        nilai: x.murid.reduce((a, m) => { var r = S.nilai[m.id + '|' + x.m.id]; if (r) a[m.id] = { tp: r._tp, sts: r.sts, sas: r.sas }; return a; }, {}) })),
      koko: { kegiatan: S.d.kegiatanKoko.map(k => ({ id: k.id, nama: k.nama_kegiatan, dim: k._dim })), level: LEVEL_KOKO,
        cap: MU.reduce((a, m) => { var r = S.koko[m.id]; if (r) a[m.id] = r._cap; return a; }, {}) },
      ekskul: { list: S.d.ekskul.map(e => ({ id: e.id, nama: e.nama })), predikat: PREDIKAT_EKS,
        data: MU.reduce((a, m) => { var r = S.eks[m.id]; if (r) { a[m.id] = {}; r._data.forEach(x => { if (x.ekskul_id) a[m.id][x.ekskul_id] = x.predikat; }); } return a; }, {}) },
      hadir: { smt2: P('semester') === '2', opsi: keputusanOpsi(), data: MU.reduce((a, m) => { var h = S.hadir[m.id]; if (h) a[m.id] = h; return a; }, {}) }
    };
    window.desktop.templateSemester(o).then(r => { if (r.ok) toastFile('Template tersimpan — isi lalu unggah kembali', r.path); }).catch(gagal);
  };
  if (S.dirty) konfirmasi('Perubahan belum disimpan', 'Template berisi data yang sudah <b>tersimpan</b>. Simpan dulu perubahan di layar agar ikut masuk ke template?', 'Unduh tanpa menyimpan', true).then(ok => ok && go2());
  else go2();
}
function unggahTemplateSemester() {
  if (S.dirty) return toast('Simpan dulu perubahan di layar sebelum mengunggah.', 'err');
  var MU = MA(), norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  var cariMurid = (row, daftar) => { var id = String(row[0] || '').trim(), nm = norm(row[2]); return (daftar || MU).find(m => m.id === id) || (nm ? (daftar || MU).find(m => norm(m.nama) === nm) : null); };
  var LV = { b: 'Berkembang', berkembang: 'Berkembang', c: 'Cakap', cakap: 'Cakap', m: 'Mahir', mahir: 'Mahir' };
  var PR = { sb: 'Sangat Baik', 'sangat baik': 'Sangat Baik', b: 'Baik', baik: 'Baik', c: 'Cukup', cukup: 'Cukup', k: 'Kurang', kurang: 'Kurang' };
  window.desktop.bacaExcel().then(r => {
    if (!r.ok) { if (r.error) toast(r.error, 'err'); return; }
    var nilai = {}, koko = {}, eks = {}, hadir = {}, tdk = new Set(), hit = { nilai: 0, mapel: 0, koko: 0, eks: 0, hadir: 0, catatan: 0, salah: 0, lebih: 0 };
    var lm = {}; lembarMapel().forEach(x => { lm[x.key] = x; });
    Object.keys(r.sheets).forEach(nama => {
      var rows = r.sheets[nama], key = rows[0] || [], jenis = String(key[0] || '');
      var data = rows.slice(1).filter(x => x && String(x[2] || x[0] || '').trim());
      if (jenis.indexOf('map:') === 0) {
        var x = lm[jenis.slice(4)]; if (!x) { hit.salah++; return; }
        var tpIds = x.tps.map(t => t.id), ada = false;
        data.forEach(row => {
          var m = cariMurid(row, x.murid); if (!m) { if (String(row[0]).indexOf('M_') === 0) tdk.add(row[2]); return; }
          var k = m.id + '|' + x.m.id;
          key.forEach((kk, j) => {
            kk = String(kk); if (kk.indexOf('tp:') !== 0 && kk.indexOf('lm:') !== 0 && kk !== 'sas' && kk !== 'sts') return;
            var v = String(row[j] || '').trim().replace(',', '.'); if (v === '') return;
            var n = Number(v); if (!isFinite(n) || n < 0 || n > 100) { hit.salah++; return; }
            if (kk !== 'sas' && kk !== 'sts' && tpIds.indexOf(kk.slice(3)) < 0) { hit.salah++; return; }
            if (!nilai[k]) { var lama = S.nilai[k]; nilai[k] = { m: m, mp: x.m, _tp: clone(lama ? lama._tp : {}), sts: lama && lama.sts != null ? lama.sts : '', sas: lama ? lama.sas : '', deskripsi_manual: lama ? lama.deskripsi_manual : '' }; }
            if (kk === 'sas') nilai[k].sas = n; else if (kk === 'sts') nilai[k].sts = n; else nilai[k]._tp[kk.slice(3)] = n;
            hit.nilai++; ada = true;
          });
        });
        if (ada) hit.mapel++;
      } else if (jenis === 'koko') {
        data.forEach(row => {
          var m = cariMurid(row); if (!m) return;
          key.forEach((kk, j) => {
            kk = String(kk); if (kk.indexOf('kk:') !== 0) return;
            var v = String(row[j] || '').trim(); if (!v) return;
            var lv = LV[norm(v)]; if (!lv) { hit.salah++; return; }
            var p = kk.slice(3).split('|'), kid = p[0], dim = p.slice(1).join('|');
            if (!koko[m.id]) { var lama = S.koko[m.id]; koko[m.id] = { _cap: clone(lama ? lama._cap : {}), deskripsi_manual: lama ? lama.deskripsi_manual : '' }; }
            koko[m.id]._cap[kid] = koko[m.id]._cap[kid] || {}; koko[m.id]._cap[kid][dim] = lv; hit.koko++;
          });
        });
      } else if (jenis === 'eks') {
        data.forEach(row => {
          var m = cariMurid(row); if (!m) return;
          key.forEach((kk, j) => {
            kk = String(kk); if (kk.indexOf('ek:') !== 0) return;
            var v = String(row[j] || '').trim(); if (!v) return;
            var pr = PR[norm(v)]; if (!pr) { hit.salah++; return; }
            var eid = kk.slice(3); if (!ekskulById(eid)) { hit.salah++; return; }
            if (!eks[m.id]) { var lama = S.eks[m.id]; eks[m.id] = clone(lama ? lama._data : []); }
            var s = eks[m.id].find(z => z.ekskul_id === eid);
            if (s) { if (s.predikat !== pr) { s.predikat = pr; s.keterangan = ''; } } else eks[m.id].push({ ekskul_id: eid, predikat: pr, keterangan: '' });
            hit.eks++;
          });
          if (eks[m.id] && eks[m.id].length > 4) { hit.lebih++; eks[m.id] = eks[m.id].slice(0, 4); }
        });
      } else if (jenis === 'hadir') {
        var opsi = keputusanOpsi();
        data.forEach(row => {
          var m = cariMurid(row); if (!m) return;
          var h = hadir[m.id] || (hadir[m.id] = Object.assign({ sakit: '', izin: '', alpa: '', catatan: '', keputusan: '', tanggapan: '' }, S.hadir[m.id] || {}));
          key.forEach((kk, j) => {
            var v = String(row[j] || '').trim(); if (v === '') return;
            if (kk === 'sakit' || kk === 'izin' || kk === 'alpa') { if (!/^\d+$/.test(v)) { hit.salah++; return; } h[kk] = v; hit.hadir++; }
            else if (kk === 'catatan') { h.catatan = v; hit.catatan++; }
            else if (kk === 'keputusan') { var o = opsi.find(z => norm(z) === norm(v)) || opsi.find(z => norm(z).indexOf(norm(v)) === 0); if (o) h.keputusan = o; else hit.salah++; }
          });
        });
      }
    });
    var nN = Object.keys(nilai).length, nK = Object.keys(koko).length, nE = Object.keys(eks).length, nH = Object.keys(hadir).length;
    if (!nN && !nK && !nE && !nH) return toast('Tidak ada isian yang dikenali. Pastikan memakai template dari aplikasi ini.', 'err');
    konfirmasi('Terapkan isian dari Excel?', `File <b>${esc(r.nama)}</b>:<br>
      • ${hit.nilai} nilai di ${hit.mapel} mapel<br>• ${hit.koko} capaian kokurikuler · ${hit.eks} isian ekstrakurikuler<br>• ${hit.hadir} isian kehadiran · ${hit.catatan} catatan<br>
      ${hit.salah ? '<span style="color:var(--bad)">• ' + hit.salah + ' isian tidak valid dilewati</span><br>' : ''}${hit.lebih ? '<span style="color:var(--bad)">• ' + hit.lebih + ' ' + sebutan().toLowerCase() + ' mengikuti lebih dari 4 ekskul — hanya 4 pertama yang dipakai</span><br>' : ''}${tdk.size ? '<span style="color:var(--bad)">• ' + tdk.size + ' nama tidak ditemukan: ' + esc(Array.from(tdk).slice(0, 5).join(', ')) + '</span><br>' : ''}
      <span class="small muted">Sel kosong di Excel tidak menghapus data yang sudah ada. Nilai akhir & deskripsi dihitung ulang otomatis.</span>`, 'Terapkan').then(ok => {
      if (!ok) return;
      var tugas = [];
      if (nN) tugas.push(() => call('simpanNilai', { rows: Object.keys(nilai).map(k => {
        var x = nilai[k], h = hitung(x.m, x.mp, x), o = {};
        Object.keys(x._tp).forEach(t => { if (String(x._tp[t]).trim() !== '') o[t] = num(x._tp[t]); });
        return { siswa_id: x.m.id, mapel_id: x.mp.id, nilai_tp: o, sts: String(x.sts).trim() === '' ? '' : num(x.sts), sas: String(x.sas).trim() === '' ? '' : num(x.sas), na: h.na == null ? '' : h.na, deskripsi_manual: x.deskripsi_manual || '' };
      }) }, 'Menerapkan nilai…'));
      if (nK) tugas.push(() => call('simpanNilaiKoko', { rows: Object.keys(koko).map(id => ({ siswa_id: id, capaian: koko[id]._cap, deskripsi_manual: koko[id].deskripsi_manual || '' })) }, 'Menerapkan kokurikuler…'));
      if (nE) tugas.push(() => call('simpanNilaiEkskul', { rows: Object.keys(eks).map(id => ({ siswa_id: id, data: eks[id] })) }, 'Menerapkan ekstrakurikuler…'));
      if (nH) tugas.push(() => call('simpanKehadiran', { rows: Object.keys(hadir).map(id => Object.assign({ siswa_id: id }, hadir[id])) }, 'Menerapkan kehadiran…'));
      tugas.reduce((p, f) => p.then(f), Promise.resolve()).then(() => muatUlang()).then(() => { S.dirty = false; go(S.view, true); toast('Isian Excel diterapkan'); }).catch(gagal);
    });
  }).catch(gagal);
}
/* =========================================================
   TEMPLATE GURU MAPEL: satu file per mapel → dibagikan → diunggah sekaligus
   ========================================================= */
function kartuGuruMapel() {
  // dipakai di Input Nilai: dua jalur Excel dalam satu kartu
  return `<div class="card" style="margin-bottom:12px"><div class="card-b" style="padding:4px 16px">
    <div class="row" style="padding:8px 0;border-bottom:1px solid var(--line-2)"><div style="flex:1;min-width:240px"><span class="b small">Dari guru mapel:</span> <span class="small muted">satu file Excel per mapel berisi nilai TP dan kolom LM input langsung, lalu unggah semua file yang kembali sekaligus.</span></div>
      <button class="btn ghost sm" data-gm-buat>${ic('download')} Buat file guru mapel</button><button class="btn soft sm" data-gm-unggah>${ic('upload')} Unggah file guru mapel</button></div>
    <div class="row" style="padding:8px 0"><div style="flex:1;min-width:240px"><span class="b small">Semua dalam satu file:</span> <span class="small muted">nilai semua mapel, kokurikuler, ekstrakurikuler, kehadiran & catatan.</span></div>
      <button class="btn ghost sm" data-tmpl-unduh>${ic('download')} Unduh template</button><button class="btn soft sm" data-tmpl-unggah>${ic('upload')} Unggah hasil isian</button></div>
  </div></div>`;
}
document.addEventListener('click', function (e) {
  if (e.target.closest('[data-gm-buat]')) dialogGuruMapel();
  else if (e.target.closest('[data-gm-unggah]')) unggahGuruMapel();
});
function infoKelas() { return { kelas: namaKelas(), semester: P('semester'), tahun: P('tahun_pelajaran') }; }
function dialogGuruMapel() {
  if (!MA().length) return toast('Tambahkan data ' + sebutan().toLowerCase() + ' dulu.', 'err');
  var daftar = lembarMapel();
  if (!daftar.length) return toast('Belum ada mapel aktif.', 'err');
  var isi = x => x.murid.filter(m => hitung(m, x.m).na != null).length;
  // centang awal: pilihan terakhir; bila belum ada → SD hanya mapel yang lazim diajar guru mapel, jenjang lain semua
  var sd = (P('jenjang') || 'SD') === 'SD', lalu = null;
  try { lalu = JSON.parse(localStorage.getItem('gmPilih') || 'null'); } catch (e) { lalu = null; }
  var LAZIM_SD = ['AGAMA', 'PJOK', 'BING', 'MULOK1'];
  var dicentang = x => Array.isArray(lalu) ? lalu.indexOf(x.key) >= 0 : (!sd || LAZIM_SD.indexOf(x.m.id) >= 0 || x.m.kelompok === 'Muatan Lokal');
  var md = modal({ title: 'Buat file untuk guru mapel', size: 'lg',
    body: `<p class="small" style="margin-top:0;color:var(--ink-2)">Centang <b>hanya mapel yang diajar guru lain</b>. Setiap mapel yang dicentang dibuatkan <b>satu file Excel</b> berisi daftar ${sebutan().toLowerCase()}, daftar TP (boleh diubah/ditambah guru), kolom nilai TP, LM, STS & SAS, serta deskripsi opsional. Mapel yang Bapak/Ibu ajar sendiri cukup diisi langsung di halaman ini.</p>
      ${sd ? `<div class="preview-desk small" style="margin:0 0 8px">${ic('sparkle')} Di SD biasanya hanya <b>PABP, PJOK, Bahasa Inggris, dan muatan lokal</b> yang diajar guru mapel, jadi itu yang tercentang di awal. Sesuaikan dengan sekolah Bapak/Ibu — pilihan ini diingat untuk berikutnya.</div>` : ''}
      <div class="row small" style="margin:6px 0 8px"><a href="#" data-semua>Pilih semua</a><span class="muted">·</span><a href="#" data-kosong>Kosongkan</a><span class="sp"></span><span class="muted" data-hit></span></div>
      <div style="max-height:46vh;overflow:auto;border:1px solid var(--line);border-radius:10px">
      ${daftar.map((x, i) => { var n = isi(x); return `<label class="row" style="padding:9px 12px;border-bottom:1px solid var(--line);cursor:pointer;gap:10px">
        <input type="checkbox" data-gm="${i}" ${dicentang(x) ? 'checked' : ''}><span style="flex:1;min-width:0"><span class="b">${esc(x.judul)}</span><br>
        <span class="small muted">${x.tps.length ? x.tps.length + ' TP' : 'belum ada TP — guru bisa menuliskannya di file'} · ${x.murid.length} ${sebutan().toLowerCase()} · ${n ? 'nilai terisi ' + n + '/' + x.murid.length : 'nilai belum diisi'}</span></span></label>`; }).join('')}</div>`,
    foot: `<button class="btn ghost" data-x>Batal</button><button class="btn" data-ok>${ic('download')} Pilih folder & buat file</button>`,
    onMount: (el) => {
      var segar = () => { $('[data-hit]', el).textContent = $$('[data-gm]:checked', el).length + ' file akan dibuat'; };
      el.addEventListener('change', segar); segar();
      $('[data-semua]', el).onclick = (e) => { e.preventDefault(); $$('[data-gm]', el).forEach(c => { c.checked = true; }); segar(); };
      $('[data-kosong]', el).onclick = (e) => { e.preventDefault(); $$('[data-gm]', el).forEach(c => { c.checked = false; }); segar(); };
    } });
  $('[data-ok]', md.el).onclick = () => {
    var pilih = $$('[data-gm]:checked', md.el).map(c => daftar[num(c.dataset.gm)]);
    if (!pilih.length) return toast('Centang minimal satu mapel.', 'err');
    try { localStorage.setItem('gmPilih', JSON.stringify(pilih.map(x => x.key))); } catch (e) { /* abaikan */ }
    var go2 = () => {
      var kls = namaKelas(), files = pilih.map(x => ({
        nama: 'Nilai ' + x.singkatan + (x.agama && x.singkatan.indexOf(x.agama) < 0 ? ' ' + x.agama : '') + ' - Kelas ' + kls,
        data: Object.assign({ key: x.key, judul: x.judul, singkatan: x.singkatan, kktp: kktp(x.m), bobotLm: P('bobot_lm'), bobotSas: P('bobot_sas'), teksBobot: teksBobot(), sebutan: sebutan(),
          semesterTeks: teksSemester(), sekolah: P('nama_sekolah'), wali: P('wali_kelas'),
          tps: x.tps.map(t => ({ id: t.id, kode: t.kode, lingkup: t.lingkup_materi, tujuan: t.tujuan })),
          lms: (S.d.lingkupMateri || []).filter(g => String(g.mapel_id) === String(x.m.id) && String(g.agama || '') === String(x.agama || '') && g.status === 'Aktif').sort((a,b) => num(a.urut)-num(b.urut)).map(g => ({ id: g.id, nama: g.nama })),
          murid: x.murid.map(m => ({ id: m.id, nama: m.nama })),
          nilai: x.murid.reduce((a, m) => { var r = S.nilai[m.id + '|' + x.m.id]; if (r) a[m.id] = { tp: r._tp, lm: r._lm || {}, sts: r.sts, sas: r.sas, desk: r.deskripsi_manual || '' }; return a; }, {}) }, infoKelas())
      }));
      window.desktop.templateGuruMapel({ folder: 'File Guru Mapel - Kelas ' + kls + ' - Semester ' + P('semester') + ' ' + P('tahun_pelajaran').replace('/', '-'), files: files })
        .then(r => { if (r.ok) { md.close(); toastFile(r.files.length + ' file guru mapel dibuat — bagikan ke masing-masing guru', r.folder); } }).catch(gagal);
    };
    if (S.dirty) konfirmasi('Perubahan belum disimpan', 'File berisi data yang sudah <b>tersimpan</b>. Simpan dulu perubahan di layar agar ikut masuk?', 'Buat tanpa menyimpan', true).then(ok => ok && go2());
    else go2();
  };
}
/** Baca satu file guru mapel → {x, guru, tpBaru, tpBerubah, nilai:{sid:{tp:{kode:v}, sts, sas, desk}}, ...} */
function bacaFileGuruMapel(f, lm) {
  var norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  var hasil = { nama: f.nama, waktu: f.waktu || 0, peringatan: [], nilai: {}, nNilai: 0, nDesk: 0, nUbah: 0, salah: 0, tdk: [] };
  if (f.error) { hasil.error = f.error; return hasil; }
  var nm = Object.keys(f.sheets).find(n => String((f.sheets[n][0] || [])[0] || '').indexOf('gm:') === 0);
  if (!nm) {
    var semester = Object.keys(f.sheets).some(n => String((f.sheets[n][0] || [])[0] || '').indexOf('map:') === 0);
    hasil.error = semester ? 'ini template penilaian semester — unggah lewat tombol "Unggah hasil isian"' : 'bukan file guru mapel dari aplikasi ini';
    return hasil;
  }
  var rows = f.sheets[nm], key = rows[0] || [], gk = String(key[0]).slice(3), x = lm[gk];
  if (!x) { hasil.error = 'mapel di file ini tidak aktif / tidak ada di kelas ini'; return hasil; }
  hasil.x = x;
  var info = key.map(String).find(k => k.indexOf('info:') === 0);
  if (info) { try { var i = JSON.parse(info.slice(5)), now = infoKelas();
    if (norm(i.kelas) !== norm(now.kelas) || String(i.semester) !== String(now.semester) || String(i.tahun) !== String(now.tahun))
      hasil.peringatan.push('file dibuat untuk Kelas ' + i.kelas + ' semester ' + i.semester + ' ' + i.tahun);
  } catch (e) { /* abaikan */ } }
  hasil.guru = String((rows[3] || [])[3] || '').trim();
  // daftar TP dari lembar TP (baris 4+k)
  var tpSheet = Object.keys(f.sheets).find(n => String((f.sheets[n][0] || [])[0] || '') === 'tpgm:' + gk), kodeKe = {}, list = [], dipakai = {};
  if (tpSheet) {
    var tr = f.sheets[tpSheet];
    for (var k = 1; k < tr.length - 3; k++) {
      var row = tr[3 + k] || [], lingkup = String(row[1] || '').trim(), tujuan = String(row[2] || '').trim();
      if (!lingkup && !tujuan) continue;
      var kode = String(row[0] || '').trim() || 'TP ' + k, dasar = kode, u = 2;
      while (dipakai[norm(kode)]) kode = dasar + ' (' + u++ + ')';
      dipakai[norm(kode)] = 1; kodeKe[k] = kode;
      list.push({ kode: kode, lingkup_materi: lingkup, tujuan: tujuan });
    }
    var lama = x.tps;
    hasil.tpBerubah = list.length !== lama.length || list.some((t, j) => norm(t.kode) !== norm(lama[j].kode) || norm(t.lingkup_materi) !== norm(lama[j].lingkup_materi) || norm(t.tujuan) !== norm(lama[j].tujuan));
    hasil.tpBaru = list;
  } else { x.tps.forEach((t, j) => { kodeKe[j + 1] = t.kode; }); hasil.peringatan.push('lembar TP tidak ditemukan — memakai TP di aplikasi'); }
  // nilai (nUbah = isian yang berbeda dari data di aplikasi)
  var idLama = {}; x.tps.forEach(t => { idLama[norm(t.kode)] = t.id; });
  var beda = (a, b) => String(a == null ? '' : a).trim() !== String(b == null ? '' : b).trim();
  rows.slice(7).forEach(row => {
    if (!row || !String(row[2] || row[0] || '').trim()) return;
    var id = String(row[0] || '').trim(), nmM = norm(row[2]);
    var m = x.murid.find(z => z.id === id) || (nmM ? x.murid.find(z => norm(z.nama) === nmM) : null);
    if (!m) { if (nmM) hasil.tdk.push(row[2]); return; }
    var e = { tp: {}, lm: {}, sts: null, sas: null, desk: '' }, ada = false, lama = S.nilai[m.id + '|' + x.m.id];
    key.forEach((kk, j) => {
      kk = String(kk); var v = String(row[j] == null ? '' : row[j]).trim();
      if (v === '') return;
      if (kk === 'desk') { e.desk = v; hasil.nDesk++; ada = true; if (beda(v, lama && lama.deskripsi_manual)) hasil.nUbah++; return; }
      if (kk.indexOf('tp:') !== 0 && kk.indexOf('lm:') !== 0 && kk !== 'sas' && kk !== 'sts') return;
      var n = Number(v.replace(',', '.'));
      if (!isFinite(n) || n < 0 || n > 100) { hasil.salah++; return; }
      if (kk.indexOf('lm:') === 0) { var lid = kk.slice(3); if (!x.lms || !x.lms.some(g => String(g.id) === lid)) { hasil.salah++; return; } e.lm[lid] = n; if (beda(n, lama && lama._lm && lama._lm[lid])) hasil.nUbah++; }
      else if (kk === 'sas') { e.sas = n; if (beda(n, lama && lama.sas)) hasil.nUbah++; }
      else if (kk === 'sts') { e.sts = n; if (beda(n, lama && lama.sts)) hasil.nUbah++; }
      else {
        var kd = kodeKe[num(kk.slice(3))]; if (!kd) { hasil.salah++; return; } e.tp[kd] = n;
        var tid = idLama[norm(kd)]; if (!tid || beda(n, lama && lama._tp[tid])) hasil.nUbah++;
      }
      hasil.nNilai++; ada = true;
    });
    if (ada) hasil.nilai[m.id] = e;
  });
  if (hasil.tdk.length) hasil.peringatan.push(hasil.tdk.length + ' nama tidak ditemukan: ' + hasil.tdk.slice(0, 4).join(', ') + (hasil.tdk.length > 4 ? ', …' : ''));
  if (hasil.salah) hasil.peringatan.push(hasil.salah + ' isian tidak valid dilewati');
  return hasil;
}
function unggahGuruMapel() {
  if (S.dirty) return toast('Simpan dulu perubahan di layar sebelum mengunggah.', 'err');
  window.desktop.bacaExcelBanyak().then(r => {
    if (!r.ok) { if (r.error) toast(r.error, 'err'); return; }
    var lm = {}; lembarMapel().forEach(x => { x.lms = (S.d.lingkupMateri || []).filter(g => String(g.mapel_id) === String(x.m.id) && String(g.agama || '') === String(x.agama || '') && g.status === 'Aktif').sort((a,b) => num(a.urut)-num(b.urut)); lm[x.key] = x; });
    var hasil = r.files.map(f => bacaFileGuruMapel(f, lm));
    // satu mapel di beberapa file: pakai yang perubahannya paling banyak (seri → file yang lebih baru)
    var seen = {}, skor = h => h.nUbah + (h.tpBerubah ? 1 : 0);
    hasil.forEach(h => {
      if (!h.x || h.error) return;
      var lain = seen[h.x.key];
      if (!lain) { seen[h.x.key] = h; return; }
      var menang = skor(h) > skor(lain) || (skor(h) === skor(lain) && h.waktu >= lain.waktu) ? h : lain, kalah = menang === h ? lain : h;
      kalah.dobel = menang.nama; menang.peringatan.push('mapel ini juga ada di file "' + kalah.nama + '" — file ini yang dipakai');
      seen[h.x.key] = menang;
    });
    var baik = hasil.filter(h => !h.error && !h.dobel && (h.nUbah || h.tpBerubah));
    var baris = hasil.map(h => {
      var judul = h.x ? esc(h.x.judul) + (h.x.agama ? ' <span class="muted">(' + esc(h.x.agama) + ')</span>' : '') : '<span class="muted">' + esc(h.nama) + '</span>';
      var ket = h.error ? '<span style="color:var(--bad)">' + esc(h.error) + '</span>'
        : h.dobel ? '<span class="muted">dilewati — dipakai file "' + esc(h.dobel) + '"</span>'
        : (h.nUbah || h.tpBerubah ? '<b>' + h.nUbah + ' isian baru/berubah</b> <span class="muted">(' + h.nNilai + ' nilai terisi' + (h.nDesk ? ', ' + h.nDesk + ' deskripsi' : '') + ')</span>' : '<span class="muted">tidak ada perubahan dari data di aplikasi</span>') +
          (h.tpBerubah ? '<br><b>TP diperbarui</b> (' + h.x.tps.length + ' → ' + h.tpBaru.length + ' TP)' : '') +
          (h.peringatan.length ? '<br><span style="color:var(--bad)">' + h.peringatan.map(esc).join('<br>') + '</span>' : '');
      return `<tr style="border-bottom:1px solid var(--line-2)"><td style="padding:8px 10px;vertical-align:top;width:42%"><span class="b">${judul}</span>${h.guru ? '<br><span class="small muted">' + esc(h.guru) + '</span>' : ''}<br><span class="small muted" style="font-size:11px">${esc(h.nama)}</span></td><td class="small" style="padding:8px 10px;vertical-align:top">${ket}</td></tr>`;
    }).join('');
    var body = `<div style="max-height:50vh;overflow:auto;border:1px solid var(--line);border-radius:10px"><table style="width:100%;border-collapse:collapse">${baris}</table></div>
      <p class="small muted" style="margin-bottom:0">Sel kosong tidak menghapus nilai yang sudah ada. Bila TP diperbarui, TP mapel tersebut diganti sesuai file (nilai tetap tersambung untuk kode TP yang sama). Nilai akhir & deskripsi dihitung ulang otomatis.</p>`;
    if (!baik.length) { modal({ title: 'Tidak ada isian baru untuk diterapkan', body: body, size: 'lg' }); return; }
    var md = modal({ title: 'Terapkan ' + baik.length + ' file guru mapel?', size: 'lg', body: body,
      foot: `<button class="btn ghost" data-x>Batal</button><button class="btn" data-ok>Terapkan</button>` });
    $('[data-ok]', md.el).onclick = () => {
      md.close();
      var grupTP = baik.filter(h => h.tpBerubah).map(h => ({ mapel_id: h.x.m.id, agama: h.x.agama, list: h.tpBaru }));
      var langkah = grupTP.length ? call('imporTP', { grup: grupTP }, 'Memperbarui TP…').then(() => call('muat')).then(d => { setData(d); }) : Promise.resolve();
      langkah.then(() => {
        var rows = [];
        baik.forEach(h => {
          var mp = h.x.m;
          Object.keys(h.nilai).forEach(sid => {
            var m = muridById(sid), e = h.nilai[sid], lama = S.nilai[sid + '|' + mp.id];
            var tps = tpList(mp.id, m.agama), idKode = {}; tps.forEach(t => { idKode[String(t.kode).toLowerCase()] = t.id; });
            var row = { _tp: clone(lama ? lama._tp : {}), _lm: clone(lama ? lama._lm : {}), sts: lama && lama.sts != null ? lama.sts : '', sas: lama ? lama.sas : '', deskripsi_manual: lama ? lama.deskripsi_manual : '' };
            Object.keys(e.tp).forEach(kd => { var id = idKode[kd.toLowerCase()]; if (id) row._tp[id] = e.tp[kd]; });
            if (e.sas !== null) row.sas = e.sas;
            Object.keys(e.lm || {}).forEach(id => { row._lm = row._lm || {}; row._lm[id] = e.lm[id]; });
            if (e.sts !== null) row.sts = e.sts;
            if (e.desk) row.deskripsi_manual = e.desk;
            var hh = hitung(m, mp, row), o = {};
            Object.keys(row._tp).forEach(t => { if (String(row._tp[t]).trim() !== '') o[t] = num(row._tp[t]); });
            var nilaiLmSimpan = {}; Object.keys(row._lm || {}).forEach(id => { if (String(row._lm[id]).trim() !== '') nilaiLmSimpan[id] = num(row._lm[id]); });
            rows.push({ siswa_id: sid, mapel_id: mp.id, nilai_tp: o, nilai_lm: nilaiLmSimpan, sts: String(row.sts).trim() === '' ? '' : num(row.sts), sas: String(row.sas).trim() === '' ? '' : num(row.sas), na: hh.na == null ? '' : hh.na, deskripsi_manual: row.deskripsi_manual || '' });
          });
        });
        return rows.length ? call('simpanNilai', { rows: rows }, 'Menerapkan nilai…') : null;
      }).then(() => muatUlang()).then(() => { S.dirty = false; go(S.view, true); toast(baik.length + ' file guru mapel diterapkan'); }).catch(gagal);
    };
  }).catch(gagal);
}

function unduhTemplateTP() {
  window.desktop.templateTP({ kelas: namaKelas(), mapel: mapelAktif().map(m => ({ id: m.id, singkatan: m.singkatan || m.nama, nama: m.nama, agama: isAgama(m) })), tp: S.d.tp })
    .then(r => { if (r.ok) toastFile('Template TP tersimpan — isi lalu unggah kembali', r.path); }).catch(gagal);
}
function unggahTemplateTP(selesai) {
  var norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  window.desktop.bacaExcel().then(r => {
    if (!r.ok) { if (r.error) toast(r.error, 'err'); return; }
    var nm = Object.keys(r.sheets).find(n => String((r.sheets[n][0] || [])[0]) === 'mapel');
    if (!nm) return toast('Lembar TP tidak ditemukan. Pastikan memakai template TP dari aplikasi ini.', 'err');
    var grup = {}, urutan = [], salah = new Set();
    r.sheets[nm].slice(1).forEach(row => {
      var sm = norm(row[0]), lm = String(row[3] || '').trim(), tj = String(row[4] || '').trim();
      if (!sm || (!lm && !tj) || /^mapel$/.test(sm)) return;
      var m = S.d.mapel.find(x => norm(x.singkatan) === sm || norm(x.nama) === sm);
      if (!m) { salah.add(row[0]); return; }
      var ag = isAgama(m) ? (normAgama(row[1]) || 'Islam') : '', k = m.id + '|' + ag;
      if (!grup[k]) { grup[k] = { mapel_id: m.id, agama: ag, list: [] }; urutan.push(k); }
      grup[k].list.push({ kode: String(row[2] || '').trim() || 'TP ' + (grup[k].list.length + 1), lingkup_materi: lm, tujuan: tj });
    });
    if (!urutan.length) return toast('Tidak ada TP yang terbaca dari file.', 'err');
    var total = urutan.reduce((a, k) => a + grup[k].list.length, 0);
    konfirmasi('Terapkan TP dari Excel?', `<b>${total} TP</b> untuk ${urutan.length} mapel: ${esc(urutan.map(k => { var g = grup[k], m = mapelById(g.mapel_id); return (m.singkatan || m.nama) + (g.agama ? ' (' + g.agama + ')' : '') + ' ' + g.list.length; }).join(', '))}.<br>
      ${salah.size ? '<span style="color:var(--bad)">Mapel tidak dikenal dilewati: ' + esc(Array.from(salah).join(', ')) + '</span><br>' : ''}
      <span class="small muted">TP lama pada mapel tersebut diganti. Nilai tetap tersambung bila kode TP-nya sama (TP 1, TP 2, …).</span>`, 'Terapkan').then(ok => {
      if (!ok) return;
      call('imporTP', { grup: urutan.map(k => grup[k]) }, 'Menyimpan TP…').then(() => call('muat')).then(d => { setData(d); toast(total + ' TP diterapkan'); if (selesai) selesai(); }).catch(gagal);
    });
  }).catch(gagal);
}

/* =========================================================
   CADANGAN & PULIHKAN (versi laptop)
   ========================================================= */
function waktuIndo(iso) {
  if (!iso) return 'belum pernah';
  var d = new Date(iso); if (isNaN(d)) return iso;
  return d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear() + ', ' + ('0' + d.getHours()).slice(-2) + '.' + ('0' + d.getMinutes()).slice(-2);
}
function ukuran(b) { b = num(b); return b > 1048576 ? f1(b / 1048576) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
function hariSejak(iso) { if (!iso) return 9999; return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000); }
VIEWS.cadangan = function (v) {
  v.innerHTML = '<div class="card card-b muted">Memuat info cadangan…</div>';
  var muat = () => window.desktop.cadanganInfo().then(i => {
    var terakhir = i.terakhirManual;
    var aman = hariSejak(terakhir) <= 14;
    v.innerHTML = `<div class="preview-desk" style="margin-bottom:14px;${aman ? '' : 'background:var(--warn-bg);border-color:#F1D9A2;color:#7A4E07'}">${ic(aman ? 'check' : 'alert')}
        ${aman ? 'Data terakhir dicadangkan: <b>' + esc(waktuIndo(terakhir)) + '</b>.' : 'Belum ada cadangan data dalam 14 hari terakhir. Silakan klik Cadangkan Data.'}</div>
      <div class="grid g2">
        <div class="card"><div class="card-h"><h3>Cadangkan & pulihkan data</h3></div><div class="card-b">
          <p class="small muted" style="margin-top:0">Cadangan menyimpan seluruh data aplikasi ke file <b>.json</b>. Folder dan nama file ditentukan otomatis oleh aplikasi; Anda tidak perlu memilih lokasi penyimpanan.</p>
          <div class="stat3" style="margin:10px 0 14px"><div><b>${S.d.murid.length}</b><span>${sebutan().toLowerCase()}</span></div><div><b>${S.d.tp.length}</b><span>TP</span></div><div><b>${esc(ukuran(i.ukuranData))}</b><span>ukuran data</span></div></div>
          <div class="row"><button class="btn" id="btnCadang">${ic('download')} Cadangkan Data</button><button class="btn ghost" id="btnPulih">${ic('upload')} Pulihkan dari file…</button></div>
          <div class="small muted mt-s">Folder penyimpanan: <b>${esc(i.folderCadangan)}</b></div>
          <div class="small muted mt-s">Cadangan manual terakhir: ${esc(waktuIndo(i.terakhirManual))}</div>
          <div class="row mt-s"><button class="btn ghost sm" id="btnBukaCadangan">${ic('folder')} Buka Folder Cadangan</button></div>
        </div></div>
        <div class="card"><div class="card-h"><h3>Cadangan otomatis internal</h3><span class="sub">sebelum perubahan pertama setiap hari</span></div><div class="card-b">
          ${i.otomatis.length ? `<div class="tbl-wrap" style="max-height:300px"><table class="tbl"><thead><tr><th>Tanggal</th><th class="num">Ukuran</th><th></th></tr></thead><tbody>
            ${i.otomatis.map(c => `<tr><td class="b small">${esc(waktuIndo(c.waktu))}<br><span class="muted" style="font-weight:500">${esc(c.nama)}</span></td><td class="num small">${esc(ukuran(c.ukuran))}</td>
              <td style="text-align:right"><button class="btn ghost sm" data-pulih-oto="${esc(c.nama)}">${ic('refresh')} Pulihkan</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="small muted">Belum ada. Setiap hari, sebelum perubahan pertama, aplikasi menyimpan kondisi data di sini (14 terakhir).</div>'}
          <div class="row mt-s"><button class="btn ghost sm" data-folder>${ic('ext')} Buka folder data</button></div>
        </div></div>
        <div class="card"><div class="card-h"><h3>Pindah laptop</h3></div><div class="card-b small" style="color:var(--ink-2)">
          <ol style="padding-left:18px;margin:0" class="guide"><li>Di laptop lama: klik <b>Cadangkan Data</b>.</li><li>Salin file dari folder cadangan yang ditampilkan aplikasi ke laptop baru.</li><li>Di laptop baru, buka menu ini lalu klik <b>Pulihkan dari file…</b>.</li><li>Semua data, termasuk logo dan pengaturan, ikut pindah.</li></ol></div></div>
        <div class="card" style="border-color:#F3C7C9"><div class="card-h"><h3 style="color:var(--bad)">Zona hati-hati</h3></div><div class="card-b">
          <div class="row"><div style="flex:1;min-width:200px"><div class="b small">Semester baru</div><div class="small muted">Kosongkan nilai, kokurikuler, ekskul, kehadiran & catatan. ${sebutan()} aktif, mapel, dan TP tetap.</div></div><button class="btn danger sm" id="btnTahunBaru">Mulai semester baru</button></div>
          <div class="row mt" style="border-top:1px dashed var(--line);padding-top:12px"><div style="flex:1;min-width:200px"><div class="b small">Hapus semua data ${sebutan().toLowerCase()} & nilai</div><div class="small muted">Mis. setelah mencoba data contoh. Pengaturan, mapel, TP, kegiatan kokurikuler, dan daftar ekskul tetap.</div></div><button class="btn danger sm" id="btnKosongkan">Hapus semua</button></div>
          <div class="small muted mt">Sebelum menghapus, aplikasi otomatis menyimpan salinan di folder cadangan otomatis.</div>
        </div></div>
      </div>`;
    $('#btnCadang').onclick = () => window.desktop.cadangkan().then(r => { if (r.ok) { toastFile('Cadangan tersimpan', r.path); muat(); } }).catch(gagal);
    $('#btnPulih').onclick = () => konfirmasi('Pulihkan dari file cadangan?', 'Semua data di aplikasi akan <b>diganti</b> dengan isi file yang Anda pilih. Data saat ini disalin dulu ke folder cadangan otomatis.', 'Pilih file…', true)
      .then(ok => ok && window.desktop.pulihkan().then(selesaiPulih).catch(gagal));
    $('#btnBukaCadangan').onclick = () => window.desktop.bukaFolderCadangan().catch(gagal);
    $$('[data-pulih-oto]', v).forEach(b => b.onclick = () => konfirmasi('Pulihkan cadangan otomatis?', 'Data akan dikembalikan ke kondisi <b>' + esc(b.dataset.pulihOto) + '</b>. Data saat ini disalin dulu sebagai cadangan.', 'Pulihkan', true)
      .then(ok => ok && window.desktop.cadanganPulihkanOtomatis(b.dataset.pulihOto).then(selesaiPulih).catch(gagal)));
    $('#btnKosongkan').onclick = () => konfirmasi('Hapus semua data ' + sebutan().toLowerCase() + ' & nilai?', 'Semua <b>' + sebutan().toLowerCase() + ', nilai, kokurikuler, ekskul, kehadiran, dan catatan</b> akan dihapus.', 'Ya, hapus semua', true)
      .then(ok => ok && call('kosongkanSemua', {}, 'Menghapus…').then(d => { setData(d); renderChrome(); go('beranda', true); toast('Data dikosongkan'); }).catch(gagal));
    $('#btnTahunBaru').onclick = () => konfirmasi('Mulai semester baru?', 'Semua <b>nilai, kokurikuler, ekskul, kehadiran, dan catatan</b> akan dikosongkan. ' + sebutan() + ' berstatus pindah/keluar dihapus dari daftar. Saran: klik “Cadangkan sekarang” dulu sebagai arsip.', 'Kosongkan & mulai', true)
      .then(ok => ok && call('semesterBaru', {}, 'Menyiapkan…').then(d => { setData(d); renderChrome(); toast('Siap untuk semester baru — ubah semester & tanggal rapor di Pengaturan'); go('sekolah', true); }).catch(gagal));
  }).catch(gagal);
  var selesaiPulih = r => { if (r.ok) { S.dirty = false; toast('Data berhasil dipulihkan'); setTimeout(() => location.reload(), 600); } else if (r.error) toast(r.error, 'err'); };
  muat();
};
/** pengingat cadangan di beranda */
function pengingatCadangan(v) {
  if (!window.desktop || !window.desktop.cadanganInfo || !S.d.murid.length) return;
  window.desktop.cadanganInfo().then(i => {
    var t = [i.terakhirManual, i.terakhirTambahan].filter(Boolean).sort().pop();
    if (hariSejak(t) <= 14 || !v.isConnected) return;
    var el = document.createElement('div');
    el.className = 'preview-desk'; el.style.cssText = 'margin-bottom:14px;background:var(--warn-bg);border-color:#F1D9A2;color:#7A4E07;display:flex;align-items:center;gap:10px;flex-wrap:wrap';
    el.innerHTML = ic('alert') + '<span style="flex:1;min-width:220px">' + (t ? 'Data belum dicadangkan sejak <b>' + esc(waktuIndo(t)) + '</b>.' : 'Data rapor belum pernah dicadangkan ke luar laptop.') + ' Cadangkan agar aman bila laptop bermasalah.</span><button class="btn sm" data-go="cadangan">Cadangkan</button>';
    v.insertBefore(el, v.firstChild);
  }).catch(() => {});
}
