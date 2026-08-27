const { Client } = require('pg');

async function run() {
    const client = new Client({ connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
    await client.connect();
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'manifest_passengers'");
    console.log(res.rows.map(r=>r.column_name).join(', '));
    await client.end();
}
run().catch(console.error);
