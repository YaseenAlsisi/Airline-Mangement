const xlsx = require('xlsx');

const wb = xlsx.readFile('حسابات وكلاء 26-6-2026العماله (2).xlsx');
const sheets = wb.SheetNames;
const targets = ['ايزي ترافيل', 'رحليستا', 'سعفان رافع', 'عفاف', 'فاطمه الجازوي', 'نيو ايدج'];
const found = sheets.filter(s => targets.some(t => s.includes(t)));
console.log("Matching sheets:", found);
