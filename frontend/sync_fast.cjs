const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
    connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    max: 20
});

async function run() {
    try {
        console.log("Starting FAST data sync to legacy tables...");
        
        // Delete previous partially inserted data
        await pool.query(`DELETE FROM manifest_passengers WHERE batch_id = 'c47ad75c-ef25-49dc-948d-7efaa4e5323c'`);
        await pool.query(`DELETE FROM agent_payments WHERE payment_date > NOW() - INTERVAL '1 hour'`);

        const batchId = 'c47ad75c-ef25-49dc-948d-7efaa4e5323c';
        
        const txRes = await pool.query(`SELECT t.*, a.source_sheet_name as sheet_name FROM agent_transactions t JOIN agents a ON t.agent_id = a.id`);
        const transactions = txRes.rows;
        console.log(`Fetched ${transactions.length} transactions from new DB.`);

        let manifestQueries = [];
        let paymentQueries = [];

        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            const agentName = tx.sheet_name || 'Unknown Agent';

            if (tx.transaction_type === 'PASSENGER') {
                manifestQueries.push(pool.query(`
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
                ]));
            } else if (['PAYMENT', 'OPENING_BALANCE'].includes(tx.transaction_type)) {
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
                    amount = -Number(tx.debit_usd);
                    currency = 'USD';
                } else if (Number(tx.debit_egp) > 0) {
                    amount = -Number(tx.debit_egp);
                    currency = 'EGP';
                }

                paymentQueries.push(pool.query(`
                    INSERT INTO agent_payments (
                        id, agent_name_raw, amount, currency, payment_date, note
                    ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
                `, [
                    uuidv4(), agentName, amount, currency, tx.payment_description || tx.transaction_type
                ]));
            }
        }

        console.log(`Executing ${manifestQueries.length} passenger inserts...`);
        // Execute in chunks of 500
        for (let i = 0; i < manifestQueries.length; i += 500) {
            await Promise.all(manifestQueries.slice(i, i + 500));
        }

        console.log(`Executing ${paymentQueries.length} payment inserts...`);
        for (let i = 0; i < paymentQueries.length; i += 500) {
            await Promise.all(paymentQueries.slice(i, i + 500));
        }

        await pool.query(`UPDATE manifest_import_batches SET total_rows = $1, valid_rows = $2 WHERE id = $3`, [manifestQueries.length, manifestQueries.length, batchId]);

        console.log(`Sync Complete! Migrated ${manifestQueries.length} passengers and ${paymentQueries.length} payments.`);
    } catch (err) {
        console.error("Error during sync:", err);
    } finally {
        await pool.end();
    }
}

run();
