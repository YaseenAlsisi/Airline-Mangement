const xlsx = require('xlsx');
const { Client } = require('pg');

function parseDate(v) {
    if (!v) return null;
    let iso = null;
    if (typeof v === 'number') {
        const d = new Date((v - (25567 + 2)) * 86400 * 1000);
        iso = d.toISOString().split('T')[0];
    } else if (typeof v === 'string') {
        const parts = v.split(/[-/]/);
        if (parts.length === 3) {
            if (parts[0].length === 4) iso = v;
            else if (parts[2].length === 4) iso = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
        }
    }
    
    if (iso) {
        const year = parseInt(iso.substring(0, 4), 10);
        if (year < 1900 || year > 2100) return null; // Reject weird dates like +023465
        return iso;
    }
    return null;
}

function parseTime(v) {
    if (!v) return null;
    if (typeof v === 'number') {
        const totalSeconds = Math.round(v * 86400);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    return null;
}

async function run() {
    const client = new Client({ connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
    await client.connect();
    
    const wb = xlsx.readFile('data.xlsx');
    let updatedCount = 0;
    
    for (const sheetName of wb.SheetNames) {
        if (['Summary', 'الإجمالي', 'Sheet1'].includes(sheetName)) continue;
        
        const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], {header: 1});
        for (let r = 1; r < data.length; r++) {
            const row = data[r];
            if (!row || row.length === 0) continue;
            
            let hasTravelData = false;
            for (let i = 1; i <= 15; i++) {
                if (row[i] != null && String(row[i]).trim() !== '') {
                    hasTravelData = true;
                    break;
                }
            }
            if (!hasTravelData) continue; // Not a passenger row
            
            const birthDate = parseDate(row[1]);
            const departureDate = parseDate(row[7]);
            const arrivalTime = parseTime(row[8]); // This is actually departure time
            const investmentSupplier = row[10] ? String(row[10]).substring(0, 255) : null;
            
            const rowNumber = r + 1; // 1-indexed for excel rows
            
            if (departureDate || birthDate || arrivalTime || investmentSupplier) {
                try {
                    const res = await client.query(
                        `UPDATE manifest_passengers 
                         SET departure_date = $1, birth_date = $2, arrival_time = $3, investment_supplier = $4
                         WHERE agent_name_raw = $5 AND row_number = $6
                         RETURNING id`,
                        [departureDate, birthDate, arrivalTime, investmentSupplier, sheetName, rowNumber]
                    );
                    
                    if (res.rowCount > 0) {
                        updatedCount++;
                    }
                } catch (e) {
                    console.error(`Error updating row ${rowNumber} in sheet ${sheetName}:`, e.message);
                }
            }
        }
    }
    
    console.log(`Successfully updated ${updatedCount} passengers with missing dates/details.`);
    await client.end();
}

run().catch(console.error);
