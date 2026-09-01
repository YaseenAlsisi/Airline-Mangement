tb const { Pool } = require('pg');

const p = new Pool({
    connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
    console.log("Inserting missing payments for فاطمه الجازوي...");

    const crypto = require('crypto');
    // Insert 54000
    await p.query(`
        INSERT INTO agent_payments 
        (id, agent_name_raw, amount, currency, payment_type, note, payment_date)
        VALUES 
        ($1, $2, $3, 'EGP', 'CREDIT', $4, CURRENT_TIMESTAMP)
    `, [crypto.randomUUID(), 'فاطمه الجازوي', 54000, 'دفعة غير مسماة (بدون اسم - سطر 223)']);

    // Insert 320000
    await p.query(`
        INSERT INTO agent_payments 
        (id, agent_name_raw, amount, currency, payment_type, note, payment_date)
        VALUES 
        ($1, $2, $3, 'EGP', 'CREDIT', $4, CURRENT_TIMESTAMP)
    `, [crypto.randomUUID(), 'فاطمه الجازوي', 320000, 'دفعة غير مسماة (بدون اسم - سطر 224)']);

    console.log("Done! Checking new balance...");

    const px = await p.query("SELECT SUM(debit_egp) as d_e, SUM(credit_egp) as c_e FROM manifest_passengers WHERE agent_name_raw='فاطمه الجازوي'");
    const py = await p.query("SELECT SUM(amount) as a, payment_type FROM agent_payments WHERE agent_name_raw='فاطمه الجازوي' AND currency='EGP' GROUP BY payment_type");

    let paxDEgp = Number(px.rows[0].d_e || 0), paxCEgp = Number(px.rows[0].c_e || 0);
    let payDEgp = 0, payCEgp = 0;
    for (let r of py.rows) {
        if (r.payment_type === 'DEBIT') payDEgp += Number(r.a);
        if (r.payment_type === 'CREDIT') payCEgp += Number(r.a);
    }

    let netEgp = (paxDEgp + payDEgp) - (paxCEgp + payCEgp);
    console.log("New Net EGP for فاطمه الجازوي:", netEgp);

    await p.end();
}

run().catch(console.error);
