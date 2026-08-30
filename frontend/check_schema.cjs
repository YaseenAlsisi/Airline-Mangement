const {Pool}=require('pg');
const pool=new Pool({connectionString:'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'});
async function run() {
  const r = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'agent_payments'");
  console.log(r.rows);
  await pool.end();
}
run();
