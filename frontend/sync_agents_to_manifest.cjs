const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
    console.log('Starting sync to manifest and payments...');
    try {
        const agentsToFix = ['ايزي ترافيل', 'رحليستا', 'سعفان رافع', 'عفاف', 'فاطمه الجازوي', 'نيو ايدج'];
        
        let delPlaceholders = agentsToFix.map((_, i) => `$${i+1}`).join(',');
        
        // 1. Delete existing records
        console.log('Deleting from manifest_passengers...');
        await pool.query(`DELETE FROM manifest_passengers WHERE agent_name_raw IN (${delPlaceholders})`, agentsToFix);
        
        console.log('Deleting from agent_payments...');
        await pool.query(`DELETE FROM agent_payments WHERE agent_name_raw IN (${delPlaceholders})`, agentsToFix);
        
        // 2. Fetch from agent_transactions
        console.log('Fetching from agent_transactions...');
        const res = await pool.query(`
            SELECT * FROM agent_transactions 
            WHERE source_sheet_name IN (${delPlaceholders})
        `, agentsToFix);
        
        const txns = res.rows;
        console.log(`Found ${txns.length} transactions to migrate.`);
        
        const manifestQueries = [];
        const paymentQueries = [];
        
        const batchId = uuidv4();
        await pool.query(`INSERT INTO manifest_import_batches (id, original_filename, status, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())`, [batchId, 'migration.xlsx', 'COMPLETED']);
        
        let rowCounter = 1;
        for (const t of txns) {
            const agentName = t.source_sheet_name;
            
            const hasDebit = t.debit_usd > 0 || t.debit_egp > 0;
            const hasCredit = t.credit_usd > 0 || t.credit_egp > 0;
            
            // If it has a debit, or if it was classified as a PASSENGER, put it in manifest_passengers
            if (t.transaction_type === 'PASSENGER' || hasDebit || (t.transaction_type === 'OPENING_BALANCE' && hasDebit)) {
                let name = t.passenger_name;
                if (!name || name.trim() === '') {
                    name = t.payment_description || t.raw_column_a || 'رسوم/تسوية';
                }
                
                manifestQueries.push({
                    text: `INSERT INTO manifest_passengers (
                        id, batch_id, row_number, agent_name_raw, passenger_name, birth_date, national_id, passport_number,
                        departure_port, destination, flight_number, departure_date, arrival_time,
                        investment_supplier, service_type, passenger_category, note_2, note_3,
                        debit_usd, credit_usd, debit_egp, credit_egp, total_price, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, NOW(), NOW())`,
                    values: [
                        uuidv4(), batchId, rowCounter++, agentName, name, t.birth_date, t.national_id, t.passport_number,
                        t.departure_port, t.destination, t.airline, t.departure_date, t.departure_time,
                        t.investment_supplier, t.service_type, t.passenger_category, t.note, t.note_2,
                        t.debit_usd, 0, t.debit_egp, 0, t.debit_egp
                    ]
                });
            }
            
            // If it has a credit, put it in agent_payments
            if (hasCredit || (t.transaction_type === 'OPENING_BALANCE' && hasCredit) || (t.transaction_type === 'PAYMENT' && !hasDebit)) {
                let desc = t.payment_description || t.raw_column_a || 'دفعة/تسوية';
                if (t.transaction_type === 'OPENING_BALANCE') desc = 'رصيد ما قبله (Opening Balance)';
                
                const processPayment = (amount, currency, type) => {
                    if (Number(amount) > 0) {
                        paymentQueries.push({
                            text: `INSERT INTO agent_payments (
                                id, agent_name_raw, amount, currency, payment_type, note, payment_date, created_at, updated_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())`,
                            values: [uuidv4(), agentName, amount, currency, type, desc]
                        });
                    }
                };
                
                processPayment(t.credit_usd, 'USD', 'CREDIT');
                processPayment(t.credit_egp, 'EGP', 'CREDIT');
            }
        }
        
        console.log(`Inserting ${manifestQueries.length} passengers...`);
        for (const q of manifestQueries) await pool.query(q.text, q.values);
        
        console.log(`Inserting ${paymentQueries.length} payments...`);
        for (const q of paymentQueries) await pool.query(q.text, q.values);
        
        console.log('Sync Complete!');
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
