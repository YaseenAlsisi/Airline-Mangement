const xlsx = require('xlsx');

function run() {
    const wb = xlsx.readFile('حسابات وكلاء 26-6-2026العماله (2).xlsx');
    const sheets = ['رحليستا', 'نيو ايدج', 'سعفان رافع'];
    
    for (const sheet of sheets) {
        console.log(`\n==== ${sheet} ====`);
        const data = xlsx.utils.sheet_to_json(wb.Sheets[sheet], {header: 1});
        console.log("HEADER:", data[0]);
        for(let i=1; i<4; i++) {
            if(data[i]) console.log(`ROW ${i}:`, data[i]);
        }
    }
}
run();
