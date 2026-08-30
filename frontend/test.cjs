const fs = require('fs');
const authStore = JSON.parse(fs.readFileSync('src/store/authStore.js', 'utf8').match(/state":(\{.*?\})/)[1]);
fetch('http://localhost:8080/api/manifest/passengers?page=0&size=1', {
  headers: { 'Authorization': 'Bearer ' + authStore.token }
}).then(r => r.text()).then(console.log).catch(console.error);
