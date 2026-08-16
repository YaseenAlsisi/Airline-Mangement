const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  await client.connect();
  
  const res = await client.query('SELECT status, COUNT(*) FROM manifest_import_batches GROUP BY status');
  console.log("Batches by status:");
  console.log(res.rows);

  const res2 = await client.query(`
    SELECT b.status, COUNT(m.id) 
    FROM manifest_passengers m 
    JOIN manifest_import_batches b ON m.batch_id = b.id 
    GROUP BY b.status
  `);
  console.log("Passengers by batch status:");
  console.log(res2.rows);

  await client.end();
}

run().catch(console.error);
