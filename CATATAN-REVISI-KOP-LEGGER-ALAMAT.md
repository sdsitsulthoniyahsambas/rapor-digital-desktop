REVISI LANJUTAN — KOP LEGER DAN ALAMAT RAPOR

Mempertahankan:
- NIP tidak dicetak jika kosong / sakelar nonaktif.
- Label Guru Kelas pada seluruh dokumen cetak.
- Seluruh fitur sebelumnya termasuk ranking leger.

Perbaikan:
1. Menu Leger sekarang membangun empat baris KOP terpisah, masing-masing memiliki teks, jenis font, ukuran, Bold, Italic, Underline.
2. Menambahkan unggah logo kiri dan kanan serta ukuran lebar/tinggi logo.
3. Preview KOP diperbarui saat pengaturan diubah.
4. Tombol Simpan pengaturan KOP menyimpan konfigurasi ke pengaturan aplikasi.
5. Tombol Simpan PDF dan Cetak memanggil pipeline cetak dengan ukuran kertas dan orientasi pilihan.
6. Alamat rapor menggunakan spasi non-breaking pada "Kec. Sambas" agar label Kec. tidak terpisah dari nama kecamatan saat membungkus baris.

Pemeriksaan:
- 18 berkas JS lolos node --check.
- 15 tes otomatis lulus.
- Preflight struktur lulus.
- Belum diuji visual di Windows pengguna; lakukan uji preview, simpan KOP, restart aplikasi, PDF dan cetak.

Jalankan:
npm.cmd install
npm.cmd run prepare:clean-dev-data
npm.cmd test
npm.cmd run preflight
npm.cmd run start:dev
