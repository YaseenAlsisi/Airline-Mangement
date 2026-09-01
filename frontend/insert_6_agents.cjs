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
    if (typeof v === 'number') {
        const d = new Date((v - (25567 + 2)) * 86400 * 1000);
        return d.toISOString().split('T')[0];
    }
    if (typeof v === 'string') {
        const parts = v.split(/[-/]/);
        if (parts.length === 3) {
            let y, m, d;
            if (parts[0].length === 4) { y = parts[0]; m = parts[1]; d = parts[2]; }
            else if (parts[2].length === 4) { y = parts[2]; m = parts[1]; d = parts[0]; }
            else return null;
            return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
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
    if (typeof v === 'string' && /^([01]\d|2[0-3]):?([0-5]\d):?([0-5]\d)?$/.test(v)) {
       return v;
    }
    return null;
}

function classifyRow(row) {
    const colA = row[0] ? String(row[0]) : '';
    
    let isRowEmpty = true;
    for (let i = 0; i < 25; i++) {
        if (row[i] != null && String(row[i]).trim() !== '') {
            isRowEmpty = false;
            break;
        }
    }
    if (isRowEmpty) return 'EMPTY';
    
    if (colA && colA.includes('ما قبله')) return 'OPENING_BALANCE';
    
    const colI = row[8] ? String(row[8]) : '';
    if (colI && (colI.includes('اجمالي المديونيه') || colI.includes('الرئيسيه'))) {
        return 'SUMMARY';
    }
    
    let hasTravelData = false;
    for (let i = 1; i <= 15; i++) {
        if (row[i] != null && String(row[i]).trim() !== '') {
            hasTravelData = true;
            break;
        }
    }
    
    let hasFinancials = false;
    for (let i = 16; i <= 21; i++) {
        let v = Number(String(row[i] || '').replace(/[^\d.-]/g, ''));
        if (!isNaN(v) && v !== 0) {
            hasFinancials = true;
            break;
        }
    }
    
    if (colA && !hasTravelData && hasFinancials) return 'PAYMENT';
    if (colA && !hasTravelData && !hasFinancials) return 'SECTION_HEADER';
    if (hasTravelData) return 'PASSENGER';
    
    return 'UNKNOWN';
}

async function run() {
    try {
        console.log("Reading agents from DB...");
        const agentsRes = await pool.query('SELECT id, name, source_sheet_name FROM agents');
        const agentMap = new Map();
        agentsRes.rows.forEach(r => agentMap.set(r.name, r.id));

        const agentsToFix = ['ايزي ترافيل', 'رحليستا', 'سعفان رافع', 'عفاف', 'فاطمه الجازوي', 'نيو ايدج'];
        
        console.log("Cleaning up old data for these 6 agents...");
        for (const agentName of agentsToFix) {
            await pool.query(`DELETE FROM manifest_passengers WHERE agent_name_raw = $1`, [agentName]);
            await pool.query(`DELETE FROM agent_payments WHERE agent_name_raw = $1`, [agentName]);
        }
        
        const batchId = uuidv4();
        await pool.query(
            `INSERT INTO manifest_import_batches (id, original_filename, status, total_rows, valid_rows, invalid_rows, created_at, updated_at) 
             VALUES ($1, $2, 'PUBLISHED', 0, 0, 0, NOW(), NOW())`,
            [batchId, 'حسابات وكلاء 26-6-2026العماله (2).xlsx']
        );
        console.log(`Created manifest batch: ${batchId}`);

        const wb = xlsx.readFile('حسابات وكلاء 26-6-2026العماله (2).xlsx');

        let totalPassengers = 0, totalPayments = 0;
        
        for (const sheetName of agentsToFix) {
            console.log(`Processing sheet: ${sheetName}`);
            const ws = wb.Sheets[sheetName];
            if (!ws) {
                console.log(`Sheet ${sheetName} not found!`);
                continue;
            }
            
            const agentId = agentMap.get(sheetName);
            if (!agentId) {
                console.log(`Agent ID not found for ${sheetName}`);
                continue;
            }

            const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
            if (data.length === 0) continue;

            const header = data[0];
            const idxDUsd = Math.max(header.indexOf('مدين دولار '), 16);
            const idxCUsd = Math.max(header.indexOf('دائن دولار '), 17);
            const idxDEgp = Math.max(header.indexOf('مدين جنيه '), 18);
            const idxCEgp = Math.max(header.indexOf('دائن جنيه'), 19);

            for (let r = 1; r < data.length; r++) {
                const row = data[r];
                const type = classifyRow(row);
                
                if (['EMPTY', 'SUMMARY', 'SECTION_HEADER', 'UNKNOWN'].includes(type)) continue;

                const rawColA = String(row[0] || '').trim();
                const debitUsd = Number(String(row[idxDUsd] || '').replace(/[^\d.-]/g, '')) || 0;
                const creditUsd = Number(String(row[idxCUsd] || '').replace(/[^\d.-]/g, '')) || 0;
                const debitEgp = Number(String(row[idxDEgp] || '').replace(/[^\d.-]/g, '')) || 0;
                const creditEgp = Number(String(row[idxCEgp] || '').replace(/[^\d.-]/g, '')) || 0;
                const balance = debitEgp - creditEgp; // simplistic for now

                if (type === 'PASSENGER') {
                    let passengerName = truncate(row[0], 255);
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

                    // fallback if passenger name is somehow empty
                    if (!passengerName) passengerName = 'بدون اسم';

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
                        agentId, sheetName, investmentSupplier, serviceType, passengerCategory,
                        note2, note3, debitUsd, creditUsd, debitEgp, creditEgp
                    ]);
                    totalPassengers++;
                } else if (type === 'PAYMENT' || type === 'OPENING_BALANCE') {
                    let date = parseDate(row[7]) || new Date().toISOString().split('T')[0];
                    let note = rawColA || (type === 'OPENING_BALANCE' ? 'رصيد ما قبله' : 'دفعة/تسوية');
                    
                    await pool.query(`
                        INSERT INTO agent_payments (
                            id, agent_name_raw, amount, currency, payment_date, note, created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                    `, [
                        uuidv4(), sheetName, Math.abs(balance), 'EGP', date, note
                    ]);
                    totalPayments++;
                }
            }
        }
        
        console.log(`Success! Inserted ${totalPassengers} passengers and ${totalPayments} payments for the 6 agents.`);
    } catch(e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

run();
