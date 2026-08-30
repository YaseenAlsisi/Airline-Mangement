const xlsx = require('xlsx');

const agentsToInspect = [
    'ايزي ترافيل',
    'رحليستا',
    'سعفان رافع',
    'عفاف',
    'فاطمه الجازوي',
    'نيو ايدج'
];

function classifyRow(row) {
    const colA = row[0] ? String(row[0]) : '';
    let isRowEmpty = true;
    for (let i = 0; i < 25; i++) {
        if (row[i] != null && String(row[i]).trim() !== '') {
            isRowEmpty = false; break;
        }
    }
    if (isRowEmpty) return 'EMPTY';
    if (colA && colA.includes('ما قبله')) return 'OPENING_BALANCE';
    
    const colI = row[8] ? String(row[8]) : '';
    if (colI && (colI.includes('اجمالي المديونيه') || colI.includes('الرئيسيه'))) {
        return 'SUMMARY';
    }
    
    let hasTravelData = false;
    for (let i = 1; i <= 15; i++) {
        if (row[i] != null && String(row[i]).trim() !== '') {
            hasTravelData = true; break;
        }
    }
    let hasFinancials = false;
    for (let i = 16; i <= 21; i++) {
        let v = Number(String(row[i] || '').replace(/[^\d.-]/g, ''));
        if (!isNaN(v) && v !== 0) {
            hasFinancials = true; break;
        }
    }
    
    if (colA && !hasTravelData && hasFinancials) return 'PAYMENT';
    if (colA && !hasTravelData && !hasFinancials) return 'SECTION_HEADER';
    if (hasTravelData) return 'PASSENGER';
    return 'UNKNOWN';
}

function run() {
    console.log('Loading Excel...');
    const wb = xlsx.readFile('حسابات وكلاء 26-6-2026العماله (2).xlsx');
    
    for (const sheetName of agentsToInspect) {
        if (!wb.Sheets[sheetName]) {
            console.log(`Sheet not found: ${sheetName}`);
            continue;
        }
        console.log(`\n================ Sheet: ${sheetName} ================`);
        const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], {header: 1});
        
        const header = data[0] || [];
        const debitUsdIndex = header.indexOf('مدين دولار ');
        const creditUsdIndex = header.indexOf('دائن دولار ');
        const debitEgpIndex = header.indexOf('مدين جنيه ');
        const creditEgpIndex = header.indexOf('دائن جنيه');
        
        const idxDUsd = debitUsdIndex >= 0 ? debitUsdIndex : 16;
        const idxCUsd = creditUsdIndex >= 0 ? creditUsdIndex : 17;
        const idxDEgp = debitEgpIndex >= 0 ? debitEgpIndex : 18;
        const idxCEgp = creditEgpIndex >= 0 ? creditEgpIndex : 19;
        
        console.log(`Indices: DebitUSD=${idxDUsd}, CreditUSD=${idxCUsd}`);
        
        let totalDUsd = 0;
        let totalCUsd = 0;
        let totalDEgp = 0;
        let totalCEgp = 0;
        let rowCounts = { PASSENGER: 0, PAYMENT: 0, UNKNOWN: 0, SECTION_HEADER: 0, EMPTY: 0, OPENING_BALANCE: 0, SUMMARY: 0 };
        
        for (let r = 1; r < data.length; r++) {
            const row = data[r];
            const type = classifyRow(row);
            rowCounts[type] = (rowCounts[type] || 0) + 1;
            
            if (['EMPTY', 'SUMMARY', 'SECTION_HEADER', 'UNKNOWN', 'OPENING_BALANCE'].includes(type)) {
                // Let's see if we are skipping something we shouldn't
                let dU = Number(String(row[idxDUsd] || '').replace(/[^\d.-]/g, '')) || 0;
                let cU = Number(String(row[idxCUsd] || '').replace(/[^\d.-]/g, '')) || 0;
                if (dU !== 0 || cU !== 0) {
                    console.log(`Row ${r+1} has money but is classified as ${type}: dU=${dU}, cU=${cU} | ColA='${row[0]}', ColI='${row[8]}'`);
                }
                continue;
            }
            
            const dU = Number(String(row[idxDUsd] || '').replace(/[^\d.-]/g, '')) || 0;
            const cU = Number(String(row[idxCUsd] || '').replace(/[^\d.-]/g, '')) || 0;
            const dE = Number(String(row[idxDEgp] || '').replace(/[^\d.-]/g, '')) || 0;
            const cE = Number(String(row[idxCEgp] || '').replace(/[^\d.-]/g, '')) || 0;
            
            totalDUsd += dU;
            totalCUsd += cU;
            totalDEgp += dE;
            totalCEgp += cE;
            
            if (type === 'UNKNOWN') {
                console.log(`Row ${r+1} UNKNOWN: dU=${dU}, cU=${cU} | Row data:`, row.slice(0, 5));
            }
        }
        
        console.log('Totals from valid rows:');
        console.log(` Debit USD: ${totalDUsd}`);
        console.log(` Credit USD: ${totalCUsd}`);
        console.log(` Debit EGP: ${totalDEgp}`);
        console.log(` Credit EGP: ${totalCEgp}`);
        console.log('Row Types:', rowCounts);
        
        // Also let's find if there are totals rows that we missed
        let lastRowIdx = data.length - 1;
        while (lastRowIdx >= 0 && (!data[lastRowIdx] || data[lastRowIdx].length === 0 || !data[lastRowIdx].some(x => x))) {
            lastRowIdx--;
        }
        const lastRow = data[lastRowIdx] || [];
        console.log('Last row data (often total):');
        console.log(` Col I (idx 8): ${lastRow[8]}`);
        console.log(` D_USD: ${lastRow[idxDUsd]}, C_USD: ${lastRow[idxCUsd]}`);
    }
}
run();
