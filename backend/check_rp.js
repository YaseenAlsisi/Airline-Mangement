const {Client}=require('./node_modules/pg');
const c=new Client('postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require');
const sql = "SELECT r.name as role, p.code FROM role_permissions rp JOIN roles r ON r.id = rp.role_id JOIN permissions p ON p.id = rp.permission_id ORDER BY r.name, p.code";
c.connect().then(()=>c.query(sql)).then(r=>console.log(JSON.stringify(r.rows,null,2))).catch(console.error).finally(()=>c.end());
