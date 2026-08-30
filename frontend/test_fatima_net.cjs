const {Pool} = require('pg');
const p = new Pool({connectionString:'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'});

async function test() {
  const px = await p.query('SELECT SUM(debit_egp) as d_e, SUM(credit_egp) as c_e, SUM(debit_usd) as d_u, SUM(credit_usd) as c_u FROM manifest_passengers WHERE agent_name_raw=\'فاطمه الجازوي\'');
  const py = await p.query('SELECT SUM(amount) as a, currency, payment_type FROM agent_payments WHERE agent_name_raw=\'فاطمه الجازوي\' GROUP BY currency, payment_type');
  let paxDEgp=Number(px.rows[0].d_e||0), paxCEgp=Number(px.rows[0].c_e||0);
  let paxDUsd=Number(px.rows[0].d_u||0), paxCUsd=Number(px.rows[0].c_u||0);
  let payDEgp=0, payCEgp=0, payDUsd=0, payCUsd=0;
  for(let r of py.rows){
    if(r.currency==='EGP' && r.payment_type==='DEBIT') payDEgp+=Number(r.a);
    if(r.currency==='EGP' && r.payment_type==='CREDIT') payCEgp+=Number(r.a);
    if(r.currency==='USD' && r.payment_type==='DEBIT') payDUsd+=Number(r.a);
    if(r.currency==='USD' && r.payment_type==='CREDIT') payCUsd+=Number(r.a);
  }
  console.log('Pax DEGP:', paxDEgp, 'CEGP:', paxCEgp, 'DUSD:', paxDUsd, 'CUSD:', paxCUsd);
  console.log('Pay DEGP:', payDEgp, 'CEGP:', payCEgp, 'DUSD:', payDUsd, 'CUSD:', payCUsd);
  let netEgp = (paxDEgp + payDEgp) - (paxCEgp + payCEgp);
  let netUsd = (paxDUsd + payDUsd) - (paxCUsd + payCUsd);
  console.log('Net EGP:', netEgp, 'Net USD:', netUsd);
}
test().finally(()=>p.end());
