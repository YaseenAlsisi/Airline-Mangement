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

function classifyRow(row) {
    const colA = row[0] ? String(row[0]) : '';
    
    let isRowEmpty = true;
    for (let i = 0; i < 20; i++) {
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
    for (let i = 16; i <= 19; i++) {
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

function parseDate(v) {
    if (!v) return null;
    if (typeof v === 'number') {
        // Excel date
        const d = new Date((v - (25567 + 2)) * 86400 * 1000);
        return d.toISOString().split('T')[0];
    }
    if (typeof v === 'string') {
        const parts = v.split(/[-/]/);
        if (parts.length === 3) {
            // Assume yyyy-mm-dd or dd/mm/yyyy
            if (parts[0].length === 4) return v;
            if (parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
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
    return null;
}

async function run() {
    console.log('Starting direct import...');
    try {
        const wb = xlsx.readFile('حسابات وكلاء 26-6-2026العماله (1).xlsx');
        
        // 1. Create Batch
        const batchId = uuidv4();
        await pool.query(
            `INSERT INTO agent_import_batches (id, original_filename, status, created_at) 
             VALUES ($1, $2, 'COMPLETED', NOW())`,
            [batchId, 'حسابات وكلاء 26-6-2026العماله (1).xlsx']
        );
        console.log(`Created batch ${batchId}`);

        // Get agents map
        const res = await pool.query(`SELECT id, name, source_sheet_name FROM agents`);
        const agentMap = new Map(); // name -> id
        res.rows.forEach(r => {
            agentMap.set(r.source_sheet_name || r.name, r.id);
        });

        // Parse sheets
        let totalAgents = 0, totalTx = 0, totalP = 0, totalPay = 0;
        
        for (const sheetName of wb.SheetNames) {
            if (sheetName === 'الرئيسيه' || sheetName.includes('نموذج')) continue;
            
            console.log(`Processing ${sheetName}...`);
            let agentId = agentMap.get(sheetName);
            if (!agentId) {
                agentId = uuidv4();
                const resCount = await pool.query(`SELECT COUNT(*) FROM agents`);
                const count = parseInt(resCount.rows[0].count, 10);
                const code = `AGT-IMP-${count + 1}`;
                
                await pool.query(
                    `INSERT INTO agents (id, name, code, source_sheet_name, status, currency, created_at, updated_at) 
                     VALUES ($1, $2, $3, $4, 'ACTIVE', 'USD', NOW(), NOW())`,
                    [agentId, truncate(sheetName, 255), code, truncate(sheetName, 255)]
                );
                agentMap.set(sheetName, agentId);
                totalAgents++;
            }
            
            const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], {header: 1});
            
            // Start from row 1 (skip header)
            let txBatch = [];
            
            for (let r = 1; r < data.length; r++) {
                const row = data[r];
                const type = classifyRow(row);
                if (['EMPTY', 'SUMMARY', 'SECTION_HEADER', 'UNKNOWN'].includes(type)) continue;
                
                const txId = uuidv4();
                
                const debitUsd = Number(String(row[16] || '').replace(/[^\d.-]/g, '')) || 0;
                const creditUsd = Number(String(row[17] || '').replace(/[^\d.-]/g, '')) || 0;
                const debitEgp = Number(String(row[18] || '').replace(/[^\d.-]/g, '')) || 0;
                const creditEgp = Number(String(row[19] || '').replace(/[^\d.-]/g, '')) || 0;
                
                let passengerName = null, birthDate = null, nationalId = null, passportNumber = null;
                let departurePort = null, destination = null, airline = null, departureDate = null;
                let departureTime = null, investmentSupplier = null, passengerCategory = null;
                let serviceType = null, note = null, note2 = null, note3 = null, paymentDescription = null;
                
                if (type === 'PASSENGER') {
                    passengerName = truncate(row[0], 255);
                    birthDate = parseDate(row[1]);
                    nationalId = truncate(row[2], 50);
                    passportNumber = truncate(row[3], 50);
                    departurePort = truncate(row[4], 255);
                    destination = truncate(row[5], 255);
                    airline = truncate(row[6], 255);
                    departureDate = parseDate(row[7]);
                    departureTime = parseTime(row[8]);
                    investmentSupplier = truncate(row[10], 255);
                    passengerCategory = truncate(row[11], 100);
                    serviceType = truncate(row[12], 255);
                    note = truncate(row[13], 1000);
                    note2 = truncate(row[14], 1000);
                    note3 = truncate(row[15], 1000);
                    totalP++;
                } else {
                    paymentDescription = truncate(row[0], 1000);
                    totalPay++;
                }
                
                totalTx++;
                txBatch.push([
                    txId, agentId, batchId, type, sheetName, r + 1,
                    passengerName, nationalId, passportNumber, departurePort, destination, airline,
                    passengerCategory, serviceType, note, note2, note3, paymentDescription,
                    debitUsd, creditUsd, debitEgp, creditEgp, passengerName // raw_column_a
                ]);
                
                if (txBatch.length >= 1000) {
                    await insertBatch(txBatch);
                    txBatch = [];
                }
            }
            if (txBatch.length > 0) {
                await insertBatch(txBatch);
            }
        }
        
        await pool.query(
            `UPDATE agent_import_batches SET total_agents = $1, total_transactions = $2, total_passengers = $3, total_payments = $4 WHERE id = $5`,
            [totalAgents, totalTx, totalP, totalPay, batchId]
        );
        
        console.log(`Success! Total Agents: ${totalAgents}, Tx: ${totalTx}`);
    } catch (e) {
        console.error('Error during import:', e);
    } finally {
        await pool.end();
    }
}

async function insertBatch(batch) {
    if (batch.length === 0) return;
    
    // We use pg-format like parameterized query
    let query = `INSERT INTO agent_transactions (
        id, agent_id, import_batch_id, transaction_type, source_sheet_name, source_row_number,
        passenger_name, national_id, passport_number, departure_port, destination, airline,
        passenger_category, service_type, note, note_2, note_3, payment_description,
        debit_usd, credit_usd, debit_egp, credit_egp, raw_column_a, created_at, updated_at
    ) VALUES `;
    
    let values = [];
    let placeholders = [];
    
    let pIdx = 1;
    for (const r of batch) {
        let pRow = [];
        for (let i = 0; i < 23; i++) {
            pRow.push(`$${pIdx++}`);
            values.push(r[i]);
        }
        pRow.push('NOW()', 'NOW()');
        placeholders.push(`(${pRow.join(',')})`);
    }
    
    query += placeholders.join(', ');
    await pool.query(query, values);
}

run();
