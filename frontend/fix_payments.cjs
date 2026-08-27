const axios = require('axios');

const arabicMonths = {
  "يناير": 0, "فبراير": 1, "مارس": 2, "ابريل": 3, "إبريل": 3,
  "مايو": 4, "يونيو": 5, "يوليو": 6, "اغسطس": 7, "أغسطس": 7,
  "سبتمبر": 8, "اكتوبر": 9, "أكتوبر": 9, "نوفمبر": 10, "ديسمبر": 11
};

async function fixPayments() {
  try {
    const res = await axios.get('http://localhost:8080/api/v1/agent-payments');
    const payments = res.data.data;
    console.log(`Found ${payments.length} payments.`);

    let updatedCount = 0;

    for (const payment of payments) {
      if (!payment.note) continue;

      const regex = /(\d{1,2})\s+(يناير|فبراير|مارس|ابريل|إبريل|مايو|يونيو|يوليو|اغسطس|أغسطس|سبتمبر|اكتوبر|أكتوبر|نوفمبر|ديسمبر)/i;
      const match = payment.note.match(regex);

      if (match) {
        const day = parseInt(match[1]);
        const month = arabicMonths[match[2]];
        const year = new Date(payment.paymentDate).getFullYear() || 2026;
        
        // Correct date (assuming local time)
        // create a date like 2026-07-09T12:00:00Z
        const newDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
        
        // Only update if it's different from current (ignoring time)
        const oldDate = new Date(payment.paymentDate);
        if (oldDate.getUTCMonth() !== month || oldDate.getUTCDate() !== day) {
          console.log(`Fixing payment ${payment.id}:`);
          console.log(`  Note: ${payment.note}`);
          console.log(`  Old Date: ${oldDate.toISOString()}`);
          console.log(`  New Date: ${newDate.toISOString()}`);
          
          await axios.put(`http://localhost:8080/api/v1/agent-payments/${payment.id}`, {
            agentNameRaw: payment.agentNameRaw,
            amount: payment.amount,
            currency: payment.currency,
            paymentDate: newDate.toISOString(),
            note: payment.note
          });
          updatedCount++;
        }
      }
    }
    
    console.log(`Successfully updated ${updatedCount} payments.`);
  } catch (err) {
    console.error(err.message);
    if (err.response) console.error(err.response.data);
  }
}

fixPayments();
