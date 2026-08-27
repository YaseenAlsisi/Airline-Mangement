const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
    try {
        console.log("Starting DB wipe...");
        
        await pool.query('DELETE FROM manifest_passengers');
        console.log("Deleted manifest_passengers");

        await pool.query('DELETE FROM agent_transactions');
        console.log("Deleted agent_transactions");

        await pool.query('DELETE FROM agent_payments');
        console.log("Deleted agent_payments");

        await pool.query('DELETE FROM manifest_import_batches');
        console.log("Deleted manifest_import_batches");

        await pool.query('DELETE FROM agent_import_batches');
        console.log("Deleted agent_import_batches");

        await pool.query('DELETE FROM agents');
        console.log("Deleted agents");

        console.log("Wipe completed successfully.");
    } catch (err) {
        console.error("Error during wipe:", err);
    } finally {
        await pool.end();
    }
}

run();
