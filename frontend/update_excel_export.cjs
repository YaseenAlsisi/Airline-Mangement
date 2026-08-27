const fs = require('fs');

const fileContent = `import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportAgentsToExcel = async (agentGroups) => {
  const workbook = new ExcelJS.Workbook();
  
  // Style constants
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDAEAFF' } // #daeaff
  };
  
  const headerFont = {
    name: 'Cairo',
    color: { argb: 'FF304ACE' }, // #304ace
    size: 14,
    bold: true
  };
  
  const defaultFont = {
    name: 'Cairo',
    size: 12
  };
  
  const alignmentCentered = {
    vertical: 'middle',
    horizontal: 'center'
  };

  const applyHeaderStyle = (row) => {
    row.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = alignmentCentered;
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    row.height = 30;
  };

  const applyRowStyle = (row) => {
    row.eachCell((cell) => {
      cell.font = defaultFont;
      cell.alignment = alignmentCentered;
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    row.height = 25;
  };

  agentGroups.forEach((agent) => {
    // Truncate agent name if it's too long (max 31 chars for sheet name)
    const sheetName = (agent.agentName || 'Agent').substring(0, 31).replace(/[\\\\/?*\\[\\]]/g, '');
    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ rightToLeft: true }]
    });

    // 1. Passengers Table
    worksheet.columns = [
      { header: 'الاسم', key: 'name', width: 30 },
      { header: 'تاريخ الميلاد', key: 'dob', width: 16 },
      { header: 'رقم الجواز', key: 'passport', width: 18 },
      { header: 'النوع', key: 'category', width: 14 },
      { header: 'تاريخ المغادرة', key: 'depDate', width: 16 },
      { header: 'رقم الرحله', key: 'flight', width: 16 },
      { header: 'جهة المغادرة', key: 'departure', width: 18 },
      { header: 'جهة الوصول', key: 'arrival', width: 18 },
      { header: 'ميعاد الوصول', key: 'arrTime', width: 16 },
      { header: 'الوكيل', key: 'agent', width: 25 },
      { header: 'نوع الخدمة', key: 'service', width: 18 },
      { header: 'مدين دولار ($)', key: 'debitUsd', width: 16 },
      { header: 'دائن دولار ($)', key: 'creditUsd', width: 16 },
      { header: 'مدين مصري (ج.م)', key: 'debitEgp', width: 18 },
      { header: 'دائن مصري (ج.م)', key: 'creditEgp', width: 18 }
    ];

    applyHeaderStyle(worksheet.getRow(1));

    let totalPassengersDebitUsd = 0;
    let totalPassengersCreditUsd = 0;
    let totalPassengersDebitEgp = 0;
    let totalPassengersCreditEgp = 0;

    if (agent.passengers && agent.passengers.length > 0) {
      agent.passengers.forEach((p) => {
        const pDebitUsd = Number(p.debitUsd) || 0;
        const pCreditUsd = Number(p.creditUsd) || 0;
        const pDebitEgp = p.totalPrice != null ? Number(p.totalPrice) : (Number(p.debitEgp) || 0);
        const pCreditEgp = Number(p.creditEgp) || 0;

        totalPassengersDebitUsd += pDebitUsd;
        totalPassengersCreditUsd += pCreditUsd;
        totalPassengersDebitEgp += pDebitEgp;
        totalPassengersCreditEgp += pCreditEgp;

        const row = worksheet.addRow({
          name: p.passengerName || '-',
          dob: p.birthDate || '-',
          passport: p.passportNumber || '-',
          category: p.passengerCategory || '-',
          depDate: p.departureDate || '-',
          flight: p.flightNumber || '-',
          departure: p.departurePort || '-',
          arrival: p.destination || '-',
          arrTime: p.arrivalTime || '-',
          agent: agent.agentName,
          service: p.serviceType || '-',
          debitUsd: pDebitUsd,
          creditUsd: pCreditUsd,
          debitEgp: pDebitEgp,
          creditEgp: pCreditEgp
        });
        applyRowStyle(row);
      });
      
      // Add Total Row for Passengers
      const totalRow = worksheet.addRow({
        service: 'الإجمالي:',
        debitUsd: totalPassengersDebitUsd,
        creditUsd: totalPassengersCreditUsd,
        debitEgp: totalPassengersDebitEgp,
        creditEgp: totalPassengersCreditEgp
      });
      
      totalRow.eachCell((cell) => {
        cell.font = { name: 'Cairo', size: 12, bold: true, color: { argb: 'FF304ACE' } };
        cell.alignment = alignmentCentered;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      });
    }

    const currentLastRow = worksheet.lastRow ? worksheet.lastRow.number : 1;

    // 2. Deposits (Payments) Table
    const paymentsStartRow = currentLastRow + 3;
    worksheet.getCell(\`A\${paymentsStartRow}\`).value = 'سجل عمليات الإيداع (الدفعات)';
    worksheet.getCell(\`A\${paymentsStartRow}\`).font = { ...headerFont, size: 16 };
    worksheet.getCell(\`A\${paymentsStartRow}\`).alignment = alignmentCentered;
    worksheet.mergeCells(\`A\${paymentsStartRow}:D\${paymentsStartRow}\`);

    const paymentHeaderRow = worksheet.getRow(paymentsStartRow + 1);
    paymentHeaderRow.values = ['تاريخ الدفع', 'المبلغ', 'العملة', 'ملاحظات'];
    applyHeaderStyle(paymentHeaderRow);

    if (agent.payments && agent.payments.length > 0) {
      const sortedPayments = [...agent.payments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
      sortedPayments.forEach((payment, idx) => {
        const row = worksheet.getRow(paymentsStartRow + 2 + idx);
        row.values = [
          payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-',
          Number(payment.amount || 0),
          payment.currency || 'EGP',
          payment.note || '-'
        ];
        applyRowStyle(row);
      });
    } else {
      const row = worksheet.getRow(paymentsStartRow + 2);
      row.values = ['لا يوجد دفعات مسجلة', '-', '-', '-'];
      applyRowStyle(row);
    }

    const afterPaymentsRow = worksheet.lastRow ? worksheet.lastRow.number : paymentsStartRow + 2;

    // 3. Summary Table (Financial Summary for EGP and USD)
    const summaryStartRow = afterPaymentsRow + 3;
    worksheet.getCell(\`A\${summaryStartRow}\`).value = 'ملخص حساب الوكيل (Financial Summary)';
    worksheet.getCell(\`A\${summaryStartRow}\`).font = { ...headerFont, size: 16 };
    worksheet.getCell(\`A\${summaryStartRow}\`).alignment = alignmentCentered;
    worksheet.mergeCells(\`A\${summaryStartRow}:D\${summaryStartRow}\`);

    const summaryHeaderRow = worksheet.getRow(summaryStartRow + 1);
    summaryHeaderRow.values = ['العملة', 'إجمالي المدين (عليه)', 'إجمالي الدائن (له)', 'الرصيد المتبقي (الملخص)'];
    applyHeaderStyle(summaryHeaderRow);

    // EGP Summary Row
    const debitEgp = Number(agent.debitEgp || 0);
    const creditEgp = Number(agent.creditEgp || 0);
    const balanceEgp = debitEgp - creditEgp;
    let balanceEgpText = 'خالص';
    if (balanceEgp > 0) balanceEgpText = \`الوكيل عليه \${balanceEgp.toLocaleString()} ج.م\`;
    else if (balanceEgp < 0) balanceEgpText = \`للشركة \${Math.abs(balanceEgp).toLocaleString()} ج.م\`;

    const summaryEgpRow = worksheet.getRow(summaryStartRow + 2);
    summaryEgpRow.values = ['الجنيه المصري (EGP)', debitEgp, creditEgp, balanceEgpText];
    applyRowStyle(summaryEgpRow);

    const balanceEgpCell = worksheet.getCell(\`D\${summaryStartRow + 2}\`);
    if (balanceEgp > 0) {
      balanceEgpCell.font = { ...defaultFont, color: { argb: 'FFD32F2F' }, bold: true };
    } else if (balanceEgp < 0) {
      balanceEgpCell.font = { ...defaultFont, color: { argb: 'FF388E3C' }, bold: true };
    } else {
      balanceEgpCell.font = { ...defaultFont, color: { argb: 'FF1976D2' }, bold: true };
    }

    // USD Summary Row
    const debitUsd = Number(agent.debitUsd || 0);
    const creditUsd = Number(agent.creditUsd || 0);
    const balanceUsd = debitUsd - creditUsd;
    let balanceUsdText = 'خالص';
    if (balanceUsd > 0) balanceUsdText = \`الوكيل عليه \${balanceUsd.toLocaleString()} $\`;
    else if (balanceUsd < 0) balanceUsdText = \`للشركة \${Math.abs(balanceUsd).toLocaleString()} $\`;

    const summaryUsdRow = worksheet.getRow(summaryStartRow + 3);
    summaryUsdRow.values = ['الدولار الأمريكي (USD)', debitUsd, creditUsd, balanceUsdText];
    applyRowStyle(summaryUsdRow);

    const balanceUsdCell = worksheet.getCell(\`D\${summaryStartRow + 3}\`);
    if (balanceUsd > 0) {
      balanceUsdCell.font = { ...defaultFont, color: { argb: 'FFD32F2F' }, bold: true };
    } else if (balanceUsd < 0) {
      balanceUsdCell.font = { ...defaultFont, color: { argb: 'FF388E3C' }, bold: true };
    } else {
      balanceUsdCell.font = { ...defaultFont, color: { argb: 'FF1976D2' }, bold: true };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, \`Agents_Report_\${dateStr}.xlsx\`);
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

  const positiveAgents = [];
  const negativeAgents = [];

  agentGroups.forEach(agent => {
    const debitUsd = Number(agent.debitUsd || 0);
    const creditUsd = Number(agent.creditUsd || 0);
    const balanceUsd = debitUsd - creditUsd;

    const debitEgp = Number(agent.debitEgp || 0);
    const creditEgp = Number(agent.creditEgp || 0);
    const balanceEgp = debitEgp - creditEgp;
    const tickets = ticketPrice > 0 ? (balanceEgp / ticketPrice).toFixed(2) : '0.00';

    const data = {
      name: agent.agentName,
      debitUsd,
      creditUsd,
      balanceUsd,
      debitEgp,
      creditEgp,
      balanceEgp,
      tickets: Number(tickets)
    };

    if (balanceEgp >= 0 && balanceUsd >= 0) {
      positiveAgents.push(data);
    } else {
      negativeAgents.push(data);
    }
  });

  const columns = [
    { header: 'اسم الوكيل', key: 'name', width: 30 },
    { header: 'مدين دولار ($)', key: 'debitUsd', width: 18 },
    { header: 'دائن دولار ($)', key: 'creditUsd', width: 18 },
    { header: 'رصيد دولار ($)', key: 'balanceUsd', width: 18 },
    { header: 'مدين مصري (ج.م)', key: 'debitEgp', width: 18 },
    { header: 'دائن مصري (ج.م)', key: 'creditEgp', width: 18 },
    { header: 'رصيد مصري (ج.م)', key: 'balanceEgp', width: 18 },
    { header: \`التذاكر التقريبية (\${ticketPrice.toLocaleString()})\`, key: 'tickets', width: 25 }
  ];

  worksheet.columns = columns;
  
  // Table 1: Positive Agents (Debtors)
  worksheet.getCell('A1').value = 'الوكلاء المدينين (عليهم أموال للشركة)';
  worksheet.getCell('A1').font = { ...headerFont, size: 16 };
  worksheet.getCell('A1').alignment = alignmentCentered;
  worksheet.mergeCells('A1:H1');

  const posHeaderRow = worksheet.getRow(2);
  posHeaderRow.values = columns.map(c => c.header);
  applyTableStyle(posHeaderRow);

  let currentRow = 3;
  let totalPosDebitUsd = 0;
  let totalPosCreditUsd = 0;
  let totalPosBalanceUsd = 0;
  let totalPosDebitEgp = 0;
  let totalPosCreditEgp = 0;
  let totalPosBalanceEgp = 0;

  positiveAgents.forEach(agent => {
    totalPosDebitUsd += agent.debitUsd;
    totalPosCreditUsd += agent.creditUsd;
    totalPosBalanceUsd += agent.balanceUsd;
    totalPosDebitEgp += agent.debitEgp;
    totalPosCreditEgp += agent.creditEgp;
    totalPosBalanceEgp += agent.balanceEgp;

    const row = worksheet.getRow(currentRow++);
    row.values = [
      agent.name, 
      agent.debitUsd, 
      agent.creditUsd, 
      agent.balanceUsd, 
      agent.debitEgp, 
      agent.creditEgp, 
      agent.balanceEgp, 
      agent.tickets
    ];
    applyRowStyle(row);
  });

  // Total row for positive
  const posTotalRow = worksheet.getRow(currentRow++);
  posTotalRow.values = [
    'الإجمالي', 
    totalPosDebitUsd, 
    totalPosCreditUsd, 
    totalPosBalanceUsd, 
    totalPosDebitEgp, 
    totalPosCreditEgp, 
    totalPosBalanceEgp, 
    ticketPrice > 0 ? (totalPosBalanceEgp / ticketPrice).toFixed(2) : '0.00'
  ];
  posTotalRow.eachCell((cell) => {
    cell.font = { ...headerFont, size: 12 };
    cell.alignment = alignmentCentered;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  // Space
  currentRow += 2;

  // Table 2: Negative Agents (Creditors)
  worksheet.getCell(\`A\${currentRow}\`).value = 'الوكلاء الدائنين (لهم أموال عند الشركة)';
  worksheet.getCell(\`A\${currentRow}\`).font = { ...headerFont, size: 16 };
  worksheet.getCell(\`A\${currentRow}\`).alignment = alignmentCentered;
  worksheet.mergeCells(\`A\${currentRow}:H\${currentRow}\`);
  currentRow++;

  const negHeaderRow = worksheet.getRow(currentRow++);
  negHeaderRow.values = columns.map(c => c.header);
  applyTableStyle(negHeaderRow);

  let totalNegDebitUsd = 0;
  let totalNegCreditUsd = 0;
  let totalNegBalanceUsd = 0;
  let totalNegDebitEgp = 0;
  let totalNegCreditEgp = 0;
  let totalNegBalanceEgp = 0;

  negativeAgents.forEach(agent => {
    totalNegDebitUsd += agent.debitUsd;
    totalNegCreditUsd += agent.creditUsd;
    totalNegBalanceUsd += agent.balanceUsd;
    totalNegDebitEgp += agent.debitEgp;
    totalNegCreditEgp += agent.creditEgp;
    totalNegBalanceEgp += agent.balanceEgp;

    const row = worksheet.getRow(currentRow++);
    row.values = [
      agent.name, 
      agent.debitUsd, 
      agent.creditUsd, 
      agent.balanceUsd, 
      agent.debitEgp, 
      agent.creditEgp, 
      agent.balanceEgp, 
      agent.tickets
    ];
    applyRowStyle(row);
  });

  // Total row for negative
  const negTotalRow = worksheet.getRow(currentRow++);
  negTotalRow.values = [
    'الإجمالي', 
    totalNegDebitUsd, 
    totalNegCreditUsd, 
    totalNegBalanceUsd, 
    totalNegDebitEgp, 
    totalNegCreditEgp, 
    totalNegBalanceEgp, 
    ticketPrice > 0 ? (totalNegBalanceEgp / ticketPrice).toFixed(2) : '0.00'
  ];
  negTotalRow.eachCell((cell) => {
    cell.font = { ...headerFont, size: 12 };
    cell.alignment = alignmentCentered;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, \`Balances_Report_\${dateStr}.xlsx\`);
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
  saveAs(blob, \`Sales_Report_\${dateStr}.xlsx\`);
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
  saveAs(blob, \`Dashboard_Report_\${dateStr}.xlsx\`);
};
`;

fs.writeFileSync('src/utils/excelExportUtils.js', fileContent, 'utf8');
console.log('Successfully updated excelExportUtils.js with full USD and EGP support!');
