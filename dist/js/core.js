/* =========================================================
   RAPOR DIGITAL (aplikasi laptop) — Inti
   File ini dimuat sebagai script biasa (bukan modul) agar
   fungsi-fungsinya bisa dipakai bersama views.js & cetak.js.
   ========================================================= */
var S = { d: null, pin: '', view: 'beranda', dirty: false, charts: [], nilai: {}, koko: {}, eks: {}, hadir: {} };

/* ---------- ikon ---------- */
var IC = {
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
  school:'<path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9.5 21v-5h5v5"/><path d="M12 10h.01"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.2A6.5 6.5 0 0 1 21.5 20"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  book:'<path d="M4 19V5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  sparkle:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  medal:'<circle cx="12" cy="15" r="5"/><path d="M8.5 11 6 3h4l2 5 2-5h4l-2.5 8"/>',
  calendar:'<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  chart:'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  table:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  printer:'<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"/><path d="M12 17h.01"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  trash:'<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/>',
  save:'<path d="M5 3h11l5 5v13H3V3z"/><path d="M7 3v5h8"/><path d="M7 21v-7h10v7"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  upload:'<path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
  download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
  left:'<path d="m15 18-6-6 6-6"/>', right:'<path d="m9 18 6-6-6-6"/>',
  up:'<path d="m18 15-6-6-6 6"/>', down:'<path d="m6 9 6 6 6-6"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  alert:'<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  clip:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h6"/>',
  trophy:'<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  ext:'<path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
  lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  refresh:'<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  sliders:'<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'
};
function ic(n, cls) { return '<svg class="i ' + (cls || '') + '" viewBox="0 0 24 24">' + (IC[n] || '') + '</svg>'; }

/* ---------- util ---------- */
function $(s, el) { return (el || document).querySelector(s); }
function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function num(v) { var n = Number(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : 0; }
function nOrNull(v) { if (v === '' || v == null) return null; var n = Number(String(v).replace(',', '.')); return isFinite(n) ? n : null; }
function avg(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : null; }
function f1(n) { return n == null || isNaN(n) ? '–' : (Math.round(n * 10) / 10).toFixed(1).replace('.', ','); }
function f0(n) { return n == null || isNaN(n) ? '–' : String(Math.round(n)); }
function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }
function kap(s) { s = String(s || '').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function kecilAwal(s) { s = String(s || '').trim().replace(/[.;]+$/, ''); return s ? s.charAt(0).toLowerCase() + s.slice(1) : ''; }
function gabung(a) { a = a.filter(Boolean); if (a.length < 2) return a.join(''); return a.slice(0, -1).join(', ') + (a.length > 2 ? ', dan ' : ' dan ') + a[a.length - 1]; }
function inisial(n) { var p = String(n || '?').trim().split(/\s+/); return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase(); }
function jsonP(s, d) { if (s && typeof s === 'object') return s; try { var x = JSON.parse(s); return x == null ? d : x; } catch (e) { return d; } }
function romawi(k) { return ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'][num(k)] || String(k); }
function terbilang(k) { return ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas'][num(k)] || ''; }
var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
function tglIndo(s) {
  if (!s) return '';
  var m = String(s).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return String(s);
  return num(m[3]) + ' ' + BULAN[num(m[2]) - 1] + ' ' + m[1];
}
function uid(p) { return (p || 'X') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function debounce(fn, ms) { var t; return function () { var a = arguments, me = this; clearTimeout(t); t = setTimeout(function () { fn.apply(me, a); }, ms); }; }
function clone(o) { return JSON.parse(JSON.stringify(o)); }

/* ---------- warna ---------- */
function hexRgb(h) { h = String(h || '#1F56D6').replace('#', ''); if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join(''); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(h, w, t) { var a = hexRgb(h), b = hexRgb(w); return 'rgb(' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(',') + ')'; }
function brand() { return (S.d && P('warna_tema')) || '#1F56D6'; }
function terapkanWarna(hex) { document.documentElement.style.setProperty('--brand', hex || '#1F56D6'); var st = $('#brand-style'); if (st) st.textContent = ':root{--brand:' + (hex || '#1F56D6') + '}'; }
function terapkanSidebarBackground(draft) {
  draft = draft || {};
  var p = draft.sidebar_bg !== undefined ? (draft.sidebar_bg || './assets/sidebar-school-background.png') : (P('sidebar_bg') || './assets/sidebar-school-background.png');
  var warna = draft.sidebar_overlay || P('sidebar_overlay') || '#142747';
  var rawOpacity = draft.sidebar_opacity !== undefined ? draft.sidebar_opacity : P('sidebar_opacity');
  var op = Math.max(0, Math.min(100, Number(rawOpacity === '' || rawOpacity == null ? 55 : rawOpacity))) / 100;
  var st = $('#sidebar-background-style');
  if (!st) { st = document.createElement('style'); st.id = 'sidebar-background-style'; document.head.appendChild(st); }
  var safe = String(p).replace(/'/g, '%27');
  st.textContent = `.sidebar{background-color:${warna}!important;background-image:linear-gradient(${warna}${Math.round(op*255).toString(16).padStart(2,'0')},${warna}${Math.round(op*255).toString(16).padStart(2,'0')}),url('${safe}')!important;background-size:cover!important;background-position:center bottom!important;background-repeat:no-repeat!important}.sidebar .sb-item.on{background:var(--brand)!important}
  .sidebar .sb-name,.sidebar .sb-sub,.sidebar .sb-grp,.sidebar .sb-item,.sidebar .sb-foot{color:#fff!important}
  .sidebar .sb-sub{opacity:1!important}
  .sidebar .sb-item span{color:#fff!important;text-shadow:0 1px 3px rgba(0,0,0,.65)}
  .sidebar .sb-grp{color:#fff!important;text-shadow:0 1px 3px rgba(0,0,0,.75)}
  .sidebar .sb-item svg{color:#fff!important;stroke:#fff!important}
  .sidebar .sb-logo{box-shadow:0 3px 14px rgba(0,0,0,.22)}`;
}

/* ---------- toast / busy / modal ---------- */
function toast(msg, jenis) {
  var el = document.createElement('div');
  el.className = 'toast ' + (jenis || 'ok');
  el.innerHTML = (jenis === 'err' ? ic('alert') : ic('check')) + '<span>' + esc(msg) + '</span>';
  $('#toast').appendChild(el);
  setTimeout(function () { el.remove(); }, jenis === 'err' ? 5200 : 2600);
}
var busyN = 0;
function busy(on, tx) {
  busyN = Math.max(0, busyN + (on ? 1 : -1));
  $('#busyTx').textContent = tx || 'Menyimpan…';
  $('#busy').classList.toggle('on', busyN > 0);
}
function modal(o) {
  var root = $('#modal-root');
  var bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = '<div class="modal ' + (o.size || '') + '"><div class="modal-h"><h3>' + esc(o.title || '') + '</h3><span class="sp"></span>' +
    '<button class="btn ghost icon sm" data-x>' + ic('x') + '</button></div><div class="modal-b">' + (o.body || '') + '</div>' +
    (o.foot !== false ? '<div class="modal-f">' + (o.foot || '<button class="btn ghost" data-x>Tutup</button>') + '</div>' : '') + '</div>';
  root.appendChild(bg);
  var api = { el: bg, close: function () { bg.remove(); if (o.onClose) o.onClose(); } };
  bg.addEventListener('click', function (e) {
    if (e.target === bg || e.target.closest('[data-x]')) api.close();
  });
  if (o.onMount) o.onMount(bg, api);
  return api;
}
function konfirmasi(judul, pesan, label, bahaya) {
  return new Promise(function (res) {
    var m = modal({
      title: judul, body: '<p style="margin:0;color:var(--ink-2)">' + pesan + '</p>',
      foot: '<button class="btn ghost" data-x>Batal</button><button class="btn ' + (bahaya ? 'danger' : '') + '" data-ok>' + esc(label || 'Ya, lanjutkan') + '</button>',
      onClose: function () { res(false); }
    });
    $('[data-ok]', m.el).onclick = function () { res(true); m.el.remove(); };
  });
}

/* ---------- API ---------- */
function call(aksi, data, teksBusy) {
  var tulis = aksi !== 'muat' && aksi !== 'status';
  if (tulis) busy(true, teksBusy);
  return window.desktop.api({ aksi: aksi, data: data || {}, pin: S.pin }).then(function (r) {
    if (tulis) busy(false);
    if (!r) throw new Error('Aplikasi tidak merespons.');
    if (r.ok) return r.data;
    if (r.perluPin) tampilPin(r.error);
    throw new Error(r.error || 'Terjadi kesalahan.');
  }, function (e) {
    if (tulis) busy(false);
    throw e instanceof Error ? e : new Error(String(e && e.message || e));
  });
}
/** toast dengan tombol untuk membuka file hasil (PDF/Excel) */
function toastFile(msg, path) {
  var el = document.createElement('div');
  el.className = 'toast ok'; el.style.pointerEvents = 'auto';
  el.innerHTML = ic('check') + '<span>' + esc(msg) + '</span><button class="btn sm" style="margin-left:6px;padding:4px 10px">Buka</button>';
  $('button', el).onclick = function () { window.desktop.bukaFile(path); el.remove(); };
  $('#toast').appendChild(el);
  setTimeout(function () { el.remove(); }, 7000);
}
function gagal(e) { toast((e && e.message) || String(e), 'err'); console.error(e); }

/* ---------- data & indeks ---------- */
function P(k) { return S.d && S.d.pengaturan ? (S.d.pengaturan[k] == null ? '' : String(S.d.pengaturan[k])) : ''; }
function urut(a, b) { return num(a.urut) - num(b.urut); }

function setData(d) {
  S.d = d;
  reindex();
}
function reindex() {
  var d = S.d;
  d.murid.sort(urut); d.mapel.sort(urut); d.tp.sort(urut); d.ekskul.sort(urut); d.kegiatanKoko.sort(urut);
  S.nilai = {}; d.nilai.forEach(function (r) { r._tp = jsonP(r.nilai_tp, {}); r._lm = jsonP(r.nilai_lm, {}); S.nilai[r.siswa_id + '|' + r.mapel_id] = r; });
  S.koko = {}; d.nilaiKoko.forEach(function (r) { r._cap = jsonP(r.capaian, {}); S.koko[r.siswa_id] = r; });
  S.eks = {}; d.nilaiEkskul.forEach(function (r) { r._data = jsonP(r.data, []); S.eks[r.siswa_id] = r; });
  S.hadir = {}; d.kehadiran.forEach(function (r) { S.hadir[r.siswa_id] = r; });
  d.kegiatanKoko.forEach(function (k) { k._dim = String(k.dimensi || '').split('|').filter(Boolean); });
}

/* ---------- konstanta kurikulum ---------- */
var AGAMA = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu', 'Kepercayaan'];
var NAMA_PABP = {
  Islam: 'Pendidikan Agama Islam dan Budi Pekerti', Kristen: 'Pendidikan Agama Kristen dan Budi Pekerti',
  Katolik: 'Pendidikan Agama Katolik dan Budi Pekerti', Hindu: 'Pendidikan Agama Hindu dan Budi Pekerti',
  Buddha: 'Pendidikan Agama Buddha dan Budi Pekerti', Khonghucu: 'Pendidikan Agama Khonghucu dan Budi Pekerti',
  Kepercayaan: 'Pendidikan Kepercayaan terhadap Tuhan Yang Maha Esa dan Budi Pekerti'
};
var DIMENSI = ['Keimanan dan Ketakwaan terhadap Tuhan YME', 'Kewargaan', 'Penalaran Kritis', 'Kreativitas', 'Kolaborasi', 'Kemandirian', 'Kesehatan', 'Komunikasi'];
var DIMENSI_PENDEK = { 'Keimanan dan Ketakwaan terhadap Tuhan YME': 'Keimanan & Ketakwaan' };
var LEVEL_KOKO = ['Berkembang', 'Cakap', 'Mahir'];
var PREDIKAT_EKS = ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'];
var KELOMPOK = ['Umum', 'Kejuruan', 'Seni dan Budaya', 'Muatan Lokal', 'Pilihan'];

function normAgama(a) {
  a = String(a || '').trim().toLowerCase();
  if (!a) return '';
  if (a.indexOf('islam') >= 0) return 'Islam';
  if (a.indexOf('kristen') >= 0 || a.indexOf('protestan') >= 0) return 'Kristen';
  if (a.indexOf('katol') >= 0) return 'Katolik';
  if (a.indexOf('hindu') >= 0) return 'Hindu';
  if (a.indexOf('bud') >= 0) return 'Buddha';
  if (a.indexOf('kong') >= 0 || a.indexOf('khong') >= 0) return 'Khonghucu';
  if (a.indexOf('percaya') >= 0) return 'Kepercayaan';
  return kap(a);
}
function fase(k) { k = num(k); return k <= 2 ? 'A' : k <= 4 ? 'B' : k <= 6 ? 'C' : k <= 9 ? 'D' : k === 10 ? 'E' : 'F'; }
/** Rentang kelas per jenjang */
function kelasJenjang(j) { return { SMP: [7, 8, 9], SMA: [10, 11, 12], SMK: [10, 11, 12] }[j] || [1, 2, 3, 4, 5, 6]; }
var TEKS_JENJANG = { SD: 'SEKOLAH DASAR (SD)', SMP: 'SEKOLAH MENENGAH PERTAMA (SMP)', SMA: 'SEKOLAH MENENGAH ATAS (SMA)', SMK: 'SEKOLAH MENENGAH KEJURUAN (SMK)' };
function teksJenjang() { return String(P('teks_jenjang') || '').trim() || TEKS_JENJANG[P('jenjang') || 'SD'] || TEKS_JENJANG.SD; }
function tulisKelas(k) { return P('kelas_romawi') === 'Ya' ? romawi(k) : String(k); }
function namaKelas() { return tulisKelas(P('kelas')) + (P('rombel') ? ' ' + P('rombel') : ''); }
function teksSemester() { return P('semester') === '2' ? '2 (Genap)' : '1 (Ganjil)'; }
function sebutan() { return P('sebutan_murid') || 'Murid'; }
function judulApp() {
  var n = P('nama_aplikasi').trim(); if (n) return n;
  var s = P('nama_sekolah').trim(); return s ? 'Rapor Digital ' + s : 'Rapor Digital';
}

function mapelAktif() { return S.d.mapel.filter(function (m) { return String(m.aktif) === 'Ya'; }); }
function mapelById(id) { for (var i = 0; i < S.d.mapel.length; i++) if (S.d.mapel[i].id === id) return S.d.mapel[i]; return null; }
function muridById(id) { for (var i = 0; i < S.d.murid.length; i++) if (String(S.d.murid[i].id) === String(id)) return S.d.murid[i]; return null; }
function isAgama(m) { return m && m.id === 'AGAMA'; }
function namaMapelUntuk(m, murid) { return isAgama(m) && murid && NAMA_PABP[normAgama(murid.agama)] ? NAMA_PABP[normAgama(murid.agama)] : m.nama; }
function kktp(m) { return num(m && m.kktp) || num(P('kktp')) || 75; }
var AWALAN_NAMA = ['ahmad', 'achmad', 'akhmad', 'muhammad', 'muhamad', 'mohammad', 'mohamad', 'mochammad', 'mochamad', 'mohammed', 'moch', 'moh', 'muh', 'mhd', 'm', 'siti', 'nur', 'ni', 'i', 'putu', 'made', 'kadek', 'komang', 'ketut', 'gede', 'luh', 'ida', 'gusti', 'raden', 'r', 'rr', 'andi', 'tengku', 'teuku', 'cut', 'dewa', 'anak', 'agung'];
/** Nama panggilan otomatis: melewati awalan umum (Muhammad, Moch., Siti, Nur, Ni, I Made, …) */
function panggilanOtomatis(nama) {
  var p = String(nama || '').trim().split(/\s+/).filter(Boolean), i = 0;
  if (!p.length) return '';
  while (i < p.length - 1 && AWALAN_NAMA.indexOf(p[i].toLowerCase().replace(/\.$/, '')) >= 0) i++;
  var w = p[i].replace(/[.,]$/, '');
  return w === w.toUpperCase() ? w.charAt(0) + w.slice(1).toLowerCase() : w;
}
function panggilan(murid) { return murid.panggilan || panggilanOtomatis(murid.nama); }
/** status murid: Aktif / Pindah / Keluar. Rapor, nilai, dan leger hanya untuk murid aktif. */
function statusMurid(m) { return m && m.status && m.status !== 'Aktif' ? m.status : 'Aktif'; }
function MA() { return S.d.murid.filter(function (m) { return statusMurid(m) === 'Aktif'; }); }
/** nama murid di rapor: sesuai data atau HURUF BESAR (pengaturan) */
function namaCetak(m) { return P('nama_kapital') === 'Ya' ? String(m.nama).toUpperCase() : String(m.nama); }
function agamaDipakai() {
  var a = {}; MA().forEach(function (m) { var g = normAgama(m.agama) || 'Islam'; a[g] = (a[g] || 0) + 1; });
  return Object.keys(a).sort(function (x, y) { return a[y] - a[x]; });
}

function tpList(mid, agama) {
  var all = S.d.tp.filter(function (t) { return t.mapel_id === mid; });
  if (mid !== 'AGAMA') return all.filter(function (t) { return !t.agama; });
  var ag = normAgama(agama) || 'Islam';
  var spes = all.filter(function (t) { return normAgama(t.agama) === ag; });
  return spes.length ? spes : all.filter(function (t) { return !t.agama; });
}

/* ---------- perhitungan nilai ---------- */
function predikat(n, m) {
  if (n == null) return '';
  if (n >= (num(P('batas_sangat_baik')) || 90)) return 'sangat baik';
  if (n >= (num(P('batas_baik')) || 80)) return 'baik';
  if (n >= kktp(m)) return 'cukup';
  return 'perlu bimbingan';
}
function chipPredikat(n, m) {
  var p = predikat(n, m);
  var c = { 'sangat baik': 'c-sb', 'baik': 'c-b', 'cukup': 'c-c', 'perlu bimbingan': 'c-pb' }[p] || 'c-0';
  return '<span class="chip ' + c + '">' + (p ? kap(p) : 'Belum ada') + '</span>';
}
function normalisasiNamaLM(nama) { return String(nama || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID'); }
function hitung(murid, m, row) {
  row = row || S.nilai[murid.id + '|' + m.id];
  var tps = tpList(m.id, murid.agama), skor = [];
  if (row) tps.forEach(function (t) {
    var v = nOrNull(row._tp[t.id]);
    if (v != null) skor.push({ tp: t, v: v });
  });
  // Nilai LM diinput langsung oleh guru, tidak dihitung dari nilai TP.
  var daftarLM = (S.d.lingkupMateri || []).filter(function (g) {
    return String(g.mapel_id) === String(m.id) &&
      String(g.agama || '') === (m.id === 'AGAMA' ? (normAgama(murid.agama) || 'Islam') : '') &&
      g.status === 'Aktif';
  }).sort(function (a, b) { return num(a.urut) - num(b.urut); });
  var nilaiLM = {}, rincianLM = daftarLM.map(function (g) {
    var nilai = row ? nOrNull((row._lm || {})[g.id]) : null;
    if (nilai != null) nilaiLM[g.id] = nilai;
    return { id: g.id, nama: g.nama, nilai: nilai };
  });
  var nilaiRataLM = avg(rincianLM.map(function (x) { return x.nilai; }).filter(function (x) { return x != null; }));
  var sas = row ? nOrNull(row.sas) : null, sts = row ? nOrNull(row.sts) : null;
  var rt = skor.length ? avg(skor.map(function (x) { return x.v; })) : null;
  var na = nilaiAkhir(nilaiRataLM, sas);
  return { tps: tps, skor: skor, sts: sts, sas: sas, rt: rt, nilaiLM: nilaiLM, rincianLM: rincianLM, rataLM: nilaiRataLM, na: na == null ? null : Math.round(na), row: row };
}
/** Nilai akhir hanya menggunakan rata-rata Lingkup Materi dan SAS. STS tetap disimpan, TP tetap menjadi sumber deskripsi. */
function bobotNilai() { return { lm: num(P('bobot_lm')), sas: num(P('bobot_sas')) }; }
function nilaiAkhir(lm, sas, b) {
  b = b || bobotNilai();
  var ada = [[lm, b.lm], [sas, b.sas]].filter(function (x) { return x[0] != null; });
  if (!ada.length) return null;
  var w = ada.reduce(function (a, x) { return a + x[1]; }, 0);
  if (!w) return null;
  return ada.reduce(function (a, x) { return a + x[0] * x[1]; }, 0) / w;
}
function teksBobot() { var b = bobotNilai(); return 'Lingkup Materi ' + b.lm + '% + SAS ' + b.sas + '%'; }
function deskripsiOtomatis(murid, m, h) {
  h = h || hitung(murid, m);
  if (!h.skor.length) return '';
  var k = kktp(m), n = Math.min(3, Math.max(1, num(P('desk_jumlah_tp')) || 2));
  var tuntas = h.skor.filter(function (s) { return s.v >= k; }).sort(function (a, b) { return b.v - a.v; });
  var belum = h.skor.filter(function (s) { return s.v < k; }).sort(function (a, b) { return a.v - b.v; });
  var teks = function (arr) { return gabung(arr.map(function (s) { return kecilAwal(s.tp.tujuan || s.tp.lingkup_materi); })); };
  var bag = [];
  if (tuntas.length) {
    var top = tuntas.slice(0, n);
    var pr = predikat(avg(top.map(function (s) { return s.v; })), m);
    pr = pr === 'cukup' ? 'cukup baik' : pr;
    bag.push((P('kalimat_kuat') || 'menunjukkan penguasaan yang {predikat} dalam').replace('{predikat}', pr) + ' ' + teks(top));
  }
  if (belum.length) bag.push((P('kalimat_lemah') || 'perlu bimbingan dalam') + ' ' + teks(belum.slice(0, n)));
  else if (tuntas.length > n) bag.push((P('kalimat_tingkat') || 'perlu peningkatan dalam') + ' ' + teks([tuntas[tuntas.length - 1]]));
  var subj = P('desk_pakai_nama') === 'Ya' ? 'Ananda ' + panggilan(murid) + ' ' : '';
  return bag.map(function (b, i) { return i === 0 && subj ? subj + b + '.' : kap(b) + '.'; }).join(' ');
}
function deskripsi(murid, m, h) {
  h = h || hitung(murid, m);
  // Deskripsi yang telah disetujui guru menjadi prioritas tertinggi.
  // deskripsi_manual dipertahankan sebagai kompatibilitas data versi lama.
  return (h.row && String(h.row.deskripsi_final || '').trim()) ||
    (h.row && String(h.row.deskripsi_manual || '').trim()) ||
    deskripsiOtomatis(murid, m, h);
}
/** Daftar mapel untuk seorang murid (aktif & relevan). */
function mapelMurid(murid) {
  return mapelAktif().filter(function (m) {
    if (m.kelompok === 'Seni dan Budaya' || m.kelompok === 'Pilihan' || m.kelompok === 'Muatan Lokal') {
      var h = hitung(murid, m); return h.na != null || mapelAktif().filter(function (x) { return x.kelompok === m.kelompok; }).length === 1;
    }
    return true;
  });
}
function rataMurid(murid) {
  var a = []; mapelAktif().forEach(function (m) { var h = hitung(murid, m); if (h.na != null) a.push(h.na); });
  return { rata: avg(a), jumlah: a.reduce(function (x, y) { return x + y; }, 0), n: a.length };
}
function peringkat() {
  var arr = MA().map(function (m) { var r = rataMurid(m); return { m: m, rata: r.rata, jumlah: r.jumlah }; })
    .filter(function (x) { return x.rata != null; }).sort(function (a, b) { return b.rata - a.rata; });
  var rk = {}, prev = null, pos = 0;
  arr.forEach(function (x, i) { var key = Math.round(x.rata * 100); if (key !== prev) { pos = i + 1; prev = key; } rk[x.m.id] = pos; x.rank = pos; });
  return { list: arr, rank: rk };
}
function rataKelasMapel(m) {
  var a = []; MA().forEach(function (mu) { var h = hitung(mu, m); if (h.na != null) a.push(h.na); });
  return { rata: avg(a), n: a.length, max: a.length ? Math.max.apply(null, a) : null, min: a.length ? Math.min.apply(null, a) : null, list: a };
}

/* ---------- kokurikuler, ekskul, catatan ---------- */
function deskripsiKokoOtomatis(murid) {
  var r = S.koko[murid.id]; if (!r) return '';
  var subj = P('desk_pakai_nama') === 'Ya' ? 'Ananda ' + panggilan(murid) : 'Ananda';
  var out = [];
  S.d.kegiatanKoko.forEach(function (k) {
    var cap = r._cap[k.id]; if (!cap) return;
    var g = { Mahir: [], Cakap: [], Berkembang: [] };
    k._dim.forEach(function (d) { if (cap[d] && g[cap[d]]) g[cap[d]].push(d); });
    var pos = [];
    if (g.Mahir.length) pos.push('sangat baik pada dimensi ' + gabung(g.Mahir.map(kecilDim)));
    if (g.Cakap.length) pos.push('baik pada dimensi ' + gabung(g.Cakap.map(kecilDim)));
    var neg = g.Berkembang.length ? 'masih perlu penguatan pada dimensi ' + gabung(g.Berkembang.map(kecilDim)) : '';
    if (!pos.length && !neg) return;
    out.push('Melalui kegiatan ' + k.nama_kegiatan + ', ' + subj + (pos.length ? ' menunjukkan capaian ' + pos.join(' dan ') : '') + (neg ? (pos.length ? ', serta ' : ' ') + neg : '') + '.');
  });
  return out.join(' ');
}
function kecilDim(d) { return d.replace('Keimanan dan Ketakwaan terhadap Tuhan YME', 'keimanan dan ketakwaan terhadap Tuhan YME').toLowerCase().replace('tuhan yme', 'Tuhan YME'); }
function deskripsiKoko(murid) { var r = S.koko[murid.id]; return (r && String(r.deskripsi_manual || '').trim()) || deskripsiKokoOtomatis(murid); }

function ketEkskulOtomatis(nama, pred) {
  var t = {
    'Sangat Baik': 'Sangat baik, aktif dan antusias dalam mengikuti kegiatan ' + nama + '.',
    'Baik': 'Baik, rutin dan bersungguh-sungguh mengikuti kegiatan ' + nama + '.',
    'Cukup': 'Cukup, perlu lebih aktif dalam mengikuti kegiatan ' + nama + '.',
    'Kurang': 'Perlu bimbingan dan motivasi untuk lebih aktif dalam kegiatan ' + nama + '.'
  };
  return t[pred] || '';
}
function ekskulById(id) { for (var i = 0; i < S.d.ekskul.length; i++) if (S.d.ekskul[i].id === id) return S.d.ekskul[i]; return null; }
function ekskulMurid(murid) {
  var r = S.eks[murid.id]; if (!r) return [];
  return r._data.filter(function (x) { return x.ekskul_id && ekskulById(x.ekskul_id); }).map(function (x) {
    var e = ekskulById(x.ekskul_id);
    return { nama: e.nama, predikat: x.predikat, ket: x.keterangan || ketEkskulOtomatis(e.nama, x.predikat) };
  });
}
function catatanOtomatis(murid) {
  var r = rataMurid(murid).rata, n = panggilan(murid);
  if (r == null) return '';
  if (r >= 90) return 'Ananda ' + n + ' menunjukkan prestasi yang sangat membanggakan. Pertahankan semangat belajar dan terus berbagi kebaikan dengan teman-teman.';
  if (r >= 80) return 'Ananda ' + n + ' sudah belajar dengan baik. Terus tingkatkan rasa ingin tahu dan kebiasaan membaca agar capaianmu semakin optimal.';
  if (r >= kktp()) return 'Ananda ' + n + ' sudah berusaha dengan cukup baik. Tingkatkan lagi ketekunan dan keberanian bertanya saat ada materi yang belum dipahami.';
  return 'Ananda ' + n + ' perlu pendampingan belajar lebih intensif di rumah dan di sekolah. Tetap semangat, setiap usaha kecil akan membawa kemajuan.';
}
function keputusanOpsi() {
  var k = num(P('kelas'));
  var akhir = kelasJenjang(P('jenjang') || 'SD'); if (k >= akhir[akhir.length - 1]) return ['Lulus', 'Belum Lulus'];
  return ['Naik ke Kelas ' + romawi(k + 1) + ' (' + terbilang(k + 1) + ')', 'Tinggal di Kelas ' + romawi(k) + ' (' + terbilang(k) + ')'];
}

/* ---------- kesiapan rapor ---------- */
function kesiapan() {
  var d = S.d, MU = MA(), M = MU.length, mp = mapelAktif();
  var prof = ['nama_sekolah', 'npsn', 'kepala_sekolah', 'wali_kelas', 'tahun_pelajaran', 'tanggal_rapor', 'tempat_rapor'];
  var pf = prof.filter(function (k) { return P(k).trim(); }).length;
  var tpOk = 0, tpTot = 0;
  mp.forEach(function (m) {
    if (isAgama(m)) agamaDipakai().forEach(function (a) { tpTot++; if (tpList('AGAMA', a).length) tpOk++; });
    else { tpTot++; if (tpList(m.id).length) tpOk++; }
  });
  var nIsi = 0, nTot = 0;
  MU.forEach(function (mu) { mapelMurid(mu).forEach(function (m) { nTot++; if (hitung(mu, m).na != null) nIsi++; }); });
  var kk = MU.filter(function (mu) { return deskripsiKoko(mu); }).length;
  var ek = MU.filter(function (mu) { return ekskulMurid(mu).length; }).length;
  var ct = MU.filter(function (mu) { var h = S.hadir[mu.id]; return h && String(h.catatan || '').trim(); }).length;
  var st = [
    { t: 'Profil sekolah & periode', d: pf + ' dari ' + prof.length + ' data inti terisi', p: pct(pf, prof.length), v: 'sekolah' },
    { t: 'Data ' + sebutan().toLowerCase(), d: M + ' ' + sebutan().toLowerCase() + ' terdaftar', p: M ? 100 : 0, v: 'murid' },
    { t: 'Tujuan pembelajaran (TP)', d: tpOk + ' dari ' + tpTot + ' mapel sudah punya TP', p: pct(tpOk, tpTot), v: 'mapel' },
    { t: 'Nilai intrakurikuler', d: nIsi + ' dari ' + nTot + ' nilai akhir terisi', p: pct(nIsi, nTot), v: 'nilai' },
    { t: 'Kokurikuler', d: kk + ' dari ' + M + ' ' + sebutan().toLowerCase() + ' sudah dinilai', p: pct(kk, M), v: 'koko' },
    { t: 'Ekstrakurikuler', d: ek + ' dari ' + M + ' ' + sebutan().toLowerCase() + ' sudah diisi', p: pct(ek, M), v: 'ekskul' },
    { t: 'Kehadiran & catatan wali kelas', d: ct + ' dari ' + M + ' catatan terisi', p: pct(ct, M), v: 'hadir' }
  ];
  var tot = Math.round(avg(st.map(function (s) { return s.p; })));
  return { langkah: st, total: tot };
}

/* ---------- grafik ---------- */
function bersihkanGrafik() { S.charts.forEach(function (c) { try { c.destroy(); } catch (e) {} }); S.charts = []; }
function grafik(canvas, cfg, simpan) {
  if (!window.Chart || !canvas) { if (canvas) canvas.parentNode.innerHTML = '<div class="muted small" style="padding:20px;text-align:center">Grafik tidak dapat dimuat.</div>'; return null; }
  Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
  Chart.defaults.color = '#4A556E';
  Chart.defaults.borderColor = '#EEF1F6';
  var c = new Chart(canvas, cfg);
  if (simpan !== false) S.charts.push(c);
  return c;
}
var TOOLTIP = { backgroundColor: '#121A2E', padding: 10, cornerRadius: 8, titleFont: { weight: '700' }, bodyFont: { weight: '600' }, displayColors: true, boxPadding: 4 };

/* ---------- navigasi ---------- */
var NAV = [
  { g: 'Utama', it: [['beranda', 'Beranda', 'home']] },
  { g: 'Data', it: [['sekolah', 'Profil & Pengaturan', 'school'], ['murid', 'Data Murid', 'users'], ['mapel', 'Mapel & TP', 'book'], ['cadangan', 'Cadangan & Pulihkan', 'download']] },
  { g: 'Penilaian', it: [['nilai', 'Input Nilai', 'edit'], ['koko', 'Kokurikuler', 'sparkle'], ['ekskul', 'Ekstrakurikuler', 'medal'], ['hadir', 'Kehadiran & Catatan', 'calendar']] },
  { g: 'Laporan', it: [['analisis', 'Analisis Murid', 'chart'], ['leger', 'Leger Nilai', 'table'], ['cetak', 'Cetak Rapor', 'printer'], ['editorDokumen', 'Editor Dokumen', 'edit']] },
  { g: 'Bantuan', it: [['panduan', 'Panduan', 'help']] }
];
function labelNav(id) {
  for (var i = 0; i < NAV.length; i++) for (var j = 0; j < NAV[i].it.length; j++) if (NAV[i].it[j][0] === id) return NAV[i].it[j][1];
  return '';
}

/* Sidebar desktop dapat diperkecil; pilihan disimpan lokal */
function sidebarRingkasBaca() { try { return localStorage.getItem('raporDigital.sidebarRingkas')==='Ya'; } catch(e) { return false; } }
function terapkanSidebarRingkas(ringkas) {
  var shell=$('#shell'); if(!shell)return;
  shell.classList.toggle('sidebar-collapsed',!!ringkas);
  var btn=$('#sidebarCollapse');
  if(btn){btn.innerHTML=ic(ringkas?'right':'left');btn.title=ringkas?'Perluas sidebar':'Perkecil sidebar';btn.setAttribute('aria-label',btn.title);}
  var st=$('#sidebar-collapse-style');
  if(!st){st=document.createElement('style');st.id='sidebar-collapse-style';document.head.appendChild(st);}
  st.textContent=`@media(min-width:900px){
    #shell.sidebar-collapsed .sidebar{width:76px!important;min-width:76px!important}
    #shell.sidebar-collapsed .sb-brand{justify-content:center;padding:16px 8px}
    #shell.sidebar-collapsed .sb-brand>div:not(.sb-logo){display:none!important}
    #shell.sidebar-collapsed .sb-logo{margin:0 auto}
    #shell.sidebar-collapsed .sb-grp,#shell.sidebar-collapsed .sb-item span,#shell.sidebar-collapsed .sb-foot{display:none!important}
    #shell.sidebar-collapsed .sb-item{justify-content:center;padding:13px 8px;margin:5px 8px}
    #shell.sidebar-collapsed .sb-item svg{margin:0;width:21px;height:21px}
    #sidebarCollapse{display:grid;place-items:center;width:34px;height:30px;margin:4px auto 10px;border:1px solid rgba(255,255,255,.35);border-radius:9px;background:rgba(255,255,255,.12);color:inherit;cursor:pointer}
    #sidebarCollapse svg{width:17px;height:17px}
    #shell:not(.sidebar-collapsed) #sidebarCollapse{align-self:flex-end;margin:0 12px 8px auto}
  }
  @media(max-width:899px){#sidebarCollapse{display:none!important}}`;
}
function toggleSidebarRingkas() {
  var next=!$('#shell').classList.contains('sidebar-collapsed');
  try { localStorage.setItem('raporDigital.sidebarRingkas',next?'Ya':'Tidak'); } catch(e) {}
  terapkanSidebarRingkas(next);
}
function renderNav() {
  $('#nav').innerHTML = NAV.map(function (g) {
    return '<div class="sb-grp">' + g.g + '</div>' + g.it.map(function (x) {
      var lb = x[0] === 'murid' ? 'Data ' + sebutan() : x[1];
      return '<button class="sb-item ' + (S.view === x[0] ? 'on' : '') + '" data-go="' + x[0] + '" title="' + lb + '">' + ic(x[2]) + '<span>' + lb + '</span></button>';
    }).join('');
  }).join('');
}
function renderChrome() {
  var logo = P('logo');
  $('#sbLogo').innerHTML = logo ? '<img src="' + esc(logo) + '" alt="">' : esc(inisial(P('nama_sekolah') || 'Rapor'));
  $('#sbName').textContent = judulApp();
  $('#sbSub').textContent = (P('nama_sekolah') || 'Nama sekolah') + ' · Kurikulum Merdeka';
  $('#sbFoot').textContent = 'Rapor Digital · v' + (S.d.versi || '1.0');
  $('#tbMeta').innerHTML = '<span class="pill brand">Kelas ' + esc(namaKelas()) + '</span><span class="pill">Semester ' + esc(teksSemester()) + '</span><span class="pill">TP ' + esc(P('tahun_pelajaran')) + '</span>';
  document.title = judulApp();
  terapkanWarna(P('warna_tema'));
  terapkanSidebarBackground();
  renderNav();
}
function go(id, paksa) {
  if (S.dirty && !paksa) {
    konfirmasi('Perubahan belum disimpan', 'Ada perubahan yang belum disimpan. Tinggalkan halaman ini?', 'Tinggalkan', true)
      .then(function (ok) { if (ok) { S.dirty = false; go(id, true); } });
    return;
  }
  S.dirty = false;
  S.view = id;
  bersihkanGrafik();
  $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('open');
  $('#pageTitle').textContent = id === 'murid' ? 'Data ' + sebutan() : labelNav(id);
  renderNav();
  var lama = $('#view'), v = lama.cloneNode(false); // elemen baru = event listener lama ikut terhapus
  lama.parentNode.replaceChild(v, lama);
  window.scrollTo(0, 0);
  try { (VIEWS[id] || VIEWS.beranda)(v); } catch (e) { v.innerHTML = '<div class="card card-b">Terjadi kesalahan: ' + esc(e.message) + '</div>'; console.error(e); }
}
function tandaiBerubah(on) { S.dirty = on !== false; var sb = $('.savebar'); if (sb) { sb.classList.toggle('clean', !S.dirty); var m = $('.msg', sb); if (m) m.textContent = S.dirty ? 'Ada perubahan yang belum disimpan' : 'Semua perubahan sudah tersimpan'; } }
window.addEventListener('beforeunload', function (e) { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });

/* ---------- PIN ---------- */
function tampilPin(pesan) {
  if ($('#pinWrap')) { $('#pinMsg').textContent = pesan || ''; return; }
  $('#loader').classList.add('hide');
  var w = document.createElement('div');
  w.className = 'pin-wrap'; w.id = 'pinWrap';
  w.innerHTML = '<div class="pin-card"><div class="empty" style="padding:0 0 10px"><div class="art">' + ic('lock') + '</div></div>' +
    '<h3 style="margin:0 0 4px">' + esc(document.title) + '</h3><p class="muted small" style="margin:0 0 16px">Masukkan PIN untuk membuka aplikasi rapor</p>' +
    '<input class="inp" id="pinIn" type="password" inputmode="numeric" maxlength="12" autocomplete="off">' +
    '<div id="pinMsg" class="small" style="color:var(--bad);min-height:20px;margin:8px 0"></div>' +
    '<button class="btn" style="width:100%" id="pinBtn">Masuk</button></div>';
  document.body.appendChild(w);
  var masuk = function () {
    S.pin = $('#pinIn').value.trim();
    try { sessionStorage.setItem('rapor_pin', S.pin); } catch (e) {}
    $('#pinMsg').textContent = '';
    muatData().then(function () { w.remove(); }).catch(function () {});
  };
  $('#pinBtn').onclick = masuk;
  $('#pinIn').onkeydown = function (e) { if (e.key === 'Enter') masuk(); };
  if (pesan) $('#pinMsg').textContent = pesan;
  setTimeout(function () { $('#pinIn').focus(); }, 50);
}

/* ---------- boot ---------- */
function muatData() {
  return call('muat').then(function (d) {
    setData(d);
    renderChrome();
    $('#loader').classList.add('hide');
    go(S.view || 'beranda', true);
  });
}
function muatUlang() { return call('muat').then(function (d) { setData(d); renderChrome(); }); }

/* ---------- navigasi keyboard di semua tabel (panah atas/bawah/kiri/kanan & Enter) ---------- */
document.addEventListener('keydown', function (e) {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  var k = e.key;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].indexOf(k) < 0) return;
  var el = e.target; if (!el || !el.closest) return;
  var grid = el.closest('table.tbl, .kgrid'), baris = el.closest('tr, .kr');
  if (!grid || !baris) return;
  var tag = el.tagName, teks = (tag === 'INPUT' && !/checkbox|radio|file|date|color/.test(el.type)) || tag === 'TEXTAREA';
  if (tag === 'SELECT' && (k === 'ArrowUp' || k === 'ArrowDown')) return;            // biarkan dropdown memilih
  if (k === 'Enter' && (tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'SELECT')) return;
  if (el.type === 'date' && (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown')) return;
  if (teks && (k === 'ArrowLeft' || k === 'ArrowRight')) {                            // kiri/kanan hanya di ujung teks
    if (k === 'ArrowLeft' && !(el.selectionStart === 0 && el.selectionEnd === 0)) return;
    if (k === 'ArrowRight' && el.selectionStart !== el.value.length) return;
  }
  if (tag === 'TEXTAREA' && (k === 'ArrowUp' || k === 'ArrowDown')) {                 // di catatan: hanya dari baris pertama/terakhir
    var pos = el.selectionStart;
    if (k === 'ArrowUp' && el.value.lastIndexOf('\n', pos - 1) !== -1) return;
    if (k === 'ArrowDown' && el.value.indexOf('\n', pos) !== -1) return;
  }
  var bisa = function (wadah) {
    return Array.prototype.filter.call(wadah.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=file]), select, textarea, button.lv4'),
      function (x) { return !x.disabled && x.offsetParent !== null; });
  };
  var rows = Array.prototype.filter.call(grid.querySelectorAll('tr, .kr'), function (r) { return bisa(r).length; });
  var ri = rows.indexOf(baris), items = bisa(baris), ci = items.indexOf(el);
  if (ri < 0 || ci < 0) return;
  var target = null;
  if (k === 'ArrowLeft' || k === 'ArrowRight') target = items[ci + (k === 'ArrowRight' ? 1 : -1)];
  else {
    var r2 = rows[ri + (k === 'ArrowUp' ? -1 : 1)]; if (!r2) return;
    var td = el.closest('td, th');
    if (td && r2.cells && r2.cells[td.cellIndex]) target = bisa(r2.cells[td.cellIndex])[0];
    if (!target) { var it = bisa(r2); target = it[Math.min(ci, it.length - 1)]; }
  }
  if (!target) return;
  e.preventDefault(); target.focus();
  if (target.tagName === 'INPUT' && target.select) target.select();
});

document.addEventListener('click', function (e) {
  var g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); go(g.getAttribute('data-go')); }
  if (e.target.closest('[data-folder]')) window.desktop.bukaFolderData();
});
window.addEventListener('load', function () {
  $('#burger').innerHTML = ic('menu');
  $('#burger').onclick = function () { $('#sidebar').classList.add('open'); $('#scrim').classList.add('open'); };
  var collapse=$('#sidebarCollapse'); if(collapse) collapse.onclick=toggleSidebarRingkas;
  terapkanSidebarRingkas(sidebarRingkasBaca());
  $('#scrim').onclick = function () { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('open'); };
  try { S.pin = sessionStorage.getItem('rapor_pin') || ''; } catch (e) {}
  call('status').then(function (st) {
    if (st.perluPin && !S.pin) { tampilPin(); return; }
    return muatData();
  }).catch(function (e) {
    if (!$('#pinWrap')) { $('#loader').innerHTML = '<div class="box"><div class="b">Gagal memuat data</div><div class="small muted">' + esc(e.message) + '</div></div>'; }
  });
});
