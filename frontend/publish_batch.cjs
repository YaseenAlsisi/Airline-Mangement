const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
    try {
        await pool.query("UPDATE manifest_import_batches SET status='PUBLISHED', published_at=NOW() WHERE status='COMPLETED'");
        console.log('Batch published successfully!');
    } catch(err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
run();
