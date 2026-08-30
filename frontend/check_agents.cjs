const {Pool}=require('pg');
const pool=new Pool({connectionString:'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'});
async function run() {
  const r = await pool.query("SELECT name, source_sheet_name FROM agents WHERE name LIKE '%نيو ايدج%'");
  console.log(r.rows);
  await pool.end();
}
run();
