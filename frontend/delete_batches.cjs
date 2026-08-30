const {Pool}=require('pg'); 
const p=new Pool({connectionString:'postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'}); 
p.query("DELETE FROM manifest_import_batches WHERE id IN ('8dce9736-f335-446f-b440-b4487cce9e8b', '63935a70-0c5a-4786-8a8f-fb13e99e12cf')")
.then(()=>console.log('Deleted batches'))
.catch(e=>console.error(e))
.finally(()=>p.end());
