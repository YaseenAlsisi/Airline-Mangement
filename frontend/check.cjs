const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
pool.query(`SELECT count(*) as count FROM manifest_passengers WHERE agent_name_raw = 'أبو رحمه'`)
    .then(r => console.log('Count:', r.rows[0].count))
    .finally(() => pool.end());
