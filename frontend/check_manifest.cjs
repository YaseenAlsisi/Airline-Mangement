const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
    try {
        const res = await pool.query(`
            SELECT agent_name_raw, COUNT(*), SUM(debit_egp) as de, SUM(debit_usd) as du
            FROM manifest_passengers
            WHERE agent_name_raw IN ('رحليستا', 'فاطمه الجازوي', 'ايزي ترافيل', 'سعفان رافع', 'عفاف', 'نيو ايدج')
            GROUP BY agent_name_raw
        `);
        console.table(res.rows);
    } finally {
        pool.end();
    }
}
run();
