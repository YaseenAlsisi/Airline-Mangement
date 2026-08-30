const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'agent_payments';
        `);
        console.table(res.rows);
    } finally {
        pool.end();
    }
}
run();
