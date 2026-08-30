const xlsx = require('xlsx');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
    try {
        console.log('Reading Excel file...');
        const wb = xlsx.readFile('حسابات وكلاء 26-6-2026العماله (2).xlsx');
        
        console.log('Querying DB for agent totals...');
        const res = await pool.query(`
            SELECT a.source_sheet_name, a.name,
                   COUNT(*) as db_count,
                   SUM(t.debit_usd) as db_debit_usd,
                   SUM(t.credit_usd) as db_credit_usd,
                   SUM(t.debit_egp) as db_debit_egp,
                   SUM(t.credit_egp) as db_credit_egp
            FROM agents a
            LEFT JOIN agent_transactions t ON a.id = t.agent_id
            GROUP BY a.id, a.source_sheet_name, a.name
        `);
        
        const dbMap = new Map();
        res.rows.forEach(r => {
            dbMap.set(r.source_sheet_name || r.name, r);
        });
        
        console.log('Analyzing Excel sheets...');
        let discrepancies = [];
        let notInDb = [];
        let shiftedSheets = [];
        
        for (const sheetName of wb.SheetNames) {
            if (sheetName === 'الرئيسيه' || sheetName.includes('نموذج')) continue;
            
            const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], {header: 1});
            if (data.length === 0) continue;
            
            // Check for shifts
            const header = data[0];
            const debitUsdIndex = header.indexOf('مدين دولار ');
            const creditUsdIndex = header.indexOf('دائن دولار ');
            const debitEgpIndex = header.indexOf('مدين جنيه ');
            const creditEgpIndex = header.indexOf('دائن جنيه');
            
            if (debitUsdIndex !== 16) {
                shiftedSheets.push({sheetName, index: debitUsdIndex});
            }
            
            let exDebitUsd = 0, exCreditUsd = 0, exDebitEgp = 0, exCreditEgp = 0;
            let exCount = 0;
            
            for (let r = 1; r < data.length; r++) {
                const row = data[r];
                // basic empty check
                let isEmpty = true;
                for(let i=0; i<20; i++) {
                    if (row[i] != null && String(row[i]).trim() !== '') { isEmpty = false; break; }
                }
                if (isEmpty) continue;
                
                const colA = row[0] ? String(row[0]) : '';
                const colI = row[8] ? String(row[8]) : '';
                
                if (colA.includes('ما قبله') || colI.includes('اجمالي المديونيه') || colI.includes('الرئيسيه')) {
                    continue; // skip opening/summary
                }
                
                // check if it's header inside
                let hasTravel = false;
                for(let i=1; i<=15; i++) {
                    if (row[i] != null && String(row[i]).trim() !== '') { hasTravel = true; break; }
                }
                let hasFin = false;
                for(let i=16; i<=19; i++) {
                    let v = Number(String(row[i]||'').replace(/[^\d.-]/g, ''));
                    if (!isNaN(v) && v !== 0) { hasFin = true; break; }
                }
                if (colA && !hasTravel && !hasFin) continue; // section header
                
                exCount++;
                
                // Try to get financial data based on dynamic indices or static if dynamic is -1
                const idxDUsd = debitUsdIndex >= 0 ? debitUsdIndex : 16;
                const idxCUsd = creditUsdIndex >= 0 ? creditUsdIndex : 17;
                const idxDEgp = debitEgpIndex >= 0 ? debitEgpIndex : 18;
                const idxCEgp = creditEgpIndex >= 0 ? creditEgpIndex : 19;

                const dU = Number(String(row[idxDUsd] || '').replace(/[^\d.-]/g, '')) || 0;
                const cU = Number(String(row[idxCUsd] || '').replace(/[^\d.-]/g, '')) || 0;
                const dE = Number(String(row[idxDEgp] || '').replace(/[^\d.-]/g, '')) || 0;
                const cE = Number(String(row[idxCEgp] || '').replace(/[^\d.-]/g, '')) || 0;
                
                exDebitUsd += dU;
                exCreditUsd += cU;
                exDebitEgp += dE;
                exCreditEgp += cE;
            }
            
            const dbData = dbMap.get(sheetName);
            if (!dbData) {
                notInDb.push(sheetName);
                continue;
            }
            
            // Compare totals
            const dbCount = Number(dbData.db_count);
            const dbDU = Number(dbData.db_debit_usd || 0);
            const dbCU = Number(dbData.db_credit_usd || 0);
            const dbDE = Number(dbData.db_debit_egp || 0);
            const dbCE = Number(dbData.db_credit_egp || 0);
            
            const diffCount = Math.abs(dbCount - exCount);
            const diffDU = Math.abs(dbDU - exDebitUsd);
            const diffCU = Math.abs(dbCU - exCreditUsd);
            
            // Allow small floating point differences for currency, and minor count diffs due to different parsing logic
            if (diffCount > 1 || diffDU > 1 || diffCU > 1) {
                discrepancies.push({
                    sheetName,
                    db: { count: dbCount, debit_usd: dbDU, credit_usd: dbCU },
                    ex: { count: exCount, debit_usd: exDebitUsd, credit_usd: exCreditUsd },
                    shifted: debitUsdIndex !== 16
                });
            }
        }
        
        console.log('\n--- Analysis Results ---');
        console.log(`Total Sheets Checked: ${wb.SheetNames.length}`);
        console.log(`Not in DB: ${notInDb.length}`, notInDb);
        console.log(`Shifted Sheets (debit usd not at col 16): ${shiftedSheets.length}`);
        shiftedSheets.forEach(s => console.log(` - ${s.sheetName} (Index: ${s.index})`));
        console.log(`Discrepancies found: ${discrepancies.length}`);
        discrepancies.forEach(d => {
            console.log(`\n=> ${d.sheetName}${d.shifted ? ' [SHIFTED]' : ''}`);
            console.log(`   DB: count=${d.db.count}, debitUsd=${d.db.debit_usd}, creditUsd=${d.db.credit_usd}`);
            console.log(`   EX: count=${d.ex.count}, debitUsd=${d.ex.debit_usd}, creditUsd=${d.ex.credit_usd}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
