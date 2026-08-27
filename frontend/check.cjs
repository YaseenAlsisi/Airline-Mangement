const { Client } = require('pg');

async function run() {
    const client = new Client({ connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
    await client.connect();
    
    // Check Al-Meligi
    const resPass = await client.query(`SELECT SUM(debit_egp) as d, SUM(credit_egp) as c FROM manifest_passengers WHERE agent_name_raw = 'المليجي'`);
    console.log("Passengers (المليجي):", resPass.rows[0]);
    
    const resPay = await client.query(`SELECT SUM(amount) as c FROM agent_payments WHERE currency = 'EGP' AND agent_name_raw = 'المليجي'`);
    console.log("Payments (المليجي):", resPay.rows[0]);
    
    // Check balance in agent_transactions (original data)
    const resTx = await client.query(`
        SELECT SUM(debit_egp) as d, SUM(credit_egp) as c, SUM(debit_egp) - SUM(credit_egp) as bal
        FROM agent_transactions t JOIN agents a ON t.agent_id = a.id
        WHERE a.source_sheet_name = 'المليجي'
    `);
    console.log("Original Transactions (المليجي):", resTx.rows[0]);

    await client.end();
}
run().catch(console.error);
