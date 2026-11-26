RAPOR DIGITAL SD — REVISI 4 POIN

Perubahan pada salinan pengembangan:
1. Sidebar: teks/ikon diperkuat kontrasnya; penerapan warna overlay dan transparansi memakai nilai formulir sementara sehingga pratinjau berubah langsung sebelum disimpan.
2. Leger Nilai: tombol Cetak printer/Simpan PDF membuka halaman pengaturan dan pratinjau; tersedia ukuran A4/F4, orientasi Portrait/Landscape, dan KOP yang dapat diketik pada area pratinjau (juga tersedia kotak teks).
3. Tabel leger menggunakan lebar fleksibel, nama peserta didik diberi lebar minimum dan pembungkusan teks agar tidak terpotong.
4. Pratinjau cetak rapor memiliki tombol murid sebelumnya/berikutnya dan dropdown pemilih nama.

Catatan:
- Perubahan hanya pada salinan pengembangan.
- Jangan menimpa folder pengembangan sebelumnya yang telah teruji.
- Database dev bersih harus dibuat di folder hasil ekstraksi ini.
- Pengujian sintaks dan test suite lulus; preflight struktur lulus.
- Belum dilakukan pengujian visual pada komputer Windows pengguna. Mohon uji sebelum build installer.

Perintah:
npm.cmd install
npm.cmd run prepare:clean-dev-data
npm.cmd test
npm.cmd run preflight
npm.cmd run start:dev
