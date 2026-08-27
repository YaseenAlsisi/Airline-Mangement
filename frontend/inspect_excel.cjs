const ExcelJS = require('exceljs');

async function inspectExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('data.xlsx');
  const sheet = workbook.getWorksheet('المليجي');
  
  const headerRow = sheet.getRow(1);
  const headers = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, col) => {
    if (col <= 25) {
      headers.push(`Col ${col}: ${cell.value}`);
    }
  });
  console.log("Headers:");
  console.log(headers.join('\n'));
}
inspectExcel().catch(console.error);
