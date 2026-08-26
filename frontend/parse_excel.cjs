const xlsx = require('xlsx');

const workbook = xlsx.readFile('حسابات وكلاء 26-6-2026العماله (1).xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

if (data.length > 0) {
  console.log("Headers:");
  console.log(JSON.stringify(data[0], null, 2));
  
  console.log("\nFirst 3 rows:");
  for (let i = 1; i < Math.min(4, data.length); i++) {
    console.log(JSON.stringify(data[i], null, 2));
  }
} else {
  console.log("Empty sheet");
}
