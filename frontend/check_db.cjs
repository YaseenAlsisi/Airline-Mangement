const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
pool.query(SELECT count(*) as count FROM agent_transactions t JOIN agents a ON t.agent_id = a.id WHERE a.source_sheet_name = '??? ????' OR a.name LIKE '%??? ????%').then(r => console.log('DB Abu Rahma count:', r.rows)).catch(console.error).finally(() => pool.end());
