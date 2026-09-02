const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const hash = bcrypt.hashSync('admin', 10);
console.log('New hash:', hash);

const client = new Client({
  connectionString: 'postgresql://airline_user:airsys8808@localhost:5432/airline_db'
});

async function run() {
  await client.connect();
  try {
    const res = await client.query(`UPDATE users SET password_hash = '${hash}';`);
    console.log('Updated rows:', res.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
