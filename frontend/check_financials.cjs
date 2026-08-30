const {Pool}=require('pg');
const pool=new Pool({connectionString:'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'});
async function run() {
  const r = await pool.query("SELECT passenger_name, debit_egp, credit_egp FROM manifest_passengers WHERE agent_name_raw = 'نيو ايدج' LIMIT 5");
  console.log('Passengers:', r.rows);
  const p = await pool.query("SELECT amount, currency FROM agent_payments WHERE agent_name_raw = 'نيو ايدج' LIMIT 5");
  console.log('Payments:', p.rows);
  await pool.end();
}
run();
