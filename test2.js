const fs = require('fs');

const data = fs.readFileSync(`2832019154143/11.txt`, 'utf8');
console.log(data);
console.log(data.replace(/[]/g, ''));