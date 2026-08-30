const xlsx = require('xlsx');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

function parseDateStr(v) {
    if (!v) return null;
    const parts = v.split(/[-/]/);
    if (parts.length === 3) {
        let y, m, d;
        if (parts[0].length === 4) { y = parts[0]; m = parts[1]; d = parts[2]; }
        else if (parts[2].length === 4) { y = parts[2]; m = parts[1]; d = parts[0]; }
        if (y) return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    }
    return null;
}

function truncate(str, len) {
    if (str == null) return null;
    let s = String(str);
    return s.length > len ? s.substring(0, len) : s;
}

async function run() {
    try {
        console.log("Reading agents from DB...");
        const agentsRes = await pool.query('SELECT id, name FROM agents');
        const agentMap = new Map();
        agentsRes.rows.forEach(r => agentMap.set(r.name, r.id));

        const wb = xlsx.readFile('manifest_export_data (11).xlsx');
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
        
        if (data.length <= 1) {
            console.log("File is empty.");
            return;
        }

        const batchId = uuidv4();
        await pool.query(
            `INSERT INTO manifest_import_batches (id, original_filename, status, total_rows, valid_rows, invalid_rows, created_at, updated_at) 
             VALUES ($1, $2, 'PUBLISHED', $3, $3, 0, NOW(), NOW())`,
            [batchId, 'manifest_export_data (11).xlsx', data.length - 1]
        );

        let inserted = 0;
        for (let r = 1; r < data.length; r++) {
            const row = data[r];
            if (!row || row.length === 0) continue;
            
            const agentName = String(row[0] || '').trim();
            const passengerName = String(row[1] || '').trim();
            if (!passengerName) continue;
            
            const agentId = agentMap.get(agentName) || null;
            
            const passportNumber = truncate(row[2], 50);
            const passengerCategory = truncate(row[3], 100);
            const departureDate = parseDateStr(row[4]);
            const flightNumber = truncate(row[5], 255);
            const destination = truncate(row[6], 255);
            const departurePort = truncate(row[7], 255);
            const birthDate = parseDateStr(row[8]);
            const arrivalTime = (row[9] && String(row[9]).trim() !== '') ? truncate(row[9], 100) : null;
            const serviceType = truncate(row[10], 255);
            
            const debitUsd = Number(String(row[11] || '').replace(/[^\d.-]/g, '')) || 0;
            const creditUsd = Number(String(row[12] || '').replace(/[^\d.-]/g, '')) || 0;
            const debitEgp = Number(String(row[15] || '').replace(/[^\d.-]/g, '')) || 0;
            const creditEgp = Number(String(row[16] || '').replace(/[^\d.-]/g, '')) || 0;

            await pool.query(`
                INSERT INTO manifest_passengers (
                    id, batch_id, row_number, passenger_name, birth_date, passport_number,
                    departure_port, destination, flight_number, departure_date, arrival_time,
                    agent_id, agent_name_raw, service_type, passenger_category,
                    debit_usd, credit_usd, debit_egp, credit_egp,
                    validation_status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'VALID', NOW(), NOW())
            `, [
                uuidv4(), batchId, r, passengerName, birthDate, passportNumber,
                departurePort, destination, flightNumber, departureDate, arrivalTime,
                agentId, agentName, serviceType, passengerCategory,
                debitUsd, creditUsd, debitEgp, creditEgp
            ]);
            inserted++;
        }
        console.log(`Successfully inserted ${inserted} passengers.`);
    } catch(e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
