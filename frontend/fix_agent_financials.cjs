const { Client } = require('pg');
const xlsx = require('xlsx');
const { v4: uuidv4 } = require('uuid');

async function fixAgent(client, agentName, debitUsdIndex, creditUsdIndex, debitEgpIndex, creditEgpIndex) {
    console.log(`Fixing ${agentName}...`);
    // Find all imported transactions for this agent
    const txs = await client.query(`
        SELECT t.* 
        FROM agent_transactions t JOIN agents a ON t.agent_id = a.id
        WHERE a.source_sheet_name = $1
    `, [agentName]);
    
    console.log(`Found ${txs.rowCount} transactions for ${agentName}.`);
    
    // We will just read the Excel file to get the exact true values!
    const wb = xlsx.readFile('data.xlsx');
    const sheet = wb.Sheets[agentName];
    const data = xlsx.utils.sheet_to_json(sheet, {header: 1});
    
    for (const tx of txs.rows) {
        const rowNum = tx.source_row_number;
        const excelRow = data[rowNum - 1];
        if (!excelRow) continue;
        
        const trueDebitUsd = Number(excelRow[debitUsdIndex]) || 0;
        const trueCreditUsd = Number(excelRow[creditUsdIndex]) || 0;
        const trueDebitEgp = Number(excelRow[debitEgpIndex]) || 0;
        const trueCreditEgp = Number(excelRow[creditEgpIndex]) || 0;
        
        await client.query(`
            UPDATE agent_transactions 
            SET debit_usd = $1, credit_usd = $2, debit_egp = $3, credit_egp = $4
            WHERE id = $5
        `, [trueDebitUsd, trueCreditUsd, trueDebitEgp, trueCreditEgp, tx.id]);
    }
    
    console.log(`Fixed agent_transactions for ${agentName}.`);
}

async function run() {
    const client = new Client({ connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
    await client.connect();
    
    // 1. Fix agent_transactions for Ahmed El-Saidi and Rehlista
    await fixAgent(client, 'احمد الصعيدي', 15, 16, 17, 18);
    await fixAgent(client, 'رحليستا', 13, 14, 15, 16);
    
    // 2. Now we need to fix manifest_passengers and agent_payments!
    // Instead of dropping and re-inserting, we will fix manifest_passengers using agent_transactions
    console.log("Syncing manifest_passengers with correct values...");
    
    // For passengers, just copy from agent_transactions
    await client.query(`
        UPDATE manifest_passengers mp
        SET debit_usd = t.debit_usd, credit_usd = t.credit_usd, 
            debit_egp = t.debit_egp, credit_egp = t.credit_egp
        FROM agent_transactions t
        WHERE mp.agent_name_raw IN ('احمد الصعيدي', 'رحليستا')
        AND mp.passenger_name = t.passenger_name
        AND t.transaction_type = 'PASSENGER'
    `);
    
    console.log("Fixed manifest_passengers for shifted agents.");
    
    // 3. For agent_payments of shifted agents, it's safer to delete their old imported payments and re-insert
    console.log("Fixing agent_payments for shifted agents...");
    await client.query(`
        DELETE FROM agent_payments 
        WHERE agent_name_raw IN ('احمد الصعيدي', 'رحليستا') 
        AND note != 'MANUAL' -- Keep any manual ones if they exist
    `);
    
    const paymentTxs = await client.query(`
        SELECT t.*, a.source_sheet_name
        FROM agent_transactions t JOIN agents a ON t.agent_id = a.id
        WHERE a.source_sheet_name IN ('احمد الصعيدي', 'رحليستا')
        AND transaction_type IN ('PAYMENT', 'OPENING_BALANCE')
    `);
    
    for (const tx of paymentTxs.rows) {
        // Only insert ACTUAL credits into agent_payments
        if (Number(tx.credit_usd) > 0) {
            await client.query(`INSERT INTO agent_payments (id, agent_name_raw, amount, currency, payment_date, note) VALUES ($1, $2, $3, 'USD', CURRENT_TIMESTAMP, $4)`, [uuidv4(), tx.source_sheet_name, tx.credit_usd, tx.payment_description]);
        }
        if (Number(tx.credit_egp) > 0) {
            await client.query(`INSERT INTO agent_payments (id, agent_name_raw, amount, currency, payment_date, note) VALUES ($1, $2, $3, 'EGP', CURRENT_TIMESTAMP, $4)`, [uuidv4(), tx.source_sheet_name, tx.credit_egp, tx.payment_description]);
        }
    }
    
    console.log("Fixed agent_payments for shifted agents.");
    
    // 4. GLOBALLY Fix the missing debits for ALL agents!
    console.log("Migrating missing debits for ALL agents to manifest_passengers...");
    
    // Any payment or opening balance that had a DEBIT was previously saved as a NEGATIVE payment.
    // First, let's delete all NEGATIVE payments because they shouldn't be payments!
    const deletedNegative = await client.query(`DELETE FROM agent_payments WHERE amount < 0 RETURNING *`);
    console.log(`Deleted ${deletedNegative.rowCount} negative payments.`);
    
    // Now, insert those debits into manifest_passengers so they show up properly!
    const missingDebits = await client.query(`
        SELECT t.*, a.source_sheet_name 
        FROM agent_transactions t JOIN agents a ON t.agent_id = a.id
        WHERE transaction_type IN ('PAYMENT', 'OPENING_BALANCE') 
        AND (debit_egp > 0 OR debit_usd > 0)
    `);
    
    console.log(`Found ${missingDebits.rowCount} missing debit transactions across all agents.`);
    
    // Get an existing batch_id
    const batchRes = await client.query('SELECT id FROM manifest_import_batches LIMIT 1');
    const defaultBatchId = batchRes.rows[0]?.id;
    
    for (const tx of missingDebits.rows) {
        await client.query(`
            INSERT INTO manifest_passengers (
                id, batch_id, row_number, passenger_name, agent_id, agent_name_raw,
                debit_egp, debit_usd, credit_egp, credit_usd, validation_status, note_2
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0, 'VALID', 'تسوية مديونية / رصيد افتتاحي')
        `, [
            uuidv4(), defaultBatchId, tx.source_row_number, 
            tx.payment_description || tx.transaction_type, 
            tx.agent_id, tx.source_sheet_name,
            tx.debit_egp, tx.debit_usd
        ]);
    }
    
    console.log("Successfully migrated all missing debits to manifest_passengers!");
    await client.end();
}
run().catch(console.error);
