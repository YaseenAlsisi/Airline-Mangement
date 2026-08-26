const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
pool.query(`SELECT count(*) FROM manifest_passengers WHERE batch_id = 'c47ad75c-ef25-49dc-948d-7efaa4e5323c'`)
    .then(r => console.log('Rows inserted so far:', r.rows[0].count))
    .catch(console.error)
    .finally(() => pool.end());
