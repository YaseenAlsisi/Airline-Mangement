const xlsx = require('xlsx');

const wb = xlsx.readFile('data.xlsx');
let count = 0;
for (const sheetName of wb.SheetNames) {
    if (['Summary', 'الإجمالي', 'Sheet1'].includes(sheetName)) continue;
    
    const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], {header: 1});
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        const passengerName = row[0];
        const departureDate = row[7];
        
        if (passengerName && typeof passengerName === 'string' && departureDate) {
            // Excel dates are usually numbers (serial dates)
            if (count < 10) {
               console.log(`Passenger: ${passengerName}, Date: ${departureDate}, Type: ${typeof departureDate}`);
            }
            count++;
        }
    }
}
console.log(`Total rows with dates: ${count}`);
