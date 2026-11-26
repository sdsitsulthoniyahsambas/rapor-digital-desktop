/**
 * Jembatan aman antara tampilan (renderer) dan proses utama Electron.
 * Tampilan hanya bisa memakai fungsi-fungsi di window.desktop ini.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  api: (req) => ipcRenderer.invoke('api', req),
  geminiStatus: () => ipcRenderer.invoke('gemini-status'),
  geminiSetKey: (key) => ipcRenderer.invoke('gemini-set-key', key),
  geminiGenerate: (payload) => ipcRenderer.invoke('gemini-generate', payload),                 // semua aksi data (pengganti google.script.run)
  cetak: () => ipcRenderer.invoke('cetak'),                       // dialog cetak printer
  simpanPdf: (opsi) => ipcRenderer.invoke('pdf', opsi),           // simpan PDF ke file
  pilihFolder: () => ipcRenderer.invoke('pilih-folder'),          // folder tujuan PDF per murid
  pdfKeFolder: (opsi) => ipcRenderer.invoke('pdf-folder', opsi),  // tulis 1 PDF ke folder terpilih
  eksporExcel: (opsi) => ipcRenderer.invoke('excel', opsi),       // leger → .xlsx
  templateMurid: () => ipcRenderer.invoke('template-murid'),       // unduh template data murid
  templateTP: (o) => ipcRenderer.invoke('template-tp', o),         // unduh template tujuan pembelajaran
  templateSemester: (o) => ipcRenderer.invoke('template-semester', o), // unduh template penilaian semester
  bacaExcel: () => ipcRenderer.invoke('baca-excel'),              // unggah file .xlsx hasil isian
  templateGuruMapel: (o) => ipcRenderer.invoke('template-guru-mapel', o), // buat file per mapel untuk guru mapel
  bacaExcelBanyak: () => ipcRenderer.invoke('baca-excel-banyak'),   // unggah banyak file guru mapel sekaligus
  cadangkan: () => ipcRenderer.invoke('cadangkan'),               // backup data → file .json
  pulihkan: () => ipcRenderer.invoke('pulihkan'),                 // restore dari file .json
  cadanganInfo: () => ipcRenderer.invoke('cadangan-info'),
  cadanganPulihkanOtomatis: (nama) => ipcRenderer.invoke('cadangan-pulihkan-otomatis', nama),
  bukaFolderCadangan: () => ipcRenderer.invoke('buka-folder-cadangan'),

  bukaFolderData: () => ipcRenderer.invoke('folder-data'),
  bukaFile: (p) => ipcRenderer.invoke('buka-file', p),
  info: () => ipcRenderer.invoke('info')
});
