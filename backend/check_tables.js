const { Client } = require('./node_modules/pg');
const client = new Client('postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require');
const sql = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name";
client.connect().then(() => client.query(sql)).then(res => console.log(res.rows.map(r => r.table_name))).catch(console.error).finally(() => client.end());
