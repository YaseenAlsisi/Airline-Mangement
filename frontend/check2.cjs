const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
pool.query(`SELECT id, transaction_type, passenger_name, passport_number FROM agent_transactions WHERE agent_id IN (SELECT id FROM agents WHERE source_sheet_name = 'أبو رحمه') LIMIT 15`)
    .then(r => console.log('Tx:', r.rows))
    .finally(() => pool.end());
