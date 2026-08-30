const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
    try {
        const res = await pool.query(`
            SELECT a.name, a.source_sheet_name,
                   COUNT(*) as count,
                   SUM(t.debit_usd) as dU, SUM(t.credit_usd) as cU,
                   SUM(t.debit_egp) as dE, SUM(t.credit_egp) as cE
            FROM agents a
            JOIN agent_transactions t ON a.id = t.agent_id
            WHERE a.source_sheet_name IN ('ايزي ترافيل', 'رحليستا', 'سعفان رافع', 'عفاف', 'فاطمه الجازوي', 'نيو ايدج')
            GROUP BY a.id, a.name, a.source_sheet_name
        `);
        console.table(res.rows);
    } finally {
        await pool.end();
    }
}
run();
