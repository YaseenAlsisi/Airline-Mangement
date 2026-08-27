const { Client } = require('pg');

const arabicMonths = {
  "يناير": 0, "فبراير": 1, "مارس": 2, "ابريل": 3, "إبريل": 3,
  "مايو": 4, "يونيو": 5, "يوليو": 6, "اغسطس": 7, "أغسطس": 7,
  "سبتمبر": 8, "اكتوبر": 9, "أكتوبر": 9, "نوفمبر": 10, "ديسمبر": 11
};

async function fixPayments() {
  const client = new Client({
    connectionString: "postgres://neondb_owner:npg_oJ21CsYWzTie@ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require"
  });

  try {
    await client.connect();
    
    const res = await client.query(`SELECT id, payment_date, note FROM agent_payments WHERE note IS NOT NULL AND note != ''`);
    const payments = res.rows;
    console.log(`Found ${payments.length} payments with notes.`);

    let updatedCount = 0;

    for (const payment of payments) {
      const regex = /(\d{1,2})\s+(يناير|فبراير|مارس|ابريل|إبريل|مايو|يونيو|يوليو|اغسطس|أغسطس|سبتمبر|اكتوبر|أكتوبر|نوفمبر|ديسمبر)/i;
      const match = payment.note.match(regex);

      if (match) {
        const day = parseInt(match[1]);
        const month = arabicMonths[match[2]];
        const year = new Date(payment.payment_date).getFullYear() || 2026;
        
        // Correct date (assuming local time)
        const newDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
        
        // Only update if it's different from current
        const oldDate = new Date(payment.payment_date);
        if (oldDate.getUTCMonth() !== month || oldDate.getUTCDate() !== day) {
          console.log(`Fixing payment ${payment.id}:`);
          console.log(`  Note: ${payment.note}`);
          console.log(`  Old Date: ${oldDate.toISOString()}`);
          console.log(`  New Date: ${newDate.toISOString()}`);
          
          await client.query(`UPDATE agent_payments SET payment_date = $1 WHERE id = $2`, [newDate.toISOString(), payment.id]);
          updatedCount++;
        }
      }
    }
    
    console.log(`Successfully updated ${updatedCount} payments.`);
  } catch (err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}

fixPayments();
