/**
 * Logika aplikasi Rapor Digital (port dari Code.gs versi Google Apps Script).
 * Semua aksi dipanggil dari tampilan lewat IPC: api({ aksi, data, pin }).
 * Nama aksi & bentuk data sama dengan versi spreadsheet.
 */
const APP = { VERSI: require('../../package.json').version, NAMA_PRODUK: 'Rapor Digital' };
let store = null;
let infoLingkungan = {};

/* ---------- helper tabel (pengganti SpreadsheetApp) ---------- */
function bacaTabel_(nama) { return store.baca(nama); }
function tulisTabel_(nama, rows) { store.tulis(nama, rows); }
function upsert_(nama, kunci, rows) { store.upsert(nama, kunci, rows); }
function cariIndex_(rows, f, v) { for (var i = 0; i < rows.length; i++) if (String(rows[i][f]) === String(v)) return i; return -1; }
function buatId_(a) { return a + '_' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
function sekarang_() {
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

/** Normalisasi nama lingkup materi: kapitalisasi dan variasi spasi tidak membuat grup baru. */
function normalisasiLM_(nama) {
  return String(nama || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID');
}
/** Sinkronkan kelompok LM dari TP. Kelompok yang hilang diarsipkan, bukan dihapus. */
function sinkronLingkupMateri_(mapelId, agama) {
  var mid = String(mapelId), ag = String(agama || ''), tp = bacaTabel_('TP');
  var sumber = {}, daftar = [];
  tp.filter(function (t) { return String(t.mapel_id) === mid && String(t.agama || '') === ag; }).forEach(function (t) {
    var nama = String(t.lingkup_materi || '').normalize('NFKC').trim().replace(/\s+/g, ' ');
    var key = normalisasiLM_(nama); if (!key) return;
    if (!sumber[key]) sumber[key] = nama;
  });
  var rows = bacaTabel_('LINGKUP_MATERI'), aktif = {};
  rows.forEach(function (r) {
    if (String(r.mapel_id) !== mid || String(r.agama || '') !== ag || r.status !== 'Aktif') return;
    var key = r.nama_normalisasi || normalisasiLM_(r.nama);
    if (!aktif[key]) aktif[key] = r; else { r.status = 'Arsip'; r.diarsipkan = sekarang_(); }
  });
  Object.keys(aktif).forEach(function (key) {
    if (!Object.prototype.hasOwnProperty.call(sumber, key)) { aktif[key].status = 'Arsip'; aktif[key].diarsipkan = sekarang_(); }
  });
  Object.keys(sumber).forEach(function (key) {
    if (aktif[key] && aktif[key].status === 'Aktif') return;
    rows.push({ id: buatId_('LM'), mapel_id: mid, agama: ag, nama: sumber[key], nama_normalisasi: key, status: 'Aktif', dibuat: sekarang_(), diarsipkan: '' });
  });
  tulisTabel_('LINGKUP_MATERI', rows);
  return rows.filter(function (r) { return String(r.mapel_id) === mid && String(r.agama || '') === ag; });
}

var DEFAULT_SEKOLAH = require('./defaults/school-defaults.json');

var PENGATURAN_AWAL = [
  ['nama_aplikasi', '', 'Kosongkan = otomatis "Rapor Digital <nama sekolah>"'],
  ['nama_sekolah', '', ''],
  ['npsn', '', ''],
  ['nss', '', 'NIS/NSS/NDS sekolah'],
  ['alamat_sekolah', '', 'Jalan / nomor'],
  ['desa', '', 'Kelurahan / desa'],
  ['kecamatan', '', ''],
  ['kabupaten', '', 'Kabupaten / kota'],
  ['provinsi', '', ''],
  ['kode_pos', '', ''],
  ['telepon', '', ''],
  ['email', '', ''],
  ['website', '', ''],
  ['logo', '', 'Logo sekolah (diunggah dari aplikasi)'],
  ['warna_tema', '#1F56D6', 'Warna utama aplikasi'],
  ['kepala_sekolah', '', ''],
  ['nip_kepala', '', ''],
  ['wali_kelas', '', ''],
  ['nip_wali', '', ''],
  ['jenjang', 'SD', 'SD / SMP / SMA / SMK'],
  ['kelas', '5', '1 sampai 12, sesuai jenjang'],
  ['kelas_romawi', 'Tidak', 'Kelas ditulis dengan angka Romawi (VII A, X-1, …)'],
  ['rombel', 'A', 'Nama rombel, mis. A / B / Melati'],
  ['semester', '1', '1 = Ganjil, 2 = Genap'],
  ['tahun_pelajaran', '2026/2027', ''],
  ['tempat_rapor', '', 'Kota/tempat pembagian rapor'],
  ['tanggal_rapor', '', 'Format YYYY-MM-DD'],
  ['kktp', '75', 'Kriteria Ketercapaian Tujuan Pembelajaran (bawaan)'],
  ['bobot_lm', '50', 'Bobot rata-rata nilai Lingkup Materi'],
  ['bobot_sas', '50', 'Bobot Sumatif Akhir Semester'],
  ['bobot_tp', '50', 'Pengaturan lama (tidak digunakan dalam nilai akhir baru)'],
  ['bobot_sts', '0', 'STS tetap dicatat, tidak digunakan dalam nilai akhir baru'],
  ['batas_sangat_baik', '90', ''],
  ['batas_baik', '80', ''],
  ['desk_pakai_nama', 'Ya', 'Deskripsi diawali "Ananda <panggilan>"'],
  ['desk_jumlah_tp', '2', 'Jumlah TP yang disebut per kalimat (1/2)'],
  ['kalimat_kuat', 'menunjukkan penguasaan yang {predikat} dalam', ''],
  ['kalimat_lemah', 'perlu bimbingan dalam', 'Untuk TP di bawah KKTP'],
  ['kalimat_tingkat', 'perlu peningkatan dalam', 'Bila semua TP tuntas'],
  ['sebutan_murid', 'Murid', 'Murid / Peserta Didik'],
  ['kertas', 'A4', 'A4 / F4'],
  ['rapor_grafik', 'Ya', 'Lampirkan halaman grafik capaian'],
  ['rapor_tanggapan', 'Ya', 'Tampilkan kolom tanggapan orang tua'],
  ['ttd_posisi', 'Bawah', 'Posisi tanda tangan kepala sekolah: Bawah (di tengah bawah) / Sejajar'],
  ['teks_jenjang', '', 'Tulisan jenjang di sampul & identitas sekolah; kosong = otomatis sesuai jenjang'],
  ['instansi_sampul', 'KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH\nREPUBLIK INDONESIA', 'Teks bawah sampul rapor'],
  ['nama_kapital', 'Ya', 'Nama murid di rapor ditulis HURUF BESAR'],
  ['pin', '', 'PIN masuk aplikasi (kosong = tanpa PIN)']
];

/* Paket mapel bawaan per jenjang (Kurikulum Merdeka): [id, nama, singkatan, kelompok, aktif].
   ID yang sama dipakai lintas jenjang supaya nilai & TP tetap tersambung. */
var SENI_ = [['SMUS', 'Seni Musik', 'S.Mus', 'Seni dan Budaya', 'Tidak'], ['SRUP', 'Seni Rupa', 'S.Rupa', 'Seni dan Budaya', 'Ya'],
  ['STAR', 'Seni Tari', 'S.Tari', 'Seni dan Budaya', 'Tidak'], ['STEA', 'Seni Teater', 'S.Teater', 'Seni dan Budaya', 'Tidak']];
var UMUM_ = [['AGAMA', 'Pendidikan Agama dan Budi Pekerti', 'PABP', 'Umum', 'Ya'], ['PP', 'Pendidikan Pancasila', 'PP', 'Umum', 'Ya'],
  ['BIND', 'Bahasa Indonesia', 'B.Ind', 'Umum', 'Ya']];
var MAPEL_JENJANG = {
  SMP: UMUM_.concat([['MTK', 'Matematika', 'MTK', 'Umum', 'Ya'], ['IPA', 'Ilmu Pengetahuan Alam', 'IPA', 'Umum', 'Ya'], ['IPS', 'Ilmu Pengetahuan Sosial', 'IPS', 'Umum', 'Ya'],
    ['BING', 'Bahasa Inggris', 'B.Ing', 'Umum', 'Ya'], ['PJOK', 'Pendidikan Jasmani, Olahraga, dan Kesehatan', 'PJOK', 'Umum', 'Ya'], ['INF', 'Informatika', 'Inf', 'Umum', 'Ya']],
    SENI_, [['PRAK', 'Prakarya', 'Prakarya', 'Pilihan', 'Tidak'], ['KKA', 'Koding dan Kecerdasan Artifisial', 'KKA', 'Pilihan', 'Tidak'], ['MULOK1', 'Bahasa Daerah', 'B.Daerah', 'Muatan Lokal', 'Ya']]),
  SMA: UMUM_.concat([['MTK', 'Matematika', 'MTK', 'Umum', 'Ya'], ['BING', 'Bahasa Inggris', 'B.Ing', 'Umum', 'Ya'], ['SEJ', 'Sejarah', 'Sejarah', 'Umum', 'Ya'],
    ['PJOK', 'Pendidikan Jasmani, Olahraga, dan Kesehatan', 'PJOK', 'Umum', 'Ya'], ['INF', 'Informatika', 'Inf', 'Umum', 'Ya']],
    SENI_, [['FIS', 'Fisika', 'Fisika', 'Pilihan', 'Ya'], ['KIM', 'Kimia', 'Kimia', 'Pilihan', 'Ya'], ['BIO', 'Biologi', 'Biologi', 'Pilihan', 'Ya'],
    ['EKO', 'Ekonomi', 'Ekonomi', 'Pilihan', 'Ya'], ['GEO', 'Geografi', 'Geografi', 'Pilihan', 'Ya'], ['SOS', 'Sosiologi', 'Sosiologi', 'Pilihan', 'Ya'],
    ['MTKL', 'Matematika Tingkat Lanjut', 'MTK-L', 'Pilihan', 'Tidak'], ['KKA', 'Koding dan Kecerdasan Artifisial', 'KKA', 'Pilihan', 'Tidak'], ['MULOK1', 'Bahasa Daerah', 'B.Daerah', 'Muatan Lokal', 'Tidak']]),
  SMK: UMUM_.concat([['PJOK', 'Pendidikan Jasmani, Olahraga, dan Kesehatan', 'PJOK', 'Umum', 'Ya'], ['SEJ', 'Sejarah', 'Sejarah', 'Umum', 'Ya']], SENI_,
    [['MTK', 'Matematika', 'MTK', 'Kejuruan', 'Ya'], ['BING', 'Bahasa Inggris', 'B.Ing', 'Kejuruan', 'Ya'], ['INF', 'Informatika', 'Inf', 'Kejuruan', 'Ya'],
    ['IPAS', 'Projek Ilmu Pengetahuan Alam dan Sosial', 'P-IPAS', 'Kejuruan', 'Ya'], ['DDPK', 'Dasar-dasar Program Keahlian', 'DDPK', 'Kejuruan', 'Ya'],
    ['KK', 'Konsentrasi Keahlian', 'KK', 'Kejuruan', 'Tidak'], ['PKK', 'Projek Kreatif dan Kewirausahaan', 'PKK', 'Kejuruan', 'Tidak'], ['PKL', 'Praktik Kerja Lapangan', 'PKL', 'Kejuruan', 'Tidak'],
    ['MPIL', 'Mata Pelajaran Pilihan', 'Pilihan', 'Pilihan', 'Tidak'], ['MULOK1', 'Bahasa Daerah', 'B.Daerah', 'Muatan Lokal', 'Tidak']])
};

var MAPEL_AWAL = [
  ['AGAMA', 1, 'Pendidikan Agama dan Budi Pekerti', 'PABP', 'Umum', '', 'Ya'],
  ['PP', 2, 'Pendidikan Pancasila', 'PP', 'Umum', '', 'Ya'],
  ['BIND', 3, 'Bahasa Indonesia', 'B.Ind', 'Umum', '', 'Ya'],
  ['MTK', 4, 'Matematika', 'MTK', 'Umum', '', 'Ya'],
  ['IPAS', 5, 'Ilmu Pengetahuan Alam dan Sosial', 'IPAS', 'Umum', '', 'Ya'],
  ['PJOK', 6, 'Pendidikan Jasmani, Olahraga, dan Kesehatan', 'PJOK', 'Umum', '', 'Ya'],
  ['SMUS', 7, 'Seni Musik', 'S.Mus', 'Seni dan Budaya', '', 'Tidak'],
  ['SRUP', 8, 'Seni Rupa', 'S.Rupa', 'Seni dan Budaya', '', 'Ya'],
  ['STAR', 9, 'Seni Tari', 'S.Tari', 'Seni dan Budaya', '', 'Tidak'],
  ['STEA', 10, 'Seni Teater', 'S.Teater', 'Seni dan Budaya', '', 'Tidak'],
  ['BING', 11, 'Bahasa Inggris', 'B.Ing', 'Umum', '', 'Ya'],
  ['KKA', 12, 'Koding dan Kecerdasan Artifisial', 'KKA', 'Pilihan', '', 'Tidak'],
  ['MULOK1', 13, 'Bahasa Daerah', 'B.Daerah', 'Muatan Lokal', '', 'Ya']
];

var EKSKUL_AWAL = [
  ['EK1', 1, 'Pramuka', ''],
  ['EK2', 2, 'Seni Tari', ''],
  ['EK3', 3, 'Futsal', '']
];


var TABEL_NILAI = ['NILAI', 'NILAI_KOKO', 'NILAI_EKSKUL', 'KEHADIRAN'];

/* ==========================================================================
 *  AKSI
 * ========================================================================== */
var AKSI = {
  status: function () {
    var s = ambilPengaturan_();
    return { perluPin: !!String(s.pin || '').trim(), judul: judulAplikasi_(s), warna: s.warna_tema, logo: s.logo || '' };
  },
  muat: function () {
    if (!bacaTabel_('LINGKUP_MATERI').length) {
      var kunci = {}; bacaTabel_('TP').forEach(function (t) { kunci[String(t.mapel_id) + '|' + String(t.agama || '')] = { mapel_id: t.mapel_id, agama: t.agama || '' }; });
      Object.keys(kunci).forEach(function (k) { sinkronLingkupMateri_(kunci[k].mapel_id, kunci[k].agama); });
    }
    return muatSemua_();
  },

  simpanPengaturan: function (p) {
    var data = p.data || {}, rows = bacaTabel_('PENGATURAN'), map = {};
    rows.forEach(function (r) { map[r.kunci] = r; });
    Object.keys(data).forEach(function (k) {
      var v = data[k] == null ? '' : String(data[k]);
      if (map[k]) map[k].nilai = v; else { map[k] = { kunci: k, nilai: v, keterangan: '' }; rows.push(map[k]); }
    });
    tulisTabel_('PENGATURAN', rows);
    return ambilPengaturan_();
  },

  simpanMurid: function (p) {
    var m = p.data || {}, rows = bacaTabel_('MURID');
    if (!String(m.nama || '').trim()) throw new Error('Nama wajib diisi.');
    if (!m.status) m.status = 'Aktif';
    if (!m.id) { m.id = buatId_('M'); m.urut = rows.length + 1; rows.push(m); }
    else { var i = cariIndex_(rows, 'id', m.id); if (i < 0) rows.push(m); else rows[i] = Object.assign(rows[i], m); }
    tulisTabel_('MURID', rows);
    return bacaTabel_('MURID');
  },
  hapusMurid: function (p) {
    var id = String(p.id);
    tulisTabel_('MURID', bacaTabel_('MURID').filter(function (r) { return String(r.id) !== id; }));
    TABEL_NILAI.forEach(function (n) { tulisTabel_(n, bacaTabel_(n).filter(function (r) { return String(r.siswa_id) !== id; })); });
    return true;
  },
  imporMurid: function (p) {
    var lama = p.mode === 'ganti' ? [] : bacaTabel_('MURID');
    (p.rows || []).forEach(function (m) { m.id = buatId_('M'); m.urut = lama.length + 1; if (!m.status) m.status = 'Aktif'; lama.push(m); });
    tulisTabel_('MURID', lama);
    return bacaTabel_('MURID');
  },
  urutkanMurid: function (p) {
    var ids = p.ids || [], rows = bacaTabel_('MURID');
    rows.forEach(function (r) { var i = ids.indexOf(String(r.id)); r.urut = i < 0 ? 999 : i + 1; });
    rows.sort(function (a, b) { return Number(a.urut) - Number(b.urut); });
    tulisTabel_('MURID', rows);
    return rows;
  },

  presetMapel: function (p) {
    if (p.nama === 'SD') return MAPEL_AWAL.map(function (r) { return [r[0], r[2], r[3], r[4], r[6]]; });
    return MAPEL_JENJANG[p.nama] || [];
  },
  simpanMapel: function (p) {
    tulisTabel_('MAPEL', (p.list || []).map(function (m, i) { if (!m.id) m.id = buatId_('MP'); m.urut = i + 1; return m; }));
    return bacaTabel_('MAPEL');
  },
  simpanTP: function (p) {
    var mid = String(p.mapel_id), agama = String(p.agama || '');
    var sisa = bacaTabel_('TP').filter(function (r) { return !(String(r.mapel_id) === mid && String(r.agama || '') === agama); });
    (p.list || []).forEach(function (t, i) {
      sisa.push({ id: t.id || buatId_('TP'), mapel_id: mid, agama: agama, urut: i + 1, kode: t.kode || ('TP ' + (i + 1)), lingkup_materi: t.lingkup_materi || '', tujuan: t.tujuan || '' });
    });
    tulisTabel_('TP', sisa);
    sinkronLingkupMateri_(mid, agama);
    return bacaTabel_('TP');
  },
  /** impor TP dari template: grup = [{mapel_id, agama, list:[...]}] → TP grup tsb diganti, ID TP lama dipakai ulang bila kodenya sama */
  imporTP: function (p) {
    var semua = bacaTabel_('TP');
    (p.grup || []).forEach(function (g) {
      var mid = String(g.mapel_id), agama = String(g.agama || '');
      var lama = semua.filter(function (r) { return String(r.mapel_id) === mid && String(r.agama || '') === agama; });
      semua = semua.filter(function (r) { return lama.indexOf(r) < 0; });
      (g.list || []).forEach(function (t, i) {
        var kode = t.kode || ('TP ' + (i + 1));
        var ada = lama.filter(function (r) { return String(r.kode).toLowerCase() === String(kode).toLowerCase(); })[0];
        semua.push({ id: ada ? ada.id : buatId_('TP'), mapel_id: mid, agama: agama, urut: i + 1, kode: kode, lingkup_materi: t.lingkup_materi || '', tujuan: t.tujuan || '' });
      });
    });
    tulisTabel_('TP', semua);
    (p.grup || []).forEach(function (g) { sinkronLingkupMateri_(g.mapel_id, g.agama || ''); });
    return bacaTabel_('TP');
  },

  /** rows: [{siswa_id, mapel_id?, nilai_tp, sts, sas, na, deskripsi_manual}] — mapel_id per baris atau p.mapel_id */
  simpanNilai: function (p) {
    var waktu = sekarang_();
    upsert_('NILAI', ['siswa_id', 'mapel_id'], (p.rows || []).map(function (r) {
      return {
        siswa_id: r.siswa_id, mapel_id: r.mapel_id || p.mapel_id, nilai_tp: JSON.stringify(r.nilai_tp || {}),
        nilai_lm: JSON.stringify(r.nilai_lm || {}),
        sts: r.sts === '' || r.sts == null ? '' : r.sts,
        sas: r.sas === '' || r.sas == null ? '' : r.sas, na: r.na === '' || r.na == null ? '' : r.na,
        deskripsi_manual: r.deskripsi_manual || '', deskripsi_tp: r.deskripsi_tp || '',
        deskripsi_ai: r.deskripsi_ai || '', deskripsi_final: r.deskripsi_final || '', diperbarui: waktu
      };
    }));
    return true;
  },
  simpanKegiatanKoko: function (p) {
    tulisTabel_('KOKURIKULER', (p.list || []).map(function (k, i) {
      return { id: k.id || buatId_('KK'), urut: i + 1, nama_kegiatan: k.nama_kegiatan || '', dimensi: (k.dimensi || []).join('|') };
    }));
    return bacaTabel_('KOKURIKULER');
  },
  simpanNilaiKoko: function (p) {
    var waktu = sekarang_();
    upsert_('NILAI_KOKO', ['siswa_id'], (p.rows || []).map(function (r) {
      return { siswa_id: r.siswa_id, capaian: JSON.stringify(r.capaian || {}), deskripsi_manual: r.deskripsi_manual || '', diperbarui: waktu };
    }));
    return true;
  },
  simpanEkskul: function (p) {
    tulisTabel_('EKSKUL', (p.list || []).map(function (e, i) { return { id: e.id || buatId_('EK'), urut: i + 1, nama: e.nama || '', pembina: e.pembina || '' }; }));
    return bacaTabel_('EKSKUL');
  },
  simpanNilaiEkskul: function (p) {
    var waktu = sekarang_();
    upsert_('NILAI_EKSKUL', ['siswa_id'], (p.rows || []).map(function (r) { return { siswa_id: r.siswa_id, data: JSON.stringify(r.data || []), diperbarui: waktu }; }));
    return true;
  },
  simpanKehadiran: function (p) {
    var waktu = sekarang_();
    upsert_('KEHADIRAN', ['siswa_id'], (p.rows || []).map(function (r) {
      return { siswa_id: r.siswa_id, sakit: r.sakit, izin: r.izin, alpa: r.alpa, catatan: r.catatan || '', keputusan: r.keputusan || '', tanggapan: r.tanggapan || '', diperbarui: waktu };
    }));
    return true;
  },

  dataContoh: function () {
    if (bacaTabel_('MURID').length) throw new Error('Data contoh hanya bisa diisi saat data murid masih kosong.');
    isiDataContoh_();
    return muatSemua_();
  },
  /** semester baru: nilai, kokurikuler, ekskul, kehadiran dikosongkan; murid aktif, mapel, TP tetap */
  semesterBaru: function () {
    store.salinPengaman('sebelum-semester-baru');
    TABEL_NILAI.forEach(function (n) { tulisTabel_(n, []); });
    tulisTabel_('MURID', bacaTabel_('MURID').filter(function (m) { return !m.status || m.status === 'Aktif'; }));
    return muatSemua_();
  },
  kosongkanSemua: function () {
    store.salinPengaman('sebelum-hapus-semua');
    ['MURID'].concat(TABEL_NILAI).forEach(function (n) { tulisTabel_(n, []); });
    return muatSemua_();
  }
};

function isiDataContoh_() {
  var nama = [
    ['Aditya Pratama', 'Adit', 'L'], ['Alya Nur Rahma', 'Alya', 'P'], ['Bima Saputra', 'Bima', 'L'],
    ['Citra Lestari', 'Citra', 'P'], ['Dafa Ramadhan', 'Dafa', 'L'], ['Dewi Anggraeni', 'Dewi', 'P'],
    ['Fajar Nugraha', 'Fajar', 'L'], ['Hana Salsabila', 'Hana', 'P'], ['Irfan Maulana', 'Irfan', 'L'],
    ['Kayla Putri Azzahra', 'Kayla', 'P'], ['Muhammad Rizki', 'Rizki', 'L'], ['Nadia Khairunnisa', 'Nadia', 'P'],
    ['Raka Firmansyah', 'Raka', 'L'], ['Salma Aulia', 'Salma', 'P'], ['Yoga Permana', 'Yoga', 'L'],
    ['Zahra Fitriani', 'Zahra', 'P']
  ];
  var murid = bacaTabel_('MURID');
  var kota = ['Ciamis', 'Tasikmalaya', 'Banjar'];
  nama.forEach(function (n, i) {
    murid.push({
      id: buatId_('M'), urut: murid.length + 1, nis: String(2401 + i), nisn: '01' + (35849701 + i * 731),
      nama: n[0], panggilan: n[1], jk: n[2], tempat_lahir: kota[i % 3],
      tanggal_lahir: '2015-' + ('0' + ((i % 12) + 1)).slice(-2) + '-' + ('0' + ((i * 3 % 27) + 1)).slice(-2),
      agama: 'Islam', pendidikan_sebelumnya: 'TK Pertiwi', alamat: 'Kp. Sukamaju RT 0' + (i % 5 + 1) + '/02',
      nama_ayah: 'Bapak ' + n[1], nama_ibu: 'Ibu ' + n[1], pekerjaan_ayah: ['Wiraswasta', 'Petani', 'Karyawan Swasta'][i % 3],
      pekerjaan_ibu: 'Mengurus Rumah Tangga', alamat_ortu: 'Kp. Sukamaju', nama_wali: '', pekerjaan_wali: '', alamat_wali: '', status: 'Aktif'
    });
  });
  tulisTabel_('MURID', murid);

  var tp = {
    'AGAMA|Islam': [
      ['Beriman kepada Hari Akhir', 'meyakini makna beriman kepada hari akhir'],
      ['Adab Berpakaian dan Berhias', 'mengetahui adab berpakaian dan berhias dengan baik'],
      ['Tayamum', 'mempraktikkan tata cara tayamum sesuai syariat'],
      ['Kisah Nabi Ilyas dan Ilyasa AS', 'menceritakan kembali kisah Nabi Ilyas dan Ilyasa AS'],
      ["Qana'ah", "menjelaskan manfaat qana'ah dan cara meraihnya"]],
    'PP|': [
      ['Hubungan Antarsila Pancasila', 'menjelaskan hubungan antarsila Pancasila'],
      ['Norma dan Aturan', 'menjelaskan pengertian, macam-macam, serta contoh pelaksanaan norma, aturan, hak, dan kewajiban'],
      ['Keberagaman Budaya', 'menghargai keberagaman budaya di lingkungan sekitar']],
    'BIND|': [
      ['Aku yang Unik', 'menulis teks deskripsi menggunakan kata sifat dan kalimat majemuk setara'],
      ['Buku Jendela Dunia', 'mengidentifikasi unsur intrinsik dan majas pada teks fiksi'],
      ['Ekspresi Diri Melalui Hobi', 'membuat teks prosedur menggunakan kata berimbuhan -kan dan -lah'],
      ['Belajar Berwirausaha', 'menjelaskan informasi dalam teks wawancara']],
    'MTK|': [
      ['Bilangan Desimal', 'menjumlahkan dan mengurangkan bilangan desimal'],
      ['Pengukuran', 'menyelesaikan masalah sehari-hari yang berkaitan dengan rata-rata'],
      ['Perkalian Desimal', 'menyelesaikan perkalian bilangan desimal'],
      ['Bangun Datar', 'menjelaskan jumlah sudut pada segi banyak'],
      ['Volume', 'menyelesaikan masalah volume kubus dan balok'],
      ['Kelipatan dan Faktor', 'menyelesaikan masalah KPK dan FPB dalam kehidupan sehari-hari']],
    'IPAS|': [
      ['Cahaya dan Bunyi', 'menjelaskan sifat-sifat bunyi dan cahaya'],
      ['Harmoni dalam Ekosistem', 'menjelaskan rantai makanan dan jaring-jaring makanan'],
      ['Magnet dan Listrik', 'menjelaskan manfaat magnet dan listrik dalam teknologi sehari-hari'],
      ['Bumi Kita', 'menjelaskan bagian-bagian bumi dan perubahan di permukaannya']],
    'PJOK|': [
      ['Permainan Bola Besar', 'mempraktikkan pola gerak dasar permainan bola besar'],
      ['Permainan Bola Kecil', 'mempraktikkan pola gerak dasar permainan bola kecil'],
      ['Senam Lantai', 'mempraktikkan kombinasi pola gerak dominan senam lantai'],
      ['Atletik', 'mempraktikkan gerak dasar atletik dengan benar']],
    'SRUP|': [
      ['Ragam Hias Nusantara', 'menggambar menggunakan ragam hias flora dan fauna'],
      ['Karya Tiga Dimensi', 'membuat karya tiga dimensi dari bahan di sekitar'],
      ['Apresiasi Karya', 'menyampaikan pendapat tentang karya seni rupa teman']],
    'BING|': [
      ['What Delicious Bakso', 'menyebutkan beberapa rasa pada makanan dan minuman dengan tepat'],
      ['How Much is It?', 'menyebutkan angka terkait harga makanan dan minuman'],
      ["I've Got a Stomachache", 'menyebutkan beberapa jenis keluhan sakit dengan tepat'],
      ['What a Nice Skirt', 'menyebutkan jenis-jenis pakaian dengan tepat']],
    'MULOK1|': [
      ['Dongeng', 'menceritakan kembali isi dongeng berbahasa daerah'],
      ['Tembang/Pupuh', 'memahami isi tembang daerah yang dibacakan'],
      ['Unggah-ungguh Basa', 'menggunakan unggah-ungguh basa yang tepat saat berbicara']]
  };
  var tpRows = bacaTabel_('TP');
  var tpPerMapel = {};
  Object.keys(tp).forEach(function (key) {
    var mid = key.split('|')[0], ag = key.split('|')[1];
    tpPerMapel[mid] = [];
    tp[key].forEach(function (t, i) {
      var id = buatId_('TP');
      tpRows.push({ id: id, mapel_id: mid, agama: ag, urut: i + 1, kode: 'TP ' + (i + 1), lingkup_materi: t[0], tujuan: t[1] });
      tpPerMapel[mid].push(id);
    });
  });
  tulisTabel_('TP', tpRows);

  // nilai acak yang realistis
  var nilai = [];
  var waktu = sekarang_();
  murid.slice(-nama.length).forEach(function (m, mi) {
    var dasar = 70 + ((mi * 37) % 25);
    Object.keys(tpPerMapel).forEach(function (mid, k) {
      var o = {}, total = 0;
      tpPerMapel[mid].forEach(function (id, j) {
        var v = Math.max(55, Math.min(100, dasar + ((mi * 7 + j * 11 + k * 5) % 21) - 8));
        o[id] = v; total += v;
      });
      var rt = total / tpPerMapel[mid].length;
      var sas = Math.max(55, Math.min(100, dasar + ((mi * 5 + k * 3) % 17) - 6));
      var sts = Math.max(55, Math.min(100, dasar + ((mi * 3 + k * 7) % 15) - 7));
      nilai.push({
        siswa_id: m.id, mapel_id: mid, nilai_tp: JSON.stringify(o), sts: sts, sas: sas,
        na: Math.round((rt + sas) / 2), deskripsi_manual: '', diperbarui: waktu
      });
    });
  });
  store.upsert('NILAI', ['siswa_id', 'mapel_id'], nilai);

  var kk = bacaTabel_('KOKURIKULER');
  if (!kk.length) {
    kk = [
      { id: 'KK1', urut: 1, nama_kegiatan: 'Gerakan Sekolah Bersih dan Hijau', dimensi: 'Kewargaan|Kolaborasi|Kemandirian|Kesehatan' },
      { id: 'KK2', urut: 2, nama_kegiatan: 'Pameran Karya Kearifan Lokal', dimensi: 'Kreativitas|Komunikasi|Penalaran Kritis' }
    ];
    tulisTabel_('KOKURIKULER', kk);
  }
  var lv = ['Berkembang', 'Cakap', 'Mahir'];
  var nk = [], ne = [], hd = [];
  murid.slice(-nama.length).forEach(function (m, mi) {
    var cap = {};
    kk.forEach(function (k, ki) {
      cap[k.id] = {};
      String(k.dimensi).split('|').forEach(function (d, di) { cap[k.id][d] = lv[(mi + di + ki) % 3 === 0 ? 1 : (mi + di) % 3]; });
    });
    nk.push({ siswa_id: m.id, capaian: JSON.stringify(cap), deskripsi_manual: '', diperbarui: waktu });
    var pred = ['Sangat Baik', 'Baik', 'Baik', 'Cukup'][mi % 4];
    var dt = [{ ekskul_id: 'EK1', predikat: pred, keterangan: '' }];
    if (mi % 3 === 0) dt.push({ ekskul_id: 'EK3', predikat: 'Baik', keterangan: '' });
    if (mi % 4 === 1) dt.push({ ekskul_id: 'EK2', predikat: 'Sangat Baik', keterangan: '' });
    ne.push({ siswa_id: m.id, data: JSON.stringify(dt), diperbarui: waktu });
    hd.push({ siswa_id: m.id, sakit: String(mi % 3), izin: String(mi % 2), alpa: mi % 7 === 0 ? '1' : '0', catatan: '', keputusan: '', tanggapan: '', diperbarui: waktu });
  });
  store.upsert('NILAI_KOKO', ['siswa_id'], nk);
  store.upsert('NILAI_EKSKUL', ['siswa_id'], ne);
  store.upsert('KEHADIRAN', ['siswa_id'], hd);

  var s = ambilPengaturan_();
  if (!String(s.nama_sekolah || '').trim()) AKSI.simpanPengaturan({ data: { nama_sekolah: 'SD Negeri Contoh' } });
  if (!s.wali_kelas) {
    AKSI.simpanPengaturan({ data: {
      wali_kelas: 'Rina Kartika, S.Pd.', kepala_sekolah: 'Drs. H. Asep Saepudin, M.Pd.', nip_kepala: '196805121993031004',
      alamat_sekolah: 'Jl. Pendidikan No. 12', desa: 'Sukamaju', kecamatan: 'Cikoneng', kabupaten: 'Ciamis',
      provinsi: 'Jawa Barat', npsn: '20211234', tempat_rapor: 'Ciamis'
    } });
  }
}

/* ---------- data ---------- */
function muatSemua_() {
  return {
    versi: APP.VERSI,
    lingkungan: infoLingkungan,
    pengaturan: ambilPengaturan_(),
    murid: bacaTabel_('MURID'),
    mapel: bacaTabel_('MAPEL'),
    tp: bacaTabel_('TP'),
    lingkupMateri: bacaTabel_('LINGKUP_MATERI'),
    nilai: bacaTabel_('NILAI'),
    kegiatanKoko: bacaTabel_('KOKURIKULER'),
    nilaiKoko: bacaTabel_('NILAI_KOKO'),
    ekskul: bacaTabel_('EKSKUL'),
    nilaiEkskul: bacaTabel_('NILAI_EKSKUL'),
    kehadiran: bacaTabel_('KEHADIRAN')
  };
}
function ambilPengaturan_() {
  var o = {};
  PENGATURAN_AWAL.forEach(function (r) { o[r[0]] = r[1]; });
  bacaTabel_('PENGATURAN').forEach(function (r) { if (r.kunci) o[r.kunci] = r.nilai; });
  return o;
}
function judulAplikasi_(s) {
  var n = String(s.nama_aplikasi || '').trim(); if (n) return n;
  var sek = String(s.nama_sekolah || '').trim();
  return sek ? 'Rapor Digital ' + sek : APP.NAMA_PRODUK;
}
/** Isi awal saat database masih kosong (pertama kali aplikasi dibuka). */
function pastikanSheet_() {
  var instalasiBaru = !bacaTabel_('PENGATURAN').length;
  if (instalasiBaru) tulisTabel_('PENGATURAN', PENGATURAN_AWAL.map(function (r) { return { kunci: r[0], nilai: r[1], keterangan: r[2] }; }));
  // Profil sekolah, logo, dan kop merupakan aset default aplikasi. Pada instalasi
  // baru, nilai bawaan mengisi profil. Pada database lama, hanya kunci yang belum
  // ada yang ditambahkan sehingga isian pengguna yang sudah ada tidak ditimpa.
  var pengaturan = bacaTabel_('PENGATURAN'), indeks = {};
  pengaturan.forEach(function (r, i) { indeks[String(r.kunci)] = i; });
  Object.keys(DEFAULT_SEKOLAH).forEach(function (k) {
    var nilai = String(DEFAULT_SEKOLAH[k] == null ? '' : DEFAULT_SEKOLAH[k]);
    if (indeks[k] === undefined) pengaturan.push({ kunci: k, nilai: nilai, keterangan: 'Default sekolah bawaan aplikasi' });
    else if (instalasiBaru) pengaturan[indeks[k]].nilai = nilai;
  });
  if (pengaturan.length) tulisTabel_('PENGATURAN', pengaturan);
  if (!bacaTabel_('MAPEL').length) tulisTabel_('MAPEL', MAPEL_AWAL.map(function (r) { return { id: r[0], urut: r[1], nama: r[2], singkatan: r[3], kelompok: r[4], kktp: r[5], aktif: r[6] }; }));
  if (!bacaTabel_('EKSKUL').length && !store.data.ekskulDiatur) {
    tulisTabel_('EKSKUL', EKSKUL_AWAL.map(function (r) { return { id: r[0], urut: r[1], nama: r[2], pembina: r[3] }; }));
    store.data.ekskulDiatur = true;
  }
}

function api(req) {
  req = req || {};
  try {
    pastikanSheet_();
    var aksi = String(req.aksi || '');
    if (!AKSI[aksi]) throw new Error('Aksi tidak dikenal: ' + aksi);
    if (aksi !== 'status') {
      var pin = String(ambilPengaturan_().pin || '').trim();
      if (pin && String(req.pin || '').trim() !== pin) return { ok: false, perluPin: true, error: 'PIN salah atau belum diisi.' };
    }
    return { ok: true, data: AKSI[aksi](req.data || {}) };
  } catch (e) {
    return { ok: false, error: (e && e.message) ? e.message : String(e) };
  }
}

function init(s, info) { store = s; infoLingkungan = info || {}; pastikanSheet_(); }

module.exports = { init, api, judul: () => judulAplikasi_(ambilPengaturan_()), pengaturan: () => ambilPengaturan_(), APP };
