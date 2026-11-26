RAPOR DIGITAL SD — REVISI TANDA TANGAN & KOP LEGER

1. Profil kepala sekolah dan guru kelas memiliki sakelar Tampilkan NIP masing-masing. NIP kosong tidak pernah dicetak; jika nomor tersedia dan sakelar aktif, NIP dicetak.
2. Seluruh label cetak "Wali Kelas" diubah menjadi "Guru Kelas".
3. KOP Leger:
   - Logo kiri dan kanan (PNG/JPG/WebP)
   - Lebar dan tinggi logo dapat diatur dalam mm
   - Empat baris teks: yayasan/dinas, nama sekolah, alamat baris 1, alamat/keterangan lain
   - Tiap baris dapat mengatur font, ukuran (pt), bold, italic, underline
   - Pengaturan KOP disimpan pada pengaturan aplikasi
   - Opsi ranking tetap tersedia; format KOP berlaku untuk kedua mode ranking.

Pemeriksaan:
- 18 berkas JavaScript lolos node --check
- 15 tes otomatis lulus
- preflight struktur berhasil
- Belum build installer dan belum diuji visual pada komputer pengguna.

Perintah uji:
npm.cmd install
npm.cmd run prepare:clean-dev-data
npm.cmd test
npm.cmd run preflight
npm.cmd run start:dev

Perubahan ini ada di folder pengembangan baru. Jangan timpa versi pengembangan sebelumnya.
