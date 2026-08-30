const xlsx = require('xlsx');

function run() {
    const wb = xlsx.readFile('حسابات وكلاء 26-6-2026العماله (2).xlsx');
    const data = xlsx.utils.sheet_to_json(wb.Sheets['فاطمه الجازوي'], {header: 1});
    
    for(let r=1; r<data.length; r++) {
        const row = data[r];
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
        const colA = row[0] ? String(row[0]) : '';
        if (!colA && !hasTravelData && hasFinancials) {
            console.log(`Missing Col A but has financials! Row ${r+1}:`, row);
        }
    }
}
run();
