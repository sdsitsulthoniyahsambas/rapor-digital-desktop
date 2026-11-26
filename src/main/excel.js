/** Ekspor leger nilai ke file Excel (.xlsx) — pengganti "Ekspor ke sheet LEGER". */
const ExcelJS = require('exceljs');

async function tulisRekapExcel(file, { header = [], rows = [], judul = 'LEGER', subjudul = '', lembar = 'Leger' }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Rapor Digital';
  const ws = wb.addWorksheet(lembar, { views: [{ state: 'frozen', xSplit: 2, ySplit: 4 }] });
  ws.mergeCells(1, 1, 1, Math.max(header.length, 2));
  ws.getCell(1, 1).value = judul;
  ws.getCell(1, 1).font = { bold: true, size: 13 };
  ws.mergeCells(2, 1, 2, Math.max(header.length, 2));
  ws.getCell(2, 1).value = subjudul;
  ws.getCell(2, 1).font = { size: 10, color: { argb: 'FF555555' } };

  const head = ws.getRow(4);
  header.forEach((h, i) => {
    const c = head.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2A44' } };
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });
  head.height = 32;

  const garis = { style: 'thin', color: { argb: 'FFCBD2E0' } };
  rows.forEach((r, ri) => {
    const row = ws.getRow(5 + ri);
    header.forEach((_, i) => {
      const v = r[i];
      const c = row.getCell(i + 1);
      c.value = v === '' || v === null || v === undefined ? null : (typeof v === 'number' || (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v) && i > 1) ? Number(v) : v);
      c.border = { top: garis, left: garis, bottom: garis, right: garis };
      if (i !== 1) c.alignment = { horizontal: 'center' };
    });
  });
  ws.columns.forEach((col, i) => { col.width = i === 0 ? 6 : i === 1 ? 32 : 11; });
  await wb.xlsx.writeFile(file);
  return file;
}

module.exports = { tulisRekapExcel };
