const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
    connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
    try {
        console.log("Starting data sync to legacy tables...");
        
        // 1. Create a new manifest batch
        const batchId = uuidv4();
        await pool.query(`
            INSERT INTO manifest_import_batches (id, original_filename, status, total_rows, valid_rows, published_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        `, [batchId, 'حسابات_وكلاء_legacy_sync.xlsx', 'PUBLISHED', 0, 0]);
        console.log(`Created manifest batch: ${batchId}`);

        // 2. Fetch all agent_transactions
        const txRes = await pool.query(`SELECT t.*, a.source_sheet_name as sheet_name FROM agent_transactions t JOIN agents a ON t.agent_id = a.id`);
        const transactions = txRes.rows;
        console.log(`Fetched ${transactions.length} transactions from new DB.`);

        let manifestCount = 0;
        let paymentCount = 0;

        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            const agentName = tx.sheet_name || 'Unknown Agent';

            if (tx.transaction_type === 'PASSENGER') {
                // Insert into manifest_passengers
                await pool.query(`
                    INSERT INTO manifest_passengers (
                        id, batch_id, row_number, passenger_name, agent_id, agent_name_raw,
                        passport_number, departure_port, destination, flight_number,
                        departure_date, investment_supplier, service_type, passenger_category,
                        debit_usd, credit_usd, debit_egp, credit_egp, validation_status
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'VALID')
                `, [
                    uuidv4(), batchId, tx.source_row_number || (i+1),
                    tx.passenger_name || 'Unknown Passenger',
                    tx.agent_id, agentName,
                    tx.passport_number, tx.departure_port, tx.destination, tx.airline,
                    tx.departure_date, tx.investment_supplier, tx.service_type, tx.passenger_category,
                    tx.debit_usd, tx.credit_usd, tx.debit_egp, tx.credit_egp
                ]);
                manifestCount++;
            } else if (['PAYMENT', 'OPENING_BALANCE'].includes(tx.transaction_type)) {
                // Insert into agent_payments
                // Payment requires amount > 0
                const creditUsd = Number(tx.credit_usd) || 0;
                const creditEgp = Number(tx.credit_egp) || 0;
                
                let amount = 0;
                let currency = 'EGP';
                if (creditUsd > 0) {
                    amount = creditUsd;
                    currency = 'USD';
                } else if (creditEgp > 0) {
                    amount = creditEgp;
                    currency = 'EGP';
                } else if (Number(tx.debit_usd) > 0) {
                    // Sometimes opening balance is debit
                    amount = -Number(tx.debit_usd);
                    currency = 'USD';
                } else if (Number(tx.debit_egp) > 0) {
                    amount = -Number(tx.debit_egp);
                    currency = 'EGP';
                }

                if (amount !== 0) {
                    await pool.query(`
                        INSERT INTO agent_payments (
                            id, agent_name_raw, amount, currency, payment_date, note
                        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
                    `, [
                        uuidv4(), agentName, amount, currency, tx.payment_description || tx.transaction_type
                    ]);
                    paymentCount++;
                } else {
                    // Insert zero payment just to keep the record
                     await pool.query(`
                        INSERT INTO agent_payments (
                            id, agent_name_raw, amount, currency, payment_date, note
                        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
                    `, [
                        uuidv4(), agentName, 0, 'EGP', tx.payment_description || tx.transaction_type
                    ]);
                    paymentCount++;
                }
            }
        }

        // Update batch counts
        await pool.query(`UPDATE manifest_import_batches SET total_rows = $1, valid_rows = $2 WHERE id = $3`, [manifestCount, manifestCount, batchId]);

        console.log(`Sync Complete! Migrated ${manifestCount} passengers and ${paymentCount} payments.`);
    } catch (err) {
        console.error("Error during sync:", err);
    } finally {
        await pool.end();
    }
}

run();
