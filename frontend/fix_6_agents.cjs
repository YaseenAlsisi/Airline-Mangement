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

function classifyRowDynamic(row, idxDUsd, idxCUsd, idxDEgp, idxCEgp) {
    const colA = row[0] ? String(row[0]) : '';
    
    let isRowEmpty = true;
    for (let i = 0; i < 25; i++) {
        if (row[i] != null && String(row[i]).trim() !== '') {
            isRowEmpty = false; break;
        }
    }
    if (isRowEmpty) return 'EMPTY';
    
    if (colA && colA.includes('ما قبله')) return 'OPENING_BALANCE';
    
    const colI = row[8] ? String(row[8]) : '';
    if ((colI && (colI.includes('اجمالي المديونيه') || colI.includes('الرئيسيه'))) || 
        (colA && (colA.includes('اجمالي المديونيه') || colA.includes('الرئيسيه')))) {
        return 'SUMMARY';
    }
    
    let hasTravelData = false;
    for (let i = 1; i <= 15; i++) {
        if (row[i] != null && String(row[i]).trim() !== '') {
            hasTravelData = true; break;
        }
    }
    
    let hasFinancials = false;
    const finIndices = [idxDUsd, idxCUsd, idxDEgp, idxCEgp];
    for (let idx of finIndices) {
        if (idx >= 0) {
            let v = Number(String(row[idx] || '').replace(/[^\d.-]/g, ''));
            if (!isNaN(v) && v !== 0) {
                hasFinancials = true; break;
            }
        }
    }
    
    // Crucial fix: Do not require colA for payment if hasFinancials is true!
    if (!hasTravelData && hasFinancials) return 'PAYMENT';
    if (colA && !hasTravelData && !hasFinancials) return 'SECTION_HEADER';
    if (hasTravelData) return 'PASSENGER';
    
    return 'UNKNOWN';
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

async function insertBatch(batch) {
    if (batch.length === 0) return;
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

async function run() {
    console.log('Starting fixed import for 6 agents...');
    try {
        const agentsToFix = ['ايزي ترافيل', 'رحليستا', 'سعفان رافع', 'عفاف', 'فاطمه الجازوي', 'نيو ايدج'];
        
        console.log('Deleting existing transactions for these agents...');
        // Prepare query for deleting
        let delValues = agentsToFix;
        let delPlaceholders = agentsToFix.map((_, i) => `$${i+1}`).join(',');
        await pool.query(`DELETE FROM agent_transactions WHERE source_sheet_name IN (${delPlaceholders})`, delValues);
        console.log('Deleted successfully.');

        const fileName = 'حسابات وكلاء 26-6-2026العماله (2).xlsx';
        const wb = xlsx.readFile(fileName);
        
        const batchId = uuidv4();
        await pool.query(
            `INSERT INTO agent_import_batches (id, original_filename, status, created_at) 
             VALUES ($1, $2, 'COMPLETED', NOW())`,
            [batchId, fileName]
        );

        const res = await pool.query(`SELECT id, name, source_sheet_name FROM agents`);
        const agentMap = new Map();
        res.rows.forEach(r => agentMap.set(r.source_sheet_name || r.name, r.id));

        for (const sheetName of agentsToFix) {
            console.log(`Processing ${sheetName}...`);
            let agentId = agentMap.get(sheetName);
            if (!agentId) {
                console.log(`Error: Agent ${sheetName} not found in DB!`);
                continue;
            }
            
            const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], {header: 1});
            if (data.length === 0) continue;
            
            const header = data[0] || [];
            // Handle different names
            const debitUsdIndex = header.indexOf('مدين دولار ') >= 0 ? header.indexOf('مدين دولار ') : header.indexOf('مدين دولار');
            const creditUsdIndex = header.indexOf('دائن دولار ') >= 0 ? header.indexOf('دائن دولار ') : header.indexOf('دائن دولار');
            const debitEgpIndex = header.indexOf('مدين مصري') >= 0 ? header.indexOf('مدين مصري') : (header.indexOf('مدين جنيه ') >= 0 ? header.indexOf('مدين جنيه ') : -1);
            const creditEgpIndex = header.indexOf('دائن مصري') >= 0 ? header.indexOf('دائن مصري') : (header.indexOf('دائن جنيه') >= 0 ? header.indexOf('دائن جنيه') : -1);
            
            const idxDUsd = debitUsdIndex >= 0 ? debitUsdIndex : 16;
            const idxCUsd = creditUsdIndex >= 0 ? creditUsdIndex : 17;
            const idxDEgp = debitEgpIndex >= 0 ? debitEgpIndex : 18;
            const idxCEgp = creditEgpIndex >= 0 ? creditEgpIndex : 19;
            
            let txBatch = [];
            
            for (let r = 1; r < data.length; r++) {
                const row = data[r];
                const type = classifyRowDynamic(row, idxDUsd, idxCUsd, idxDEgp, idxCEgp);
                if (['EMPTY', 'SUMMARY', 'SECTION_HEADER', 'UNKNOWN'].includes(type)) continue;
                
                const txId = uuidv4();
                
                const debitUsd = Number(String(row[idxDUsd] || '').replace(/[^\d.-]/g, '')) || 0;
                const creditUsd = Number(String(row[idxCUsd] || '').replace(/[^\d.-]/g, '')) || 0;
                const debitEgp = Number(String(row[idxDEgp] || '').replace(/[^\d.-]/g, '')) || 0;
                const creditEgp = Number(String(row[idxCEgp] || '').replace(/[^\d.-]/g, '')) || 0;
                
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
                } else {
                    paymentDescription = truncate(row[0], 1000);
                }
                
                txBatch.push([
                    txId, agentId, batchId, type, sheetName, r + 1,
                    passengerName, nationalId, passportNumber, departurePort, destination, airline,
                    passengerCategory, serviceType, note, note2, note3, paymentDescription,
                    debitUsd, creditUsd, debitEgp, creditEgp, truncate(row[0], 255)
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
        
        console.log(`Success!`);
    } catch (e) {
        console.error('Error during import:', e);
    } finally {
        await pool.end();
    }
}
run();
