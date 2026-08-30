const xlsx = require('xlsx');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

function truncate(str, len) {
    if (str == null) return null;
    let s = String(str);
    return s.length > len ? s.substring(0, len) : s;
}

function parseDate(v) {
    if (!v) return null;
    let d = null;
    if (typeof v === 'number') {
        d = new Date((v - (25567 + 2)) * 86400 * 1000);
    } else if (typeof v === 'string') {
        const parts = v.split(/[-/]/);
        if (parts.length === 3) {
            let y, m, day;
            if (parts[0].length === 4) { y = parts[0]; m = parts[1]; day = parts[2]; }
            else if (parts[2].length === 4) { y = parts[2]; m = parts[1]; day = parts[0]; }
            if (y) d = new Date(`${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        }
    }
    if (d && !isNaN(d.getTime())) {
        const year = d.getFullYear();
        if (year >= 1900 && year <= 2100) return d.toISOString().split('T')[0];
    }
    return null;
}

function parseTime(v) {
    if (!v) return null;
    if (typeof v === 'number') {
        const totalSeconds = Math.round(v * 86400);
        if (totalSeconds < 0 || totalSeconds > 86400 * 365) return null;
        const h = Math.floor((totalSeconds % 86400) / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    if (typeof v === 'string') {
        const timeMatch = v.match(/([01]?\d|2[0-3]):([0-5]\d)(:([0-5]\d))?/);
        if (timeMatch) return timeMatch[0];
    }
    return null;
}

function classifyRow(row) {
    const colA = row[0] ? String(row[0]) : '';
    let isRowEmpty = true;
    for (let i = 0; i < 25; i++) {
        if (row[i] != null && String(row[i]).trim() !== '') { isRowEmpty = false; break; }
    }
    if (isRowEmpty) return 'EMPTY';
    if (colA && colA.includes('ما قبله')) return 'OPENING_BALANCE';
    
    const colI = row[8] ? String(row[8]) : '';
    if (colI && (colI.includes('اجمالي المديونيه') || colI.includes('الرئيسيه'))) return 'SUMMARY';
    
    let hasTravelData = false;
    for (let i = 1; i <= 15; i++) {
        if (row[i] != null && String(row[i]).trim() !== '') { hasTravelData = true; break; }
    }
    
    let hasFinancials = false;
    for (let i = 16; i <= 21; i++) {
        let v = Number(String(row[i] || '').replace(/[^\d.-]/g, ''));
        if (!isNaN(v) && v !== 0) { hasFinancials = true; break; }
    }
    
    if (colA && !hasTravelData && hasFinancials) return 'PAYMENT';
    if (colA && !hasTravelData && !hasFinancials) return 'SECTION_HEADER';
    if (hasTravelData) return 'PASSENGER';
    return 'UNKNOWN';
}

async function run() {
    try {
        console.log("Fixing duplicate agents...");
        // 1. Delete the duplicate 'محمد عبدالله' that my script wrongly created
        const dupRes = await pool.query(`SELECT id FROM agents WHERE name = 'محمد عبدالله' AND source_sheet_name = 'محمد عبدالله'`);
        if (dupRes.rows.length > 0) {
            for (const r of dupRes.rows) {
                await pool.query(`DELETE FROM manifest_passengers WHERE agent_id = $1`, [r.id]);
                await pool.query(`DELETE FROM agent_payments WHERE agent_name_raw = 'محمد عبدالله'`);
                await pool.query(`DELETE FROM agents WHERE id = $1`, [r.id]);
                console.log(`Deleted duplicate agent محمد عبدالله`);
            }
        }
        
        console.log("Reading Excel file...");
        const wb = xlsx.readFile('حسابات وكلاء 26-6-2026العماله (2).xlsx');
        const sheetsToProcess = ['احمد الصعيدي', 'محمد عبدالله', 'حمدي الجازوي', 'رحليستا', 'فاطمه الجازوي', 'منصور'];
        
        const batchId = uuidv4();
        await pool.query(
            `INSERT INTO manifest_import_batches (id, original_filename, status, total_rows, valid_rows, invalid_rows, created_at, updated_at) 
             VALUES ($1, $2, 'PUBLISHED', 0, 0, 0, NOW(), NOW())`,
            [batchId, 'حسابات وكلاء 26-6-2026العماله (2).xlsx']
        );

        let totalPassengers = 0, totalPayments = 0;
        
        for (const sheetName of sheetsToProcess) {
            console.log(`Processing sheet: ${sheetName}`);
            
            // Fix: Find the agent by source_sheet_name OR name
            let agentRes = await pool.query(`SELECT id, name FROM agents WHERE source_sheet_name = $1 OR name = $1 LIMIT 1`, [sheetName]);
            let agentId;
            let agentNameForDB;
            if (agentRes.rows.length === 0) {
                agentId = uuidv4();
                agentNameForDB = sheetName;
                await pool.query(`INSERT INTO agents (id, name, type, source_sheet_name, currency, created_at, updated_at) VALUES ($1, $2, 'B2B', $3, 'EGP', NOW(), NOW())`, [agentId, agentNameForDB, sheetName]);
                console.log(`  -> Created missing agent: ${sheetName}`);
            } else {
                agentId = agentRes.rows[0].id;
                agentNameForDB = agentRes.rows[0].name; // this handles 'المميز'
                console.log(`  -> Found agent: ${agentNameForDB} (ID: ${agentId})`);
            }

            // Wipe existing data for this agent by ID to be safe!
            await pool.query(`DELETE FROM manifest_passengers WHERE agent_id = $1`, [agentId]);
            await pool.query(`DELETE FROM agent_payments WHERE agent_name_raw = $1`, [agentNameForDB]);
            // Also wipe by sheetName just in case
            if (agentNameForDB !== sheetName) {
                await pool.query(`DELETE FROM manifest_passengers WHERE agent_name_raw = $1`, [sheetName]);
                await pool.query(`DELETE FROM agent_payments WHERE agent_name_raw = $1`, [sheetName]);
            }

            const ws = wb.Sheets[sheetName];
            if (!ws) { console.log(`Sheet not found: ${sheetName}`); continue; }
            const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
            if (data.length === 0) continue;

            const header = data[0] || [];
            let idxDUsd = 16, idxCUsd = 17, idxDEgp = 18, idxCEgp = 19;
            for(let i=15; i<25; i++) {
                if(!header[i]) continue;
                let h = String(header[i]).trim();
                if (h.includes('مدين دولار')) idxDUsd = i;
                if (h.includes('دائن دولار')) idxCUsd = i;
                if (h.includes('مدين مصري') || h.includes('مدين جنيه')) idxDEgp = i;
                if (h.includes('دائن مصري') || h.includes('دائن جنيه')) idxCEgp = i;
            }

            for (let r = 1; r < data.length; r++) {
                const row = data[r];
                const type = classifyRow(row);
                
                if (['EMPTY', 'SUMMARY', 'SECTION_HEADER', 'UNKNOWN'].includes(type)) continue;

                const rawColA = String(row[0] || '').trim();
                const debitUsd = Number(String(row[idxDUsd] || '').replace(/[^\d.-]/g, '')) || 0;
                const creditUsd = Number(String(row[idxCUsd] || '').replace(/[^\d.-]/g, '')) || 0;
                const debitEgp = Number(String(row[idxDEgp] || '').replace(/[^\d.-]/g, '')) || 0;
                const creditEgp = Number(String(row[idxCEgp] || '').replace(/[^\d.-]/g, '')) || 0;
                const balanceUsd = debitUsd - creditUsd;
                const balanceEgp = debitEgp - creditEgp;

                if (type === 'PASSENGER') {
                    let passengerName = truncate(row[0], 255) || 'بدون اسم';
                    let birthDate = parseDate(row[1]);
                    let nationalId = truncate(row[2], 50);
                    let passportNumber = truncate(row[3], 50);
                    let departurePort = truncate(row[4], 255);
                    let destination = truncate(row[5], 255);
                    let airline = truncate(row[6], 255);
                    let departureDate = parseDate(row[7]);
                    let departureTime = parseTime(row[8]);
                    let investmentSupplier = truncate(row[10], 255);
                    let passengerCategory = truncate(row[11], 100);
                    let serviceType = truncate(row[12], 255);
                    let note2 = truncate(row[13], 1000);
                    let note3 = truncate(row[14], 1000);

                    await pool.query(`
                        INSERT INTO manifest_passengers (
                            id, batch_id, row_number, passenger_name, birth_date, national_id, passport_number,
                            departure_port, destination, flight_number, departure_date, arrival_time,
                            agent_id, agent_name_raw, investment_supplier, service_type, passenger_category,
                            note_2, note_3, debit_usd, credit_usd, debit_egp, credit_egp,
                            validation_status, created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, 'VALID', NOW(), NOW())
                    `, [
                        uuidv4(), batchId, r + 1, passengerName, birthDate, nationalId, passportNumber,
                        departurePort, destination, airline, departureDate, departureTime,
                        agentId, agentNameForDB, investmentSupplier, serviceType, passengerCategory,
                        note2, note3, debitUsd, creditUsd, debitEgp, creditEgp
                    ]);
                    totalPassengers++;
                } else if (type === 'PAYMENT' || type === 'OPENING_BALANCE') {
                    let date = parseDate(row[7]) || new Date().toISOString().split('T')[0];
                    let note = rawColA || (type === 'OPENING_BALANCE' ? 'رصيد ما قبله' : 'دفعة/تسوية');
                    
                    if (balanceUsd !== 0) {
                        const paymentType = balanceUsd > 0 ? 'DEBIT' : 'CREDIT';
                        await pool.query(`
                            INSERT INTO agent_payments (
                                id, agent_name_raw, amount, currency, payment_type, payment_date, note, created_at, updated_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                        `, [uuidv4(), agentNameForDB, Math.abs(balanceUsd), 'USD', paymentType, date, note]);
                        totalPayments++;
                    }
                    if (balanceEgp !== 0) {
                        const paymentType = balanceEgp > 0 ? 'DEBIT' : 'CREDIT';
                        await pool.query(`
                            INSERT INTO agent_payments (
                                id, agent_name_raw, amount, currency, payment_type, payment_date, note, created_at, updated_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                        `, [uuidv4(), agentNameForDB, Math.abs(balanceEgp), 'EGP', paymentType, date, note]);
                        totalPayments++;
                    }
                }
            }
        }
        
        console.log(`Success! Fixed and inserted ${totalPassengers} passengers and ${totalPayments} payments for the 6 agents.`);
    } catch(e) {
        console.error("FAILED:", e);
    } finally {
        await pool.end();
    }
}
run();
