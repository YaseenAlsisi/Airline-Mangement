const {Pool}=require('pg');
const pool=new Pool({connectionString:'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'});
async function run() {
  const r = await pool.query("UPDATE manifest_passengers SET validation_status = 'VALID' WHERE validation_status = 'ERROR'");
  console.log(r.rowCount);
  await pool.end();
}
run();
