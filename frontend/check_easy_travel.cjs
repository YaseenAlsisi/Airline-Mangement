const xlsx = require('xlsx');

function run() {
    const wb = xlsx.readFile('حسابات وكلاء 26-6-2026العماله (2).xlsx');
    const data = xlsx.utils.sheet_to_json(wb.Sheets['ايزي ترافيل'], {header: 1});
    const header = data[0];
    const dIdx = header.indexOf('مدين دولار ') >= 0 ? header.indexOf('مدين دولار ') : 16;
    let totalD = 0;
    
    for(let r=1; r<data.length; r++) {
        const row = data[r];
        const d = Number(String(row[dIdx]||'').replace(/[^\d.-]/g, ''))||0;
        totalD += d;
        if(d >= 10000) {
            console.log(`ROW ${r}: dU=${d} | colA='${row[0]}'`, row.slice(0, 5));
        }
    }
    console.log(`TOTAL: ${totalD}`);
}
run();
