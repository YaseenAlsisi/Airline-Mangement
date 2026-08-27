const xlsx = require('xlsx');
const wb = xlsx.readFile('data.xlsx');

const shiftedAgents = [];
const normalAgents = [];

for (const sheetName of wb.SheetNames) {
    if (sheetName === 'الرئيسيه') continue;
    
    const sheet = wb.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, {header: 1});
    if (data.length === 0) continue;
    
    const header = data[0];
    const debitUsdIndex = header.indexOf('مدين دولار ');
    
    if (debitUsdIndex === 15) {
        shiftedAgents.push(sheetName);
    } else if (debitUsdIndex === 16) {
        normalAgents.push(sheetName);
    } else {
        console.log(`Unknown index for ${sheetName}: ${debitUsdIndex}`);
    }
}

console.log("Shifted Agents (19 columns):", shiftedAgents.length);
console.log(shiftedAgents);
console.log("Normal Agents (20 columns):", normalAgents.length);
console.log(normalAgents);
