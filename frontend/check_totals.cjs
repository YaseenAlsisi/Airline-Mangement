const xlsx = require('xlsx');

function run() {
    const wb = xlsx.readFile('حسابات وكلاء 26-6-2026العماله (2).xlsx');
    const sheets = ['ايزي ترافيل', 'رحليستا', 'سعفان رافع', 'عفاف', 'فاطمه الجازوي', 'نيو ايدج'];
    
    for (const sheet of sheets) {
        console.log(`\n==== ${sheet} ====`);
        const data = xlsx.utils.sheet_to_json(wb.Sheets[sheet], {header: 1});
        const header = data[0] || [];
        const dIdx = header.indexOf('مدين دولار ') >= 0 ? header.indexOf('مدين دولار ') : 16;
        const cIdx = header.indexOf('دائن دولار ') >= 0 ? header.indexOf('دائن دولار ') : 17;
        const dEgp = header.indexOf('مدين جنيه ') >= 0 ? header.indexOf('مدين جنيه ') : 18;
        const cEgp = header.indexOf('دائن جنيه') >= 0 ? header.indexOf('دائن جنيه') : 19;
        
        let sumDU = 0, sumCU = 0;
        
        for(let r=1; r<data.length; r++) {
            const row = data[r];
            const colA = String(row[0]||'');
            const d = Number(String(row[dIdx]||'').replace(/[^\d.-]/g, ''))||0;
            const c = Number(String(row[cIdx]||'').replace(/[^\d.-]/g, ''))||0;
            
            if(colA.includes('ما قبله')) {
                console.log(`OPENING BALANCE: dU=${d}, cU=${c}`);
                sumDU += d;
                sumCU += c;
            } else if (colA.includes('اجمالي المديونيه') || (row[8]&&String(row[8]).includes('الرئيسيه'))) {
                console.log(`SUMMARY: dU=${d}, cU=${c} | colI=${row[8]}`);
            } else {
                sumDU += d;
                sumCU += c;
            }
        }
        console.log(`TOTAL CALCULATED: dU=${sumDU}, cU=${sumCU}`);
    }
}
run();
