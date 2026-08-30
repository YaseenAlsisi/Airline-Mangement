const {Pool} = require('pg');
const p = new Pool({connectionString:'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'});

Promise.all(['رحليستا', 'فاطمه الجازوي'].map(async s => {
  const px = await p.query('SELECT SUM(debit_egp) as e, SUM(debit_usd) as u FROM manifest_passengers WHERE agent_name_raw=$1', [s]);
  const py = await p.query('SELECT SUM(amount) as a, currency FROM agent_payments WHERE agent_name_raw=$1 AND payment_type=\'DEBIT\' GROUP BY currency', [s]);
  let egp = Number(px.rows[0].e || 0);
  let usd = Number(px.rows[0].u || 0);
  for(let r of py.rows) {
    if(r.currency==='EGP') egp += Number(r.a);
    if(r.currency==='USD') usd += Number(r.a);
  }
  console.log(s, 'DB EGP:', egp, 'DB USD:', usd);
})).finally(()=>p.end());
