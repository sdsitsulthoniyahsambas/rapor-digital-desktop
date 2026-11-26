# Rapor Digital — rekonstruksi toolchain Windows

## Fakta paket asli yang telah diverifikasi
- Runtime pada executable asli: Electron 44.6.0.
- Proses utama: `src/main/main.js`.
- Preload: `src/main/preload.js`.
- Renderer: `dist/index.html` beserta aset lokal.
- Data utama: JSON melalui `src/main/store.js`.
- Paket asli menggunakan installer NSIS.

## Persiapan pada Windows
1. Pasang Node.js versi LTS yang kompatibel dengan Electron 44.6.0.
2. Buka PowerShell pada folder proyek.
3. Jalankan `npm install`.
4. Jalankan `npm test`.
5. Pastikan database pengembangan bersih tersedia dengan `npm run prepare:clean-dev-data` (jika belum ada).
6. Jalankan `npm run start:dev`.
7. Pastikan folder data dan user-data yang dipakai adalah `dev-data-clean`, bukan `%APPDATA%\Rapor Digital SD`.
8. Setelah uji manual berhasil, jalankan `npm run dist:win` untuk membangun installer NSIS x64.

## Isolasi data
Skrip `start:dev` mengatur `RAPOR_DATA_DIR` dan `RAPOR_USER_DATA_DIR` ke folder pengembangan. Kode utama menggunakan variabel tersebut sehingga pengujian tidak menyentuh data aplikasi lama. Installer yang dibangun juga tidak menghapus data pengguna saat uninstall (`deleteAppDataOnUninstall: false`).

## Catatan yang masih harus divalidasi
- `appId` saat ini adalah identitas paket pengembangan yang diusulkan (`id.hysedu.rapordigital`), bukan nilai yang terbukti dari installer lama.
- `electron-builder` adalah toolchain pembangunan yang disiapkan untuk mereproduksi paket NSIS; metadata builder asli belum ditemukan.
- Versi Windows dan tampilan installer baru harus diuji pada komputer Windows sebelum distribusi.
- Jangan memasang installer hasil build ke komputer kerja utama sebelum uji bersih dan persetujuan akhir.


## Revisi tata letak rapor (report-layout)
- Input nilai membedakan visual kolom TP, LM, STS, dan SAS dengan warna lembut.
- Alamat pada kepala rapor dirangkai: alamat jalan, Desa, Kec., Kab., lalu nama provinsi tanpa kata "Provinsi".
- Halaman Cetak menyediakan pengaturan margin dan lebar kolom mata pelajaran/nilai; lebar deskripsi menyesuaikan sisa tabel. Pengaturan disimpan lokal di profil aplikasi.
- Pratinjau menampilkan setiap elemen halaman `.page` sebagai lembar terpisah dengan label nomor halaman. Cocokkan kembali jumlah halaman dengan PDF saat uji Windows karena pemenggalan konten yang meluap ke halaman fisik berikutnya tetap perlu validasi melalui hasil PDF.
