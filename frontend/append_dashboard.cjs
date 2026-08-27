const fs = require('fs');
let content = fs.readFileSync('src/utils/excelExportUtils.js', 'utf8');

const newFunction = `

export const exportDashboardToExcel = async (data, t) => {
  const workbook = new ExcelJS.Workbook();
  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDAEAFF' } };
  const headerFont = { name: 'Cairo', size: 14, bold: true, color: { argb: 'FF304ACE' } };
  const defaultFont = { name: 'Cairo', size: 12 };
  const alignmentCentered = { vertical: 'middle', horizontal: 'center' };

  const applyStyles = (worksheet, hasHeaders = true) => {
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        if (hasHeaders && rowNumber === 1) {
          cell.fill = headerFill;
          cell.font = headerFont;
        } else {
          cell.font = defaultFont;
        }
        cell.alignment = alignmentCentered;
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
      row.height = hasHeaders && rowNumber === 1 ? 30 : 25;
    });
  };

  // KPI Sheet
  const kpiData = [
    ['Metric', 'Value'],
    [t('dashboard.kpi.totalPassengers'), data?.kpis?.totalPassengers],
    [t('dashboard.kpi.totalFlights'), data?.kpis?.totalFlights],
    [t('dashboard.kpi.totalRevenue'), data?.kpis?.revenueEgp],
    [t('dashboard.kpi.totalExpenses'), data?.kpis?.expensesEgp],
    [t('dashboard.kpi.netProfit'), data?.kpis?.netProfitEgp],
  ];
  const wsKpi = workbook.addWorksheet('KPI Summary', { views: [{ rightToLeft: true }] });
  wsKpi.columns = [{ width: 30 }, { width: 20 }];
  wsKpi.addRows(kpiData);
  applyStyles(wsKpi);

  // Helper to add data sheet
  const addDataSheet = (sheetName, list) => {
    if (!list || list.length === 0) return;
    const ws = workbook.addWorksheet(sheetName, { views: [{ rightToLeft: true }] });
    const cols = Object.keys(list[0]).map(k => ({ header: k, key: k, width: 20 }));
    ws.columns = cols;
    ws.addRows(list);
    applyStyles(ws);
  };

  addDataSheet('By Destination', data?.charts?.passengersByDestination);
  addDataSheet('By Service', data?.charts?.revenueByServiceType);
  addDataSheet('Top Agents', data?.charts?.topAgentsByPassengers);
  addDataSheet('Flights', data?.flights);

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, \`Dashboard_Report_\${dateStr}.xlsx\`);
};
`;

if (!content.includes('exportDashboardToExcel')) {
  fs.writeFileSync('src/utils/excelExportUtils.js', content + newFunction, 'utf8');
}
console.log('Done replacing');
