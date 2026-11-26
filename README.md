# Rapor Digital SD — Desktop

Aplikasi desktop Rapor Digital SD Sulthoniyah.

## Status

- Versi sumber: **1.3.6**
- Platform target: Windows x64
- Runtime: Electron 44.6.0
- Installer: NSIS melalui Electron Builder

## Pengembangan lokal

Persyaratan:
- Node.js 20.19 atau lebih baru
- npm

Instal dependensi:

```bash
npm install
```

Jalankan pemeriksaan struktur dan pengujian:

```bash
npm run preflight
npm test
```

Jalankan aplikasi pengembangan sesuai petunjuk `BUILD-WINDOWS.md`.

Build installer Windows:

```bash
npm run dist:win
```

Hasil build berada di folder `release/`.

## Data pengguna

Database dan backup operasional pengguna tidak boleh disimpan di repositori ini.
Data aplikasi disimpan pada direktori data pengguna Windows. Jangan menghapus direktori tersebut ketika memperbarui aplikasi.

## Distribusi pembaruan

Repositori ini disiapkan sebagai sumber proyek desktop. Konfigurasi updater dan GitHub Actions akan ditambahkan setelah rancangan update disetujui dan diuji. Jangan mengunggah database, file backup, token, atau kredensial.

## Lisensi

Hak cipta dan distribusi aplikasi dikelola oleh pemilik proyek. Jangan menganggap kode ini sebagai perangkat lunak open-source hanya karena repositorinya bersifat Public.
