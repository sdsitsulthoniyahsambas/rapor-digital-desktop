/**
 * ==========================================================================
 *  RAPOR DIGITAL — versi aplikasi laptop (Electron)
 *  Proses utama: jendela aplikasi, penyimpanan data lokal, cetak/PDF, ekspor.
 * ==========================================================================
 */
const { app, BrowserWindow, ipcMain, dialog, shell, Menu, safeStorage } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { Store } = require('./store');
const { namaFileCadangan } = require('./backup-name');
const logika = require('./api');
const { tulisRekapExcel } = require('./excel');
const { templateMurid, templateTP, templateSemester, templateGuruMapel, bacaExcel } = require('./template');
const { createGemini } = require('./gemini');
const gemini = createGemini({ app, safeStorage });

const DEV_URL = process.env.VITE_DEV_SERVER_URL;
const ROOT = path.join(__dirname, '..', '..');
let win = null;
let splash = null;
let splashTimer = null;
let store = null;
let folderPdf = null; // folder tujuan PDF per murid yang dipilih pengguna
const folderCadanganManual = () => path.join(app.getPath('userData'), 'cadangan-manual');

// Folder data tetap di "%APPDATA%\Rapor Digital SD" (nama lama) agar data pengguna lama tidak hilang setelah ganti nama produk.
app.setPath('userData', process.env.RAPOR_USER_DATA_DIR || path.join(app.getPath('appData'), 'Rapor Digital SD'));
if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

/* ---------- konfigurasi dan lokasi cadangan lokal ---------- */
const fileConfig = () => path.join(app.getPath('userData'), 'config.json');
function bacaConfig() { try { return JSON.parse(fs.readFileSync(fileConfig(), 'utf8')); } catch (e) { return {}; } }
function tulisConfig(c) { fs.writeFileSync(fileConfig(), JSON.stringify(c, null, 1)); }
function folderCadangan() {
  const dir = folderCadanganManual();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function namaFileCadanganAktif() {
  const pengaturan = Object.fromEntries(store.baca('PENGATURAN').map((r) => [r.kunci, r.nilai]));
  return namaFileCadangan(pengaturan);
}

function folderData() {
  // bisa dipindah ke folder lain lewat variabel lingkungan (mis. untuk versi portable)
  return process.env.RAPOR_DATA_DIR || path.join(app.getPath('userData'), 'data');
}

const WARNA_LATAR = '#F3F5FA';
/** PDF dari halaman cetak. Latar jendela dibuat putih sementara,
 *  karena Chromium mewarnai area margin kertas dengan warna latar jendela. */
async function cetakKePdf() {
  win.setBackgroundColor('#FFFFFF');
  try { return await win.webContents.printToPDF({ printBackground: true, preferCSSPageSize: true }); }
  finally { win.setBackgroundColor(WARNA_LATAR); }
}

function buatJendela() {
  let splashSelesai = false;
  let berandaSiap = false;
  const tampilkanBeranda = () => {
    if (!splashSelesai || !berandaSiap || !win || win.isDestroyed()) return;
    win.maximize();
    if (splash && !splash.isDestroyed()) splash.close();
    splash = null;
    win.show();
    win.focus();
  };
  splash = new BrowserWindow({ width: 520, height: 360, frame: false, resizable: false, maximizable: false, minimizable: false, movable: false, show: false, center: true, backgroundColor: '#102b57', alwaysOnTop: true, autoHideMenuBar: true, webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true } });
  splash.once('ready-to-show', () => {
    if (!splash || splash.isDestroyed()) return;
    splash.show();
    splash.focus();
    splashTimer = setTimeout(() => { splashSelesai = true; tampilkanBeranda(); }, 5000);
  });
  splash.loadFile(path.join(ROOT, 'dist', 'splash.html'));
  win = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    backgroundColor: WARNA_LATAR,
    title: logika.judul(),
    icon: path.join(ROOT, 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });
  win.once('ready-to-show', () => { berandaSiap = true; tampilkanBeranda(); });

  // tautan luar dibuka di browser, aplikasi tidak boleh pindah halaman
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => {
    const izin = DEV_URL ? url.startsWith(DEV_URL) : url.startsWith('file://');
    if (!izin) e.preventDefault();
  });

  if (DEV_URL) win.loadURL(DEV_URL);
  else win.loadFile(path.join(ROOT, 'dist', 'index.html'));
}

function pasangMenu() {
  const menu = Menu.buildFromTemplate([
    { label: 'Aplikasi', submenu: [
      { label: 'Muat ulang', accelerator: 'CmdOrCtrl+R', click: () => win && win.reload() },
      { type: 'separator' },
      { label: 'Perbesar', accelerator: 'CmdOrCtrl+=', role: 'zoomIn' },
      { label: 'Perkecil', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
      { label: 'Ukuran normal', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
      { label: 'Layar penuh', role: 'togglefullscreen' },
      { type: 'separator' },
      { label: 'Keluar', role: 'quit' }
    ] },
    { label: 'Edit', submenu: [
      { label: 'Urungkan', role: 'undo' }, { label: 'Ulangi', role: 'redo' }, { type: 'separator' },
      { label: 'Potong', role: 'cut' }, { label: 'Salin', role: 'copy' }, { label: 'Tempel', role: 'paste' }, { label: 'Pilih semua', role: 'selectAll' }
    ] },
    { label: 'Data', submenu: [
      { label: 'Buka folder data', click: () => shell.openPath(folderData()) },
      { label: 'Alat pengembang', accelerator: 'F12', click: () => win && win.webContents.toggleDevTools(), visible: !app.isPackaged }
    ] }
  ]);
  Menu.setApplicationMenu(menu);
}

/* ---------- IPC ---------- */
function daftarIPC() {
  ipcMain.handle('gemini-status', () => gemini.status());
  ipcMain.handle('gemini-set-key', (_e, key) => gemini.setKey(key));
  ipcMain.handle('gemini-generate', (_e, payload) => gemini.generate(payload));
  ipcMain.handle('api', (_e, req) => {
    return logika.api(req);
  });

  ipcMain.handle('template-murid', async () => {
    const { canceled, filePath } = await dialog.showSaveDialog(win, { title: 'Simpan template data murid', defaultPath: path.join(app.getPath('documents'), 'Template Data Murid.xlsx'), filters: [{ name: 'Excel', extensions: ['xlsx'] }] });
    if (canceled || !filePath) return { ok: false, batal: true };
    await templateMurid(filePath);
    return { ok: true, path: filePath };
  });
  ipcMain.handle('template-tp', async (_e, o = {}) => {
    const { canceled, filePath } = await dialog.showSaveDialog(win, { title: 'Simpan template tujuan pembelajaran', defaultPath: path.join(app.getPath('documents'), 'Template TP Kelas ' + String(o.kelas || '').replace(/[\\/:*?"<>|]+/g, '-') + '.xlsx'), filters: [{ name: 'Excel', extensions: ['xlsx'] }] });
    if (canceled || !filePath) return { ok: false, batal: true };
    await templateTP(filePath, o);
    return { ok: true, path: filePath };
  });
  ipcMain.handle('template-semester', async (_e, o = {}) => {
    const nama = ('Template Nilai ' + (o.judul || '')).replace(/[\\/:*?"<>|]+/g, '-').trim();
    const { canceled, filePath } = await dialog.showSaveDialog(win, { title: 'Simpan template penilaian', defaultPath: path.join(app.getPath('documents'), nama + '.xlsx'), filters: [{ name: 'Excel', extensions: ['xlsx'] }] });
    if (canceled || !filePath) return { ok: false, batal: true };
    await templateSemester(filePath, o);
    return { ok: true, path: filePath };
  });
  // template guru mapel: satu file per mapel, disimpan dalam satu subfolder
  ipcMain.handle('template-guru-mapel', async (_e, o = {}) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, { title: 'Pilih folder untuk menyimpan file guru mapel', defaultPath: app.getPath('documents'), properties: ['openDirectory', 'createDirectory'] });
    if (canceled || !filePaths.length) return { ok: false, batal: true };
    const bersih = (s) => String(s || '').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim();
    const folder = path.join(filePaths[0], bersih(o.folder || 'File Guru Mapel'));
    fs.mkdirSync(folder, { recursive: true });
    const hasil = [];
    for (const f of (o.files || [])) {
      const file = path.join(folder, bersih(f.nama) + '.xlsx');
      await templateGuruMapel(file, f.data);
      hasil.push(file);
    }
    return { ok: true, folder, files: hasil };
  });
  ipcMain.handle('baca-excel-banyak', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, { title: 'Pilih file dari guru mapel (boleh banyak sekaligus)', properties: ['openFile', 'multiSelections'], filters: [{ name: 'Excel', extensions: ['xlsx'] }] });
    if (canceled || !filePaths.length) return { ok: false, batal: true };
    const files = [];
    for (const f of filePaths) {
      try { files.push({ nama: path.basename(f), waktu: fs.statSync(f).mtimeMs, sheets: await bacaExcel(f) }); }
      catch (e) { files.push({ nama: path.basename(f), error: 'tidak bisa dibaca (' + e.message + ')' }); }
    }
    return { ok: true, files };
  });
  ipcMain.handle('baca-excel', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, { title: 'Pilih file Excel yang sudah diisi', properties: ['openFile'], filters: [{ name: 'Excel', extensions: ['xlsx'] }] });
    if (canceled || !filePaths.length) return { ok: false, batal: true };
    try { return { ok: true, nama: path.basename(filePaths[0]), sheets: await bacaExcel(filePaths[0]) }; }
    catch (e) { return { ok: false, error: 'File tidak bisa dibaca: ' + e.message + ' (pastikan format .xlsx)' }; }
  });

  ipcMain.handle('cadangan-info', () => {
    let ukuranData = 0; try { ukuranData = fs.statSync(store.file).size; } catch (e) { /* abaikan */ }
    const dir = folderCadangan();
    let daftarManual = [];
    try {
      daftarManual = fs.readdirSync(dir).filter(f => /^db_.+_.+_.+\.json$/.test(f))
        .map(f => ({ nama: f, waktu: fs.statSync(path.join(dir, f)).mtime.toISOString(), ukuran: fs.statSync(path.join(dir, f)).size }))
        .sort((a, b) => b.waktu.localeCompare(a.waktu));
    } catch (e) { /* folder baru dibuat di atas */ }
    const c = bacaConfig();
    return { folderData: folderData(), folderCadangan: dir, daftarManual, otomatis: store.infoCadangan(),
      terakhirManual: c.terakhirManual || '', ukuranData };
  });
  ipcMain.handle('cadangan-pulihkan-otomatis', (_e, nama) => {
    const f = path.join(store.backupDir, path.basename(String(nama || '')));
    if (!f.startsWith(store.backupDir) || !fs.existsSync(f)) return { ok: false, error: 'File cadangan tidak ditemukan.' };
    try { store.ganti(JSON.parse(fs.readFileSync(f, 'utf8'))); return { ok: true }; } catch (e) { return { ok: false, error: e.message }; }
  });

  ipcMain.handle('info', () => ({ folderData: folderData(), versi: app.getVersion(), dev: !!DEV_URL }));

  ipcMain.handle('cetak', () => new Promise((res) => {
    win.webContents.print({ printBackground: true }, (ok, alasan) => res({ ok, alasan }));
  }));

  ipcMain.handle('pdf', async (_e, opsi = {}) => {
    const nama = String(opsi.namaFile || 'Rapor').replace(/[\\/:*?"<>|]+/g, '-') + '.pdf';
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Simpan PDF',
      defaultPath: path.join(app.getPath('documents'), nama),
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });
    if (canceled || !filePath) return { ok: false, batal: true };
    const data = await cetakKePdf();
    fs.writeFileSync(filePath, data);
    return { ok: true, path: filePath };
  });

  ipcMain.handle('pilih-folder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Pilih folder untuk menyimpan PDF', defaultPath: app.getPath('documents'), properties: ['openDirectory', 'createDirectory']
    });
    if (canceled || !filePaths.length) return { ok: false, batal: true };
    folderPdf = filePaths[0];
    return { ok: true, folder: folderPdf };
  });

  ipcMain.handle('pdf-folder', async (_e, opsi = {}) => {
    if (!folderPdf) return { ok: false, error: 'Folder belum dipilih.' };
    const nama = String(opsi.namaFile || 'Rapor').replace(/[\\/:*?"<>|]+/g, '-') + '.pdf';
    const data = await cetakKePdf();
    fs.writeFileSync(path.join(folderPdf, nama), data);
    return { ok: true };
  });

  ipcMain.handle('excel', async (_e, opsi = {}) => {
    const nama = String(opsi.namaFile || 'Leger').replace(/[\\/:*?"<>|]+/g, '-') + '.xlsx';
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Simpan leger Excel',
      defaultPath: path.join(app.getPath('documents'), nama),
      filters: [{ name: 'Excel', extensions: ['xlsx'] }]
    });
    if (canceled || !filePath) return { ok: false, batal: true };
    await tulisRekapExcel(filePath, opsi);
    return { ok: true, path: filePath };
  });

  ipcMain.handle('cadangkan', async () => {
    try {
      const dir = folderCadangan();
      const nama = namaFileCadanganAktif();
      const { canceled, filePath } = await dialog.showSaveDialog(win, {
        title: 'Simpan cadangan data', defaultPath: path.join(dir, nama),
        buttonLabel: 'Simpan Cadangan', filters: [{ name: 'Cadangan data', extensions: ['json'] }]
      });
      if (canceled || !filePath) return { ok: false, batal: true };
      // writeFileSync menimpa file dengan nama yang sama; tidak membuat salinan bernomor.
      fs.writeFileSync(filePath, JSON.stringify(store.data, null, 1));
      const c = bacaConfig(); c.terakhirManual = new Date().toISOString(); tulisConfig(c);
      return { ok: true, path: filePath, nama: path.basename(filePath) };
    } catch (e) { return { ok: false, error: e.message }; }
  });

  ipcMain.handle('pulihkan', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Pilih file cadangan',
      properties: ['openFile'],
      filters: [{ name: 'Cadangan data', extensions: ['json'] }]
    });
    if (canceled || !filePaths.length) return { ok: false, batal: true };
    try {
      store.ganti(JSON.parse(fs.readFileSync(filePaths[0], 'utf8')));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('folder-data', () => shell.openPath(folderData()));
  ipcMain.handle('buka-folder-cadangan', () => shell.openPath(folderCadangan()));
  ipcMain.handle('buka-file', (_e, p) => (p && fs.existsSync(p) ? shell.openPath(p) : 'File tidak ditemukan'));
}

app.whenReady().then(() => {
  store = new Store(folderData());
  logika.init(store, { folderData: folderData(), desktop: true });
  daftarIPC();
  pasangMenu();
  buatJendela();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) buatJendela(); });
});

app.on('before-quit', () => {
  if (splashTimer) { clearTimeout(splashTimer); splashTimer = null; }
  if (splash && !splash.isDestroyed()) splash.close();
});
app.on('window-all-closed', () => {
  if (splashTimer) { clearTimeout(splashTimer); splashTimer = null; }
  if (splash && !splash.isDestroyed()) splash.close();
  if (process.platform !== 'darwin') app.quit();
});
