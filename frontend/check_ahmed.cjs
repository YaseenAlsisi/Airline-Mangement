const { Client } = require('pg');

async function run() {
    const client = new Client({ connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
    await client.connect();
    
    // Find Ahmed El-Saidi agents
    const agents = await client.query(`SELECT id, name, source_sheet_name FROM agents WHERE name LIKE '%احمد الصعيد%'`);
    console.table(agents.rows);
    
    for (let agent of agents.rows) {
        console.log("Agent:", agent.name);
        const res = await client.query(`
            SELECT transaction_type, SUM(debit_egp) as d, SUM(credit_egp) as c
            FROM agent_transactions t 
            WHERE agent_id = $1
            GROUP BY transaction_type
        `, [agent.id]);
        console.table(res.rows);
    }
    await client.end();
}
run().catch(console.error);
