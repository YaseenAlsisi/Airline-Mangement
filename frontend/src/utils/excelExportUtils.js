import ExcelJS from 'exceljs';
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
    const sheetName = agent.agentName.substring(0, 31).replace(/[\\/?*\[\]]/g, '');
    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ rightToLeft: true }]
    });

    // 1. Passengers Table
    worksheet.columns = [
      { header: 'الاسم', key: 'name', width: 30 },
      { header: 'تاريخ الميلاد', key: 'dob', width: 20 },
      { header: 'رقم الجواز', key: 'passport', width: 20 },
      { header: 'جهة المغادرة', key: 'departure', width: 20 },
      { header: 'جهة الوصول', key: 'arrival', width: 20 },
      { header: 'رقم الرحله', key: 'flight', width: 20 },
      { header: 'تاريخ المغادرة', key: 'depDate', width: 20 },
      { header: 'ميعاد الوصول', key: 'arrTime', width: 20 },
      { header: 'الوكيل', key: 'agent', width: 25 },
      { header: 'نوع الخدمة', key: 'service', width: 20 },
      { header: 'النوع', key: 'category', width: 15 },
      { header: 'المدين', key: 'debit', width: 15 }
    ];

    applyHeaderStyle(worksheet.getRow(1));

    let totalPassengersDebit = 0;

    if (agent.passengers && agent.passengers.length > 0) {
      agent.passengers.forEach((p) => {
        const passengerDebit = p.totalPrice != null ? Number(p.totalPrice) : (Number(p.debitEgp) || 0);
        totalPassengersDebit += passengerDebit;

        const row = worksheet.addRow({
          name: p.passengerName || '-',
          dob: p.birthDate || '-',
          passport: p.passportNumber || '-',
          departure: p.departurePort || '-',
          arrival: p.destination || '-',
          flight: p.flightNumber || '-',
          depDate: p.departureDate || '-',
          arrTime: p.arrivalTime || '-',
          agent: agent.agentName,
          service: p.serviceType || '-',
          category: p.passengerCategory || '-',
          debit: passengerDebit
        });
        applyRowStyle(row);
      });
      
      // Add Total Row for Passengers Debit
      const totalRow = worksheet.addRow({
        category: 'الإجمالي:',
        debit: totalPassengersDebit
      });
      
      totalRow.eachCell((cell) => {
        cell.font = { name: 'Cairo', size: 12, bold: true };
        cell.alignment = alignmentCentered;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      });
    }

    const currentLastRow = worksheet.lastRow.number;

    // 2. Deposits (Payments) Table
    const paymentsStartRow = currentLastRow + 3;
    worksheet.getCell(`A${paymentsStartRow}`).value = 'سجل عمليات الإيداع (الدفعات)';
    worksheet.getCell(`A${paymentsStartRow}`).font = { ...headerFont, size: 16 };
    worksheet.getCell(`A${paymentsStartRow}`).alignment = alignmentCentered;
    worksheet.mergeCells(`A${paymentsStartRow}:C${paymentsStartRow}`);

    const paymentHeaderRow = worksheet.getRow(paymentsStartRow + 1);
    paymentHeaderRow.values = ['تاريخ الدفع', 'المبلغ (ج.م)', 'ملاحظات'];
    applyHeaderStyle(paymentHeaderRow);

    if (agent.payments && agent.payments.length > 0) {
      // Sort payments newest first
      const sortedPayments = [...agent.payments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
      
      sortedPayments.forEach((payment, idx) => {
        const row = worksheet.getRow(paymentsStartRow + 2 + idx);
        row.values = [
          payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-',
          Number(payment.amount || 0),
          payment.note || '-'
        ];
        applyRowStyle(row);
      });
    } else {
      const row = worksheet.getRow(paymentsStartRow + 2);
      row.values = ['لا يوجد دفعات مسجلة', '-', '-'];
      applyRowStyle(row);
    }

    const afterPaymentsRow = worksheet.lastRow.number;

    // 3. Summary Table
    const summaryStartRow = afterPaymentsRow + 3;
    worksheet.getCell(`A${summaryStartRow}`).value = 'ملخص حساب الوكيل';
    worksheet.getCell(`A${summaryStartRow}`).font = { ...headerFont, size: 16 };
    worksheet.getCell(`A${summaryStartRow}`).alignment = alignmentCentered;
    worksheet.mergeCells(`A${summaryStartRow}:C${summaryStartRow}`);

    const summaryHeaderRow = worksheet.getRow(summaryStartRow + 1);
    summaryHeaderRow.values = ['إجمالي المدين (عليه)', 'إجمالي الدائن (له)', 'الرصيد المتبقي (الملخص)'];
    applyHeaderStyle(summaryHeaderRow);

    const summaryDataRow = worksheet.getRow(summaryStartRow + 2);
    const debit = Number(agent.debitEgp || 0);
    const credit = Number(agent.creditEgp || 0);
    const balance = debit - credit;
    let balanceText = 'خالص';
    if (balance > 0) balanceText = `الوكيل عليه ${balance}`;
    else if (balance < 0) balanceText = `للشركة ${Math.abs(balance)}`; // This means company owes agent? Actually if debit - credit < 0, agent paid more, company owes agent.

    summaryDataRow.values = [
      debit,
      credit,
      balanceText
    ];
    applyRowStyle(summaryDataRow);
    
    // Add colors to balance cell based on value
    const balanceCell = worksheet.getCell(`C${summaryStartRow + 2}`);
    if (balance > 0) {
      balanceCell.font = { ...defaultFont, color: { argb: 'FFD32F2F' }, bold: true }; // Red
    } else if (balance < 0) {
      balanceCell.font = { ...defaultFont, color: { argb: 'FF388E3C' }, bold: true }; // Green
    } else {
      balanceCell.font = { ...defaultFont, color: { argb: 'FF1976D2' }, bold: true }; // Blue
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Agents_Report_${dateStr}.xlsx`);
};

export const exportBalancesReportToExcel = async (agentGroups) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('تقرير الأرصدة', { views: [{ rightToLeft: true }] });

  const headerFillPositive = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } }; // Light Red for owe us
  const headerFillNegative = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } }; // Light Green for we owe them
  
  const headerFont = { name: 'Cairo', size: 14, bold: true };
  const defaultFont = { name: 'Cairo', size: 12 };
  const alignmentCentered = { vertical: 'middle', horizontal: 'center' };

  const applyTableStyle = (row, isNegative) => {
    row.eachCell((cell) => {
      cell.fill = isNegative ? headerFillNegative : headerFillPositive;
      cell.font = { ...headerFont, color: { argb: isNegative ? 'FF2E7D32' : 'FFC62828' } };
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
    const debit = Number(agent.debitEgp || 0);
    const credit = Number(agent.creditEgp || 0);
    const balance = debit - credit;
    const tickets = (balance / 44000).toFixed(2);

    const data = {
      name: agent.agentName,
      debit,
      credit,
      balance: Math.abs(balance),
      tickets: Math.abs(tickets)
    };

    if (balance >= 0) {
      positiveAgents.push(data);
    } else {
      negativeAgents.push(data);
    }
  });

  const columns = [
    { header: 'اسم الوكيل', key: 'name', width: 30 },
    { header: 'إجمالي المدين', key: 'debit', width: 20 },
    { header: 'إجمالي الدائن', key: 'credit', width: 20 },
    { header: 'الرصيد', key: 'balance', width: 20 },
    { header: 'التذاكر التقريبية (44,000)', key: 'tickets', width: 25 }
  ];

  // Table 1: Positive Agents
  worksheet.columns = columns;
  
  worksheet.getCell('A1').value = 'الوكلاء المدينين (عليهم أموال للشركة)';
  worksheet.getCell('A1').font = { ...headerFont, size: 16, color: { argb: 'FFC62828' } };
  worksheet.getCell('A1').alignment = alignmentCentered;
  worksheet.mergeCells('A1:E1');

  const posHeaderRow = worksheet.getRow(2);
  posHeaderRow.values = columns.map(c => c.header);
  applyTableStyle(posHeaderRow, false);

  let currentRow = 3;
  let totalPosDebit = 0;
  let totalPosCredit = 0;
  let totalPosBalance = 0;

  positiveAgents.forEach(agent => {
    totalPosDebit += agent.debit;
    totalPosCredit += agent.credit;
    totalPosBalance += agent.balance;
    const row = worksheet.getRow(currentRow++);
    row.values = [agent.name, agent.debit, agent.credit, agent.balance, agent.tickets];
    applyRowStyle(row);
  });

  // Total row for positive
  const posTotalRow = worksheet.getRow(currentRow++);
  posTotalRow.values = ['الإجمالي', totalPosDebit, totalPosCredit, totalPosBalance, (totalPosBalance / 44000).toFixed(2)];
  posTotalRow.eachCell((cell) => {
    cell.font = { ...headerFont, size: 12 };
    cell.alignment = alignmentCentered;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  // Space
  currentRow += 2;

  // Table 2: Negative Agents
  worksheet.getCell(`A${currentRow}`).value = 'الوكلاء الدائنين (لهم أموال عند الشركة)';
  worksheet.getCell(`A${currentRow}`).font = { ...headerFont, size: 16, color: { argb: 'FF2E7D32' } };
  worksheet.getCell(`A${currentRow}`).alignment = alignmentCentered;
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  currentRow++;

  const negHeaderRow = worksheet.getRow(currentRow++);
  negHeaderRow.values = columns.map(c => c.header);
  applyTableStyle(negHeaderRow, true);

  let totalNegDebit = 0;
  let totalNegCredit = 0;
  let totalNegBalance = 0;

  negativeAgents.forEach(agent => {
    totalNegDebit += agent.debit;
    totalNegCredit += agent.credit;
    totalNegBalance += agent.balance;
    const row = worksheet.getRow(currentRow++);
    row.values = [agent.name, agent.debit, agent.credit, agent.balance, agent.tickets];
    applyRowStyle(row);
  });

  // Total row for negative
  const negTotalRow = worksheet.getRow(currentRow++);
  negTotalRow.values = ['الإجمالي', totalNegDebit, totalNegCredit, totalNegBalance, (totalNegBalance / 44000).toFixed(2)];
  negTotalRow.eachCell((cell) => {
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
