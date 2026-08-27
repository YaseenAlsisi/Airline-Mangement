const { Client } = require('pg');

async function checkPaymentNotes() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'aams_db',
    password: 'admin',
    port: 5432,
  });

  await client.connect();
  const res = await client.query(`SELECT id, note, payment_date FROM agent_payments WHERE note IS NOT NULL AND note != ''`);
  
  const notes = res.rows.map(r => r.note);
  console.log("Total payments with notes:", notes.length);
  
  // Show 20 unique notes as sample
  const uniqueNotes = [...new Set(notes)];
  console.log("Sample notes:");
  uniqueNotes.slice(0, 20).forEach(n => console.log(n));

  await client.end();
}

checkPaymentNotes().catch(console.error);
