import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportAgentsToExcel = async (agentGroups) => {
  const workbook = new ExcelJS.Workbook();

  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFED7D31' } }; // Orange
  const paymentFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF79646' } }; // Orange for payments
  const totalFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF304ACE' } }; // Deep Blue for totals

  const headerFont = { name: 'Arial', color: { argb: 'FF000000' }, size: 12, bold: true };
  const rowFont = { name: 'Arial', color: { argb: 'FF000000' }, size: 11, bold: false };
  const paymentFont = { name: 'Arial', color: { argb: 'FFFFFFFF' }, size: 12, bold: true };
  const totalFont = { name: 'Arial', color: { argb: 'FFFFFFFF' }, size: 14, bold: true };
  const normalFont = { name: 'Arial', size: 12, bold: true }; // For values in total

  const alignmentCentered = { vertical: 'middle', horizontal: 'center' };
  const borderThin = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

  const applyStyle = (row, fill, font) => {
    row.eachCell((cell) => {
      if (fill) cell.fill = fill;
      if (font) cell.font = font;
      cell.alignment = alignmentCentered;
      cell.border = borderThin;
    });
  };

  agentGroups.forEach((agent) => {
    const sheetName = (agent.agentName || 'Agent').substring(0, 31).replace(/[\\/?*\[\]]/g, '');
    const worksheet = workbook.addWorksheet(sheetName, { views: [{ rightToLeft: true }] });

    // 1. Columns setup
    worksheet.columns = [
      { header: 'الاسم', key: 'name', width: 30 },
      { header: 'تاريخ الميلاد', key: 'dob', width: 12 },
      { header: 'الرقم القومي', key: 'nationalId', width: 18 },
      { header: 'رقم الجواز', key: 'passport', width: 15 },
      { header: 'المنفذ', key: 'departurePort', width: 15 },
      { header: 'جهة السفر', key: 'destination', width: 15 },
      { header: 'شركة الطيران', key: 'flight', width: 18 },
      { header: 'تاريخ المغادرة', key: 'depDate', width: 14 },
      { header: 'ميعاد المغادرة', key: 'depTime', width: 14 },
      { header: 'الوكيل', key: 'agent', width: 20 },
      { header: 'ملاحظات', key: 'notes1', width: 15 },
      { header: 'نوع الخدمه', key: 'service', width: 18 },
      { header: 'مدين دولار', key: 'debitUsd', width: 12 },
      { header: 'دائن دولار', key: 'creditUsd', width: 12 },
      { header: 'مدين مصري', key: 'debitEgp', width: 12 },
      { header: 'دائن مصري', key: 'creditEgp', width: 12 }
    ];

    const headerRow = worksheet.getRow(1);
    applyStyle(headerRow, headerFill, headerFont);
    headerRow.height = 30;

    // 2. Timeline combination and sorting (Newest first)
    const timeline = [];

    if (agent.passengers && agent.passengers.length > 0) {
      agent.passengers.forEach(p => timeline.push({ type: 'passenger', date: p.departureDate || '', data: p }));
    }

    if (agent.payments && agent.payments.length > 0) {
      agent.payments.forEach(p => timeline.push({ type: 'payment', date: p.paymentDate || '', data: p }));
    }

    timeline.sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return dateB - dateA; // Descending (Newest top)
    });

    // 3. Render rows
    timeline.forEach((item) => {
      if (item.type === 'passenger') {
        const p = item.data;
        const pDebitUsd = Number(p.debitUsd) || 0;
        const pCreditUsd = Number(p.creditUsd) || 0;
        const pDebitEgp = p.totalPrice != null ? Number(p.totalPrice) : (Number(p.debitEgp) || 0);
        const pCreditEgp = Number(p.creditEgp) || 0;

        const row = worksheet.addRow({
          name: p.passengerName || '',
          dob: p.birthDate || '',
          nationalId: p.nationalId || '',
          passport: p.passportNumber || '',
          departurePort: p.departurePort || '',
          destination: p.destination || '',
          flight: p.flightNumber || '',
          depDate: p.departureDate || '',
          depTime: p.arrivalTime || '',
          agent: agent.agentName || '',
          notes1: p.passengerCategory || 'بالغ',
          service: p.serviceType || '',
          debitUsd: pDebitUsd || '',
          creditUsd: pCreditUsd || '',
          debitEgp: pDebitEgp || '',
          creditEgp: pCreditEgp || ''
        });
        applyStyle(row, null, rowFont);
        row.height = 25;
      } else {
        const payment = item.data;
        const amt = Number(payment.amount || 0);
        const isUsd = payment.currency === 'USD';

        let desc = payment.note || '';
        if (!desc.includes('تسليم') && !desc.includes('إيداع') && !desc.includes('تاريخ')) {
          const dateStr = payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-GB') : '';
          desc = desc ? `تسليم نقدية بتاريخ ${dateStr} - ${desc}` : `تسليم نقدية بتاريخ ${dateStr}`;
        }

        const row = worksheet.addRow({
          name: desc,
          creditUsd: isUsd ? amt : '',
          creditEgp: !isUsd ? amt : ''
        });

        // 16 columns total (A to P). We merge A to L (1 to 12), leaving M to P for amounts.
        worksheet.mergeCells(`A${row.number}:L${row.number}`);
        row.getCell(1).alignment = { vertical: 'middle', horizontal: 'right' };

        applyStyle(row, paymentFill, paymentFont);
        row.height = 30;
      }
    });

    // 4. Totals with beautiful styling
    const currentLastRow = worksheet.lastRow ? worksheet.lastRow.number : 1;
    const debitUsd = Number(agent.debitUsd || 0);
    const creditUsd = Number(agent.creditUsd || 0);
    const balanceUsd = debitUsd - creditUsd;
    const debitEgp = Number(agent.debitEgp || 0);
    const creditEgp = Number(agent.creditEgp || 0);
    const balanceEgp = debitEgp - creditEgp;

    const summaryStartRow = currentLastRow + 2;
    
    const totalsHeaderFont = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    const totalsValFont = { name: 'Arial', size: 13, bold: true, color: { argb: 'FF000000' } };
    const totalsHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F75B5' } };
    const totalsValFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };

    // Header row for summary
    const sHeader = worksheet.getRow(summaryStartRow);
    worksheet.mergeCells(`A${summaryStartRow}:L${summaryStartRow}`);
    sHeader.getCell(1).value = 'ملخص حساب الوكيل';
    sHeader.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    sHeader.getCell(1).font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    sHeader.getCell(1).alignment = alignmentCentered;
    
    // Title row
    worksheet.mergeCells(`M${summaryStartRow}:P${summaryStartRow}`);
    sHeader.getCell(13).value = 'الرصيد الختامي';
    sHeader.getCell(13).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    sHeader.getCell(13).font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    sHeader.getCell(13).alignment = alignmentCentered;
    sHeader.height = 35;

    // USD Row
    const sUsd = worksheet.getRow(summaryStartRow + 1);
    worksheet.mergeCells(`A${summaryStartRow + 1}:L${summaryStartRow + 1}`);
    sUsd.getCell(1).value = 'إجمالي المديونية (دولار أمريكي)';
    sUsd.getCell(1).fill = totalsHeaderFill;
    sUsd.getCell(1).font = totalsHeaderFont;
    sUsd.getCell(1).alignment = alignmentCentered;
    sUsd.getCell(1).border = borderThin;

    worksheet.mergeCells(`M${summaryStartRow + 1}:P${summaryStartRow + 1}`);
    sUsd.getCell(13).value = balanceUsd === 0 ? 'خالص' : (balanceUsd > 0 ? `الوكيل عليه ${balanceUsd.toLocaleString()} $` : `للشركة ${Math.abs(balanceUsd).toLocaleString()} $`);
    sUsd.getCell(13).fill = totalsValFill;
    sUsd.getCell(13).font = { name: 'Arial', size: 14, bold: true, color: { argb: balanceUsd > 0 ? 'FFC00000' : (balanceUsd < 0 ? 'FF385D8A' : 'FF000000') } };
    sUsd.getCell(13).alignment = alignmentCentered;
    sUsd.getCell(13).border = borderThin;
    sUsd.height = 30;

    // EGP Row
    const sEgp = worksheet.getRow(summaryStartRow + 2);
    worksheet.mergeCells(`A${summaryStartRow + 2}:L${summaryStartRow + 2}`);
    sEgp.getCell(1).value = 'إجمالي المديونية (جنيه مصري)';
    sEgp.getCell(1).fill = totalsHeaderFill;
    sEgp.getCell(1).font = totalsHeaderFont;
    sEgp.getCell(1).alignment = alignmentCentered;
    sEgp.getCell(1).border = borderThin;

    worksheet.mergeCells(`M${summaryStartRow + 2}:P${summaryStartRow + 2}`);
    sEgp.getCell(13).value = balanceEgp === 0 ? 'خالص' : (balanceEgp > 0 ? `الوكيل عليه ${balanceEgp.toLocaleString()} ج.م` : `للشركة ${Math.abs(balanceEgp).toLocaleString()} ج.م`);
    sEgp.getCell(13).fill = totalsValFill;
    sEgp.getCell(13).font = { name: 'Arial', size: 14, bold: true, color: { argb: balanceEgp > 0 ? 'FFC00000' : (balanceEgp < 0 ? 'FF385D8A' : 'FF000000') } };
    sEgp.getCell(13).alignment = alignmentCentered;
    sEgp.getCell(13).border = borderThin;
    sEgp.height = 30;

    // Adding borders around the summary
    [sHeader, sUsd, sEgp].forEach(row => {
      for (let i = 1; i <= 16; i++) {
        const cell = row.getCell(i);
        if(!cell.border) cell.border = borderThin;
      }
    });

  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Agents_Detailed_Report_${dateStr}.xlsx`);
};


export const exportBalancesReportToExcel = async (agentGroups, ticketPrice = 44000) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('تقرير الأرصدة', { views: [{ rightToLeft: true }] });

  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDAEAFF' } }; // Light Blue
  const headerFont = { name: 'Cairo', size: 14, bold: true, color: { argb: 'FF304ACE' } };
  const defaultFont = { name: 'Cairo', size: 12 };
  const alignmentCentered = { vertical: 'middle', horizontal: 'center' };

  const applyTableStyle = (row) => {
    row.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = alignmentCentered;
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    row.height = 30;
  };

  const applyRowStyle = (row) => {
    row.eachCell((cell) => {
      cell.font = defaultFont;
      cell.alignment = alignmentCentered;
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    row.height = 25;
  };

  const allAgentsData = [];

  agentGroups.forEach(agent => {
    const debitUsd = Number(agent.debitUsd || 0);
    const creditUsd = Number(agent.creditUsd || 0);
    const balanceUsd = debitUsd - creditUsd;

    const debitEgp = Number(agent.debitEgp || 0);
    const creditEgp = Number(agent.creditEgp || 0);
    const balanceEgp = debitEgp - creditEgp;
    // Calculate tickets ONLY for creditor agents (agents who have a credit balance)
    let ticketsNum = 0;
    if (balanceEgp < 0 && ticketPrice > 0) {
      let exactTickets = Math.abs(balanceEgp) / ticketPrice;
      let integerPart = Math.floor(exactTickets);
      let fractionalPart = exactTickets - integerPart;

      // If fraction is >= 0.90 round up, otherwise just keep the integer (drop the fraction)
      if (fractionalPart >= 0.90) {
        ticketsNum = integerPart + 1;
      } else {
        ticketsNum = integerPart;
      }
    }
    const tickets = ticketsNum.toString();

    let status = 'خالص';
    const isZeroEgp = balanceEgp === 0;
    const isZeroUsd = balanceUsd === 0;

    if (isZeroEgp && isZeroUsd) {
      status = 'خالص';
    } else if (balanceEgp < 0 || balanceUsd < 0) {
      status = 'دائن (له)';
    } else {
      // If tickets < 1 (or balance is debit) and not completely zero
      status = 'مدين (عليه)';
    }

    allAgentsData.push({
      name: agent.agentName,
      debitUsd,
      creditUsd,
      balanceUsd,
      debitEgp,
      creditEgp,
      balanceEgp,
      tickets: Number(tickets),
      status
    });
  });

  const columns = [
    { header: 'اسم الوكيل', key: 'name', width: 30 },
    { header: 'الحالة', key: 'status', width: 15 },
    { header: 'مدين دولار ($)', key: 'debitUsd', width: 18 },
    { header: 'دائن دولار ($)', key: 'creditUsd', width: 18 },
    { header: 'رصيد دولار ($)', key: 'balanceUsd', width: 18 },
    { header: 'مدين مصري (ج.م)', key: 'debitEgp', width: 18 },
    { header: 'دائن مصري (ج.م)', key: 'creditEgp', width: 18 },
    { header: 'رصيد مصري (ج.م)', key: 'balanceEgp', width: 18 },
    { header: `التذاكر التقريبية (${ticketPrice.toLocaleString()})`, key: 'tickets', width: 25 }
  ];

  worksheet.columns = columns;

  worksheet.getCell('A1').value = 'تقرير أرصدة جميع الوكلاء';
  worksheet.getCell('A1').font = { ...headerFont, size: 16 };
  worksheet.getCell('A1').alignment = alignmentCentered;
  worksheet.mergeCells('A1:I1');

  const headerRow = worksheet.getRow(2);
  headerRow.values = columns.map(c => c.header);
  applyTableStyle(headerRow);

  let currentRow = 3;
  let totalDebitUsd = 0;
  let totalCreditUsd = 0;
  let totalBalanceUsd = 0;
  let totalDebitEgp = 0;
  let totalCreditEgp = 0;
  let totalBalanceEgp = 0;
  let totalTickets = 0;

  allAgentsData.forEach(agent => {
    totalDebitUsd += agent.debitUsd;
    totalCreditUsd += agent.creditUsd;
    totalBalanceUsd += agent.balanceUsd;
    totalDebitEgp += agent.debitEgp;
    totalCreditEgp += agent.creditEgp;
    totalBalanceEgp += agent.balanceEgp;
    totalTickets += Number(agent.tickets);

    const row = worksheet.getRow(currentRow++);
    row.values = [
      agent.name,
      agent.status,
      agent.debitUsd,
      agent.creditUsd,
      agent.balanceUsd,
      agent.debitEgp,
      agent.creditEgp,
      agent.balanceEgp,
      agent.tickets
    ];
    applyRowStyle(row);

    // Apply color to status
    const statusCell = row.getCell(2);
    if (agent.status === 'مدين (عليه)') statusCell.font = { ...defaultFont, color: { argb: 'FFD32F2F' } }; // Red
    else if (agent.status === 'دائن (له)') statusCell.font = { ...defaultFont, color: { argb: 'FF388E3C' } }; // Green
  });

  // Total row
  const totalRow = worksheet.getRow(currentRow++);
  totalRow.values = [
    'الإجمالي',
    '-',
    totalDebitUsd,
    totalCreditUsd,
    totalBalanceUsd,
    totalDebitEgp,
    totalCreditEgp,
    totalBalanceEgp,
    totalTickets
  ];
  totalRow.eachCell((cell) => {
    cell.font = { ...headerFont, size: 12 };
    cell.alignment = alignmentCentered;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Balances_Report_${dateStr}.xlsx`);
};

export const exportSalesSummaryToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales Summary', { views: [{ rightToLeft: true }] });

  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDAEAFF' } };
  const headerFont = { name: 'Cairo', size: 14, bold: true, color: { argb: 'FF304ACE' } };
  const defaultFont = { name: 'Cairo', size: 12 };
  const alignmentCentered = { vertical: 'middle', horizontal: 'center' };

  if (!data || data.length === 0) return;

  const columns = Object.keys(data[0]).map(key => ({
    header: key,
    key: key,
    width: 20
  }));
  worksheet.columns = columns;

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = alignmentCentered;
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });
  headerRow.height = 30;

  data.forEach((item) => {
    const row = worksheet.addRow(item);
    row.eachCell((cell) => {
      cell.font = defaultFont;
      cell.alignment = alignmentCentered;
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    row.height = 25;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Sales_Report_${dateStr}.xlsx`);
};

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
  saveAs(blob, `Dashboard_Report_${dateStr}.xlsx`);
};
