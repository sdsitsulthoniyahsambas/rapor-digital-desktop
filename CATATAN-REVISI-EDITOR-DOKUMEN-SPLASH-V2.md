# Catatan Revisi V2 — Splash Screen & Editor Dokumen

Versi dasar: Rapor Digital SD 1.3.2 — salinan pengembangan

## Perbaikan
1. Splash screen dibuat sebagai jendela awal yang tampil sendiri. Jendela beranda tetap tersembunyi sampai splash tampil selama sekitar 5 detik DAN beranda selesai dimuat. Setelah kedua kondisi terpenuhi, splash ditutup lalu beranda dimunculkan.
2. Editor Dokumen menyediakan kontrol gambar setelah gambar dipilih dengan klik:
   - Lebar gambar dalam milimeter (5–190 mm),
   - Posisi kiri, tengah, atau kanan,
   - Jarak atas dalam milimeter (0–100 mm),
   - Rasio tinggi-lebar tetap proporsional.
3. Editor menyediakan zoom halaman 20%, 50%, 75%, dan 100%. Zoom hanya memengaruhi tampilan editor, tidak mengubah dimensi kertas pada keluaran cetak.
4. Gaya ukuran dan posisi gambar disimpan sebagai atribut inline pada template. Template yang sama digunakan oleh fungsi pembentuk halaman cetak/PDF, sehingga hasil cetak mengikuti desain tersimpan. Simpan desain terlebih dahulu sebelum membuka preview cetak.

## Validasi
- `node --check src/main/main.js`: lulus.
- `node --check dist/js/document-editor.js`: lulus.
- `npm test`: 24 pengujian lulus.
- `npm run preflight`: lulus.
- Build installer Windows dan pengujian visual langsung pada Windows belum dilakukan.

## Cara mengatur gambar
1. Buka Editor Dokumen dan pilih gambar di halaman dengan klik.
2. Atur Lebar gambar (mm), Posisi kiri/tengah/kanan, dan Jarak atas (mm).
3. Klik Simpan Desain.
4. Buka Preview/Cetak untuk memeriksa hasil. Zoom editor tidak memengaruhi hasil cetak.
