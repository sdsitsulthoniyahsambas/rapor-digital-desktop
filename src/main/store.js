/**
 * Penyimpanan data lokal (pengganti Google Sheet).
 * Semua tabel disimpan dalam satu file JSON di folder data aplikasi:
 *   Windows: %APPDATA%/Rapor Digital SD/data/rapor.json (nama folder lama dipertahankan)
 * Bentuk data sama dengan versi Google Sheets (semua nilai berupa teks).
 */
const fs = require('node:fs');
const path = require('node:path');
const { namaFileCadangan } = require('./backup-name');

const TABEL = {
  PENGATURAN: ['kunci', 'nilai', 'keterangan'],
  MURID: ['id', 'urut', 'nis', 'nisn', 'nama', 'panggilan', 'jk', 'tempat_lahir', 'tanggal_lahir', 'agama',
    'pendidikan_sebelumnya', 'alamat', 'nama_ayah', 'nama_ibu', 'pekerjaan_ayah', 'pekerjaan_ibu',
    'alamat_ortu', 'nama_wali', 'pekerjaan_wali', 'alamat_wali', 'status', 'tanggal_keluar', 'keterangan_keluar'],
  MAPEL: ['id', 'urut', 'nama', 'singkatan', 'kelompok', 'kktp', 'aktif'],
  TP: ['id', 'mapel_id', 'agama', 'urut', 'kode', 'lingkup_materi', 'tujuan'],
  LINGKUP_MATERI: ['id', 'mapel_id', 'agama', 'nama', 'nama_normalisasi', 'status', 'dibuat', 'diarsipkan'],
  NILAI: ['siswa_id', 'mapel_id', 'nilai_tp', 'nilai_lm', 'sts', 'sas', 'na', 'deskripsi_manual', 'deskripsi_tp', 'deskripsi_ai', 'deskripsi_final', 'diperbarui'],
  KOKURIKULER: ['id', 'urut', 'nama_kegiatan', 'dimensi'],
  NILAI_KOKO: ['siswa_id', 'capaian', 'deskripsi_manual', 'diperbarui'],
  EKSKUL: ['id', 'urut', 'nama', 'pembina'],
  NILAI_EKSKUL: ['siswa_id', 'data', 'diperbarui'],
  KEHADIRAN: ['siswa_id', 'sakit', 'izin', 'alpa', 'catatan', 'keputusan', 'tanggapan', 'diperbarui']
};

class Store {
  constructor(dir) {
    this.dir = dir;
    this.file = path.join(dir, 'rapor.json');
    this.backupDir = path.join(dir, 'cadangan-otomatis');
    fs.mkdirSync(this.backupDir, { recursive: true });
    this.data = { aplikasi: 'rapor-digital-sd', versi: 1, tabel: {} };
    this.muat();
  }

  muat() {
    if (fs.existsSync(this.file)) {
      try {
        this.data = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      } catch (e) {
        // file rusak → simpan salinannya lalu mulai dari cadangan terbaru
        fs.copyFileSync(this.file, this.file + '.rusak-' + Date.now());
        const cad = this.daftarCadangan()[0];
        this.data = cad ? JSON.parse(fs.readFileSync(cad, 'utf8')) : { aplikasi: 'rapor-digital-sd', versi: 1, tabel: {} };
      }
    }
    if (!this.data.tabel) this.data.tabel = {};
    this.data.aplikasi = 'rapor-digital-sd';
    Object.keys(TABEL).forEach((n) => { if (!Array.isArray(this.data.tabel[n])) this.data.tabel[n] = []; });
  }

  /** tulis atomik: ke file sementara lalu rename, agar data tidak rusak bila listrik padam */
  simpan() {
    this.cadanganHarian(); // salin kondisi sebelum perubahan pertama hari ini
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data));
    fs.renameSync(tmp, this.file);
  }

  /** Cadangan otomatis: satu file per kelas/semester/tahun ajaran, diperbarui saat data berubah. */
  cadanganHarian() {
    if (!fs.existsSync(this.file)) return;
    // Nama file mengikuti periode dari snapshot lama yang benar-benar sedang disalin.
    let snapshot = this.data;
    try { snapshot = JSON.parse(fs.readFileSync(this.file, 'utf8')); } catch (e) { /* gunakan data aktif sebagai fallback */ }
    const pengaturan = Object.fromEntries(((snapshot.tabel && snapshot.tabel.PENGATURAN) || []).map((r) => [r.kunci, r.nilai]));
    const f = path.join(this.backupDir, namaFileCadangan(pengaturan));
    // Selalu perbarui satu file cadangan otomatis untuk kelas/semester/tahun ajaran aktif.
    fs.copyFileSync(this.file, f);
  }

  /** salinan paksa (mis. sebelum hapus semua / semester baru) */
  salinPengaman(label) {
    if (fs.existsSync(this.file)) fs.copyFileSync(this.file, path.join(this.backupDir, label + '-' + Date.now() + '.json'));
  }

  infoCadangan() {
    return this.daftarCadangan().map((f) => { const st = fs.statSync(f); return { nama: path.basename(f), waktu: st.mtime.toISOString(), ukuran: st.size }; });
  }

  daftarCadangan() {
    if (!fs.existsSync(this.backupDir)) return [];
    return fs.readdirSync(this.backupDir).filter((f) => f.endsWith('.json')).map((f) => path.join(this.backupDir, f))
      .map((f) => [f, fs.statSync(f).mtimeMs]).sort((a, b) => b[1] - a[1]).map((x) => x[0]);
  }

  baca(nama) {
    return (this.data.tabel[nama] || []).map((r) => Object.assign({}, r));
  }

  tulis(nama, rows) {
    const kolom = TABEL[nama];
    this.data.tabel[nama] = rows.map((r) => {
      const o = {};
      kolom.forEach((k) => {
        const x = r[k];
        o[k] = x === null || x === undefined ? '' : typeof x === 'object' ? JSON.stringify(x) : String(x);
      });
      return o;
    });
    this.simpan();
  }

  upsert(nama, kunci, rowsBaru) {
    const rows = this.baca(nama);
    const idx = {};
    const k = (r) => kunci.map((f) => String(r[f])).join('|');
    rows.forEach((r, i) => { idx[k(r)] = i; });
    rowsBaru.forEach((r) => {
      const key = k(r);
      if (idx[key] === undefined) { idx[key] = rows.length; rows.push(r); } else rows[idx[key]] = r;
    });
    this.tulis(nama, rows);
  }

  /** ganti seluruh isi (untuk pulihkan cadangan) */
  ganti(dataBaru) {
    const t = dataBaru && dataBaru.tabel;
    if (!t || !Array.isArray(t.MURID) || !Array.isArray(t.PENGATURAN)) throw new Error('File cadangan tidak valid.');
    if (Array.isArray(t.LAPORAN) && !Array.isArray(t.NILAI)) throw new Error('File ini cadangan aplikasi Laporan Perkembangan, bukan Rapor Digital.');
    this.salinPengaman('sebelum-pulihkan');
    this.data = { aplikasi: 'rapor-digital-sd', versi: 1, tabel: {} };
    Object.keys(TABEL).forEach((n) => { this.data.tabel[n] = Array.isArray(t[n]) ? t[n] : []; });
    this.simpan();
  }
}

module.exports = { Store, TABEL };
