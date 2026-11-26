RAPOR DIGITAL SD v1.3.2 — REVISI PANEL SCROLL CETAK

Perubahan tambahan:
- Area pengaturan cetak di sisi kiri (pilihan bagian, pengaturan identitas, layout, daftar murid, dan tombol cetak) kini berada dalam panel scroll vertikal tersendiri.
- Area pratinjau di sisi kanan memiliki scroll tersendiri untuk melihat halaman kertas.
- Header pratinjau tetap terlihat saat isi halaman digulir.
- Scroll memakai overscroll-behavior: contain agar guliran tidak otomatis diteruskan ke panel lain.
- Pada layar kecil, panel pengaturan dan preview tetap dapat digulir masing-masing; susunan responsif sebelumnya dipertahankan.
- Perubahan hanya aktif pada halaman Cetak Rapor; halaman/menu lain tidak diubah.

Pemeriksaan:
- 20 berkas JavaScript lolos node --check.
- 20 tes otomatis lulus.
- Preflight struktur berhasil.
- Belum menjalankan build installer dan belum melakukan uji visual langsung di Windows.

Langkah uji:
npm.cmd install
npm.cmd test
npm.cmd run preflight
npm.cmd run start:dev

Uji visual:
1. Gulir panel pengaturan kiri sampai bawah; panel preview kanan harus tetap di posisi gulirnya.
2. Gulir halaman preview kanan; panel pengaturan kiri harus tetap di posisi gulirnya.
3. Pastikan header Pratinjau tetap terlihat.
4. Uji kembali layar kecil.
