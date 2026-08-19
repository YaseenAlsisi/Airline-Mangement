const { Client } = require('./node_modules/pg');
const client = new Client('postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require');
const sql = "SELECT u.username, string_agg(p.name, ', ') as permissions FROM users u LEFT JOIN user_permissions up ON up.user_id = u.id LEFT JOIN permissions p ON p.id = up.permission_id GROUP BY u.username ORDER BY u.username";
client.connect().then(() => client.query(sql)).then(res => console.log(JSON.stringify(res.rows, null, 2))).catch(console.error).finally(() => client.end());
