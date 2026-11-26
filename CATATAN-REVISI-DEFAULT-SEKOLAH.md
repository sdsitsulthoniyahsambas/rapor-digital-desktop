# Catatan Revisi — Default Sekolah dan Pemisahan Data Operasional

## Perubahan
- Profil SDS Islam Terpadu Sulthoniyah Sambas disimpan sebagai konfigurasi bawaan aplikasi.
- Logo sekolah disertakan sebagai aset lokal untuk ikon aplikasi dan splash screen, serta sebagai logo default pada profil sekolah/sampul.
- Logo kiri/kanan, ukuran logo, empat baris kop, dan tipografi kop leger diambil dari pengaturan sekolah pada berkas cadangan.
- Default hanya mengisi instalasi baru. Pada database pengguna yang sudah ada, pengaturan yang telah tersimpan tidak ditimpa; hanya kunci default yang belum tersedia yang dilengkapi.
- Tidak ada data guru, murid, TP, nilai, absensi, atau hasil rapor dari berkas cadangan yang disalin ke konfigurasi bawaan.

## Validasi
- Database baru tetap tanpa murid, TP, LM, dan nilai.
- Profil sekolah dan logo tersedia tanpa unggah manual.
- Kop leger dan kedua gambar logo tersedia sebagai default.
- Database yang sudah memiliki profil/logo sendiri tidak ditimpa.
- Pengujian otomatis dan preflight dijalankan pada salinan pengembangan.
