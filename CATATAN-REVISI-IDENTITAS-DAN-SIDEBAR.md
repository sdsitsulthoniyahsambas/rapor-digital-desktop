RAPOR DIGITAL SD v1.3.2 — REVISI IDENTITAS CETAK & SIDEBAR

Basis: paket terakhir yang telah dinyatakan sempurna oleh pengguna. Revisi ini dibuat pada salinan pengembangan baru; paket lama dan data aplikasi utama tidak ditimpa.

Perubahan:
1. Daftar cetak dikelompokkan menjadi IDENTITAS RAPOR (Sampul, Identitas Sekolah, Identitas Murid) dan HASIL BELAJAR (Laporan Hasil Belajar, Grafik Capaian). Tiap checkbox tetap independen.
2. Ditambahkan pengaturan tampilan tersendiri untuk Sampul, Identitas Sekolah, dan Identitas Murid:
   - Font (Arial, Calibri, Times New Roman, Georgia, Verdana, Tahoma)
   - Ukuran huruf 7–24 pt
   - Jarak baris 1.0–2.5
   - Ukuran logo 20–220 pt
   Pengaturan identitas disimpan otomatis ke localStorage terpisah dari pengaturan layout tabel rapor. Preview dibangun ulang setelah pengaturan berubah.
3. Tanggal pada lembar Identitas Murid dapat diubah melalui pemilih tanggal dan disimpan terpisah. Tanggal rapor pada lembar hasil belajar tidak diubah.
4. Sidebar desktop memiliki tombol perkecil/perluas. Mode ringkas menampilkan ikon saja; preferensi disimpan di localStorage. Perilaku sidebar mobile tidak diubah.

Pemeriksaan:
- 20 berkas JavaScript lolos node --check.
- 19 tes otomatis lulus.
- Preflight struktur berhasil.
- Build installer belum dijalankan.
- Wajib uji visual di Windows untuk preview, hasil cetak/PDF, persistensi setelah restart, dan perilaku sidebar.

Langkah uji di Windows:
npm.cmd install
npm.cmd run prepare:clean-dev-data
npm.cmd test
npm.cmd run preflight
npm.cmd run start:dev

Catatan: Pengaturan identitas dan preferensi sidebar tersimpan pada penyimpanan lokal aplikasi (localStorage) perangkat tersebut.
